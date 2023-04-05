const express = require('express');
const fetch = require('node-fetch');
const cors = require("cors");
require('dotenv').config();

const {BigQuery} = require('@google-cloud/bigquery')

// Sets up the Express App
// =============================================================
const app = express();
app.use(cors())
const PORT = process.env.PORT || 3003;

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//webhook sandbox
app.post('/webhook', async (req, res) => {
	const data = req.body
	fetchEventData(data)
	.then(calendlyEvent => {
		// console.log('============CALENDLY EVENT===============')
		// console.log(calendlyEvent)
		// res.send(calendlyEvent)
		// return calendlyEvent
		formattedCalendlyData = new FormattedData (calendlyEvent)
		res.send(formattedCalendlyData)
		return formattedCalendlyData
	})
	// .then(dataForBiqQuery => {
	// 	main(dataForBiqQuery)
	// 	console.log(dataForBiqQuery)
	// })
})

app.listen(PORT, () => {
	console.log(`listening on ${PORT}`)
})

// Calendly Fetch
// =============================================================
const BearerToken = process.env.CALENDLY_BEARER_TOKEN
const organizationUri = 'https://api.calendly.com/organizations/CEBBNBYN7S5RBBCM'


let calendlyFetchOptions = {
	method: 'GET',
	headers: {'Content-Type': 'application/json', 
	Authorization: `${BearerToken}`}
};
const url = `https://api.calendly.com/event_types/BDFPR46JKT67V5RT?organization=${organizationUri}`

fetch(url, calendlyFetchOptions)
	.then(res => res.json())
	.then(json => console.log(json))
	.catch(err => console.error('error:' + err));

const fetchEventData = (data) => {
	return fetch(data.payload.uri, calendlyFetchOptions)
		.then(res => {return res.json()})
		.then( uri => {
			// console.log('============URI===============')
			// 	console.log(uri)
			return fetch(uri.resource.event, calendlyFetchOptions)
			.then(res => {return res.json()})
			.then( event => {
				console.log('============URI===============')
				console.log(uri)
				console.log('============EVENT===============')
				console.log(event)
				const webhookData = data.payload
				const fullName = webhookData.name.split(' ')
				webhookData.first_name = fullName[0]
				webhookData.last_name = fullName[1]
				webhookData.event = event.resource
				webhookData.questions_and_answers = uri.resource.questions_and_answers
				console.log('============FINAL===============')
				console.log(webhookData)
				return webhookData	
			})
		})
	.catch(err => console.log('error:' + err));
};

// Formatted Data Constructor
// =============================================================

class FormattedData {
	constructor (data) {
		this.created_at = data.event.created_at;
		this.appointment_time = data.event.start_time;
		this.duration = data.event.duration;
		this.appointment_type = data.event.name;
		this.location = data.event.location.location;
		this.first_name = data.first_name;
		this.last_name = data.last_name;
		this.email = data.email;
		this.phone = data.text_reminder_number;
		this.questions_and_answers = data.questions_and_answers
		this.utm_campaign = data.tracking.utm_campaign;
		this.utm_source = data.tracking.utm_source;
		this.utm_medium = data.tracking.utm_medium;
		this.utm_term = data.tracking.utm_term;
		this.utm_content = data.tracking.utm_content;
		this.notifications_phone = data.text_reminder_number;
		// this.employee = data.event.profile.name;
			// TODO: Need to figure out API call for employee name and appointment location
	}
}

// Big Query Connection
// =============================================================

function main(dataForBiqQuery) {
    // Import the Google Cloud client libraries
    const {BigQuery} = require('@google-cloud/bigquery');

    const datasetId = "calendly_bigquery_test_dataset";
    const tableId = "calendly_bigquery_test_table";
	const insertData = dataForBiqQuery

    async function loadCalendlyEventData(datasetId, tableId, insertData) {
        // Import a GCS file into a table with manually defined schema.

        // Instantiate clients
        const bigqueryClient = new BigQuery();

        // Configure the load job.
        const metadata = {
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        location: 'US',
        };

		const rows = [
			{
				created_at: insertData.created_at,
				appointment_time: insertData.appointment_time,
				duration: insertData.duration,
				appointment_type: insertData.appointment_type,
				location: insertData.location,
				first_name: insertData.first_name,
				last_name: insertData.last_name,
				email: insertData.email,
				phone: insertData.phone,
				details: insertData.details,
				referral_source: insertData.referral_source,
				referral_campaign: insertData.referral_campaign,
				notifications_phone: insertData.notifications_phone,
				employee: insertData.employee,
			}
		]

        // Insert data
       const job = await bigqueryClient
        .dataset(datasetId)
        .table(tableId)
        .insert(rows, metadata);

        // load() waits for the job to finish
        console.log(`Job ${job[0].kind} completed.`)

        // Check the job's status for errors
        // const errors = job.status.errors;
        // if (errors && errors.length > 0) {
        // throw errors;
        // }
    }
	
    loadCalendlyEventData(datasetId, tableId, insertData);
}
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
		formattedCalendlyData = new FormattedData (calendlyEvent)
		res.send(formattedCalendlyData)
		return formattedCalendlyData
	})
	.then(dataForBiqQuery => {
		main(dataForBiqQuery)
		console.log(dataForBiqQuery)
	})
})

app.listen(PORT, () => {
	console.log(`linstening on ${PORT}`)
})

// Calendly Fetch
// =============================================================
const BearerToken = process.env.CALENDLY_BEARER_TOKEN

let calendlyFetchOptions = {
	method: 'GET',
	headers: {'Content-Type': 'application/json', 
	Authorization: `${BearerToken}`}
};

const fetchEventData = (data) => {
	console.log(data.payload.event)
	return fetch(data.payload.event, calendlyFetchOptions)
	.then(res => {return res.json()})
	.then( event => {
		return fetch(event.resource.event_type, calendlyFetchOptions)
		.then(res => {return res.json()})
		.then(eventType => {
			const webhookData = data.payload
			const fullName = webhookData.name.split(' ')
			webhookData.first_name = fullName[0]
			webhookData.last_name = fullName[1]
			webhookData.event = event.resource
			webhookData.event.event_type = eventType.resource
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
		this.duration = data.event.event_type.duration;
		this.appointment_type = data.event.event_type.name;
		this.location = data.event.location.location;
		this.first_name = data.first_name;
		this.last_name = data.last_name;
		this.email = data.email;
		this.phone = data.text_reminder_number;
		this.details = data.event.event_type.kind_description;
		this.referral_source = data.tracking.utm_source;
		this.referral_campaign = data.tracking.utm_campaign;
		this.notifications_phone = data.text_reminder_number;
		this.employee = data.event.event_type.profile.name;
	}
}

// Formatted Data Constructor
// =============================================================
'use strict';

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
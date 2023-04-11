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
		if (data.event == 'invitee.canceled'){
		console.log(data)
		//TODO:
		//eventCanceled(data)
		}
		if (data.event == 'invitee.created' && data.payload.old_invitee){
			//TODO:
			//Reschedule code
			//Search Bigquery with data.payload.old_invitee
			//eventReschedule(data)
		}
		if (data.event == 'invitee.created' && !data.payload.old_invitee){
			fetchNewEventData(data)
			.then(calendlyEvent => {
				formattedCalendlyData = new FormattedData (calendlyEvent)
				// console.log('============FORMATTED CALENDLY DATA===============')
				// console.log(formattedCalendlyData)
				res.send(formattedCalendlyData)
				return formattedCalendlyData
			})
			.then(dataForBiqQuery => {
				main(dataForBiqQuery)
				console.log(dataForBiqQuery)
			})
		}	
})

// app.listen(PORT, () => {
// 	console.log(`listening on ${PORT}`)
// })

// Calendly Fetch
// =============================================================
const BearerToken = process.env.CALENDLY_BEARER_TOKEN
const organizationUri = 'https://api.calendly.com/organizations/CEBBNBYN7S5RBBCM'


let calendlyFetchOptions = {
	method: 'GET',
	headers: {'Content-Type': 'application/json', 
	Authorization: `${BearerToken}`}
};

// let calendlyFetchOptions = {
// 	method: 'POST',
// 	headers: {'Content-Type': 'application/json', 
// 		Authorization: `${BearerToken}`
// 	},
// 	body:'{"url":"https://us-central1-vital-range-377419.cloudfunctions.net/calendlyBigQueryETLServer/webhook","events":["invitee.created","invitee.canceled"],"organization":"https://api.calendly.com/organizations/CEBBNBYN7S5RBBCM","user":"https://api.calendly.com/users/48e74773-5fa0-42f7-9107-59fa8b3e952f","scope": "organization"}',
// };

// const url = `https://api.calendly.com/webhook_subscriptions?organization=${organizationUri}&scope=organization`

// fetch(url, calendlyFetchOptions)
// 	.then(res => res.json())
// 	.then(json => console.log(json))
// 	.catch(err => console.error('error:' + err));

const fetchNewEventData = (data) => {
	// console.log('============WEBHOOK DATA===============')
	// console.log(data)
		return fetch(data.payload.event, calendlyFetchOptions)
		.then(res => {return res.json()})
		.then( event => {
			// console.log('============EVENT===============')
			// console.log(event)
			return fetch(event.resource.event_memberships[0].user, calendlyFetchOptions)
			.then(res => {return res.json()})
			.then( user => {
				// console.log('============USER===============')
				// console.log(user)
				return fetch(event.resource.event_type, calendlyFetchOptions)
				.then(res => {return res.json()})
				.then( eventType => {
					// console.log('============Event Type===============')
					// console.log(eventType)
					const webhookData = data.payload
					const fullName = webhookData.name.split(' ')
					webhookData.first_name = fullName[0]
					webhookData.last_name = fullName[1]
					webhookData.event = event.resource
					webhookData.salesperson_name = user.resource.name
					webhookData.salesperson_email = user.resource.email
					webhookData.event.event_type = eventType.resource
					if (webhookData.questions_and_answers[0]){
						webhookData.phone = webhookData.questions_and_answers[0].answer
					} else {
						webhookData.phone = ''
					}
					if (webhookData.questions_and_answers[1]){
						webhookData.question_1 = webhookData.questions_and_answers[1].question
						webhookData.answer_1 = webhookData.questions_and_answers[1].answer
					} else {
						webhookData.question_1 = ''
						webhookData.answer_1 = ''
					}
					if (webhookData.questions_and_answers[2]){
						webhookData.question_2 = webhookData.questions_and_answers[2].question
						webhookData.answer_2 = webhookData.questions_and_answers[2].answer
					} else {
						webhookData.question_2 = ''
						webhookData.answer_2 = ''
					}
					if (webhookData.questions_and_answers[3]){
						webhookData.question_3 = webhookData.questions_and_answers[3].question
						webhookData.answer_3 = webhookData.questions_and_answers[3].answer
					} else {
						webhookData.question_3 = ''
						webhookData.answer_3 = ''
					}
					if (webhookData.questions_and_answers[4]){
						webhookData.question_4 = webhookData.questions_and_answers[4].question
						webhookData.answer_4 = webhookData.questions_and_answers[4].answer
					} else {
						webhookData.question_4 = ''
						webhookData.answer_4 = ''
					}
					console.log('============FINAL===============')
					console.log(webhookData)
					return webhookData	
				})
			})
		})
	.catch(err => console.log('error:' + err));
};

//TODO:
const eventRescheduled = () => {
		// find the record that matches
			// But how do I match them? What is the permanent record/identifier for each calendly appointment?
}

const eventCanceled = () => {
	// find the record that matches
	// But how do I match them? What is the permanent record/identifier for each calendly appointment?
}

// Formatted Data Constructor
// =============================================================

class FormattedData {
	constructor (data) {
		this.created_at = data.event.created_at;
		this.appointment_time = data.event.start_time;
		this.duration = data.event.event_type.duration;
		this.appointment_type = data.event.name;
		this.location = data.event.location.location;
		this.first_name = data.first_name;
		this.last_name = data.last_name;
		this.email = data.email;
		this.phone = data.phone;
		this.question_one = data.question_1
		this.answer_one = data.answer_1
		this.question_two = data.question_2
		this.answer_two = data.answer_2
		this.question_three = data.question_3
		this.answer_three = data.answer_3
		this.question_four = data.question_4
		this.answer_four = data.answer_4
		this.utm_campaign = data.tracking.utm_campaign;
		this.utm_source = data.tracking.utm_source;
		this.utm_medium = data.tracking.utm_medium;
		this.utm_term = data.tracking.utm_term;
		this.utm_content = data.tracking.utm_content;
		this.text_reminder_number = data.text_reminder_number;
		this.salesperson_email = data.salesperson_email
		this.salesperson_name = data.salesperson_name
		this.canceled = data.canceled
		this.rescheduled = data.rescheduled
		this.event_uri = data.uri
	}
}

// Big Query Connection
// =============================================================

function main(dataForBiqQuery) {
    // Import the Google Cloud client libraries
    const {BigQuery} = require('@google-cloud/bigquery');

    const datasetId = "calendly";
    const tableId = "calendly_appointments";
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
				question_one: insertData.question_one,
				answer_one: insertData.answer_one,
				question_two: insertData.question_two,
				answer_two: insertData.answer_two,
				question_three: insertData.question_three,
				answer_three: insertData.answer_three,
				question_four: insertData.question_four,
				answer_four: insertData.answer_four,
				utm_campaign: insertData.utm_campaign,
				utm_source: insertData.utm_source,
				utm_medium: insertData.utm_medium,
				utm_term: insertData.utm_term,
				utm_content: insertData.utm_content,
				text_reminder_number: insertData.text_reminder_number,
				salesperson_email: insertData.salesperson_email,
				salesperson_name: insertData.salesperson_name,
				canceled: insertData.canceled,
				rescheduled: insertData.rescheduled,
				event_uri: insertData.event_uri
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

exports.calendlyBigQueryETLServer = app;
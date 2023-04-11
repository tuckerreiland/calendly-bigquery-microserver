'use strict';

function main() {
    // Import the Google Cloud client libraries
    const {BigQuery} = require('@google-cloud/bigquery');
	const datasetId = "calendly";
    const tableId = "calendly_appointments";

	async function createTable(datasetId, tableId) {
        // Creates a new table
		
        // Create a client
        const bigqueryClient = new BigQuery();

        const options = {
            location: 'US',
			schema: {
				fields: [
					{
						name: 'created_at', 
						type: 'STRING'
					},
					{
						name: 'appointment_time', 
						type: 'STRING'
					},
					{
						name: 'duration', 
						type: 'STRING'
					},
					{
						name: 'appointment_type', 
						type: 'STRING'
					},
					{
						name: 'location', 
						type: 'STRING'
					},
					{
						name: 'first_name', 
						type: 'STRING'
					},
					{
						name: 'last_name', 
						type: 'STRING'
					},
					{
						name: 'email', 
						type: 'STRING'
					},
					{
						name: 'phone', 
						type: 'STRING'
					},
					{
						name: 'question_one', 
						type: 'STRING'
					},
					{
						name: 'answer_one', 
						type: 'STRING'
					},
					{
						name: 'question_two', 
						type: 'STRING'
					},
					{
						name: 'answer_two', 
						type: 'STRING'
					},
					{
						name: 'question_three', 
						type: 'STRING'
					},
					{
						name: 'answer_three', 
						type: 'STRING'
					},
					{
						name: 'question_four', 
						type: 'STRING'
					},
					{
						name: 'answer_four', 
						type: 'STRING'
					},
					{
						name: 'utm_campaign', 
						type: 'STRING'
					},
					{
						name: 'utm_source', 
						type: 'STRING'
					},
					{
						name: 'utm_medium', 
						type: 'STRING'
					},
					{
						name: 'utm_content', 
						type: 'STRING'
					},
					{
						name: 'utm_term', 
						type: 'STRING'
					},
					{
						name: 'text_reminder_number', 
						type: 'STRING'
					},
					{
						name: 'salesperson_email', 
						type: 'STRING'
					},
					{
						name: 'salesperson_name', 
						type: 'STRING'
					},
					{
						name: 'canceled', 
						type: 'BOOLEAN'
					},
					{
						name: 'rescheduled', 
						type: 'BOOLEAN'
					},
				],
			},
            };

        // Create a new table in the dataset
        const [table] = await bigqueryClient
        .dataset(datasetId)
        .createTable(tableId, options);

        console.log(`Table ${table.id} created.`);
    }

    createTable(datasetId, tableId);;
}

main();
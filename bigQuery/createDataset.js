'use strict';

function main() {
    // Import the Google Cloud client libraries
    const {BigQuery} = require('@google-cloud/bigquery');
	const datasetId = "calendly_bigquery_test_dataset";

    async function createDataset(datasetId) {

        const bigqueryClient = new BigQuery();

        // Specify the geographic location where the dataset should reside
        const options = {
        location: 'US',
        };

        // Create a new dataset
        const [dataset] = await bigqueryClient.createDataset(datasetId, options);
        console.log(`Dataset ${dataset.id} created.`);
    }

   	createDataset(datasetId);
}

main();

const { Worker } = require("bullmq");

const redisConnection =
    require("../config/redis");

const deadLetterQueue =
    require("../queues/deadLetter.queue");

const {
    isMaxRetriesExceeded
} = require("../utils/retry.utils");


const processDataSharing = async (job) => {

    const {
        dataOwner,
        dataRequester,
        dataType,
        consentId
    } = job.data;

    console.log(
        `Processing data-sharing job: ${job.id}`
    );


    /*
     * The actual data-sharing operation
     * should be called here.
     *
     * Replace this function with your
     * project's real data-sharing logic.
     */

    await performDataSharing({
        dataOwner,
        dataRequester,
        dataType,
        consentId
    });


    return {
        success: true,
        jobId: job.id
    };
};


const performDataSharing = async ({
    dataOwner,
    dataRequester,
    dataType,
    consentId
}) => {

    console.log(
        "Data sharing operation:",
        {
            dataOwner,
            dataRequester,
            dataType,
            consentId
        }
    );


    /*
     * Connect your actual data-sharing
     * implementation here.
     *
     * Example:
     *
     * await externalDataService.share(...)
     */


    return true;
};


const worker = new Worker(
    "data-sharing",
    processDataSharing,
    {
        connection: redisConnection,

        concurrency: 5
    }
);


worker.on("completed", (job, result) => {

    console.log(
        `Job ${job.id} completed successfully`,
        result
    );
});


worker.on("failed", async (job, error) => {

    if (!job) {
        return;
    }

    console.error(
        `Job ${job.id} failed:`,
        error.message
    );


    if (
        isMaxRetriesExceeded(
            job.attemptsMade
        )
    ) {

        try {

            await deadLetterQueue.add(
                "FAILED_DATA_SHARE",
                {
                    originalJobId: job.id,
                    ...job.data,
                    error: error.message,
                    failedAt: new Date()
                }
            );

            console.log(
                `Job ${job.id} moved to Dead Letter Queue`
            );

        } catch (dlqError) {

            console.error(
                "Failed to move job to DLQ:",
                dlqError.message
            );
        }
    }
});


worker.on("error", (error) => {

    console.error(
        "Worker error:",
        error.message
    );
});


console.log(
    "Data-sharing worker started"
);

module.exports = worker;


const dataSharingQueue =
    require("../queues/dataSharing.queue");

const addDataSharingJob = async ({
    dataOwner,
    dataRequester,
    dataType,
    consentId
}) => {

    const job = await dataSharingQueue.add(
        "DATA_SHARE",
        {
            dataOwner,
            dataRequester,
            dataType,
            consentId
        }
    );

    return {
        jobId: job.id,
        status: "QUEUED"
    };
};


const getJobStatus = async (jobId) => {

    const job =
        await dataSharingQueue.getJob(jobId);

    if (!job) {
        return null;
    }

    const state =
        await job.getState();

    return {
        jobId: job.id,
        name: job.name,
        state,
        attemptsMade: job.attemptsMade,
        data: job.data
    };
};


const removeJob = async (jobId) => {

    const job =
        await dataSharingQueue.getJob(jobId);

    if (!job) {
        return false;
    }

    await job.remove();

    return true;
};


module.exports = {
    addDataSharingJob,
    getJobStatus,
    removeJob
};


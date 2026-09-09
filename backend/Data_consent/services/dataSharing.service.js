const consentService =
    require("./consent.service");

const queueService =
    require("../../Exception_handling/services/queue.service");

const auditLogger =
    require("../utils/auditLogger");

const requestDataShare = async ({
    dataOwner,
    dataRequester,
    dataType,
    performedBy
}) => {

    // STEP 1: Check consent
    const consentResult =
        await consentService.checkConsent({
            dataOwner,
            dataRequester,
            requestedDataType: dataType
        });

    // STEP 2: Reject if consent is invalid
    if (!consentResult.allowed) {

        await auditLogger.log({
            action: "DATA_ACCESS_DENIED",
            performedBy,
            dataOwner,
            dataRequester,
            dataType,
            details: {
                reason: consentResult.reason
            }
        });

        const error = new Error(
            "Data sharing denied: valid consent not found"
        );

        error.statusCode = 403;

        throw error;
    }

    const job = await queueService.addDataSharingJob({
        dataOwner,
        dataRequester,
        dataType,
        consentId: consentResult.consent._id
    });

    await auditLogger.log({
        action: "DATA_SHARE_QUEUED",
        performedBy,
        dataOwner,
        dataRequester,
        dataType,
        consentId: consentResult.consent._id
    });

    return {
        status: "QUEUED",
        jobId: job.jobId,
        message: "Data sharing request queued"
    };
};

module.exports = {
    requestDataShare,
    getJobStatus: queueService.getJobStatus
};
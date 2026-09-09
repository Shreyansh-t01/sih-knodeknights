const AuditLog = require("../models/AuditLog");

exports.log = async ({
    action,
    performedBy,
    dataOwner,
    dataRequester,
    dataType,
    consentId,
    details
}) => {

    return await AuditLog.create({
        action,
        performedBy,
        dataOwner,
        dataRequester,
        dataType,
        consentId,
        details
    });
};
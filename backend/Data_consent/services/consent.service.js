const Consent = require("../models/Consent");

// CHECK DATA ACCESS CONSENT
exports.checkConsent = async ({
    dataOwner,
    dataRequester,
    requestedDataType
}) => {

    const consent = await Consent.findOne({
        dataOwner,
        dataRequester,
        dataTypes: requestedDataType,
        status: "ACTIVE",
        expiresAt: {
            $gt: new Date()
        }
    });

    if (!consent) {
        return {
            allowed: false,
            reason: "No active consent covers the requested data type"
        };
    }

    return {
        allowed: true,
        consent
    };
};


// CREATE CONSENT
exports.createConsent = async ({
    dataOwner,
    dataRequester,
    dataTypes,
    purpose,
    expiresAt
}) => {

    // Validation
    if (!dataOwner) {
        throw new Error("Data owner is required");
    }

    if (!dataRequester) {
        throw new Error("Data requester is required");
    }

    if (!dataTypes || dataTypes.length === 0) {
        throw new Error(
            "At least one data type is required"
        );
    }

    if (!purpose) {
        throw new Error("Purpose is required");
    }

    if (!expiresAt) {
        throw new Error("Expiry date is required");
    }

    const expiryDate = new Date(expiresAt);

    if (Number.isNaN(expiryDate.getTime())) {
        throw new Error("Invalid expiry date");
    }

    if (expiryDate <= new Date()) {
        throw new Error(
            "Consent expiry must be in the future"
        );
    }

    // Create consent
    const consent = await Consent.create({
        dataOwner,
        dataRequester,
        dataTypes,
        purpose,
        expiresAt: expiryDate,
        status: "ACTIVE"
    });

    return consent;
};


// REVOKE CONSENT
exports.revokeConsent = async (
    consentId,
    dataOwner
) => {

    // Find consent belonging to this owner
    const consent = await Consent.findOne({
        _id: consentId,
        dataOwner
    });

    if (!consent) {
        const error = new Error(
            "Consent not found"
        );

        error.statusCode = 404;

        throw error;
    }

    // Already revoked
    if (consent.status === "REVOKED") {
        const error = new Error(
            "Consent already revoked"
        );

        error.statusCode = 400;

        throw error;
    }

    // Revoke
    consent.status = "REVOKED";

    await consent.save();

    return consent;
};
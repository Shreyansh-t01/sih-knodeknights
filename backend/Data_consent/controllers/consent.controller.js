
const consentService = require("../services/consent.service");


// CREATE CONSENT
exports.createConsent = async (req, res, next) => {
    try {

        const consent = await consentService.createConsent({
            dataOwner: req.user.id,
            dataRequester: req.body.dataRequester,
            dataTypes: req.body.dataTypes,
            purpose: req.body.purpose,
            expiresAt: req.body.expiresAt
        });

        res.status(201).json({
            success: true,
            message: "Consent created successfully",
            data: consent
        });

    } catch (error) {
        next(error);
    }
};


// REVOKE CONSENT
exports.revokeConsent = async (req, res, next) => {
    try {

        const consent =
            await consentService.revokeConsent(
                req.params.id,
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Consent revoked successfully",
            data: consent
        });

    } catch (error) {
        next(error);
    }
};

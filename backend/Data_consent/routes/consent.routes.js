const express = require("express");

const router = express.Router();

const consentController =
    require("../controllers/consent.controller");

const authenticate =
    require("../middleware/authenticate");

// Create consent
router.post(
    "/",
    authenticate,
    consentController.createConsent
);

// Revoke consent
router.patch(
    "/:id/revoke",
    authenticate,
    consentController.revokeConsent
);

module.exports = router;
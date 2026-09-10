const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        dataOwner: {
            type: mongoose.Schema.Types.ObjectId
        },

        dataRequester: {
            type: mongoose.Schema.Types.ObjectId
        },

        dataType: {
            type: String
        },

        consentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Consent"
        },

        details: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "AuditLog",
    auditLogSchema
);
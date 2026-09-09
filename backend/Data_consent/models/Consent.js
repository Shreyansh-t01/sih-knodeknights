const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema(
    {
        dataOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        dataRequester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        dataTypes: [
            {
                type: String,
                enum: [
                    "profile",
                    "documents",
                    "medical",
                    "financial",
                    "activity"
                ]
            }
        ],

        purpose: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "REVOKED", "EXPIRED"],
            default: "ACTIVE"
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Consent", consentSchema);
const mongoose = require("mongoose");

const dataRequestSchema = new mongoose.Schema(
    {
        dataOwner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        dataRequester: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        dataType: {
            type: String,
            required: true
        },

        purpose: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "COMPLETED"
            ],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "DataRequest",
    dataRequestSchema
);
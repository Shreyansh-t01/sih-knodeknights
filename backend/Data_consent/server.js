const express = require("express");
const mongoose = require("mongoose");

const consentRoutes = require("./routes/consent.routes");
const dataSharingRoutes = require("./routes/dataSharing.routes");
const errorMiddleware = require("../Exception_handling/middleware/error.middleware");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "data-consent"
    });
});

app.use("/api/consents", consentRoutes);
app.use("/api/data-sharing", dataSharingRoutes);
app.use(errorMiddleware);

const start = async () => {
    if (process.env.MONGO_URI) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }

    app.listen(port, () => {
        console.log(`Data consent API listening on port ${port}`);
    });
};

start().catch((error) => {
    console.error("Failed to start data consent API:", error.message);
    process.exitCode = 1;
});

module.exports = app;

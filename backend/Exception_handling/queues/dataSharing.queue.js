
const { Queue } = require("bullmq");

const redisConnection =
    require("../config/redis");

const dataSharingQueue = new Queue(
    "data-sharing",
    {
        connection: redisConnection,

        defaultJobOptions: {
            attempts: 3,

            backoff: {
                type: "exponential",
                delay: 2000
            },

            removeOnComplete: 100,

            removeOnFail: false
        }
    }
);

module.exports = dataSharingQueue;

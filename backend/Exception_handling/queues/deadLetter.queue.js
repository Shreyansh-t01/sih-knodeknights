
const { Queue } = require("bullmq");

const redisConnection =
    require("../config/redis");

const deadLetterQueue = new Queue(
    "data-sharing-dead-letter",
    {
        connection: redisConnection
    }
);

module.exports = deadLetterQueue;


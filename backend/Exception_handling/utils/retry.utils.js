
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;

const getRetryDelay = (attempt) => {
    return INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
};

const shouldRetry = (attemptsMade) => {
    return attemptsMade < MAX_RETRIES;
};

const isMaxRetriesExceeded = (attemptsMade) => {
    return attemptsMade >= MAX_RETRIES;
};

module.exports = {
    MAX_RETRIES,
    INITIAL_RETRY_DELAY,
    getRetryDelay,
    shouldRetry,
    isMaxRetriesExceeded
};


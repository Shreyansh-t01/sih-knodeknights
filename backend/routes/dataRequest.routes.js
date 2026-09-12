const express = require('express');
const { handleDataRequest } = require('../controllers/dataRequest.controller');

const router = express.Router();

router.post('/', handleDataRequest);

module.exports = router;

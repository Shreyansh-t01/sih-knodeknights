const express = require('express');
const { getPendingApplications } = require('../controllers/application.controller');

const router = express.Router();

router.get('/pending/:global_id', getPendingApplications);

module.exports = router;

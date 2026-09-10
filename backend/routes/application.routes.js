const express = require('express');

const {
  getPendingApplications,
  updateApplicationConsent,
} = require('../controllers/application.controller');

const router = express.Router();

router.get('/pending/:global_id', getPendingApplications);

router.post('/:uarn/consent', updateApplicationConsent);

module.exports = router;
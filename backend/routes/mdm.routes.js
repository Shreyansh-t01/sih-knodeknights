const express = require('express');
const { upsertIdentity } = require('../controllers/identity.controller');

const router = express.Router();

router.post('/identity', upsertIdentity);

module.exports = router;

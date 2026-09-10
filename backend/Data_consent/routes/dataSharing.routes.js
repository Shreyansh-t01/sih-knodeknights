const express = require("express");

const router = express.Router();
const authenticate = require("../middleware/authenticate");
const controller = require("../controllers/dataSharing.controller");

router.post("/", authenticate, controller.requestDataShare);
router.get("/:jobId", authenticate, controller.getJobStatus);

module.exports = router;

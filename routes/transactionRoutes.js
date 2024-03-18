const express = require("express");
const transactionController = require("../controllers/transactionController");
const userTokenMiddleware = require("../middlewares/userTokenMiddleware");
const router = express.Router();

router.get("/history", userTokenMiddleware, transactionController.getHistory);

module.exports = router;
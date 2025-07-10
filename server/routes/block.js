const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth.js');
const {
  getAllBlocks,
  getBlockByID
} = require('../controllers/blockController');

// GET /api/block/
router.get("/", ensureAuth, getAllBlocks);

// GET /api/block/getBlockByID?blockID=xxx
router.get("/getBlockByID", ensureAuth, getBlockByID);

module.exports = router;

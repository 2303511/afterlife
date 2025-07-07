const express = require('express');
const router = express.Router();
const { ensureAuth, ensureRole } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/stats', ensureAuth, ensureRole(['staff', 'admin']), getDashboardStats);

module.exports = router;

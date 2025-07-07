const express = require("express");
const router = express.Router();
const { ensureAuth, ensureRole } = require("../middleware/auth.js");
const {
  getAllNiches,
  getNicheByID,
  getBuildings,
  getLevelsByBuilding,
  getBlocksByLevel,
  getNichesByBlock,
  updateNicheStatus
} = require("../controllers/nicheController");

router.get("/", ensureAuth, getAllNiches);
router.get("/getNicheByID", ensureAuth, getNicheByID);
router.get("/buildings", ensureAuth, getBuildings);
router.get("/levels/:buildingID", ensureAuth, getLevelsByBuilding);
router.get("/blocks/:levelID", ensureAuth, getBlocksByLevel);
router.get("/niches/:blockID", ensureAuth, getNichesByBlock);
router.post("/update-status", ensureAuth, ensureRole(["admin"]), updateNicheStatus);

module.exports = router;

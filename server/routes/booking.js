const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { ensureAuth, ensureRole, ensureSelfOrRole } = require('../middleware/auth');
// for file validation
const validateFileBooking = require('../middleware/bookingFileValidator');
const {
  getBookingsForUser,
  getBookingByUserID,
  getBookingByBookingID,
  getSearchedBookings,
  getPendingBookings,
  submitBooking,
  deleteDraftBookings,
  updateBookingTransaction,
  placeUrn,
  approveBooking,
  archiveBooking,
  getBookingApprovalDetails
} = require('../controllers/bookingController');

// GET bookings for a given userID (self or staff/admin)
router.get("/", ensureAuth, ensureSelfOrRole(["staff","admin"]), getBookingsForUser);

// GET bookings paid by a given userID (self or staff/admin)
router.get("/getBookingByUserID", ensureAuth, ensureSelfOrRole(["staff","admin"]), getBookingByUserID);

// GET a booking by bookingID (self if owner, or staff/admin)
router.get("/getBookingByBookingID", ensureAuth, getBookingByBookingID);

// staff-only search
router.get("/search", ensureAuth, ensureRole(["staff","admin"]), getSearchedBookings);

// staff-only view pending
router.get("/pending", ensureAuth, ensureRole(["staff","admin"]), getPendingBookings);

// Submit a booking
router.post("/submitBooking", ensureAuth, upload.fields([{ name: 'birthCertFile', maxCount: 1 }, { name: 'deathCertFile', maxCount: 1 }]), validateFileBooking, submitBooking);

// booking failed
router.post("/delete-draft-booking", ensureAuth, ensureRole(["user","staff","admin"]), deleteDraftBookings);

// after the user completes payment, need to update the booking to fully paid. 
router.post("/updateBookingTransaction", ensureAuth, ensureSelfOrRole(["user", "staff","admin"]), updateBookingTransaction);

// user request to place urn
router.post("/place-urn", ensureAuth, ensureSelfOrRole(["staff","admin"]), upload.single("deathCertFile"), placeUrn);

// staff - to approve pending niches aka to put a urn in
router.post('/approve', ensureAuth, ensureRole(["staff","admin"]), approveBooking);

// staff - to archive ('free') niches once the applicants are done with it
router.post('/archive', ensureAuth, ensureRole(["staff","admin"]), archiveBooking );

//bene.beneficiaryNRIC, 
router.get("/approval/:bookingID", ensureAuth, getBookingApprovalDetails);

module.exports = router;


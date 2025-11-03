const express = require('express');
const router = express.Router();
const timetableApprovalController = require('../controllers/timetableApprovalController');

router.post('/submit', timetableApprovalController.submitForReview);
router.post('/approve', timetableApprovalController.approveTimetable);
router.post('/reject', timetableApprovalController.rejectTimetable);
router.get('/pending', timetableApprovalController.getPendingReviews);
router.get('/status', timetableApprovalController.getTimetableStatus);

module.exports = router;
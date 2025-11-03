const express = require('express');
const router = express.Router();
const facultyLeaveController = require('../controllers/facultyLeaveController');

router.get('/', facultyLeaveController.getAllLeaves);
router.post('/', facultyLeaveController.createLeave);
router.put('/:id/status', facultyLeaveController.updateLeaveStatus);

module.exports = router;
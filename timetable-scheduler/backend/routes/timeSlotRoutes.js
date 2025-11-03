const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlotController');

// GET /api/time-slots/available - Get available time slots (must be before /:id)
router.get('/available', timeSlotController.getAvailableTimeSlots);

// GET /api/time-slots - Get all time slots
router.get('/', timeSlotController.getAllTimeSlots);

// GET /api/time-slots/:id - Get single time slot
router.get('/:id', timeSlotController.getTimeSlotById);

// POST /api/time-slots - Create new time slot
router.post('/', timeSlotController.createTimeSlot);

// PUT /api/time-slots/:id - Update time slot
router.put('/:id', timeSlotController.updateTimeSlot);

// DELETE /api/time-slots/:id - Delete time slot
router.delete('/:id', timeSlotController.deleteTimeSlot);

module.exports = router;
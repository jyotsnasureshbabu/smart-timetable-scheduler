const express = require('express');
const router = express.Router();
const constraintController = require('../controllers/constraintController');

router.get('/', constraintController.getAllConstraints);
router.post('/fixed-slot', constraintController.createFixedSlot);
router.post('/faculty-unavailable', constraintController.createFacultyUnavailable);
router.put('/:id/deactivate', constraintController.deactivateConstraint);

module.exports = router;
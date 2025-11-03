const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');

// GET /api/classrooms - Get all classrooms
router.get('/', classroomController.getAllClassrooms);

// GET /api/classrooms/:id - Get single classroom
router.get('/:id', classroomController.getClassroomById);

// POST /api/classrooms - Create new classroom
router.post('/', classroomController.createClassroom);

// PUT /api/classrooms/:id - Update classroom
router.put('/:id', classroomController.updateClassroom);

// DELETE /api/classrooms/:id - Delete classroom
router.delete('/:id', classroomController.deleteClassroom);

module.exports = router;
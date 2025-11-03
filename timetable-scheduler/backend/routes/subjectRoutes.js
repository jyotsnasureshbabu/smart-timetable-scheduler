const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// GET /api/subjects - Get all subjects
router.get('/', subjectController.getAllSubjects);

// GET /api/subjects/:id - Get single subject
router.get('/:id', subjectController.getSubjectById);

// POST /api/subjects - Create new subject
router.post('/', subjectController.createSubject);

// PUT /api/subjects/:id - Update subject
router.put('/:id', subjectController.updateSubject);

// DELETE /api/subjects/:id - Delete subject
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
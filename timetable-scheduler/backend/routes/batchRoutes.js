const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// GET /api/batches - Get all batches
router.get('/', batchController.getAllBatches);

// GET /api/batches/:id - Get single batch
router.get('/:id', batchController.getBatchById);

// POST /api/batches - Create new batch
router.post('/', batchController.createBatch);

// PUT /api/batches/:id - Update batch
router.put('/:id', batchController.updateBatch);

// DELETE /api/batches/:id - Delete batch
router.delete('/:id', batchController.deleteBatch);

// GET /api/batches/:id/subjects - Get subjects for a batch
router.get('/:id/subjects', batchController.getBatchSubjects);

// POST /api/batches/:batchId/subjects/:subjectId - Assign subject to batch
router.post('/:batchId/subjects/:subjectId', batchController.assignSubjectToBatch);

module.exports = router;
// Debug version of facultyRoutes.js
const express = require('express');
const router = express.Router();

console.log('📁 Faculty routes file loaded');

// Simple test route first
router.get('/test', (req, res) => {
  res.json({
    message: 'Faculty routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Import controller
let facultyController;
try {
  facultyController = require('../controllers/facultyController');
  console.log('✅ Faculty controller loaded successfully');
} catch (error) {
  console.error('❌ Error loading faculty controller:', error.message);
}

// Faculty routes
if (facultyController) {
  // GET /api/faculty - Get all faculty
  router.get('/', facultyController.getAllFaculty);
  
  // GET /api/faculty/:id - Get single faculty by ID
  router.get('/:id', facultyController.getFacultyById);
  
  // POST /api/faculty - Create new faculty
  router.post('/', facultyController.createFaculty);
  
  // PUT /api/faculty/:id - Update faculty by ID
  router.put('/:id', facultyController.updateFaculty);
  
  // DELETE /api/faculty/:id - Delete faculty by ID
  router.delete('/:id', facultyController.deleteFaculty);
  
  console.log('✅ All faculty routes registered');
} else {
  // Fallback routes if controller fails to load
  router.get('/', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Faculty controller not loaded'
    });
  });
}

module.exports = router;
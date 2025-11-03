// This file contains all the business logic for faculty operations
const pool = require('../config/database');

// Controller object to hold all faculty-related functions
const facultyController = {
  
  // GET ALL FACULTY - Retrieve all faculty members
  getAllFaculty: async (req, res) => {
    try {
      console.log('📋 Getting all faculty members...');
      
      // SQL query to get all faculty
      const query = 'SELECT * FROM faculty ORDER BY created_at DESC';
      const result = await pool.query(query);
      
      // Send successful response
      res.status(200).json({
        success: true,
        message: 'Faculty retrieved successfully',
        data: result.rows,
        total: result.rows.length
      });
      
    } catch (error) {
      console.error('❌ Error getting faculty:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve faculty',
        error: error.message
      });
    }
  },

  // GET SINGLE FACULTY - Retrieve one faculty member by ID
  getFacultyById: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔍 Getting faculty with ID: ${id}`);
      
      const query = 'SELECT * FROM faculty WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      // Check if faculty exists
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Faculty retrieved successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error getting faculty by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve faculty',
        error: error.message
      });
    }
  },

  // CREATE FACULTY - Add new faculty member
  createFaculty: async (req, res) => {
    try {
      const { name, subject, email, phone } = req.body;
      
      console.log('➕ Creating new faculty:', { name, subject, email, phone });
      
      // Validate required fields
      if (!name || !subject) {
        return res.status(400).json({
          success: false,
          message: 'Name and subject are required fields'
        });
      }
      
      // SQL query to insert new faculty
      const query = `
        INSERT INTO faculty (name, subject, email, phone) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const values = [name, subject, email, phone];
      const result = await pool.query(query, values);
      
      res.status(201).json({
        success: true,
        message: 'Faculty created successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error creating faculty:', error);
      
      // Handle duplicate email error
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create faculty',
        error: error.message
      });
    }
  },

  // UPDATE FACULTY - Update existing faculty member
  updateFaculty: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, subject, email, phone } = req.body;
      
      console.log(`✏️ Updating faculty ID: ${id}`, { name, subject, email, phone });
      
      // Check if faculty exists first
      const checkQuery = 'SELECT * FROM faculty WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }
      
      // Update faculty
      const updateQuery = `
        UPDATE faculty 
        SET name = $1, subject = $2, email = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 
        RETURNING *
      `;
      
      const values = [name, subject, email, phone, id];
      const result = await pool.query(updateQuery, values);
      
      res.status(200).json({
        success: true,
        message: 'Faculty updated successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error updating faculty:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update faculty',
        error: error.message
      });
    }
  },

  // DELETE FACULTY - Remove faculty member
  deleteFaculty: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting faculty ID: ${id}`);
      
      // Check if faculty exists first
      const checkQuery = 'SELECT * FROM faculty WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }
      
      // Delete faculty
      const deleteQuery = 'DELETE FROM faculty WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);
      
      res.status(200).json({
        success: true,
        message: 'Faculty deleted successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Error deleting faculty:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete faculty',
        error: error.message
      });
    }
  }
};

module.exports = facultyController;
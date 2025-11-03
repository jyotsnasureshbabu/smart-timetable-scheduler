// controllers/subjectController.js
const pool = require('../config/database');

const subjectController = {
  // GET ALL SUBJECTS
  getAllSubjects: async (req, res) => {
    try {
      const query = 'SELECT * FROM subjects ORDER BY name';
      const result = await pool.query(query);

      res.status(200).json({
        success: true,
        message: 'Subjects retrieved successfully',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error getting subjects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve subjects',
        error: error.message
      });
    }
  },

  // GET SINGLE SUBJECT BY ID
  getSubjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'SELECT * FROM subjects WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Subject retrieved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error getting subject by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve subject',
        error: error.message
      });
    }
  },

  // CREATE SUBJECT
  createSubject: async (req, res) => {
    try {
      const { name, code, hours_per_week } = req.body;

      // Validate required fields
      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Name and code are required fields'
        });
      }

      const query = `
        INSERT INTO subjects (name, code, hours_per_week)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const values = [name, code, hours_per_week || 4];
      const result = await pool.query(query, values);

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      
      // Handle duplicate name/code error
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Subject name or code already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create subject',
        error: error.message
      });
    }
  },

  // UPDATE SUBJECT
  updateSubject: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, hours_per_week } = req.body;

      // Check if subject exists
      const checkQuery = 'SELECT * FROM subjects WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      const updateQuery = `
        UPDATE subjects 
        SET name = $1, code = $2, hours_per_week = $3
        WHERE id = $4
        RETURNING *
      `;
      const values = [name, code, hours_per_week, id];
      const result = await pool.query(updateQuery, values);

      res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Subject name or code already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update subject',
        error: error.message
      });
    }
  },

  // DELETE SUBJECT
  deleteSubject: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if subject exists
      const checkQuery = 'SELECT * FROM subjects WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      const deleteQuery = 'DELETE FROM subjects WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);

      res.status(200).json({
        success: true,
        message: 'Subject deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete subject',
        error: error.message
      });
    }
  }
};

module.exports = subjectController;
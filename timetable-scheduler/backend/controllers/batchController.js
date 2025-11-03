// controllers/batchController.js
const pool = require('../config/database');

const batchController = {
  // GET ALL BATCHES
  getAllBatches: async (req, res) => {
    try {
      const query = 'SELECT * FROM batches ORDER BY name';
      const result = await pool.query(query);

      res.status(200).json({
        success: true,
        message: 'Batches retrieved successfully',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error getting batches:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve batches',
        error: error.message
      });
    }
  },

  // GET SINGLE BATCH BY ID
  getBatchById: async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'SELECT * FROM batches WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Batch retrieved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error getting batch by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve batch',
        error: error.message
      });
    }
  },

  // CREATE BATCH
  createBatch: async (req, res) => {
    try {
      const { name, year, semester, student_count, department } = req.body;

      // Validate required fields
      if (!name || !year || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Name, year, and semester are required fields'
        });
      }

      const query = `
        INSERT INTO batches (name, year, semester, student_count, department)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [name, year, semester, student_count || 60, department];
      const result = await pool.query(query, values);

      res.status(201).json({
        success: true,
        message: 'Batch created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating batch:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Batch name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create batch',
        error: error.message
      });
    }
  },

  // UPDATE BATCH
  updateBatch: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, year, semester, student_count, department } = req.body;

      // Check if batch exists
      const checkQuery = 'SELECT * FROM batches WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const updateQuery = `
        UPDATE batches 
        SET name = $1, year = $2, semester = $3, student_count = $4, department = $5
        WHERE id = $6
        RETURNING *
      `;
      const values = [name, year, semester, student_count, department, id];
      const result = await pool.query(updateQuery, values);

      res.status(200).json({
        success: true,
        message: 'Batch updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating batch:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Batch name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update batch',
        error: error.message
      });
    }
  },

  // DELETE BATCH
  deleteBatch: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if batch exists
      const checkQuery = 'SELECT * FROM batches WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const deleteQuery = 'DELETE FROM batches WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);

      res.status(200).json({
        success: true,
        message: 'Batch deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting batch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete batch',
        error: error.message
      });
    }
  },

  // GET SUBJECTS FOR A BATCH
  getBatchSubjects: async (req, res) => {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT s.*, bs.hours_per_week
        FROM subjects s
        JOIN batch_subjects bs ON s.id = bs.subject_id
        WHERE bs.batch_id = $1
        ORDER BY s.name
      `;
      const result = await pool.query(query, [id]);

      res.status(200).json({
        success: true,
        message: 'Batch subjects retrieved successfully',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error getting batch subjects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve batch subjects',
        error: error.message
      });
    }
  },

  // ASSIGN SUBJECT TO BATCH
  assignSubjectToBatch: async (req, res) => {
    try {
      const { batchId, subjectId } = req.params;
      const { hours_per_week } = req.body;

      const query = `
        INSERT INTO batch_subjects (batch_id, subject_id, hours_per_week)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const values = [batchId, subjectId, hours_per_week || 4];
      const result = await pool.query(query, values);

      res.status(201).json({
        success: true,
        message: 'Subject assigned to batch successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error assigning subject to batch:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Subject already assigned to this batch'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to assign subject to batch',
        error: error.message
      });
    }
  }
};

module.exports = batchController;
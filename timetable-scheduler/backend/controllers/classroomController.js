// controllers/classroomController.js
const pool = require('../config/database');

const classroomController = {
  // GET ALL CLASSROOMS
  getAllClassrooms: async (req, res) => {
    try {
      const query = 'SELECT * FROM classrooms ORDER BY name';
      const result = await pool.query(query);

      res.status(200).json({
        success: true,
        message: 'Classrooms retrieved successfully',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error getting classrooms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve classrooms',
        error: error.message
      });
    }
  },

  // GET SINGLE CLASSROOM BY ID
  getClassroomById: async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'SELECT * FROM classrooms WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Classroom not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Classroom retrieved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error getting classroom by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve classroom',
        error: error.message
      });
    }
  },

  // CREATE CLASSROOM
  createClassroom: async (req, res) => {
    try {
      const { name, capacity, type, building, floor } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Classroom name is required'
        });
      }

      const query = `
        INSERT INTO classrooms (name, capacity, type, building, floor)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [name, capacity || 60, type || 'regular', building, floor];
      const result = await pool.query(query, values);

      res.status(201).json({
        success: true,
        message: 'Classroom created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Classroom name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create classroom',
        error: error.message
      });
    }
  },

  // UPDATE CLASSROOM
  updateClassroom: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, capacity, type, building, floor } = req.body;

      // Check if classroom exists
      const checkQuery = 'SELECT * FROM classrooms WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Classroom not found'
        });
      }

      const updateQuery = `
        UPDATE classrooms 
        SET name = $1, capacity = $2, type = $3, building = $4, floor = $5
        WHERE id = $6
        RETURNING *
      `;
      const values = [name, capacity, type, building, floor, id];
      const result = await pool.query(updateQuery, values);

      res.status(200).json({
        success: true,
        message: 'Classroom updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating classroom:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Classroom name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update classroom',
        error: error.message
      });
    }
  },

  // DELETE CLASSROOM
  deleteClassroom: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if classroom exists
      const checkQuery = 'SELECT * FROM classrooms WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Classroom not found'
        });
      }

      const deleteQuery = 'DELETE FROM classrooms WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);

      res.status(200).json({
        success: true,
        message: 'Classroom deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting classroom:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete classroom',
        error: error.message
      });
    }
  }
};

module.exports = classroomController;
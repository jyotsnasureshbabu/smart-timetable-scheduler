const pool = require('../config/database');

const facultyLeaveController = {
  // GET all leaves
  getAllLeaves: async (req, res) => {
    try {
      const { faculty_id, month, year } = req.query;
      
      let query = `
        SELECT fl.*, f.name as faculty_name 
        FROM faculty_leaves fl
        JOIN faculty f ON fl.faculty_id = f.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (faculty_id) {
        paramCount++;
        query += ` AND fl.faculty_id = $${paramCount}`;
        params.push(faculty_id);
      }

      if (month && year) {
        paramCount++;
        query += ` AND EXTRACT(MONTH FROM fl.leave_date) = $${paramCount}`;
        params.push(month);
        paramCount++;
        query += ` AND EXTRACT(YEAR FROM fl.leave_date) = $${paramCount}`;
        params.push(year);
      }

      query += ' ORDER BY fl.leave_date DESC';
      
      const result = await pool.query(query, params);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching leaves:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaves',
        error: error.message
      });
    }
  },

  // CREATE leave
  createLeave: async (req, res) => {
    try {
      const { faculty_id, leave_date, reason } = req.body;

      if (!faculty_id || !leave_date) {
        return res.status(400).json({
          success: false,
          message: 'Faculty ID and leave date are required'
        });
      }

      const query = `
        INSERT INTO faculty_leaves (faculty_id, leave_date, reason, is_approved)
        VALUES ($1, $2, $3, FALSE)
        RETURNING *
      `;
      
      const result = await pool.query(query, [faculty_id, leave_date, reason]);
      
      res.status(201).json({
        success: true,
        message: 'Leave request created',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating leave:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create leave',
        error: error.message
      });
    }
  },

  // APPROVE/REJECT leave
  updateLeaveStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { is_approved } = req.body;

      const query = `
        UPDATE faculty_leaves 
        SET is_approved = $1 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await pool.query(query, [is_approved, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Leave record not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: `Leave ${is_approved ? 'approved' : 'rejected'}`,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating leave:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update leave',
        error: error.message
      });
    }
  }
};

module.exports = facultyLeaveController;
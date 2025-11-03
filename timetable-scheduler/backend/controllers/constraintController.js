const pool = require('../config/database');

const constraintController = {
  // GET all active constraints
  getAllConstraints: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM scheduling_constraints
        WHERE is_active = TRUE
        ORDER BY type, created_at DESC
      `);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching constraints:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch constraints',
        error: error.message
      });
    }
  },

  // CREATE fixed slot constraint
  createFixedSlot: async (req, res) => {
    try {
      const { subject_id, time_slot_id, reason } = req.body;

      if (!subject_id || !time_slot_id) {
        return res.status(400).json({
          success: false,
          message: 'Subject ID and time slot ID are required'
        });
      }

      const query = `
        INSERT INTO scheduling_constraints 
        (type, entity_id, time_slot_id, reason, is_active)
        VALUES ('fixed_slot', $1, $2, $3, TRUE)
        RETURNING *
      `;
      
      const result = await pool.query(query, [subject_id, time_slot_id, reason]);
      
      res.status(201).json({
        success: true,
        message: 'Fixed slot constraint created',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating fixed slot:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create fixed slot',
        error: error.message
      });
    }
  },

  // CREATE faculty unavailable constraint
  createFacultyUnavailable: async (req, res) => {
    try {
      const { faculty_id, day_of_week, time_slot_id, reason } = req.body;

      if (!faculty_id || (!day_of_week && !time_slot_id)) {
        return res.status(400).json({
          success: false,
          message: 'Faculty ID and either day_of_week or time_slot_id are required'
        });
      }

      const query = `
        INSERT INTO scheduling_constraints 
        (type, entity_id, day_of_week, time_slot_id, reason, is_active)
        VALUES ('faculty_unavailable', $1, $2, $3, $4, TRUE)
        RETURNING *
      `;
      
      const result = await pool.query(query, [faculty_id, day_of_week, time_slot_id, reason]);
      
      res.status(201).json({
        success: true,
        message: 'Faculty unavailability constraint created',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating faculty unavailable:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create faculty unavailable constraint',
        error: error.message
      });
    }
  },

  // DELETE/deactivate constraint
  deactivateConstraint: async (req, res) => {
    try {
      const { id } = req.params;

      const query = `
        UPDATE scheduling_constraints 
        SET is_active = FALSE 
        WHERE id = $1 
        RETURNING *
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Constraint not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Constraint deactivated',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error deactivating constraint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate constraint',
        error: error.message
      });
    }
  }
};

module.exports = constraintController;
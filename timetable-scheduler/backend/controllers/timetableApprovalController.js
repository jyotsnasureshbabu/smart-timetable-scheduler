const pool = require('../config/database');

const timetableApprovalController = {
  // Submit timetable for review
  submitForReview: async (req, res) => {
    try {
      const { batch_id, academic_year, semester } = req.body;

      if (!batch_id || !academic_year || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Batch ID, academic year, and semester are required'
        });
      }

      // Update all timetable entries for this batch to 'pending' status
      const result = await pool.query(`
        UPDATE timetable 
        SET status = 'pending'
        WHERE batch_id = $1 
          AND academic_year = $2 
          AND semester = $3
          AND status = 'draft'
        RETURNING *
      `, [batch_id, academic_year, semester]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No draft timetable entries found to submit'
        });
      }

      res.status(200).json({
        success: true,
        message: `${result.rows.length} timetable entries submitted for review`,
        data: {
          batch_id,
          academic_year,
          semester,
          entries_submitted: result.rows.length
        }
      });
    } catch (error) {
      console.error('Error submitting for review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit for review',
        error: error.message
      });
    }
  },

  // Approve timetable
  approveTimetable: async (req, res) => {
    try {
      const { batch_id, academic_year, semester } = req.body;
      const reviewer_id = req.user ? req.user.id : null; // From auth middleware

      if (!batch_id || !academic_year || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Batch ID, academic year, and semester are required'
        });
      }

      const result = await pool.query(`
        UPDATE timetable 
        SET status = 'approved',
            reviewed_by = $1,
            reviewed_at = CURRENT_TIMESTAMP
        WHERE batch_id = $2 
          AND academic_year = $3 
          AND semester = $4
          AND status = 'pending'
        RETURNING *
      `, [reviewer_id, batch_id, academic_year, semester]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No pending timetable entries found to approve'
        });
      }

      res.status(200).json({
        success: true,
        message: `Timetable approved! ${result.rows.length} entries approved`,
        data: {
          batch_id,
          academic_year,
          semester,
          entries_approved: result.rows.length,
          approved_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error approving timetable:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve timetable',
        error: error.message
      });
    }
  },

  // Reject timetable
  rejectTimetable: async (req, res) => {
    try {
      const { batch_id, academic_year, semester, review_notes } = req.body;
      const reviewer_id = req.user ? req.user.id : null;

      if (!batch_id || !academic_year || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Batch ID, academic year, and semester are required'
        });
      }

      const result = await pool.query(`
        UPDATE timetable 
        SET status = 'rejected',
            reviewed_by = $1,
            reviewed_at = CURRENT_TIMESTAMP,
            review_notes = $2
        WHERE batch_id = $3 
          AND academic_year = $4 
          AND semester = $5
          AND status = 'pending'
        RETURNING *
      `, [reviewer_id, review_notes, batch_id, academic_year, semester]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No pending timetable entries found to reject'
        });
      }

      res.status(200).json({
        success: true,
        message: `Timetable rejected. ${result.rows.length} entries rejected`,
        data: {
          batch_id,
          academic_year,
          semester,
          entries_rejected: result.rows.length,
          review_notes,
          rejected_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error rejecting timetable:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject timetable',
        error: error.message
      });
    }
  },

  // Get pending reviews
  getPendingReviews: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          t.batch_id,
          b.name as batch_name,
          t.academic_year,
          t.semester,
          COUNT(*) as pending_entries,
          MIN(t.created_at) as submitted_at
        FROM timetable t
        JOIN batches b ON t.batch_id = b.id
        WHERE t.status = 'pending'
        GROUP BY t.batch_id, b.name, t.academic_year, t.semester
        ORDER BY MIN(t.created_at) ASC
      `);

      res.status(200).json({
        success: true,
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending reviews',
        error: error.message
      });
    }
  },

  // Get timetable status
  getTimetableStatus: async (req, res) => {
    try {
      const { batch_id, academic_year, semester } = req.query;

      if (!batch_id || !academic_year || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Batch ID, academic year, and semester are required'
        });
      }

      const result = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM timetable
        WHERE batch_id = $1 
          AND academic_year = $2 
          AND semester = $3
        GROUP BY status
      `, [batch_id, academic_year, semester]);

      const statusSummary = {
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };

      result.rows.forEach(row => {
        statusSummary[row.status] = parseInt(row.count);
      });

      res.status(200).json({
        success: true,
        data: statusSummary,
        total: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
      });
    } catch (error) {
      console.error('Error fetching timetable status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch timetable status',
        error: error.message
      });
    }
  }
};

module.exports = timetableApprovalController;
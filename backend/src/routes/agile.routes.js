const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');

// GET /api/agile/overview
router.get('/overview', (req, res) => {
  const epics = query(`
    SELECT 
      e.*,
      COUNT(us.id) AS total_stories,
      COUNT(CASE WHEN us.status = 'DONE' THEN 1 END) AS completed_stories,
      COALESCE(SUM(us.story_points), 0) AS total_story_points,
      COALESCE(SUM(CASE WHEN us.status = 'DONE' THEN us.story_points ELSE 0 END), 0) AS completed_story_points
    FROM agile_epics e
    LEFT JOIN agile_user_stories us ON e.id = us.epic_id
    GROUP BY e.id
    ORDER BY e.id ASC
  `);

  const sprints = query(`
    SELECT 
      s.*,
      COUNT(us.id) AS stories_count,
      COALESCE(SUM(us.story_points), 0) AS committed_points,
      COALESCE(SUM(CASE WHEN us.status = 'DONE' THEN us.story_points ELSE 0 END), 0) AS completed_points
    FROM agile_sprints s
    LEFT JOIN agile_user_stories us ON s.id = us.sprint_id
    GROUP BY s.id
    ORDER BY s.sprint_number ASC
  `);

  const totalPoints = get(`SELECT COALESCE(SUM(story_points), 0) AS total FROM agile_user_stories`)?.total || 0;
  const completedPoints = get(`SELECT COALESCE(SUM(story_points), 0) AS total FROM agile_user_stories WHERE status = 'DONE'`)?.total || 0;
  const totalStories = get(`SELECT COUNT(*) AS total FROM agile_user_stories`)?.total || 0;
  const completedStories = get(`SELECT COUNT(*) AS total FROM agile_user_stories WHERE status = 'DONE'`)?.total || 0;

  res.json({
    summary: {
      epics_count: epics.length,
      sprints_count: sprints.length,
      total_stories: totalStories,
      completed_stories: completedStories,
      total_story_points: totalPoints,
      completed_story_points: completedPoints,
      completion_percentage: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
    },
    epics,
    sprints
  });
});

// GET /api/agile/stories
router.get('/stories', (req, res) => {
  const { sprint_id, epic_id, status, assignee_role } = req.query;

  let sql = `
    SELECT 
      us.*,
      e.title AS epic_title,
      s.name AS sprint_name,
      s.sprint_number
    FROM agile_user_stories us
    JOIN agile_epics e ON us.epic_id = e.id
    JOIN agile_sprints s ON us.sprint_id = s.id
  `;

  const conditions = [];
  const params = [];

  if (sprint_id) {
    conditions.push(`us.sprint_id = ?`);
    params.push(sprint_id);
  }

  if (epic_id) {
    conditions.push(`us.epic_id = ?`);
    params.push(epic_id);
  }

  if (status) {
    conditions.push(`us.status = ?`);
    params.push(status);
  }

  if (assignee_role) {
    conditions.push(`us.assignee_role = ?`);
    params.push(assignee_role);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` ORDER BY s.sprint_number ASC, us.id ASC`;

  const stories = query(sql, params);
  res.json({ stories });
});

// PUT /api/agile/stories/:id/status
router.put('/stories/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${valid.join(', ')}` });
  }

  const story = get(`SELECT * FROM agile_user_stories WHERE id = ?`, [req.params.id]);
  if (!story) {
    return res.status(404).json({ error: 'User story not found.' });
  }

  run(`UPDATE agile_user_stories SET status = ? WHERE id = ?`, [status, req.params.id]);

  // Recalculate epic progress percentage
  const epicStats = get(`
    SELECT 
      COUNT(*) AS total,
      COUNT(CASE WHEN status = 'DONE' THEN 1 END) AS done
    FROM agile_user_stories
    WHERE epic_id = ?
  `, [story.epic_id]);

  if (epicStats && epicStats.total > 0) {
    const pct = Math.round((epicStats.done / epicStats.total) * 100);
    run(`UPDATE agile_epics SET progress_percent = ? WHERE id = ?`, [pct, story.epic_id]);
  }

  res.json({ message: 'User story status updated successfully', status });
});

module.exports = router;

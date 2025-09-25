const express = require('express');
const { body, query, param } = require('express-validator');
const {
  getForumThreads,
  createForumPost,
  getForumPost,
  moderateForumPost,
  toggleLikePost,
  reportForumPost,
  getModerationQueue
} = require('../controllers/forum.controller');
const { protect, optionalAuth, authorize } = require('../middlewares/auth.middleware');
const { defaultRateLimit, createCustomRateLimit } = require('../middlewares/rateLimit');

const router = express.Router();

// Rate limiting for forum operations
const forumRateLimit = createCustomRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
const postCreateLimit = createCustomRateLimit(5, 15 * 60 * 1000); // 5 post creations per 15 minutes
const moderationLimit = createCustomRateLimit(200, 15 * 60 * 1000); // 200 moderation actions per 15 minutes

// @route   GET /api/v1/forum/threads
// @desc    Get forum threads with filtering, sorting, and pagination
// @access  Public
router.get(
  '/threads',
  forumRateLimit,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('tag')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag must be 1-50 characters'),
    query('language')
      .optional()
      .isIn(['en', 'hi', 'mr', 'gu', 'bn', 'te', 'ta', 'kn', 'ml', 'or', 'pa', 'as', 'ur'])
      .withMessage('Invalid language code'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be 1-100 characters'),
    query('sort')
      .optional()
      .isIn(['recent', 'popular', 'trending', 'oldest'])
      .withMessage('Sort must be recent, popular, trending, or oldest'),
    query('pinned')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Pinned must be true or false')
  ],
  getForumThreads
);

// @route   POST /api/v1/forum/posts
// @desc    Create new forum post (supports anonymous posting)
// @access  Private (optional - allows anonymous posts)
router.post(
  '/posts',
  postCreateLimit,
  optionalAuth, // Allows both authenticated and anonymous posts
  [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters')
      .matches(/^[a-zA-Z0-9\s\-_.,!?()[\]{}'"।॥]+$/)
      .withMessage('Title contains invalid characters'),
    body('body')
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Body must be between 10 and 5000 characters'),
    body('language')
      .optional()
      .isIn(['en', 'hi', 'mr', 'gu', 'bn', 'te', 'ta', 'kn', 'ml', 'or', 'pa', 'as', 'ur'])
      .withMessage('Invalid language code'),
    body('tags')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 tags allowed')
      .custom((tags) => {
        if (tags && Array.isArray(tags)) {
          for (let tag of tags) {
            if (typeof tag !== 'string' || tag.length < 1 || tag.length > 50) {
              throw new Error('Each tag must be 1-50 characters');
            }
            if (!/^[a-zA-Z0-9\-_]+$/.test(tag)) {
              throw new Error('Tags can only contain letters, numbers, hyphens, and underscores');
            }
          }
        }
        return true;
      }),
    body('isAnonymous')
      .optional()
      .isBoolean()
      .withMessage('isAnonymous must be a boolean'),
    body('parentPost')
      .optional()
      .isMongoId()
      .withMessage('Parent post must be a valid MongoDB ID')
  ],
  createForumPost
);

// @route   GET /api/v1/forum/posts/:id
// @desc    Get specific forum post with replies
// @access  Public
router.get(
  '/posts/:id',
  forumRateLimit,
  optionalAuth, // Optional auth to check viewing permissions
  [
    param('id')
      .isMongoId()
      .withMessage('Post ID must be a valid MongoDB ID')
  ],
  getForumPost
);

// @route   PATCH /api/v1/forum/posts/:id/moderate
// @desc    Moderate forum post (change status, add notes)
// @access  Private (admin/moderator only)
router.patch(
  '/posts/:id/moderate',
  moderationLimit,
  protect,
  authorize('admin', 'moderator'),
  [
    param('id')
      .isMongoId()
      .withMessage('Post ID must be a valid MongoDB ID'),
    body('status')
      .isIn(['pending_moderation', 'published', 'flagged', 'removed'])
      .withMessage('Status must be pending_moderation, published, flagged, or removed'),
    body('moderationNotes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Moderation notes must be less than 1000 characters')
  ],
  moderateForumPost
);

// @route   POST /api/v1/forum/posts/:id/like
// @desc    Like or unlike a forum post
// @access  Private
router.post(
  '/posts/:id/like',
  forumRateLimit,
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Post ID must be a valid MongoDB ID')
  ],
  toggleLikePost
);

// @route   POST /api/v1/forum/posts/:id/report
// @desc    Report a forum post for moderation
// @access  Private
router.post(
  '/posts/:id/report',
  forumRateLimit,
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Post ID must be a valid MongoDB ID'),
    body('reason')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Report reason must be between 5 and 500 characters')
      .isIn([
        'spam',
        'harassment',
        'self_harm',
        'violence',
        'inappropriate_content',
        'misinformation',
        'duplicate',
        'off_topic',
        'other'
      ])
      .withMessage('Invalid report reason')
  ],
  reportForumPost
);

// @route   GET /api/v1/forum/moderation/queue
// @desc    Get posts needing moderation
// @access  Private (admin/moderator only)
router.get(
  '/moderation/queue',
  moderationLimit,
  protect,
  authorize('admin', 'moderator'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending_moderation', 'flagged'])
      .withMessage('Status must be pending_moderation or flagged')
  ],
  getModerationQueue
);

// @route   GET /api/v1/forum/tags
// @desc    Get popular forum tags
// @access  Public
router.get(
  '/tags',
  forumRateLimit,
  async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      
      // Aggregate popular tags from published posts
      const popularTags = await require('../models/forum.model').aggregate([
        { $match: { status: 'published', tags: { $exists: true, $ne: [] } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);

      res.status(200).json({
        success: true,
        tags: popularTags.map(tag => ({
          name: tag._id,
          count: tag.count
        }))
      });
    } catch (error) {
      console.error('Get forum tags error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving forum tags'
      });
    }
  }
);

// @route   GET /api/v1/forum/stats
// @desc    Get forum statistics
// @access  Public
router.get(
  '/stats',
  forumRateLimit,
  async (req, res) => {
    try {
      const stats = await Promise.all([
        // Total published posts
        require('../models/forum.model').countDocuments({ status: 'published' }),
        // Posts today
        require('../models/forum.model').countDocuments({
          status: 'published',
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),
        // Posts needing moderation
        require('../models/forum.model').countDocuments({
          status: { $in: ['pending_moderation', 'flagged'] }
        }),
        // Total views
        require('../models/forum.model').aggregate([
          { $match: { status: 'published' } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ])
      ]);

      res.status(200).json({
        success: true,
        stats: {
          totalPosts: stats[0],
          postsToday: stats[1],
          pendingModeration: stats[2],
          totalViews: stats[3][0]?.totalViews || 0
        }
      });
    } catch (error) {
      console.error('Get forum stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving forum statistics'
      });
    }
  }
);

module.exports = router;
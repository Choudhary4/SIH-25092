const { validationResult } = require('express-validator');
const ForumPost = require('../models/forum.model');
const User = require('../models/user.model');
const { analyzeContent, isHighRiskContent } = require('../utils/contentFilter');

// @desc    Get forum threads (published posts only)
// @route   GET /api/v1/forum/threads
// @access  Public
const getForumThreads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      tag,
      language,
      search,
      sort = 'recent', // recent, popular, trending
      pinned = 'true'
    } = req.query;

    // Build query for published posts only
    let query = { 
      status: 'published',
      parentPost: null // Only top-level posts (not replies)
    };

    // Filter by tag if provided
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    // Filter by language if provided
    if (language) {
      query.language = language;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    let sortOptions = {};
    
    // Determine sort order
    switch (sort) {
      case 'popular':
        sortOptions = { likes: -1, views: -1, createdAt: -1 };
        break;
      case 'trending':
        // For trending, we'll use a combination of recent activity and engagement
        sortOptions = { lastActivity: -1, likes: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Always prioritize pinned posts
    if (pinned === 'true') {
      sortOptions = { isPinned: -1, ...sortOptions };
    }

    const posts = await ForumPost.find(query)
      .populate('studentId', 'name collegeId')
      .select('-flaggedWords -likedBy -reportedBy -moderationNotes')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumPost.countDocuments(query);

    // Increment view count for each post (async, don't wait)
    posts.forEach(post => {
      post.incrementViews().catch(err => 
        console.error('Error incrementing views:', err)
      );
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      filters: {
        tag: tag || null,
        language: language || null,
        search: search || null,
        sort
      },
      posts
    });

  } catch (error) {
    console.error('Get forum threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving forum threads'
    });
  }
};

// @desc    Create new forum post
// @route   POST /api/v1/forum/posts
// @access  Private (optional auth for anonymous posts)
const createForumPost = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      body,
      language = 'en',
      tags = [],
      isAnonymous = false,
      parentPost = null
    } = req.body;

    // Content analysis for safety
    const contentAnalysis = analyzeContent(title, body);
    
    // Log high-risk content for immediate attention
    if (contentAnalysis.requiresImmediate) {
      console.log('🚨 HIGH RISK FORUM POST DETECTED:', {
        title: title.substring(0, 50) + '...',
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        flags: contentAnalysis.contentFlags,
        overallRisk: contentAnalysis.overallRisk
      });
    }

    // Determine student ID (null for anonymous posts)
    const studentId = (isAnonymous || !req.user) ? null : req.user.id;

    // Validate parent post if this is a reply
    let parentPostDoc = null;
    if (parentPost) {
      parentPostDoc = await ForumPost.findById(parentPost);
      if (!parentPostDoc) {
        return res.status(400).json({
          success: false,
          message: 'Parent post not found'
        });
      }
      
      if (parentPostDoc.isLocked) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reply to locked post'
        });
      }
    }

    // Create post data
    const postData = {
      studentId,
      title: title.trim(),
      body: body.trim(),
      language,
      tags: Array.isArray(tags) ? tags : [],
      status: contentAnalysis.recommendedStatus,
      contentFlags: contentAnalysis.contentFlags,
      flaggedWords: contentAnalysis.flaggedWords,
      parentPost: parentPost || null,
      isAnonymous: studentId === null
    };

    // Create the post
    const post = await ForumPost.create(postData);

    // Update parent post reply count if this is a reply
    if (parentPostDoc) {
      parentPostDoc.replyCount += 1;
      parentPostDoc.lastActivity = new Date();
      parentPostDoc.replies.push(post._id);
      await parentPostDoc.save();
    }

    // Emit real-time moderation alert for high-risk content
    if (contentAnalysis.requiresImmediate) {
      try {
        const socketService = require('../services/socket.service');
        
        // Get user information for the alert
        let userName = 'Anonymous User';
        let anonymousDisplayName = 'Anonymous User';
        let realName = null;
        let userEmail = null;
        let collegeId = null;
        
        if (studentId) {
          const student = await User.findById(studentId).select('name email collegeId anonymousDisplayName');
          if (student) {
            userName = student.anonymousDisplayName || 'Anonymous User'; // Public display
            anonymousDisplayName = student.anonymousDisplayName || 'Anonymous User';
            realName = student.name; // Admin-only for identity tracking
            userEmail = student.email;
            collegeId = student.collegeId;
          }
        }

        const alertData = {
          _id: post._id,
          title,
          content: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
          studentId,
          contentFlags: contentAnalysis.contentFlags,
          userName, // Anonymous display name for public display
          realName, // Real name for admin tracking only
          anonymousDisplayName,
          userEmail,
          collegeId,
          timestamp: new Date(),
          type: 'forum_moderation',
          overallRisk: contentAnalysis.overallRisk
        };

        socketService.emitModerationAlert(alertData);
        
        console.log('✅ Forum moderation alert emitted via Socket.io for post:', post._id);
      } catch (socketError) {
        console.error('Failed to emit forum moderation alert via Socket.io:', socketError);
        // Don't fail the response if socket emission fails
      }
    }

    // Populate the response
    await post.populate('studentId', 'name collegeId');

    // Prepare response based on content analysis
    let responseMessage = 'Post created and published successfully';
    let warningMessage = null;

    if (contentAnalysis.recommendedStatus === 'flagged') {
      responseMessage = 'Post created but flagged for review due to potentially harmful content';
      warningMessage = 'Your post contains content that may be concerning. A moderator will review it shortly. If you\'re experiencing thoughts of self-harm, please reach out for help immediately.';
    } else if (contentAnalysis.recommendedStatus === 'pending_moderation') {
      responseMessage = 'Post created and pending moderation review';
    }

    // Include crisis resources if self-harm detected
    let crisisResources = null;
    if (contentAnalysis.contentFlags.selfHarm) {
      crisisResources = {
        crisis_hotline: '988', // National Suicide Prevention Lifeline
        crisis_text: 'Text HOME to 741741',
        emergency: '911',
        message: 'If you\'re having thoughts of self-harm, please reach out for help immediately. You\'re not alone.'
      };
    }

    res.status(201).json({
      success: true,
      message: responseMessage,
      warning: warningMessage,
      crisisResources,
      post: {
        id: post._id,
        postId: post.postId,
        title: post.title,
        body: post.body,
        language: post.language,
        tags: post.tags,
        status: post.status,
        studentId: post.studentId,
        anonymizedId: post.anonymizedId,
        isAnonymous: post.isAnonymous,
        parentPost: post.parentPost,
        views: post.views,
        likes: post.likes,
        replyCount: post.replyCount,
        createdAt: post.createdAt
      }
    });

  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating forum post'
    });
  }
};

// @desc    Get specific forum post with replies
// @route   GET /api/v1/forum/posts/:id
// @access  Public
const getForumPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    
    // Find the main post
    const post = await ForumPost.findById(postId)
      .populate('studentId', 'name collegeId')
      .populate('moderatedBy', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Only show published posts to public (unless user is moderator/admin)
    const canViewUnpublished = req.user && ['admin', 'moderator'].includes(req.user.role);
    const isAuthor = req.user && post.studentId && post.studentId._id.toString() === req.user.id;
    
    if (post.status !== 'published' && !canViewUnpublished && !isAuthor) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Get replies if this is a top-level post
    let replies = [];
    if (!post.parentPost && post.replyCount > 0) {
      replies = await ForumPost.find({
        parentPost: post._id,
        status: 'published'
      })
      .populate('studentId', 'name collegeId')
      .sort({ createdAt: 1 })
      .limit(50); // Limit replies to prevent large responses
    }

    // Increment view count (async, don't wait)
    post.incrementViews().catch(err => 
      console.error('Error incrementing views:', err)
    );

    const response = {
      success: true,
      post: post.toJSON(),
      replies: replies.map(reply => reply.toJSON())
    };

    // Add moderation info for authorized users
    if (canViewUnpublished) {
      response.post.moderationNotes = post.moderationNotes;
      response.post.contentFlags = post.contentFlags;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving forum post'
    });
  }
};

// @desc    Moderate forum post (admin/moderator only)
// @route   PATCH /api/v1/forum/posts/:id/moderate
// @access  Private (admin/moderator)
const moderateForumPost = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const postId = req.params.id;
    const { status, moderationNotes } = req.body;

    const post = await ForumPost.findById(postId)
      .populate('studentId', 'name email collegeId');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Validate status transition
    const validStatuses = ['pending_moderation', 'published', 'flagged', 'removed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Update post status and moderation info
    await post.moderate(status, req.user.id, moderationNotes);

    // Log moderation action
    console.log('Forum post moderated:', {
      postId: post._id,
      postTitle: post.title.substring(0, 50),
      oldStatus: post.status,
      newStatus: status,
      moderatedBy: req.user.id,
      moderatorName: req.user.name,
      timestamp: new Date().toISOString()
    });

    // If post was removed or flagged, notify relevant parties
    if (status === 'removed' && post.studentId) {
      // In a real application, you might send an email notification here
      console.log('Post removed - should notify user:', post.studentId.email);
    }

    res.status(200).json({
      success: true,
      message: `Post ${status.replace('_', ' ')} successfully`,
      post: {
        id: post._id,
        postId: post.postId,
        title: post.title,
        status: post.status,
        moderatedBy: post.moderatedBy,
        moderatedAt: post.moderatedAt,
        moderationNotes: post.moderationNotes,
        contentFlags: post.contentFlags
      }
    });

  } catch (error) {
    console.error('Moderate forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error moderating forum post'
    });
  }
};

// @desc    Like/unlike a forum post
// @route   POST /api/v1/forum/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    if (post.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot like unpublished posts'
      });
    }

    // Check if user already liked the post
    const hasLiked = post.likedBy.includes(req.user.id);
    
    if (hasLiked) {
      await post.removeLike(req.user.id);
    } else {
      await post.addLike(req.user.id);
    }

    res.status(200).json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes,
      hasLiked: !hasLiked
    });

  } catch (error) {
    console.error('Toggle like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling post like'
    });
  }
};

// @desc    Report a forum post
// @route   POST /api/v1/forum/posts/:id/report
// @access  Private
const reportForumPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { reason } = req.body;

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    await post.addReport(req.user.id, reason);

    res.status(200).json({
      success: true,
      message: 'Post reported successfully. Thank you for helping keep our community safe.',
      reports: post.reports
    });

  } catch (error) {
    console.error('Report forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reporting forum post'
    });
  }
};

// @desc    Get posts needing moderation
// @route   GET /api/v1/forum/moderation/queue
// @access  Private (admin/moderator)
const getModerationQueue = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {
      status: { $in: ['pending_moderation', 'flagged'] }
    };
    
    if (status && ['pending_moderation', 'flagged'].includes(status)) {
      query.status = status;
    }

    const posts = await ForumPost.find(query)
      .populate('studentId', 'name email collegeId')
      .populate('moderatedBy', 'name email')
      .sort({ createdAt: 1 }) // Oldest first for fair moderation
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumPost.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      posts: posts.map(post => ({
        ...post.toJSON({ includePrivateNotes: true }),
        contentFlags: post.contentFlags,
        flaggedWords: post.flaggedWords,
        moderationNotes: post.moderationNotes
      }))
    });

  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving moderation queue'
    });
  }
};

module.exports = {
  getForumThreads,
  createForumPost,
  getForumPost,
  moderateForumPost,
  toggleLikePost,
  reportForumPost,
  getModerationQueue
};
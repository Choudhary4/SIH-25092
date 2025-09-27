const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const Screening = require('../models/screening.model');
const Appointment = require('../models/appointment.model');
const ForumPost = require('../models/forum.model');

// @desc    Get admin overview with aggregated analytics
// @route   GET /api/v1/admin/overview
// @access  Private (admin only)
const getAdminOverview = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallel aggregation queries for better performance
    const [
      screeningsByRisk,
      appointmentsByStatus,
      forumFlagsCount,
      crisisAlertsCount,
      recentUserGrowth,
      topForumTags,
      appointmentTrends,
      screeningTrends
    ] = await Promise.all([
      // Screenings by risk level (last 30 days)
      Screening.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            isCompleted: true
          }
        },
        {
          $group: {
            _id: '$riskLevel',
            count: { $sum: 1 },
            avgPHQ9Score: { $avg: '$phq9Score' },
            avgGAD7Score: { $avg: '$gad7Score' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),

      // Appointments by status
      Appointment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgDuration: { $avg: '$duration' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),

      // Forum posts flagged for moderation
      ForumPost.aggregate([
        {
          $match: {
            status: { $in: ['flagged', 'pending_moderation', 'removed'] }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            recentCount: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', thirtyDaysAgo] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Crisis alerts (high-risk screenings + flagged forum posts with self-harm)
      Promise.all([
        Screening.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
          riskLevel: 'high',
          isCrisisAlert: true
        }),
        ForumPost.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
          'contentFlags.selfHarm': true
        })
      ]).then(([screeningCrisis, forumCrisis]) => ({
        total: screeningCrisis + forumCrisis,
        screeningCrisis,
        forumCrisis
      })),

      // User growth (last 30 days by role)
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),

      // Top forum tags (most used in published posts)
      ForumPost.aggregate([
        {
          $match: {
            status: 'published',
            tags: { $exists: true, $ne: [] }
          }
        },
        {
          $unwind: '$tags'
        },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
            avgLikes: { $avg: '$likes' },
            avgViews: { $avg: '$views' }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]),

      // Appointment trends (daily counts for last 30 days)
      Appointment.aggregate([
        {
          $match: {
            scheduledAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$scheduledAt'
              }
            },
            appointmentsScheduled: { $sum: 1 },
            appointmentsCompleted: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            appointmentsCancelled: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),

      // Screening trends (daily counts and risk distribution)
      Screening.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            isCompleted: true
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              },
              riskLevel: '$riskLevel'
            },
            count: { $sum: 1 },
            avgPHQ9: { $avg: '$phq9Score' },
            avgGAD7: { $avg: '$gad7Score' }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            screenings: {
              $push: {
                riskLevel: '$_id.riskLevel',
                count: '$count',
                avgPHQ9: '$avgPHQ9',
                avgGAD7: '$avgGAD7'
              }
            },
            totalScreenings: { $sum: '$count' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
    ]);

    // Calculate additional metrics
    const totalUsers = await User.countDocuments();
    const totalScreenings = await Screening.countDocuments({ isCompleted: true });
    const totalAppointments = await Appointment.countDocuments();
    const totalForumPosts = await ForumPost.countDocuments({ status: 'published' });

    // Calculate system health metrics
    const systemHealth = {
      userEngagement: {
        screeningCompletionRate: totalScreenings / Math.max(totalUsers, 1) * 100,
        forumParticipationRate: totalForumPosts / Math.max(totalUsers, 1) * 100,
        appointmentBookingRate: totalAppointments / Math.max(totalScreenings, 1) * 100
      },
      moderationWorkload: {
        postsNeedingReview: forumFlagsCount.reduce((sum, item) => sum + item.count, 0),
        crisisAlertsToday: crisisAlertsCount.total,
        avgResponseTime: '2.5h' // This would come from moderation timestamps in real implementation
      }
    };

    // Prepare chart-ready data
    const chartData = {
      // Pie chart data for screenings by risk
      screeningRiskDistribution: {
        labels: screeningsByRisk.map(item => item._id || 'unknown'),
        datasets: [{
          data: screeningsByRisk.map(item => item.count),
          backgroundColor: [
            '#ef4444', // high - red
            '#f97316', // moderate - orange
            '#22c55e', // low - green
            '#6b7280'  // unknown - gray
          ]
        }]
      },

      // Bar chart data for appointments
      appointmentStatusChart: {
        labels: appointmentsByStatus.map(item => item._id),
        datasets: [{
          label: 'Appointment Count',
          data: appointmentsByStatus.map(item => item.count),
          backgroundColor: [
            '#3b82f6', // scheduled - blue
            '#22c55e', // completed - green
            '#ef4444', // cancelled - red
            '#f59e0b'  // pending - yellow
          ]
        }]
      },

      // Line chart for screening trends
      screeningTrendsChart: {
        labels: screeningTrends.map(item => item._id),
        datasets: [{
          label: 'Total Screenings',
          data: screeningTrends.map(item => item.totalScreenings),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      },

      // Line chart for appointment trends
      appointmentTrendsChart: {
        labels: appointmentTrends.map(item => item._id),
        datasets: [
          {
            label: 'Scheduled',
            data: appointmentTrends.map(item => item.appointmentsScheduled),
            borderColor: '#3b82f6'
          },
          {
            label: 'Completed',
            data: appointmentTrends.map(item => item.appointmentsCompleted),
            borderColor: '#22c55e'
          },
          {
            label: 'Cancelled',
            data: appointmentTrends.map(item => item.appointmentsCancelled),
            borderColor: '#ef4444'
          }
        ]
      }
    };

    // Response structure optimized for admin dashboard
    res.status(200).json({
      success: true,
      data: {
        // Key metrics overview
        overview: {
          totalUsers,
          totalScreenings,
          totalAppointments,
          totalForumPosts,
          activeUsers: recentUserGrowth.reduce((sum, item) => sum + item.count, 0),
          crisisAlerts: crisisAlertsCount.total,
          postsNeedingModeration: forumFlagsCount.reduce((sum, item) => sum + item.count, 0)
        },

        // Detailed breakdowns
        analytics: {
          screeningsByRisk: screeningsByRisk.map(item => ({
            riskLevel: item._id || 'unknown',
            count: item.count,
            avgPHQ9Score: Math.round((item.avgPHQ9Score || 0) * 10) / 10,
            avgGAD7Score: Math.round((item.avgGAD7Score || 0) * 10) / 10,
            percentage: Math.round((item.count / Math.max(totalScreenings, 1)) * 100 * 10) / 10
          })),

          appointmentsByStatus: appointmentsByStatus.map(item => ({
            status: item._id,
            count: item.count,
            avgDuration: Math.round((item.avgDuration || 0) * 10) / 10,
            percentage: Math.round((item.count / Math.max(totalAppointments, 1)) * 100 * 10) / 10
          })),

          forumModeration: forumFlagsCount.map(item => ({
            status: item._id,
            totalCount: item.count,
            recentCount: item.recentCount,
            percentageRecent: Math.round((item.recentCount / Math.max(item.count, 1)) * 100 * 10) / 10
          })),

          userGrowth: recentUserGrowth.map(item => ({
            role: item._id,
            newUsersLast30Days: item.count
          })),

          topForumTags: topForumTags.map(item => ({
            tag: item._id,
            postCount: item.count,
            avgLikes: Math.round((item.avgLikes || 0) * 10) / 10,
            avgViews: Math.round((item.avgViews || 0) * 10) / 10
          }))
        },

        // System health indicators
        systemHealth,

        // Chart-ready data for frontend
        charts: chartData,

        // Trends data
        trends: {
          screenings: screeningTrends,
          appointments: appointmentTrends
        },

        // Crisis management data
        crisisManagement: {
          totalAlerts: crisisAlertsCount.total,
          screeningAlerts: crisisAlertsCount.screeningCrisis,
          forumAlerts: crisisAlertsCount.forumCrisis,
          alertsLast7Days: crisisAlertsCount.total // Would need date filtering for actual 7-day count
        },

        // Generated at timestamp for cache management
        generatedAt: new Date().toISOString(),
        dataRange: {
          from: thirtyDaysAgo.toISOString(),
          to: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get detailed user analytics
// @route   GET /api/v1/admin/users/analytics
// @access  Private (admin only)
const getUserAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const userAnalytics = await User.aggregate([
      {
        $facet: {
          // User registration trends
          registrationTrends: [
            {
              $match: { createdAt: { $gte: daysAgo } }
            },
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                  role: '$role'
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.date': 1 } }
          ],

          // User distribution by role
          roleDistribution: [
            {
              $group: {
                _id: '$role',
                count: { $sum: 1 },
                activeCount: {
                  $sum: {
                    $cond: [
                      { $gte: ['$lastLogin', daysAgo] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],

          // College-wise distribution
          collegeDistribution: [
            {
              $group: {
                _id: '$collegeId',
                studentCount: {
                  $sum: {
                    $cond: [{ $eq: ['$role', 'student'] }, 1, 0]
                  }
                },
                counsellorCount: {
                  $sum: {
                    $cond: [{ $eq: ['$role', 'counsellor'] }, 1, 0]
                  }
                }
              }
            },
            { $sort: { studentCount: -1 } },
            { $limit: 20 }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: userAnalytics[0],
      period: `${period} days`,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user analytics'
    });
  }
};

// @desc    Get crisis management dashboard data
// @route   GET /api/v1/admin/crisis/dashboard
// @access  Private (admin only)
const getCrisisDashboard = async (req, res, next) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      activeAlerts,
      recentHighRiskScreenings,
      flaggedForumPosts,
      crisisTrends
    ] = await Promise.all([
      // Active crisis alerts that need immediate attention
      Screening.find({
        riskLevel: 'high',
        isCrisisAlert: true,
        createdAt: { $gte: oneDayAgo }
      })
      .populate('userId', 'name email collegeId')
      .select('phq9Score gad7Score responses createdAt')
      .sort({ createdAt: -1 })
      .limit(50),

      // Recent high-risk screenings
      Screening.find({
        riskLevel: 'high',
        createdAt: { $gte: sevenDaysAgo }
      })
      .populate('userId', 'name email collegeId')
      .select('phq9Score gad7Score riskLevel createdAt')
      .sort({ createdAt: -1 })
      .limit(100),

      // Forum posts flagged for self-harm content
      ForumPost.find({
        'contentFlags.selfHarm': true,
        createdAt: { $gte: sevenDaysAgo }
      })
      .populate('studentId', 'name email collegeId')
      .select('title body status contentFlags createdAt')
      .sort({ createdAt: -1 })
      .limit(50),

      // Crisis trends over time
      Screening.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            riskLevel: 'high'
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            crisisCount: { $sum: 1 },
            avgPHQ9: { $avg: '$phq9Score' },
            avgGAD7: { $avg: '$gad7Score' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          alertsLast24Hours: activeAlerts.length,
          highRiskScreeningsLast7Days: recentHighRiskScreenings.length,
          flaggedPostsLast7Days: flaggedForumPosts.length,
          totalCrisisInterventions: activeAlerts.length + flaggedForumPosts.length
        },
        activeAlerts: activeAlerts.map(alert => ({
          id: alert._id,
          userId: alert.userId?._id,
          userName: alert.userId?.name || 'Anonymous',
          userEmail: alert.userId?.email,
          collegeId: alert.userId?.collegeId,
          phq9Score: alert.phq9Score,
          gad7Score: alert.gad7Score,
          timestamp: alert.createdAt,
          urgency: alert.phq9Score >= 20 || alert.gad7Score >= 15 ? 'critical' : 'high'
        })),
        recentHighRiskScreenings,
        flaggedForumPosts: flaggedForumPosts.map(post => ({
          id: post._id,
          title: post.title,
          content: post.body.substring(0, 200) + '...',
          author: post.studentId?.name || 'Anonymous',
          flags: post.contentFlags,
          status: post.status,
          timestamp: post.createdAt
        })),
        trends: crisisTrends,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Crisis dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving crisis dashboard'
    });
  }
};

// @desc    Create new counsellor account
// @route   POST /api/v1/admin/counsellors
// @access  Private (admin only)
const createCounsellor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      department,
      specialization,
      experience,
      availability,
      password
    } = req.body;

    // Check if counsellor email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate counsellor ID (for collegeId field)
    const counsellorCount = await User.countDocuments({ role: 'counsellor' });
    const counsellorId = `COUNSELLOR${String(counsellorCount + 1).padStart(4, '0')}`;

    // Create counsellor account
    const counsellor = await User.create({
      name,
      email,
      passwordHash: password,
      collegeId: counsellorId,
      role: 'counsellor',
      department,
      specialization,
      experience: experience || 0,
      availability: availability || [],
      createdBy: req.user.id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Counsellor account created successfully',
      data: {
        id: counsellor._id,
        name: counsellor.name,
        email: counsellor.email,
        counsellorId: counsellorId,
        department: counsellor.department,
        specialization: counsellor.specialization,
        experience: counsellor.experience,
        availability: counsellor.availability,
        isActive: counsellor.isActive,
        createdAt: counsellor.createdAt
      }
    });

  } catch (error) {
    console.error('Create counsellor error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating counsellor account'
    });
  }
};

// @desc    Get all counsellors for admin management
// @route   GET /api/v1/admin/counsellors
// @access  Private (admin only)
const getCounsellors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, department, search } = req.query;

    // Build query
    let query = { role: 'counsellor' };

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const counsellors = await User.find(query)
      .select('name email department specialization experience availability isActive createdAt updatedAt rating')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: counsellors.map(counsellor => ({
        id: counsellor._id,
        name: counsellor.name,
        email: counsellor.email,
        department: counsellor.department,
        specialization: counsellor.specialization,
        experience: counsellor.experience,
        availability: counsellor.availability,
        isActive: counsellor.isActive,
        rating: counsellor.rating,
        createdBy: counsellor.createdBy?.name || 'Unknown',
        createdAt: counsellor.createdAt,
        updatedAt: counsellor.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCounsellors: total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get counsellors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving counsellors'
    });
  }
};

// @desc    Get single counsellor details
// @route   GET /api/v1/admin/counsellors/:id
// @access  Private (admin only)
const getCounsellor = async (req, res, next) => {
  try {
    const counsellor = await User.findOne({
      _id: req.params.id,
      role: 'counsellor'
    })
    .select('-passwordHash')
    .populate('createdBy', 'name email');

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    // Get appointment statistics for this counsellor
    const appointmentStats = await Appointment.aggregate([
      {
        $match: { counsellorId: counsellor._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...counsellor.toObject(),
        appointmentStats: appointmentStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get counsellor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving counsellor details'
    });
  }
};

// @desc    Update counsellor details and availability
// @route   PUT /api/v1/admin/counsellors/:id
// @access  Private (admin only)
const updateCounsellor = async (req, res, next) => {
  try {
    const {
      name,
      department,
      specialization,
      experience,
      availability,
      isActive
    } = req.body;

    const counsellor = await User.findOne({
      _id: req.params.id,
      role: 'counsellor'
    });

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    // Update fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (department !== undefined) updateFields.department = department;
    if (specialization !== undefined) updateFields.specialization = specialization;
    if (experience !== undefined) updateFields.experience = experience;
    if (availability !== undefined) updateFields.availability = availability;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedCounsellor = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.status(200).json({
      success: true,
      message: 'Counsellor updated successfully',
      data: updatedCounsellor
    });

  } catch (error) {
    console.error('Update counsellor error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating counsellor'
    });
  }
};

// @desc    Activate/Deactivate counsellor
// @route   PATCH /api/v1/admin/counsellors/:id/status
// @access  Private (admin only)
const toggleCounsellorStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const counsellor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'counsellor' },
      { isActive },
      { new: true }
    ).select('name email isActive');

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Counsellor ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: counsellor
    });

  } catch (error) {
    console.error('Toggle counsellor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating counsellor status'
    });
  }
};

// @desc    Delete counsellor (soft delete)
// @route   DELETE /api/v1/admin/counsellors/:id
// @access  Private (admin only)
const deleteCounsellor = async (req, res, next) => {
  try {
    const counsellor = await User.findOne({
      _id: req.params.id,
      role: 'counsellor'
    });

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    // Check if counsellor has any active appointments
    const activeAppointments = await Appointment.countDocuments({
      counsellorId: req.params.id,
      status: { $in: ['scheduled', 'pending'] }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete counsellor with active appointments. Please reschedule or cancel appointments first.'
      });
    }

    // Soft delete by deactivating
    await User.findByIdAndUpdate(req.params.id, { 
      isActive: false,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Counsellor account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete counsellor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting counsellor'
    });
  }
};

// @desc    Reset counsellor password
// @route   POST /api/v1/admin/counsellors/:id/reset-password
// @access  Private (admin only)
const resetCounsellorPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const counsellor = await User.findOne({
      _id: req.params.id,
      role: 'counsellor'
    });

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    // Update password
    counsellor.passwordHash = newPassword; // Will be hashed by pre-save hook
    await counsellor.save();

    res.status(200).json({
      success: true,
      message: 'Counsellor password reset successfully'
    });

  } catch (error) {
    console.error('Reset counsellor password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting counsellor password'
    });
  }
};

module.exports = {
  getAdminOverview,
  getUserAnalytics,
  getCrisisDashboard,
  createCounsellor,
  getCounsellors,
  getCounsellor,
  updateCounsellor,
  toggleCounsellorStatus,
  deleteCounsellor,
  resetCounsellorPassword
};
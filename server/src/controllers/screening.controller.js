const { validationResult } = require('express-validator');
const Screening = require('../models/screening.model');
const User = require('../models/user.model');

/**
 * PHQ-9 Scoring and Severity Assessment
 * PHQ-9 (Patient Health Questionnaire-9) is a 9-question instrument for screening depression
 * Each question is scored 0-3 (Not at all, Several days, More than half the days, Nearly every day)
 * 
 * Severity Levels:
 * - 0-4: Minimal depression
 * - 5-9: Mild depression
 * - 10-14: Moderate depression
 * - 15-19: Moderately severe depression
 * - 20-27: Severe depression
 * 
 * Question 9 specifically asks about thoughts of self-harm or suicide
 * Any score > 0 on question 9 requires immediate crisis escalation
 */
const calculatePHQ9Score = (responses) => {
  // Validate response count
  if (responses.length !== 9) {
    throw new Error('PHQ-9 requires exactly 9 responses');
  }

  // Calculate total score (sum of all responses)
  const score = responses.reduce((sum, response) => sum + response, 0);

  // Determine severity based on total score
  let severity;
  if (score <= 4) {
    severity = 'Minimal';
  } else if (score <= 9) {
    severity = 'Mild';
  } else if (score <= 14) {
    severity = 'Moderate';
  } else if (score <= 19) {
    severity = 'Moderately severe';
  } else {
    severity = 'Severe';
  }

  // Check for suicide risk (Question 9: thoughts of self-harm)
  // Question 9 is at index 8 (0-based array)
  const suicideRiskResponse = responses[8];
  const hasSuicideRisk = suicideRiskResponse > 0;

  // Determine triage action
  let triageAction;
  let isHighRisk = false;

  if (hasSuicideRisk) {
    // CRITICAL: Any indication of self-harm thoughts requires immediate escalation
    triageAction = 'crisis_escalation';
    isHighRisk = true;
  } else if (score >= 20) {
    // Severe depression without suicide ideation still needs crisis escalation
    triageAction = 'crisis_escalation';
    isHighRisk = true;
  } else if (score >= 15) {
    // Moderately severe depression - refer to counselor
    triageAction = 'refer';
  } else if (score >= 10) {
    // Moderate depression - monitor closely
    triageAction = 'monitor';
  } else {
    // Minimal to mild depression - routine follow-up
    triageAction = 'routine';
  }

  return {
    score,
    severity,
    triageAction,
    isHighRisk,
    suicideRisk: hasSuicideRisk,
    suicideRiskScore: suicideRiskResponse
  };
};

/**
 * GAD-7 Scoring and Severity Assessment
 * GAD-7 (Generalized Anxiety Disorder 7-item scale) is a 7-question instrument for screening anxiety
 * Each question is scored 0-3 (Not at all, Several days, More than half the days, Nearly every day)
 * 
 * Severity Levels:
 * - 0-4: Minimal anxiety
 * - 5-9: Mild anxiety
 * - 10-14: Moderate anxiety
 * - 15-21: Severe anxiety
 */
const calculateGAD7Score = (responses) => {
  // Validate response count
  if (responses.length !== 7) {
    throw new Error('GAD-7 requires exactly 7 responses');
  }

  // Calculate total score (sum of all responses)
  const score = responses.reduce((sum, response) => sum + response, 0);

  // Determine severity based on total score
  let severity;
  if (score <= 4) {
    severity = 'Minimal';
  } else if (score <= 9) {
    severity = 'Mild';
  } else if (score <= 14) {
    severity = 'Moderate';
  } else {
    severity = 'Severe';
  }

  // Determine triage action for anxiety
  let triageAction;
  let isHighRisk = false;

  if (score >= 15) {
    // Severe anxiety - needs crisis escalation
    triageAction = 'crisis_escalation';
    isHighRisk = true;
  } else if (score >= 10) {
    // Moderate anxiety - refer to counselor
    triageAction = 'refer';
  } else if (score >= 5) {
    // Mild anxiety - monitor
    triageAction = 'monitor';
  } else {
    // Minimal anxiety - routine follow-up
    triageAction = 'routine';
  }

  return {
    score,
    severity,
    triageAction,
    isHighRisk,
    suicideRisk: false, // GAD-7 doesn't assess suicide risk directly
    suicideRiskScore: 0
  };
};

// @desc    Create new screening assessment
// @route   POST /api/v1/screenings
// @access  Public (allows anonymous) / Private
const createScreening = async (req, res, next) => {
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

    const { tool, responses, studentId, consentToShare, sessionId } = req.body;

    // Validate tool type
    if (!['PHQ-9', 'GAD-7'].includes(tool)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid screening tool. Must be PHQ-9 or GAD-7'
      });
    }

    // Validate responses format
    if (!Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Responses must be an array'
      });
    }

    // Validate response values (0-3 for both tools)
    const invalidResponses = responses.filter(r => 
      !Number.isInteger(r) || r < 0 || r > 3
    );
    
    if (invalidResponses.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All responses must be integers between 0 and 3'
      });
    }

    // Calculate score and assessment based on tool type
    let assessment;
    try {
      if (tool === 'PHQ-9') {
        assessment = calculatePHQ9Score(responses);
      } else if (tool === 'GAD-7') {
        assessment = calculateGAD7Score(responses);
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Validate studentId if provided
    let validatedStudentId = null;
    if (studentId) {
      try {
        const student = await User.findById(studentId);
        if (!student) {
          return res.status(400).json({
            success: false,
            message: 'Invalid student ID - user not found'
          });
        }
        validatedStudentId = studentId;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID format'
        });
      }
    }

    // Create screening record
    const screeningData = {
      studentId: validatedStudentId,
      tool,
      responses,
      score: assessment.score,
      severity: assessment.severity,
      triageAction: assessment.triageAction,
      consentToShare: consentToShare || false,
      isHighRisk: assessment.isHighRisk,
      ipAddress: req.ip, // For anonymous screenings
      sessionId: sessionId || null
    };

    const screening = await Screening.create(screeningData);

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Screening completed successfully',
      screening: {
        id: screening._id,
        tool: screening.tool,
        score: screening.score,
        severity: screening.severity,
        triageAction: screening.triageAction,
        isHighRisk: screening.isHighRisk,
        createdAt: screening.createdAt
      }
    };

    // Add suicide risk information for PHQ-9
    if (tool === 'PHQ-9') {
      responseData.screening.suicideRisk = assessment.suicideRisk;
      responseData.screening.suicideRiskScore = assessment.suicideRiskScore;
    }

    // Add crisis escalation message for high-risk cases
    if (assessment.isHighRisk) {
      responseData.crisisMessage = 'This screening indicates a need for immediate attention. Please contact a mental health professional or crisis hotline immediately.';
      responseData.resources = {
        crisis_hotline: '988', // National Suicide Prevention Lifeline
        emergency: '911',
        crisis_text: 'Text HOME to 741741'
      };
    }

    // Log high-risk screenings for monitoring
    if (assessment.isHighRisk) {
      console.log(`HIGH RISK SCREENING ALERT:`, {
        screeningId: screening._id,
        tool: screening.tool,
        score: screening.score,
        severity: screening.severity,
        triageAction: screening.triageAction,
        studentId: validatedStudentId,
        timestamp: new Date().toISOString(),
        suicideRisk: assessment.suicideRisk
      });

      // Emit real-time crisis alert to counsellors and admins
      try {
        const socketService = require('../services/socket.service');
        
        // Get user information for the alert
        let userName = 'Anonymous User';
        let userEmail = null;
        let collegeId = null;
        
        if (validatedStudentId) {
          const student = await User.findById(validatedStudentId).select('name email collegeId');
          if (student) {
            userName = student.name;
            userEmail = student.email;
            collegeId = student.collegeId;
          }
        }

        const alertData = {
          userId: validatedStudentId,
          userName,
          userEmail,
          collegeId,
          source: 'screening',
          message: `${tool} screening indicates crisis risk - Score: ${assessment.score}, Severity: ${assessment.severity}${assessment.suicideRisk ? ', Suicide Risk: YES' : ''}`,
          data: {
            screeningId: screening._id,
            tool: screening.tool,
            score: screening.score,
            severity: screening.severity,
            triageAction: screening.triageAction,
            suicideRisk: assessment.suicideRisk,
            suicideRiskScore: assessment.suicideRiskScore
          }
        };

        socketService.emitCrisisAlert(alertData);
      } catch (socketError) {
        console.error('Failed to emit crisis alert via Socket.io:', socketError);
        // Don't fail the response if socket emission fails
      }
    }

    res.status(201).json(responseData);

  } catch (error) {
    console.error('Create screening error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during screening creation'
    });
  }
};

// @desc    Get screening by ID
// @route   GET /api/v1/screenings/:id
// @access  Private (user can only see their own, counselors can see all)
const getScreening = async (req, res, next) => {
  try {
    const screeningId = req.params.id;
    
    const screening = await Screening.findById(screeningId)
      .populate('studentId', 'name email collegeId')
      .populate('reviewedBy', 'name email');

    if (!screening) {
      return res.status(404).json({
        success: false,
        message: 'Screening not found'
      });
    }

    // Check access permissions
    const isOwner = screening.studentId && screening.studentId._id.toString() === req.user.id;
    const isCounselor = ['counsellor', 'admin', 'moderator'].includes(req.user.role);
    
    if (!isOwner && !isCounselor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this screening'
      });
    }

    res.status(200).json({
      success: true,
      screening
    });

  } catch (error) {
    console.error('Get screening error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving screening'
    });
  }
};

// @desc    Get user's screening history
// @route   GET /api/v1/screenings/my-history
// @access  Private
const getMyScreenings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tool } = req.query;
    
    const query = { studentId: req.user.id };
    if (tool) query.tool = tool;

    const screenings = await Screening.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reviewedBy', 'name email');

    const total = await Screening.countDocuments(query);

    res.status(200).json({
      success: true,
      count: screenings.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      screenings
    });

  } catch (error) {
    console.error('Get my screenings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving screening history'
    });
  }
};

module.exports = {
  createScreening,
  getScreening,
  getMyScreenings,
  calculatePHQ9Score,
  calculateGAD7Score
};
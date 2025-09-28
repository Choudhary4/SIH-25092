import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';

const Forum = () => {
  console.log('Forum component rendering...');
  
  const { t } = useTranslation();

  // State management
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalThreads, setTotalThreads] = useState(0);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    isAnonymous: true
  });
  const [submittingPost, setSubmittingPost] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [categories] = useState([
    'general',
    'academic_stress',
    'anxiety_depression', 
    'relationships',
    'family_issues',
    'peer_pressure',
    'self_esteem',
    'study_motivation',
    'career_confusion',
    'social_anxiety'
  ]);

  // Trained peer volunteers from certification system
  const [trainedPeers, setTrainedPeers] = useState([]);

  // Load certified students when component mounts
  useEffect(() => {
    const certified = JSON.parse(localStorage.getItem('trainedStudents') || '[]');
    // Add some demo certified peers if none exist
    if (certified.length === 0) {
      const demoPeers = [
        { id: 1, studentName: 'Anonymous Peer #9012', specialization: 'Anxiety Support', status: 'certified', responses: 45 },
        { id: 2, studentName: 'Anonymous Peer #3456', specialization: 'Academic Stress', status: 'certified', responses: 32 },
        { id: 3, studentName: 'Anonymous Peer #7890', specialization: 'Depression Support', status: 'certified', responses: 28 },
      ];
      setTrainedPeers(demoPeers);
    } else {
      setTrainedPeers(certified.map(peer => ({
        ...peer,
        responses: Math.floor(Math.random() * 50) + 10 // Random response count for demo
      })));
    }
  }, []);

  // Check if current user is a certified peer
  const isUserCertifiedPeer = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const trainedStudents = JSON.parse(localStorage.getItem('trainedStudents') || '[]');
    return trainedStudents.some(peer => peer.studentId === user.id);
  };

  // Get peer info for display
  const getPeerInfo = (userId) => {
    const trainedStudents = JSON.parse(localStorage.getItem('trainedStudents') || '[]');
    return trainedStudents.find(peer => peer.studentId === userId);
  };

  // Load threads on component mount and page change
  useEffect(() => {
    fetchThreads();
  }, [currentPage]);

  // Debug modal state changes
  useEffect(() => {
    console.log('New Post Modal state changed:', showNewPostModal);
  }, [showNewPostModal]);

  const fetchThreads = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching threads from API...');
      console.log('API URL:', `${api.defaults.baseURL}/v1/forum/threads?page=${currentPage}&limit=10`);
      const response = await api.get(`/v1/forum/threads?page=${currentPage}&limit=10`);
      console.log('API Response:', response.data);
      setThreads(response.data?.posts || []);
      setTotalPages(response.data?.pagination?.pages || 1);
      setTotalThreads(response.data?.total || 0);
    } catch (err) {
      console.error('Error fetching threads:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        type: err.type
      });
      setError(err.message || 'Failed to load threads. Please check if the server is running at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  // Content filtering function
  const filterContent = (content) => {
    const offensiveWords = ['abuse', 'hate', 'violence', 'harm', 'suicide', 'kill'];
    const triggeringWords = ['worthless', 'hopeless', 'ending it all'];
    
    const lowerContent = content.toLowerCase();
    
    for (const word of offensiveWords) {
      if (lowerContent.includes(word)) {
        return { blocked: true, reason: 'Contains potentially harmful language' };
      }
    }
    
    for (const word of triggeringWords) {
      if (lowerContent.includes(word)) {
        return { blocked: true, reason: 'Contains triggering content - redirecting to counselor' };
      }
    }
    
    return { blocked: false };
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    
    // Validation checks
    const titleLength = newPost.title.trim().length;
    const contentLength = newPost.content.trim().length;
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (titleLength < 5 || titleLength > 200) {
      setError('Title must be between 5 and 200 characters');
      return;
    }

    if (contentLength < 10 || contentLength > 5000) {
      setError('Message must be between 10 and 5000 characters');
      return;
    }

    // Check for potentially dangerous content
    const dangerousPattern = /<script|<\/script|javascript:|on\w+\s*=/i;
    if (dangerousPattern.test(newPost.title) || dangerousPattern.test(newPost.content)) {
      setError('Posts cannot contain script tags or JavaScript code for security reasons');
      return;
    }

    // Check content filter
    const titleFilter = filterContent(newPost.title);
    const contentFilter = filterContent(newPost.content);
    
    if (titleFilter.blocked || contentFilter.blocked) {
      setError(`Post blocked: ${titleFilter.reason || contentFilter.reason}`);
      if (titleFilter.reason?.includes('counselor') || contentFilter.reason?.includes('counselor')) {
        // Suggest counselor booking
        setTimeout(() => {
          window.location.href = '/booking';
        }, 3000);
      }
      return;
    }

    setSubmittingPost(true);
    setError(null);

    try {
      const postData = {
        title: newPost.title.trim(),
        body: newPost.content.trim(),
        tags: [newPost.category || 'general'],
        isAnonymous: newPost.isAnonymous
      };

      const response = await api.post('/v1/forum/posts', postData);
      
      if (response.data.success) {
        setShowNewPostModal(false);
        setNewPost({ title: '', content: '', category: '', isAnonymous: true });
        
        // Show success message or warning
        if (response.data.warning) {
          setError(response.data.warning);
        } else if (response.data.crisisResources) {
          setError(`${response.data.crisisResources.message} Crisis hotline: ${response.data.crisisResources.crisis_hotline}`);
        } else {
          // Show success message temporarily
          setError(null);
          // You might want to add a success state here instead of using error
          console.log('✅ Post created successfully:', response.data.message);
        }
        
        fetchThreads(); // Refresh threads to show new post
      } else {
        setError(response.data.message || 'Failed to create post. Please try again.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      
      // Handle validation errors from backend
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
        setError(`Validation Error: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setSubmittingPost(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      
      const now = new Date();
      const diffInHours = Math.abs(now - date) / 36e5;

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-teal-600 text-white',
      academic_stress: 'bg-teal-700 text-white',
      anxiety_depression: 'bg-teal-500 text-white', 
      relationships: 'bg-emerald-600 text-white',
      family_issues: 'bg-green-600 text-white',
      peer_pressure: 'bg-amber-600 text-white',
      self_esteem: 'bg-cyan-600 text-white',
      study_motivation: 'bg-teal-800 text-white',
      career_confusion: 'bg-orange-600 text-white',
      social_anxiety: 'bg-red-600 text-white'
    };
    return colors[category] || colors.general;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThreadClick = async (thread) => {
    console.log('Thread clicked:', thread);
    setSelectedThread(thread);
    setShowThreadModal(true);
    
    try {
      const threadId = thread._id || thread.id;
      console.log('Fetching thread details for ID:', threadId);
      const response = await api.get(`/v1/forum/posts/${threadId}`);
      console.log('Thread details response:', response.data);
      if (response.data.success) {
        setThreadReplies(response.data.replies || []);
      }
    } catch (err) {
      console.error('Error fetching thread details:', err);
      setError('Failed to load thread details: ' + (err.message || 'Unknown error'));
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    const replyLength = replyContent.trim().length;
    
    if (!replyContent.trim()) {
      setError('Please write a reply message');
      return;
    }

    if (replyLength < 10 || replyLength > 5000) {
      setError('Reply must be between 10 and 5000 characters');
      return;
    }

    // Check content filter for reply
    const contentFilter = filterContent(replyContent);
    if (contentFilter.blocked) {
      setError(`Reply blocked: ${contentFilter.reason}`);
      if (contentFilter.reason?.includes('counselor')) {
        setTimeout(() => {
          window.location.href = '/booking';
        }, 3000);
      }
      return;
    }

    setSubmittingReply(true);
    setError(null);

    try {
      const parentId = selectedThread._id || selectedThread.id;
      const replyData = {
        title: `Re: ${selectedThread.title}`,
        body: replyContent.trim(),
        parentPost: parentId,
        isAnonymous: true // Replies are always anonymous
      };

      console.log('Submitting reply:', replyData);
      const response = await api.post('/v1/forum/posts', replyData);
      
      if (response.data.success) {
        setReplyContent('');
        // Refresh the thread details
        handleThreadClick(selectedThread);
        
        // Show warning if content was flagged
        if (response.data.warning) {
          setError(response.data.warning);
        }
      } else {
        setError(response.data.message || 'Failed to post reply. Please try again.');
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9F7F4' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-800 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-teal-800 mb-4">
            Peer Talk
          </h1>
          <p className="text-xl text-gray-600 mb-3 max-w-2xl mx-auto leading-relaxed">
            Anonymous peer-to-peer discussion board where trained students provide guidance and support
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-teal-600 rounded-full mr-2"></span>
              All posts are anonymous
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-teal-600 rounded-full mr-2"></span>
              Content is moderated
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-teal-600 rounded-full mr-2"></span>
              Trained peer volunteers respond
            </div>
          </div>
        </div>

        {/* Trained Peers Section */}
        <div className="rounded-2xl p-8 mb-10 border border-gray-200 shadow-lg" style={{ backgroundColor: '#F9E6D0' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-800 rounded-xl mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Trained Peer Volunteers</h2>
            <p className="text-gray-600">Certified peer supporters ready to help you through difficult times</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainedPeers.map(peer => (
              <div key={peer.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-semibold text-lg">🎓</span>
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    <span className="font-semibold text-gray-900 text-sm">{peer.name}</span>
                    {peer.verified && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F0FDFA', color: '#0F766E' }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{peer.specialization}</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F0FDFA', color: '#0F766E' }}>
                    {peer.responses} helpful responses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats and New Post Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{totalThreads}</div>
                <div className="text-xs text-gray-500">Active Discussions</div>
              </div>
            </div>
            <div className="hidden sm:block text-gray-300">|</div>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
              Page {currentPage} of {totalPages}
            </div>
          </div>
          
          <button
            onClick={() => {
              console.log('New Post button clicked');
              setShowNewPostModal(true);
            }}
            className="group bg-teal-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span>Start Discussion</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-800 border-t-transparent absolute top-0"></div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading discussions...</h3>
              <p className="text-gray-600">Finding the latest peer support conversations</p>
            </div>
          </div>
        ) : (
          <>
            {/* Threads List */}
            <div className="space-y-6 mb-8">
              {threads.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200" style={{ backgroundColor: '#F9E6D0' }}>
                  <div className="w-20 h-20 bg-teal-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Discussions Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Be the first to start a meaningful conversation in our supportive community</p>
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="bg-teal-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-200 group"
                  >
                    <div className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <h3 
                              className="text-xl font-bold text-gray-900 hover:text-teal-800 cursor-pointer transition-colors group-hover:text-teal-800"
                              onClick={() => handleThreadClick(thread)}
                            >
                              {thread.title}
                            </h3>
                            {thread.tags && thread.tags.length > 0 && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(thread.tags[0])} shadow-sm`}>
                                {thread.tags[0].replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          
                          <p 
                            className="text-gray-600 text-base mb-6 line-clamp-3 cursor-pointer leading-relaxed"
                            onClick={() => handleThreadClick(thread)}
                          >
                            {thread.body}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-teal-800 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <span className="font-medium">Anonymous Student</span>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatDate(thread.createdAt)}</span>
                              </div>
                            </div>
                            
                            {thread.replyCount > 0 && (
                              <div className="flex items-center space-x-2 px-3 py-1 rounded-full" style={{ backgroundColor: '#F0FDFA', color: '#0F766E' }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="font-medium">{thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {thread.isPinned && (
                          <div className="ml-6">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all ${
                          currentPage === page
                            ? 'text-white bg-teal-800 shadow-lg transform scale-105'
                            : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Thread Detail Modal */}
      {showThreadModal && selectedThread && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setShowThreadModal(false)}
          />
          
          {/* Modal Content */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6"
            >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{selectedThread.title}</h3>
                    <button
                      onClick={() => setShowThreadModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Original Post */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">A</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Anonymous Student</p>
                        <p className="text-xs text-gray-500">{formatDate(selectedThread.createdAt)}</p>
                      </div>
                      {selectedThread.tags && selectedThread.tags.length > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedThread.tags[0])}`}>
                          {selectedThread.tags[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{selectedThread.body}</p>
                  </div>

                  {/* Replies Section */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Peer Support Responses ({threadReplies.length})
                    </h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {threadReplies.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No responses yet. Be the first trained peer volunteer to help!
                        </p>
                      ) : (
                        threadReplies.map((reply, index) => {
                          const peerInfo = getPeerInfo(reply.userId);
                          const isCertifiedPeer = !!peerInfo;
                          
                          return (
                            <div key={reply.id || index} className={`rounded-lg p-4 border-l-4 ${
                              isCertifiedPeer 
                                ? 'bg-green-50 border-green-400' 
                                : 'bg-gray-50 border-gray-300'
                            }`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isCertifiedPeer 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-400'
                                }`}>
                                  <span className="text-white text-xs font-medium">
                                    {isCertifiedPeer ? '🎓' : 'A'}
                                  </span>
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <p className={`text-sm font-medium ${
                                        isCertifiedPeer ? 'text-green-900' : 'text-gray-700'
                                      }`}>
                                        {isCertifiedPeer 
                                          ? `Certified Peer Supporter${peerInfo.specialization ? ` • ${peerInfo.specialization}` : ''}`
                                          : 'Anonymous Student'
                                        }
                                      </p>
                                      {isCertifiedPeer && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                          ✅ Verified
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-xs ${
                                      isCertifiedPeer ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                      {formatDate(reply.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm">{reply.body}</p>
                              {isCertifiedPeer && (
                                <div className="mt-2 text-xs text-green-600 italic">
                                  💡 Response from a trained peer supporter with {peerInfo.examScore}% certification score
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleReplySubmit} className="space-y-4">
                    {isUserCertifiedPeer() ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">🎓</span>
                          <div>
                            <p className="text-sm font-medium text-green-900">Certified Peer Support Response</p>
                            <p className="text-xs text-green-700">You're responding as a verified trained peer supporter.</p>
                          </div>
                          <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                            ✅ Verified
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">💬</span>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Peer Response</p>
                            <p className="text-xs text-blue-700">Share your supportive thoughts as a community member.</p>
                            <p className="text-xs text-blue-600 mt-1">
                              Want to become a certified peer supporter? <a href="/resources" className="underline">Take our training course!</a>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="replyContent" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Supportive Response <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(10-5000 characters)</span>
                      </label>
                      <textarea
                        id="replyContent"
                        rows={4}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm resize-none ${
                          replyContent.length > 0 && (replyContent.length < 10 || replyContent.length > 5000)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        } ${
                          isUserCertifiedPeer() 
                            ? 'focus:ring-green-500 focus:border-green-500' 
                            : 'focus:ring-teal-800 focus:border-teal-800'
                        }`}
                        placeholder={isUserCertifiedPeer() 
                          ? "Provide supportive, professional guidance as a certified peer supporter... (at least 10 characters)"
                          : "Share your thoughts and support as a community member... (at least 10 characters)"
                        }
                        minLength={10}
                        maxLength={5000}
                        required
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${
                          replyContent.length < 10 ? 'text-red-500' : 
                          replyContent.length >= 10 && replyContent.length <= 5000 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {replyContent.length}/5000 characters
                        </span>
                        {replyContent.length > 0 && replyContent.length < 10 && (
                          <span className="text-red-500">Reply too short (minimum 10 characters)</span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowThreadModal(false)}
                        className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReply || replyContent.trim().length < 10}
                        className="flex-1 bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReply ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Posting...
                          </div>
                        ) : (
                          'Post Response'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => {
              console.log('Modal backdrop clicked');
              setShowNewPostModal(false);
            }}
          />
          
          {/* Modal Content */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Create New Post</h3>
                    <button
                      onClick={() => setShowNewPostModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleNewPost} className="space-y-4">
                    {/* Anonymous Posting Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-blue-600 mr-2">🔒</span>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Anonymous Posting</p>
                          <p className="text-xs text-blue-700">Your identity is protected. Only trained peer volunteers and moderators can respond.</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Guidelines */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">�</span>
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Posting Guidelines</p>
                          <p className="text-xs text-yellow-700">
                            • Title: 5-200 characters • Message: 10-5000 characters<br/>
                            • Most characters and emojis are allowed (no scripts/code)<br/>
                            • Posts are automatically filtered for harmful content<br/>
                            • Triggering content will be redirected to professional support
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-800 focus:border-teal-800"
                      >
                        <option value="">Select a category</option>
                        <option value="general">General Support</option>
                        <option value="academic_stress">Academic Stress</option>
                        <option value="anxiety_depression">Anxiety & Depression</option>
                        <option value="relationships">Relationships</option>
                        <option value="family_issues">Family Issues</option>
                        <option value="peer_pressure">Peer Pressure</option>
                        <option value="self_esteem">Self Esteem</option>
                        <option value="study_motivation">Study Motivation</option>
                        <option value="career_confusion">Career Confusion</option>
                        <option value="social_anxiety">Social Anxiety</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(5-200 characters)</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-800 focus:border-teal-800 ${
                          newPost.title.length > 0 && (newPost.title.length < 5 || newPost.title.length > 200)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="Briefly describe your situation (at least 5 characters)..."
                        minLength={5}
                        maxLength={200}
                        required
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${
                          newPost.title.length < 5 ? 'text-red-500' : 
                          newPost.title.length >= 5 && newPost.title.length <= 200 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {newPost.title.length}/200 characters
                        </span>
                        {newPost.title.length > 0 && newPost.title.length < 5 && (
                          <span className="text-red-500">Title too short (minimum 5 characters)</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Message <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(10-5000 characters)</span>
                      </label>
                      <textarea
                        id="content"
                        rows={6}
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-teal-800 focus:border-teal-800 resize-none ${
                          newPost.content.length > 0 && (newPost.content.length < 10 || newPost.content.length > 5000)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="Share what you're going through. Our trained peer volunteers are here to help... (at least 10 characters)"
                        minLength={10}
                        maxLength={5000}
                        required
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={`${
                          newPost.content.length < 10 ? 'text-red-500' : 
                          newPost.content.length >= 10 && newPost.content.length <= 5000 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {newPost.content.length}/5000 characters
                        </span>
                        {newPost.content.length > 0 && newPost.content.length < 10 && (
                          <span className="text-red-500">Message too short (minimum 10 characters)</span>
                        )}
                      </div>
                    </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">Your post will be reviewed by moderators before being published</p>
                        </div>
                      </div>
                    </div>                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowNewPostModal(false)}
                        className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingPost || newPost.title.trim().length < 5 || newPost.content.trim().length < 10}
                        className="flex-1 bg-teal-800 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingPost ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          'Submit Post'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Forum
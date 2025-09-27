import React, { useState, useEffect } from 'react';

const SimpleForum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '' });

  useEffect(() => {
    console.log('SimpleForum component mounted');
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to fetch posts...');
      // Try to fetch from the API
      const response = await fetch('http://localhost:5000/api/v1/forum/threads?page=1&limit=10');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API data:', data);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message);
      // Set some mock data for testing
      setPosts([
        {
          id: '1',
          title: 'Test Post 1',
          body: 'This is a test post to check if the forum is working.',
          createdAt: new Date().toISOString(),
          tags: ['general'],
          replyCount: 0
        },
        {
          id: '2',
          title: 'Another Test Post',
          body: 'This is another test post to verify the forum layout.',
          createdAt: new Date().toISOString(),
          tags: ['test'],
          replyCount: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    console.log('Submitting post:', newPost);
    
    try {
      const response = await fetch('http://localhost:5000/api/v1/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPost.title,
          body: newPost.content,
          tags: newPost.category ? [newPost.category] : ['general'],
          isAnonymous: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Post created:', result);
      
      setShowModal(false);
      setNewPost({ title: '', content: '', category: '' });
      fetchPosts(); // Refresh posts
      
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Peer Talk Forum</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{posts.length} posts</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Post
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded shadow">
                <p className="text-gray-500 mb-4">No posts yet. Be the first to start a discussion!</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id || post._id} className="bg-white p-6 rounded shadow">
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-700 mb-4">{post.body}</p>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>Anonymous</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.replyCount > 0 && <span>{post.replyCount} replies</span>}
                    {post.tags && post.tags.length > 0 && (
                      <span className="bg-gray-100 px-2 py-1 rounded">{post.tags[0]}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a category</option>
                    <option value="general">General</option>
                    <option value="academic_stress">Academic Stress</option>
                    <option value="anxiety_depression">Anxiety & Depression</option>
                    <option value="relationships">Relationships</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="What's on your mind?"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows="4"
                    className="w-full p-2 border rounded"
                    placeholder="Share your thoughts..."
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleForum;
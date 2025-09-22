import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id;

  // Fetch post & saved status
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await axios.get(`https://stark-socialmedia.onrender.com/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);

        setLiked(res.data.likes.includes(currentUserId));

        // Check saved status
        const savedRes = await axios.get(
          `https://stark-socialmedia.onrender.com/api/posts/${currentUserId}/saved-posts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaved(savedRes.data.savedPosts.some((p) => p._id === id));
      } catch (err) {
        console.error("❌ Error fetching post:", err);
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token, navigate, currentUserId]);

  // Like / Unlike (optimistic update)
  const handleLike = async () => {
    if (!post) return;

    // UI update first
    setLiked((prev) => !prev);
    setPost((prev) => ({
      ...prev,
      likes: liked
        ? prev.likes.filter((uid) => uid !== currentUserId)
        : [...prev.likes, currentUserId],
    }));

    try {
      const res = await axios.put(
        `https://stark-socialmedia.onrender.com/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Ensure backend data is correct
      setPost((prev) => ({ ...prev, likes: res.data.likes }));
      setLiked(res.data.action === "liked");
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };

  // Save / Unsave (optimistic update)
  const handleSave = async () => {
    if (!post) return;

    setSaved((prev) => !prev);

    try {
      const res = await axios.put(
        `https://stark-socialmedia.onrender.com/api/users/${currentUserId}/saved-posts`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(res.data.bookmarked);
    } catch (err) {
      console.error("❌ Error saving post:", err);
    }
  };

  // Post Comment
  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(
        `https://stark-socialmedia.onrender.com/api/posts/${id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({
      ...prev,
      comments: [...prev.comments, res.data.comment] 
    }));
      setCommentText("");
    } catch (err) {
      console.error("❌ Error posting comment:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
     <div className="flex justify-center w-full px-4">
    <div className="flex rounded-lg overflow-hidden max-w-7xl w-full h-[80vh] bg-white shadow-lg border border-gray-200">
        {/* LEFT: Media */}
        <div className="w-2/3 bg-black flex items-center justify-center">
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="max-h-full max-w-full object-contain"
            />
          )}
          {post.video && (
            <video
              src={post.video}
              controls
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* RIGHT: Comments + Actions */}
        <div className="w-1/2 flex flex-col">
          {/* HEADER */}
          <div className="flex items-center p-4 border-b">
            <img
              src={post.user?.profilePic || "/default-avatar.png"}
              alt={post.user?.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <h2 className="font-semibold">{post.user?.username}</h2>
          </div>

          {/* SCROLLABLE COMMENTS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {post.comments?.length > 0 ? (
              post.comments.map((comment, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <img
                    src={comment.user?.profilePic || "/default-avatar.png"}
                    alt={comment.user?.username}
                    className="w-8 h-8 rounded-full"
                  />
                   <div className="flex flex-col">
        <span className="font-semibold">{comment.user?.username}</span>
        <span className="text-gray-800">{comment.text}</span>
      </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t p-3">
            <div className="flex justify-between mb-2">
              <div className="flex space-x-4">
                {liked ? (
                  <AiFillHeart
                    className="text-2xl cursor-pointer text-red-500"
                    onClick={handleLike}
                  />
                ) : (
                  <AiOutlineHeart
                    className="text-2xl cursor-pointer"
                    onClick={handleLike}
                  />
                )}
                <FaRegComment className="text-2xl cursor-pointer" />
                <FiSend className="text-2xl cursor-pointer" />
              </div>
              {saved ? (
                <BsBookmarkFill
                  className="text-2xl cursor-pointer text-blue-500"
                  onClick={handleSave}
                />
              ) : (
                <BsBookmark
                  className="text-2xl cursor-pointer"
                  onClick={handleSave}
                />
              )}
            </div>

            {/* Likes */}
            <p className="font-semibold text-sm mb-2">
              {post.likes?.length || 0} likes
            </p>

            {/* Comment Input */}
            <div className="flex items-center border rounded-lg px-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 outline-none text-sm"
              />
              <button
                className="text-blue-500 font-semibold text-sm"
                onClick={handleComment}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePost;

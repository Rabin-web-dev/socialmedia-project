import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../../redux/slices/authSlice"; // ✅ update Redux user

const CommentModal = ({ isOpen, onClose, post, refreshPost }) => {
  const [commentText, setCommentText] = useState("");
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!isOpen) return null;

  // ✅ Check liked/saved state
  const isLiked = post.likes?.includes(user?._id);
  const isSaved = user?.savedPosts?.some((id) => id === post._id);

  // ✅ Like/Unlike
  const handleLikeToggle = async () => {
    try {
      await axios.put(
        `https://stark-socialmedia.onrender.com/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (refreshPost) refreshPost();
    } catch (err) {
      console.error("❌ Like toggle error:", err);
    }
  };

  // ✅ Save/Unsave
const handleSaveToggle = async () => {
  try {
    const res = await axios.put(
      `https://stark-socialmedia.onrender.com/api/posts/${user._id}/saved-posts`,
      { postId: post._id }, // ✅ send postId
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Always copy user safely
    let updatedUser = { ...user };

    if (res.data.bookmarked) {
      // Post was just saved
      updatedUser.savedPosts = [...(user.savedPosts || []), post._id];
    } else {
      // Post was just unsaved
      updatedUser.savedPosts = (user.savedPosts || []).filter(
        (id) => id !== post._id
      );
    }

    // ✅ Update Redux state
    dispatch(setUser(updatedUser));
  } catch (err) {
    console.error("❌ Save toggle error:", err);
  }
};
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} // ✅ close modal when clicking outside
    >
      {/* Modal Container */}
      <div
        className="bg-white w-[90%] max-w-5xl h-[90%] flex rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()} // ✅ prevent close on inside click
      >
        {/* Left: Post Media */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {post.image ? (
            <img
              src={post.image}
              alt="post"
              className="max-h-full max-w-full object-contain"
            />
          ) : post.video ? (
            <video controls className="max-h-full max-w-full">
              <source src={post.video} type="video/mp4" />
            </video>
          ) : (
            <p className="text-white">No Media</p>
          )}
        </div>

        {/* Right: Comments + Actions */}
        <div className="w-[40%] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center">
              <img
                src={post.user?.profilePic || "/default-avatar.png"}
                alt="profile"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-semibold">{post.user?.username}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-3">
            {post.comments?.length > 0 ? (
              post.comments.map((c, idx) => (
                <div key={idx} className="flex items-start mb-2">
                  <img
                    src={c.user?.profilePic || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <span className="font-semibold">
                      {c.user?.username || "User"}
                    </span>{" "}
                    <span className="text-sm">{c.text}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t p-3">
            <div className="flex justify-between mb-2">
              <div className="flex space-x-4">
                {/* ✅ Like Toggle */}
                {isLiked ? (
                  <AiFillHeart
                    className="text-2xl text-red-500 cursor-pointer"
                    onClick={handleLikeToggle}
                  />
                ) : (
                  <AiOutlineHeart
                    className="text-2xl cursor-pointer"
                    onClick={handleLikeToggle}
                  />
                )}

                <FaRegComment className="text-2xl cursor-pointer" />
                <FiSend className="text-2xl cursor-pointer" />
              </div>

              {/* ✅ Save Toggle */}
              {isSaved ? (
                <BsBookmarkFill
                  className="text-2xl text-blue-500 cursor-pointer"
                  onClick={handleSaveToggle}
                />
              ) : (
                <BsBookmark
                  className="text-2xl cursor-pointer"
                  onClick={handleSaveToggle}
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
              <button className="text-blue-500 font-semibold text-sm">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;

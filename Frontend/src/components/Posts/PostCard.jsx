import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import CommentModal from "./CommentModal";
import ShareModal from "./ShareModal";
import { setUser } from "../../redux/slices/authSlice";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // ✅ Redux user and dispatch
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // ✅ Fetch current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("https://stark-socialmedia.onrender.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("❌ Error fetching current user:", err);
      }
    };
    if (token) fetchCurrentUser();
  }, [token]);

  const handleLike = async () => {
    try {
      setLoading(true);
      await axios.put(
        `https://stark-socialmedia.onrender.com/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (likes.includes(userId)) {
        setLikes(likes.filter((id) => id !== userId));
      } else {
        setLikes([...likes, userId]);
      }
    } catch (error) {
      console.error("❌ Error liking post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        `https://stark-socialmedia.onrender.com/api/posts/${user._id}/saved-posts`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updatedUser = { ...user };
      if (res.data.bookmarked) {
        updatedUser.savedPosts = [...(user.savedPosts || []), post._id];
      } else {
        updatedUser.savedPosts = (user.savedPosts || []).filter(
          (id) => id !== post._id
        );
      }

      dispatch(setUser(updatedUser)); // ✅ Redux stays synced
    } catch (error) {
      console.error("❌ Error bookmarking:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `https://stark-socialmedia.onrender.com/api/posts/${post._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data.post.comments);
      setCommentText("");
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLiked = likes.includes(userId);
  const isSaved = user?.savedPosts?.includes(post._id);

  return (
    <>
      <div className="bg-white border rounded-md mb-6 w-full sm:max-w-md sm:mx-auto shadow-sm">
        {/* Post Header */}
        <div className="flex items-center p-3">
          <img
            src={post.user?.profilePic || "/default-avatar.png"}
            alt="profile"
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <h4 className="font-semibold text-sm">{post.user?.username}</h4>
        </div>

        {/* Post Media */}
        {post.image && (
          <img
            src={post.image}
            alt="post"
            className="w-full max-h-[400px] object-cover"
          />
        )}
        {post.video && (
          <video controls className="w-full max-h-[400px]">
            <source src={post.video} type="video/mp4" />
          </video>
        )}

        {/* Actions */}
        <div className="flex justify-between px-3 py-2">
          <div className="flex space-x-4">
            {isLiked ? (
              <AiFillHeart
                className="text-2xl text-red-500 cursor-pointer"
                onClick={handleLike}
              />
            ) : (
              <AiOutlineHeart
                className="text-2xl cursor-pointer"
                onClick={handleLike}
              />
            )}
            <FaRegComment
              className="text-2xl cursor-pointer"
              onClick={() => setIsCommentOpen(true)}
            />
            <FiSend
              className="text-2xl cursor-pointer"
              onClick={() => setIsShareOpen(true)}
            />
          </div>
          <div>
            {isSaved ? (
              <BsBookmarkFill
                className="text-2xl cursor-pointer text-blue-500"
                onClick={handleBookmark}
              />
            ) : (
              <BsBookmark
                className="text-xl cursor-pointer"
                onClick={handleBookmark}
              />
            )}
          </div>
        </div>

        {/* Likes */}
        <div className="px-3 font-semibold text-sm">{likes.length} likes</div>

        {/* Caption */}
        {post.content && (
          <div className="px-3 py-1 text-sm">
            <span className="font-semibold mr-1">{post.user?.username}</span>{" "}
            {post.content}
          </div>
        )}

        {/* Comments */}
        <div className="px-3 py-1 text-sm text-gray-600 space-y-1">
          {comments.slice(-2).map((c, idx) => (
            <p key={idx}>
              <strong>{c.user?.username || "User"}</strong> {c.text}
            </p>
          ))}
        </div>

        {/* Add Comment */}
        <form
          onSubmit={handleComment}
          className="flex items-center border-t px-3 py-2 gap-2"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="text-blue-500 font-semibold text-sm disabled:opacity-50"
          >
            Post
          </button>
        </form>
      </div>

      {/* ✅ Comment Modal */}
      <CommentModal
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        post={{ ...post, comments }}
      />

      {/* ✅ Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        postId={post._id}
        currentUser={currentUser}
      />
    </>
  );
};

export default PostCard;

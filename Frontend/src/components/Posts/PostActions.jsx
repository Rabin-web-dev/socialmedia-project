import React from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import axios from "axios";

const PostActions = ({ postId, isLiked, refreshPosts }) => {

  const handleLike = async () => {
    try {
      await axios.put(`/api/posts/${postId}/like`);
      refreshPosts(); // Refresh posts to update like count
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="flex space-x-4 my-2">
      <button onClick={handleLike}>
        {isLiked ? "❤️" : "🤍"} Like
      </button>
      <button>
        <MessageCircle className="hover:text-blue-500" />
      </button>
      <button>
        <Send className="hover:text-green-500" />
      </button>
    </div>
  );
};

export default PostActions;

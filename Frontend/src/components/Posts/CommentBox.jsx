import React, { useState } from "react";
import axios from "axios";

const CommentBox = ({ postId, refreshPosts }) => {

  const [comment, setComment] = useState("");

  const handleComment = async () => {
    try {
      await axios.post(`/api/posts/${postId}/comment`, { text: comment });
      setComment("");
      refreshPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };


  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="border rounded p-1"
      />
      <button onClick={handleComment}>Post</button>
    </div>
  );
};

export default CommentBox;

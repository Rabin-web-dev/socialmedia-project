import React from "react";

const CommentList = ({ comments }) => {
  return (
    <div className="mt-2">
      {comments.map((c, idx) => (
        <div key={idx} className="border-b py-1">
          <strong>{c.user.username || "User"}:</strong> {c.text}
        </div>
      ))}
    </div>
  );
};

export default CommentList;

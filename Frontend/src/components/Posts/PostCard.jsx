import React from "react";
import PostActions from "./PostActions";
import CommentBox from "./CommentBox";
import CommentList from "./CommentList";

const PostCard = ({ post, refreshPosts }) => {

  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const isLiked = post.likes.includes(userId);

  return (
 <div className="p-4 border rounded">
      <h4 className="font-semibold">{post.user?.username}</h4>
      <p>{post.content}</p>
      {post.image && <img src={post.image} alt="Post" className="mt-2" />}
      
      <PostActions postId={post._id} isLiked={isLiked} refreshPosts={refreshPosts} />

      <CommentBox postId={post._id} refreshPosts={refreshPosts} />
      <CommentList comments={post.comments} />
    </div>
  );
};

export default PostCard;

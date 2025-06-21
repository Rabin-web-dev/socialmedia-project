import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/Posts/PostCard";
import Skeleton from "react-loading-skeleton";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts/get-all-posts");
      console.log("Fetched posts:", res.data);
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="space-y-6">
    {loading ? (
        // Show 3 skeletons while loading
        Array(3).fill().map((_, i) => (
          <Skeleton key={i} height={300} borderRadius={10} />
        ))
      ) : (
        Array.isArray(posts) && posts.map((post) => (
          <PostCard key={post._id} post={post} refreshPosts={fetchPosts} />
        ))
      )}
    </div>
  );
};

export default Home;


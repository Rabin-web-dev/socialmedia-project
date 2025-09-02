import { useEffect, useState, useRef } from "react";
import axios from "axios";
import PostCard from "../components/Posts/PostCard";
import Skeleton from "react-loading-skeleton";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchPosts = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const res = await axios.get("http://localhost:5000/api/posts/");
      const fetchedPosts = Array.isArray(res.data.posts)
        ? res.data.posts
        : Array.isArray(res.data)
        ? res.data
        : [];

      setPosts(fetchedPosts);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      {/* Instagram-like center column */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-0 sm:p-4">
        {loading ? (
          Array(3)
            .fill()
            .map((_, i) => (
              <Skeleton
                key={i}
                height={500}
                borderRadius={12}
                className="mb-4"
              />
            ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              refreshPosts={fetchPosts}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">
            ⚠️ No posts to display
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;

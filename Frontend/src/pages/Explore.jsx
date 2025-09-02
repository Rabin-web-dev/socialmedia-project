import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { X, ChevronLeft, ChevronRight } from "lucide-react"; // Icons

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error("❌ Error fetching explore posts:", err);
      }
    };
    fetchPosts();
  }, [token]);

  const selectedPost = selectedIndex !== null ? posts[selectedIndex] : null;

  // Go to previous post
  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev > 0 ? prev - 1 : posts.length - 1 // Loop to last
    );
  }, [posts]);

  // Go to next post
  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev < posts.length - 1 ? prev + 1 : 0 // Loop to first
    );
  }, [posts]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPost) {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "Escape") setSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost, handlePrev, handleNext]);

  return (
    <div className="bg-white min-h-screen flex justify-center">
      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 w-full pt-17">
        {posts.map((post, idx) => (
          <div
            key={post._id}
            className="relative aspect-square bg-black cursor-pointer"
            onClick={() => setSelectedIndex(idx)}
          >
            {post.video ? (
              <video
                src={post.video}
                className="w-full h-full object-cover"
                muted
                loop
              />
            ) : (
              <img
                src={post.image}
                alt="Post"
                className="w-full h-full object-cover"
              />
            )}
            {post.video && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded">
                🎥
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing on inside click
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              <X size={28} />
            </button>

            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70"
            >
              <ChevronLeft size={28} className="text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70"
            >
              <ChevronRight size={28} className="text-white" />
            </button>

            {/* Media Content */}
            {selectedPost.video ? (
              <video
                src={selectedPost.video}
                className="w-full h-auto rounded-lg"
                controls
                autoPlay
              />
            ) : (
              <img
                src={selectedPost.image}
                alt="Post"
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;

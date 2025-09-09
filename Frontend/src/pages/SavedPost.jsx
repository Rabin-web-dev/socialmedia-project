// import { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const SavedPost = () => {
//   const [savedPosts, setSavedPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const userId = localStorage.getItem("userId");
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   const fetchSavedPosts = useCallback(async () => {
//        if (!userId || !token) {
//       console.warn("⚠️ No userId or token found in localStorage");
//       setLoading(false);
//       return;
//     }
//     try {
//       const res = await axios.get(
//         `https://stark-socialmedia.onrender.com/api/posts/${userId}/saved-posts`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSavedPosts(res.data.savedPosts || []);
//     } catch (err) {
//       console.error("❌ Error fetching saved posts:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [userId, token]);

//   useEffect(() => {
//     fetchSavedPosts();
//   }, [fetchSavedPosts]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   if (savedPosts.length === 0) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <p className="text-gray-500">No saved posts yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white min-h-screen w-full">
//       {/* ✅ Same 3-column layout as Explore */}
//       <div className="grid grid-cols-3 gap-1 w-full  ">
//         {savedPosts.map((post) => (
//           <div
//             key={post._id}
//             className="relative aspect-square bg-black cursor-pointer"
//             onClick={() => navigate(`/posts/${post._id}`)}
//           >
//             {post.video ? (
//               <video
//                 src={post.video}
//                 className="w-full h-full object-cover"
//                 muted
//                 loop
//               />
//             ) : (
//               <img
//                 src={post.image}
//                 alt="Saved Post"
//                 className="w-full h-full object-cover"
//               />
//             )}
//             {post.video && (
//               <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded">
//                 🎥
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SavedPost;

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SavedPost = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;   // ✅ extract from user object
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchSavedPosts = useCallback(async () => {
    if (!userId || !token) {
      console.warn("⚠️ No userId or token found in localStorage");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `https://stark-socialmedia.onrender.com/api/posts/${userId}/saved-posts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedPosts(res.data.savedPosts || []);
    } catch (err) {
      console.error("❌ Error fetching saved posts:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No saved posts yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full">
      {/* ✅ Same 3-column layout as Explore */}
      <div className="grid grid-cols-3 gap-1 w-full">
        {savedPosts.map((post) => (
          <div
            key={post._id}
            className="relative aspect-square bg-black cursor-pointer"
            onClick={() => navigate(`/posts/${post._id}`)}
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
                alt="Saved Post"
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
    </div>
  );
};

export default SavedPost;

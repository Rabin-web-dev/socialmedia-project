import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Following = () => {
  const { username, userId } = useParams();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState(null); // track which user is being unfollowed

  const fetchFollowing = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://stark-socialmedia.onrender.com/api/users/profile/${username}/${userId}/following`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFollowing(res.data.following || []);
    } catch (error) {
      console.error("Error fetching following:", error);
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  }, [username, userId]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  const handleUnfollow = async (followingId) => {
    const confirmUnfollow = window.confirm(
      "Are you sure you want to unfollow this user?"
    );

    if (!confirmUnfollow) return;

    try {
      setUnfollowingId(followingId);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

      await axios.post(
        `https://stark-socialmedia.onrender.com/api/users/unfollow/${followingId}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Remove from UI immediately
      setFollowing((prev) => prev.filter((f) => f._id !== followingId));

      toast.success("Unfollowed successfully");
    } catch (error) {
      console.error("Error unfollowing:", error);
      toast.error("Failed to unfollow");
    } finally {
      setUnfollowingId(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Following</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : following.length === 0 ? (
        <p className="text-gray-500 text-center">Not following anyone</p>
      ) : (
        <div className="space-y-4">
          {following.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-white shadow-sm rounded-xl hover:shadow-md transition"
            >
              {/* Profile Image + Name */}
              <div className="flex items-center gap-3">
                <Link to={`/profile/${user.username}/${user._id}`}>
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                </Link>
                <div>
                  <Link
                    to={`/profile/${user.username}/${user._id}`}
                    className="text-gray-800 font-medium hover:underline"
                  >
                    {user.username}
                  </Link>
                  <p className="text-gray-500 text-sm">{user.name}</p>
                </div>
              </div>

              {/* Following Button */}
              <button
                onClick={() => handleUnfollow(user._id)}
                disabled={unfollowingId === user._id}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  unfollowingId === user._id
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white"
                }`}
              >
                {unfollowingId === user._id ? "Unfollowing..." : "Following"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;

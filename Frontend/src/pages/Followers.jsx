import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const Followers = () => {
  const { username, userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const fetchFollowers = useCallback(async () => {
  try {
    setLoading(true);
    const res = await api.get(`/users/profile/${username}/${userId}/followers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    console.log("Followers API Response:", res.data);
    setFollowers(res.data.followers || []);  // ✅ pick from followers
  } catch (error) {
    console.error("Error fetching followers:", error);
    setFollowers([]);
  } finally {
    setLoading(false);
  }
}, [username, userId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

const handleToggleFollow = async (followerId, isFollowingBack) => {
  try {
    const token = localStorage.getItem("token"); // get JWT from storage

    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    if (isFollowingBack) {
      // Unfollow request
      await api.post(
        `/users/unfollow/${followerId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFollowers(prev =>
        prev.map(f =>
          f._id === followerId ? { ...f, isFollowingBack: false } : f
        )
      );
    } else {
      // Follow request
      await api.post(
        `/users/follow/${followerId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFollowers(prev =>
        prev.map(f =>
          f._id === followerId ? { ...f, isFollowingBack: true } : f
        )
      );
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    toast.error("Action failed");
  }
};


return (
  <div className="max-w-xl mx-auto mt-6">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">Followers</h2>

    {loading ? (
      <p className="text-gray-500 text-center">Loading...</p>
    ) : (
      <div className="space-y-4">
        {followers.length === 0 ? (
          <p className="text-gray-500 text-center">No followers yet</p>
        ) : (
          followers.map((follower) => (
            <div
              key={follower._id}
              className="flex items-center justify-between p-3 bg-white shadow-sm rounded-xl hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <Link to={`/profile/${follower.username}/${follower._id}`}>
                  <img
                    src={follower.profilePic || "/default-avatar.png"}
                    alt={follower.username}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                </Link>
                <div>
                  <Link
                    to={`/profile/${follower.username}/${follower._id}`}
                    className="text-gray-800 font-medium hover:underline"
                  >
                    {follower.username}
                  </Link>
                  <p className="text-gray-500 text-sm">{follower.name}</p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleToggleFollow(follower._id, follower.isFollowingBack)
                }
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  follower.isFollowingBack
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {follower.isFollowingBack ? "Following" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>
    )}
  </div>
);
};

export default Followers;

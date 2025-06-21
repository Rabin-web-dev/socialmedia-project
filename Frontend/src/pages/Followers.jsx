import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../components/UI/button";

const FollowersList = () => {
  const { username, userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const fetchFollowers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/profile/${username}/${userId}/followers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (isMounted) setFollowers(res.data.followers || []);

        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (isMounted) setCurrentUserFollowing(currentUser?.following || []);
      } catch (err) {
        console.error("Failed to fetch followers or current user data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFollowers();
    return () => {
      isMounted = false;
    };
  }, [username, userId, currentUserId, token]);

  const handleFollowToggle = async (targetId, isFollowing) => {
    const endpoint = isFollowing ? "unfollow" : "follow";
    try {
      await axios.post(
        `http://localhost:5000/api/users/${endpoint}/${username}/${targetId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentUserFollowing((prev) =>
        isFollowing
          ? prev.filter((id) => id !== targetId)
          : [...prev, targetId]
      );
    } catch (err) {
      console.error("Failed to toggle follow/unfollow", err);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading followers...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Followers</h2>
      {followers.length === 0 ? (
        <p className="text-gray-500">No followers yet.</p>
      ) : (
        followers.map((user) => {
          const isFollowing = currentUserFollowing.includes(user._id);
          return (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 border rounded mb-3"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${user.username}/${user._id}`)}
              >
                <img
                  src={user.profilePic || "/Images/SocialMediaDefaultImage.jpg"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.name}</p>
                </div>
              </div>
              {user._id !== currentUserId && (
                <Button onClick={() => handleFollowToggle(user._id, isFollowing)}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default FollowersList;

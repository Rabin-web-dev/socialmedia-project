import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../components/UI/button"; // or wherever your Button component is

const FollowingList = () => {
  const { username, userId } = useParams();
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;
    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/profile/${username}/${userId}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
        setFollowing(res.data.following || []);
      }
        setFollowing(res.data.following || []);
      } catch (err) {
        console.error("Failed to fetch following", err);
      }
    };
    fetchFollowing();

     return () => {
    isMounted = false;
  };
  }, [username, userId, token]);

  const handleFollowToggle = async (targetUserId, isFollowing) => {
    const endpoint = isFollowing ? "unfollow" : "follow";
    try {
      await axios.post(
        `http://localhost:5000/api/users/${endpoint}/${username}/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update state after follow/unfollow
      setFollowing((prev) =>
        prev.map((user) =>
          user._id === targetUserId
            ? {
                ...user,
                followers: isFollowing
                  ? user.followers.filter((id) => id !== loggedInUser._id)
                  : [...user.followers, loggedInUser._id],
              }
            : user
        )
      );
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Following</h2>
      {following.length === 0 ? (
        <p>Not following anyone yet.</p>
      ) : (
        following.map((user) => {
          const isFollowing = user.followers?.some((id) => id === loggedInUser._id);
          return (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 border rounded mb-2"
            >
              <div
                onClick={() => navigate(`/profile/${user.username}/${user._id}`)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={user.profilePic || "/Images/SocialMediaDefaultImage.jpg"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.name}</p>
                </div>
              </div>
              {user._id !== loggedInUser._id && (
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

export default FollowingList;

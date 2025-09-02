import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q");

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const handleFollow = async (e, userId, username) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    const isFollowing = followedUsers.includes(userId);

    try {

      const url = `http://localhost:5000/api/users/${isFollowing ? "unfollow" : "follow"}/${username}/${userId}`;

      const res = await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFollowedUsers((prev) =>
      isFollowing ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
      console.log(`✅ ${isFollowing ? "Unfollowed" : "Followed"}:`, res.data.message);
    } catch (error) {
      console.error(`❌ ${isFollowing ? "Unfollow" : "Follow"} failed:`, error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/search/users?q=${query}`),
          axios.get(`http://localhost:5000/api/search/posts?q=${query}`),
        ]);
        setUserResults(userRes.data);
        setPostResults(postRes.data);
      } catch (err) {
        console.error("Search failed", err);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-semibold">Search Results for "{query}"</h2>

      {/* Users Section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Users</h3>
        {userResults.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="space-y-3">
            {userResults.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-100 p-3 rounded"
              >
                {/* Profile Info */}
                <div
                  className="flex items-center gap-3"
                  onClick={() => navigate(`/profile/${user.username}/${user._id}`)}
                >
                  <img
                    src={user.profilePic || "/Images/SocialMediaDefaultImage.jpg"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">@{user.username}</p>
                    <p className="text-sm text-gray-500">{user.name}</p>
                  </div>
                </div>

                {/* Follow Button */}
                {user._id !== loggedInUser._id && (
                  <button
                    className={`px-4 py-1 rounded ${
                      followedUsers.includes(user._id)
                        ? "bg-gray-400 text-white cursor-default"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    onClick={(e) => handleFollow(e, user._id, user.username)}
                  >
                    {followedUsers.includes(user._id) ? "Unfollow" : "Follow"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Posts Section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Posts</h3>
        {postResults.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <ul className="space-y-4">
            {postResults.map((post) => (
              <li
                key={post._id}
                className="p-4 border rounded shadow-sm hover:shadow-md transition"
              >
                <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <img
                    src={
                      post.author?.profilePic || "/Images/SocialMediaDefaultImage.jpg"
                    }
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  @{post.author?.username}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

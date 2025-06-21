import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Chatsidebar = ({ currentUserId, onlineUsers, typingStatus }) => {
  const [following, setFollowing] = useState([]); 
  const [lastMessages, setLastMessages] = useState({});
  const navigate = useNavigate();
  const { userId: activeChatId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const username = user?.username;
  const userId = user?._id;

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/profile/${username}/${userId}/following`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        console.log("✅ Fetched following:", res.data.following);
        setFollowing(Array.isArray(res.data.following) ? res.data.following : []);
      } catch (err) {
        console.error("Error fetching following users:", err);
      }
    };

    const fetchLastMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/last/${currentUserId}`);
        setLastMessages(res.data);
      } catch (err) {
        console.error("Error fetching last messages:", err);
      }
    };

    if (username && userId && token) {
      fetchFollowing();
      fetchLastMessages();
    }
  }, [currentUserId, username, userId, token]);

  const handleChatClick = (user) => {
    navigate(`/messages/${user._id}`, { state: { friend: user } })
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.includes(userId);
  };

  return (
    <div className="w-[360px] h-full bg-[#111b21] text-white border-r border-gray-700">
      <div className="p-3">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 rounded bg-[#202c33] text-sm placeholder-gray-400 text-white focus:outline-none"
        />
      </div>

      <div className="overflow-y-auto px-2 space-y-1">
        {following.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-4">
            You are not following anyone yet.
          </p>
        )}
        {following.map((user) => {
          const isActive = String(user._id) === String(activeChatId);
          const isTyping = typingStatus?.[user._id];
          const lastMessage = lastMessages[user._id] || "Click to chat";

          return (
            <div
              key={user._id}
              className={`flex items-center p-3 rounded cursor-pointer transition-all duration-200 ${
                isActive ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
              }`}
              onClick={() => handleChatClick(user)}
            >
              <div className="relative">
                <img
                  src={user.profilePic || `https://i.pravatar.cc/40?u=${user._id}`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {isUserOnline(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111b21] rounded-full" />
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="truncate font-semibold text-sm">{user.username}</p>
                <p
                  className={`truncate text-xs ${
                    isTyping ? "text-green-400 italic" : "text-gray-400"
                  }`}
                >
                  {isTyping ? "Typing..." : lastMessage}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Chatsidebar;

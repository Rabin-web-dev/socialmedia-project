import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useSocketContext from "../../hooks/useSocketContext";

const Chatsidebar = () => {
  const [following, setFollowing] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();
  const { userId: activeChatId } = useParams();
  const { onlineUsers, typingStatus, socket } = useSocketContext();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const username = user?.username;
  const userId = user?._id;

  // ✅ Fetch following + last message + unread counts
  const fetchFollowingWithLastMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/profile/${username}/${userId}/following`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const followingData = res.data.following || [];

      const enrichedFollowing = await Promise.all(
        followingData.map(async (friend) => {
          try {
            const msgRes = await axios.get(
              `http://localhost:5000/api/messages/last/${friend._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...friend,
              lastMessage: msgRes.data.lastMessage?.content || "Click to chat",
              unreadCount: msgRes.data.unreadCount || 0,
            };
          } catch {
            return { ...friend, lastMessage: "Click to chat", unreadCount: 0 };
          }
        })
      );

      setFollowing(enrichedFollowing);

      // Update unread counts separately
      const counts = {};
      enrichedFollowing.forEach((f) => (counts[f._id] = f.unreadCount || 0));
      setUnreadCounts(counts);

    } catch (err) {
      console.error("Error fetching following users:", err);
    }
  }, [username, userId, token]);

  useEffect(() => {
    if (username && userId && token) {
      fetchFollowingWithLastMessages();
    }
  }, [username, userId, token, fetchFollowingWithLastMessages]);

  // ✅ Update on new message / seen
  useEffect(() => {
    if (!socket) return;

    const handleReceive = () => fetchFollowingWithLastMessages();

    socket.on("receiveMessage", handleReceive);
    socket.on("messageSeen", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("messageSeen", handleReceive);
    };
  }, [socket, fetchFollowingWithLastMessages]);

  const handleChatClick = (friend) => {
    navigate(`/messages/${friend._id}`, { state: { friend } });

    // ✅ Reset unread count when chat is opened
    setUnreadCounts((prev) => ({ ...prev, [friend._id]: 0 }));
  };

  const isUserOnline = (id) => onlineUsers?.includes(id);
  const isUserTyping = (id) => typingStatus[id] || false;

  return (
    <div className="flex flex-col h-full w-full bg-[#111b21] text-white">
      {/* ✅ Sticky Search */}
      <div className="p-3 border-b border-gray-700 bg-[#111b21] sticky top-0 z-10">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-3 rounded bg-[#202c33] text-sm placeholder-gray-400 mb-1 text-white focus:outline-none"
        />
      </div>

      {/* ✅ Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {following.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-4">
            You are not following anyone yet.
          </p>
        )}

        {following.map((friend) => {
          const isActive = String(friend._id) === String(activeChatId);
          const online = isUserOnline(friend._id);
          const typing = isUserTyping(friend._id);
          const unread = unreadCounts[friend._id] || 0;

          return (
            <div
              key={friend._id}
              className={`flex items-center p-3 cursor-pointer transition-all duration-200 ${
                isActive ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
              }`}
              onClick={() => handleChatClick(friend)}
            >
              {/* ✅ Profile Pic with Online Dot */}
              <div className="relative">
                <img
                  src={friend.profilePic || `https://i.pravatar.cc/40?u=${friend._id}`}
                  alt={friend.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111b21] rounded-full"></span>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <p className="truncate font-semibold text-sm">{friend.username}</p>
                <p
                  className={`truncate text-xs ${
                    typing ? "text-green-400 italic" : "text-gray-400"
                  }`}
                >
                  {typing ? "Typing..." : friend.lastMessage || "Click to chat"}
                </p>
              </div>

              {/* ✅ Unread Badge */}
              {unread > 0 && (
                <div className="bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                  {unread}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Chatsidebar;

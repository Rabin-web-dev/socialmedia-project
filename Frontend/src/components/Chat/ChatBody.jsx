import React, { useEffect, useRef } from "react";
import useSocketContext from "../../hooks/useSocketContext";

const ChatBody = ({ messages, currentUserId, selectedUser, onMessageClick }) => {
  const messageEndRef = useRef(null);
  const { socket, typingStatus } = useSocketContext(); // ✅ Added socket

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  const isTyping = selectedUser?._id && typingStatus[selectedUser._id];

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ✅ Listen for reaction updates
  useEffect(() => {
    if (!socket) return;

    socket.on("messageReactionUpdated", (updatedMsg) => {
      const idx = messages.findIndex((m) => m._id === updatedMsg._id);
      if (idx !== -1) {
        messages[idx] = updatedMsg;
      }
    });

    return () => socket.off("messageReactionUpdated");
  }, [socket, messages]);

  // ✅ Reaction display helper
  const renderReactions = (msg) => {
    if (!msg.reactions || msg.reactions.length === 0) return null;

    // Group by emoji type and count
    const grouped = msg.reactions.reduce((acc, r) => {
      acc[r.emoji] = acc[r.emoji] ? acc[r.emoji] + 1 : 1;
      return acc;
    }, {});

    return (
      <div className="flex gap-1 mt-1 justify-end">
        {Object.entries(grouped).map(([emoji, count]) => {
          const userReacted = msg.reactions.some(
            (r) =>
              r.emoji === emoji &&
              String(r.user?._id || r.user) === String(currentUserId)
          );
          return (
            <div
              key={emoji}
              className={`px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${
                userReacted ? "bg-blue-100 border-blue-400" : "bg-gray-100 border-gray-300"
              }`}
            >
              <span>{emoji}</span>
              <span>{count > 1 ? count : ""}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMessageContent = (msg) => {
    if (msg.messageType === "post" && msg.sharedPost) {
      return (
        <div className="p-2 border rounded-lg bg-gray-100">
          <p className="text-sm font-semibold mb-1">📌 Shared Post</p>
          {msg.sharedPost.image && (
            <img
              src={msg.sharedPost.image}
              alt="Shared Post"
              className="max-w-[200px] rounded mb-2"
            />
          )}
          {msg.sharedPost.video && (
            <video
              controls
              src={msg.sharedPost.video}
              className="max-w-[250px] rounded mb-2"
            />
          )}
          <p className="text-xs text-gray-700">{msg.sharedPost.content}</p>
        </div>
      );
    }

    if (msg.messageType === "image") {
      return <img src={msg.media} alt="media" className="max-w-[200px] rounded" />;
    }
    if (msg.messageType === "video") {
      return <video controls src={msg.media} className="max-w-[250px] rounded" />;
    }
    if (msg.messageType === "audio") {
      return <audio controls src={msg.media} className="w-full" />;
    }
    if (msg.messageType === "file") {
      return (
        <a
          href={msg.media}
          className="text-blue-600 underline break-all"
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          Download file
        </a>
      );
    }
    return msg.content;
  };

  if (!selectedUser || !currentUserId || !Array.isArray(messages)) {
    return <div className="p-4 text-sm text-gray-500">Loading chat...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f6]">
      <div className="flex-1 overflow-y-auto px-4 pb-[90px]">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No messages yet</p>
        ) : (
          messages.map((msg, i) => {
            const isOwn = String(msg.sender?._id || msg.sender) === String(currentUserId);
            const time = formatTime(msg.createdAt || msg.timestamp);

            return (
              <div
                key={msg._id || i}
                className={`flex items-end mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
                onClick={() => onMessageClick && onMessageClick(msg)}
              >
                {!isOwn && (
                  <img
                    src={selectedUser?.profilePic || "https://i.pravatar.cc/40"}
                    alt="friend"
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                )}

                <div className={`max-w-xs ${isOwn ? "text-right" : "text-left"} space-y-1`}>
                  <div
                    className={`px-4 py-2 rounded-xl shadow-md break-words max-w-full ${
                      isOwn
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-black rounded-bl-none"
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>

                  {/* ✅ Reaction display just below bubble */}
                  {renderReactions(msg)}

                  <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                    {isOwn && (
                      <span
                        className={`mr-1 ${
                          msg.seen
                            ? "text-blue-500"
                            : msg.delivered
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.seen ? "✔✔" : msg.delivered ? "✔" : ""}
                      </span>
                    )}
                    <span>{time}</span>
                  </div>
                </div>

                {isOwn && (
                  <img
                    src={selectedUser?.profilePic || "https://i.pravatar.cc/40"}
                    alt="you"
                    className="w-8 h-8 rounded-full object-cover ml-2"
                  />
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 mb-2">
            <img
              src={selectedUser?.profilePic || "https://i.pravatar.cc/40"}
              alt="typing"
              className="w-8 h-8 rounded-full"
            />
            <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm italic">
              Typing...
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>
    </div>
  );
};

export default ChatBody;

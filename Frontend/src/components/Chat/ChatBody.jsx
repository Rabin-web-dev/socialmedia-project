import React, { useEffect, useRef } from "react";

const ChatBody = ({ messages, currentUserId, selectedUser, isTyping }) => {
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser || !currentUserId || !Array.isArray(messages)) {
    return <div className="p-4 text-sm text-gray-500">Loading chat...</div>;
  }

  return (
    <div className="flex-1 px-4 overflow-y-auto pb-[90px] bg-[#f0f2f6]">
      {messages.map((msg, i) => {
        const isOwn = msg.sender === currentUserId;
        const time = formatTime(msg.createdAt || msg.timestamp);

        return (
          <div
            key={i}
            className={`flex items-end ${isOwn ? "justify-start" : "justify-end"}`}
          >
            {isOwn && (
              <img
                src={selectedUser?.profilePic || "https://i.pravatar.cc/40"}
                alt="you"
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
            )}

            <div className={`max-w-xs ${isOwn ? "text-left" : "text-right"} space-y-1`}>
              <div
                className={`px-4 py-2 rounded-xl shadow-md ${
                  isOwn
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-white text-black rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                {isOwn && (
                  <span className={`mr-1 ${msg.seen ? "text-blue-500" : "text-gray-400"}`}>
                    {msg.seen ? "✔✔" : msg.delivered ? "✔" : ""}
                  </span>
                )}
                <span>{time}</span>
              </div>
            </div>

            {!isOwn && (
              <img
                src={selectedUser?.profilePic || "https://i.pravatar.cc/40"}
                alt="friend"
                className="w-8 h-8 rounded-full object-cover ml-2"
              />
            )}
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-center gap-2">
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
  );
};

export default ChatBody;

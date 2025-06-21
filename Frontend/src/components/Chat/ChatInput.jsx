import { useEffect, useRef, useState } from "react";
import Picker from "emoji-picker-react";
import useSocketContext from "../../hooks/useSocketContext";
import axios from "axios";

const ChatInput = ({ currentUserId, selectedUserId, messages, setMessages }) => {
  const { socket } = useSocketContext();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typing, setTyping] = useState(false);
  const messageEndRef = useRef();

  useEffect(() => {
    if (!socket) return;

    if (text && !typing) {
      setTyping(true);
      socket.emit("typing", { senderId: currentUserId, receiverId: selectedUserId });

      const timeout = setTimeout(() => {
        setTyping(false);
        socket.emit("stopTyping", { senderId: currentUserId, receiverId: selectedUserId });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [text, typing, socket, currentUserId, selectedUserId]);

  useEffect(() => {
    if (!socket || typeof socket.on !== "function") return;

    const handleReceiveMessage = (msg) => {
      if (msg.sender === selectedUserId) {
        setMessages((prev = []) => [...prev, msg]);
        socket.emit("messageSeen", { messageId: msg._id, receiverId: msg.sender });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", () => {});
    socket.on("stopTyping", () => {});
    socket.on("messageDelivered", ({ messageId }) => {
      console.log("✅ Message delivered", messageId);
    });
    socket.on("messageSeen", ({ messageId }) => {
      console.log("👁 Message seen", messageId);
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageDelivered");
      socket.off("messageSeen");
    };
  }, [socket, selectedUserId, setMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (text.trim() && socket) {
      const message = {
        senderId: currentUserId,
        receiverId: selectedUserId,
        content: text,
        createdAt: new Date().toISOString(),
        seen: false,
        delivered: true,
        type: "text",
      };
      socket.emit("sendMessage", message);
      setMessages((prev = []) => [...prev, message]);
      setText("");
      socket.emit("stopTyping", { senderId: currentUserId, receiverId: selectedUserId });
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const mediaMessage = {
        senderId: currentUserId,
        receiverId: selectedUserId,
        media: res.data.url,
        type: file.type.startsWith("audio") ? "audio" : "image",
        createdAt: new Date().toISOString(),
        seen: false,
        delivered: true,
      };

      socket.emit("sendMessage", mediaMessage);
      setMessages((prev = []) => [...prev, mediaMessage]);
    } catch (error) {
      console.error("Media upload failed:", error);
    }
  };

  return (
    <div className="border-t px-4 py-3 bg-white flex items-center gap-2 mt-auto">
      <input type="file" id="mediaUpload" className="hidden" accept="image/*,audio/*" onChange={handleMediaUpload} />
      <label htmlFor="mediaUpload" className="cursor-pointer text-xl">📎</label>

      <button onClick={() => setShowEmoji(!showEmoji)} className="text-xl">😊</button>
      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-50">
          <Picker onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)} />
        </div>
      )}

      <input
        type="text"
        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-full">
        Send
      </button>

      <div ref={messageEndRef} />
    </div>
  );
};

export default ChatInput;

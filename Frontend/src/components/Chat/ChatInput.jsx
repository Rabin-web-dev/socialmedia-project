// import { useEffect, useRef, useState } from "react";
// import Picker from "emoji-picker-react";
// import useSocketContext from "../../hooks/useSocketContext";
// import axios from "axios";

// const ChatInput = ({ currentUserId, selectedUserId, messages, setMessages }) => {
//   const { socket } = useSocketContext();
//   const [text, setText] = useState("");
//   const [showEmoji, setShowEmoji] = useState(false);
//   const messageEndRef = useRef();

//   // ✅ Scroll to latest message
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ✅ Typing status
//   useEffect(() => {
//     if (!socket || !currentUserId || !selectedUserId) return;

//     if (text.trim()) {
//       socket.emit("typing", {
//         from: currentUserId,
//         to: selectedUserId,
//         typing: true,
//       });
//     } else {
//       socket.emit("typing", {
//         from: currentUserId,
//         to: selectedUserId,
//         typing: false,
//       });
//     }

//     const timeout = setTimeout(() => {
//       socket.emit("typing", {
//         from: currentUserId,
//         to: selectedUserId,
//         typing: false,
//       });
//     }, 1500);

//     return () => clearTimeout(timeout);
//   }, [text, socket, currentUserId, selectedUserId]);

//   // ✅ Send text message
//   const handleSend = async () => {
//     if (!text.trim()) return;
//     if (!socket || !socket.connected) {
//       console.error("❌ Socket not connected.");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post(
//         "http://localhost:5000/api/messages",
//         { receiver: selectedUserId, content: text },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const newMessage = res.data.data;

//       setMessages((prev) => {
//         const exists = prev.some((m) => m._id === newMessage._id);
//         return exists ? prev : [...prev, newMessage];
//       });

//       socket.emit("sendMessage", newMessage);
//       socket.emit("typing", { from: currentUserId, to: selectedUserId, typing: false });

//       setText("");
//     } catch (err) {
//       console.error("❌ Send error:", err);
//     }
//   };

//   // ✅ Handle media upload
//   const handleMediaUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.post("http://localhost:5000/api/messages/upload", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       const mediaUrl = res.data.url;
//       const fileType = file.type;
//       const messageType = fileType.startsWith("image")
//         ? "image"
//         : fileType.startsWith("video")
//         ? "video"
//         : fileType.startsWith("audio")
//         ? "audio"
//         : "file";

//       const mediaMessage = {
//         senderId: currentUserId,
//         receiverId: selectedUserId,
//         media: mediaUrl,
//         messageType,
//         createdAt: new Date().toISOString(),
//         seen: false,
//         delivered: true,
//       };

//       setMessages((prev) => [...prev, mediaMessage]);
//       socket.emit("sendMessage", mediaMessage);
//     } catch (err) {
//       console.error("❌ Media upload failed:", err);
//     }
//   };

//   return (
//     <div className="relative border-t px-4 py-3 bg-white flex items-center gap-2 mt-auto">
//       {/* 📎 Upload */}
//       <input
//         type="file"
//         id="mediaUpload"
//         className="hidden"
//         accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.zip,.rar"
//         onChange={handleMediaUpload}
//       />
//       <label htmlFor="mediaUpload" className="cursor-pointer text-xl">📎</label>

//       {/* 😊 Emoji */}
//       <button onClick={() => setShowEmoji(!showEmoji)} className="text-xl">😊</button>
//       {showEmoji && (
//         <div className="absolute bottom-16 left-4 z-50">
//           <Picker onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)} />
//         </div>
//       )}

//       {/* ✍️ Textbox */}
//       <input
//         type="text"
//         className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         placeholder="Type a message"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && handleSend()}
//       />

//       {/* 🚀 Send */}
//       <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-full">
//         Send
//       </button>

//       {/* 🔽 Scroll Anchor */}
//       <div ref={messageEndRef} />
//     </div>
//   );
// };

// export default ChatInput;


import { useEffect, useRef, useState } from "react";
import Picker from "emoji-picker-react";
import useSocketContext from "../../hooks/useSocketContext";
import axios from "axios";

const ChatInput = ({ currentUserId, selectedUserId, messages, setMessages }) => {
  const { socket } = useSocketContext();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messageEndRef = useRef();

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !currentUserId || !selectedUserId) return;

    if (text.trim()) {
      socket.emit("typing", { from: currentUserId, to: selectedUserId, typing: true });
    } else {
      socket.emit("typing", { from: currentUserId, to: selectedUserId, typing: false });
    }

    const timeout = setTimeout(() => {
      socket.emit("typing", { from: currentUserId, to: selectedUserId, typing: false });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [text, socket, currentUserId, selectedUserId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!socket || !socket.connected) {
      console.error("❌ Socket not connected, cannot send message");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        { receiver: selectedUserId, content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessage = res.data.data;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === newMessage._id);
        return exists ? prev : [...prev, newMessage];
      });

      socket.emit("sendMessage", newMessage);
      setText("");

      socket.emit("typing", { from: currentUserId, to: selectedUserId, typing: false });
    } catch (err) {
      console.error("❌ Send error:", err);
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/messages/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const mediaUrl = res.data.url;
      const fileType = file.type;
      const messageType = fileType.startsWith("image")
        ? "image"
        : fileType.startsWith("video")
        ? "video"
        : fileType.startsWith("audio")
        ? "audio"
        : "file";

      const mediaMessage = {
        senderId: currentUserId,
        receiverId: selectedUserId,
        media: mediaUrl,
        messageType,
        createdAt: new Date().toISOString(),
        seen: false,
        delivered: true,
      };

      socket.emit("sendMessage", mediaMessage);
    } catch (err) {
      console.error("❌ Media upload failed:", err);
    }
  };

  return (
    <div className="border-t px-3 py-2 bg-white flex items-center gap-2 mt-auto w-full max-h-28 sm:px-4 sm:py-3 relative">
      {/* Media Upload */}
      <input
        type="file"
        id="mediaUpload"
        className="hidden"
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.zip,.rar"
        onChange={handleMediaUpload}
      />
      <label htmlFor="mediaUpload" className="cursor-pointer text-xl sm:text-2xl">📎</label>

      {/* Emoji Toggle */}
      <button onClick={() => setShowEmoji(!showEmoji)} className="text-xl sm:text-2xl">😊</button>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-16 left-2 sm:left-4 z-50">
          <Picker onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)} />
        </div>
      )}

      {/* Message Input */}
      <input
        type="text"
        className="flex-1 border rounded-full px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm sm:px-4 sm:py-2 sm:text-base"
      >
        Send
      </button>

      {/* Dummy Scroll Element */}
      <div ref={messageEndRef} />
    </div>
  );
};

export default ChatInput;

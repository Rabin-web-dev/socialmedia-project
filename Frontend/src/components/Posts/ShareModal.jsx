import { useState, useEffect, useContext } from "react";
import { SocketContext } from "../../context/SocketContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ShareModal = ({ isOpen, onClose, postId, currentUser }) => {
  const { socket } = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const res = await axios.get("https://stark-socialmedia.onrender.com/api/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [isOpen, token]);

  const handleSelectUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSend = () => {
    if (!selectedUsers.length || !currentUser?._id) return;

    selectedUsers.forEach((receiver) => {
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: receiver._id,
        messageType: "post",
        postId,
        content: message,
      });
    });

    onClose();
    setMessage("");
    setSelectedUsers([]);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={() => {
        onClose();
        navigate("/home"); 
      }}>
      <div className="bg-white rounded-lg w-[450px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Share</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">✕</button>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-2 border-b bg-gray-50">
            {selectedUsers.map((u) => (
              <div
                key={u._id}
                className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
              >
                <span>{u.username}</span>
                <button
                  onClick={() => handleSelectUser(u)}
                  className="ml-2 text-blue-700 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* User Grid (3 per row, scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <div className="grid grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className={`flex flex-col items-center cursor-pointer p-2 rounded-lg ${
                  selectedUsers.some((sel) => sel._id === u._id)
                    ? "bg-blue-50 border border-blue-400"
                    : "hover:bg-gray-100"
                }`}
              >
                <img
                  src={u.profilePic || "/default-avatar.png"}
                  alt={u.username}
                  className={`w-16 h-16 rounded-full border-2 ${
                    selectedUsers.some((sel) => sel._id === u._id)
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                />
                <p className="text-sm mt-2 text-center truncate">{u.username}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input + Send Button */}
        <div className="p-4 border-t">
          <input
            type="text"
            placeholder="Write a message (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <button
            onClick={handleSend}
            className="w-full py-2 bg-blue-600 text-white font-bold rounded disabled:bg-gray-300"
            disabled={!selectedUsers.length}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

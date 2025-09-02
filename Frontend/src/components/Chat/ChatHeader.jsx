import { Phone, Video, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CallConfirmationModal from "../Model/CallConfirmationModal";
import useSocketContext from "../../hooks/useSocketContext";

const ChatHeader = ({ selectedUser, localUser }) => {
  const navigate = useNavigate();
  const { userId } = useParams(); // ✅ Detect active chat
  const { onlineUsers, typingStatus, socket } = useSocketContext();

  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [callType, setCallType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ Handle resize to check mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Update Online Status
  useEffect(() => {
    if (selectedUser?._id) {
      setIsOnline(onlineUsers.includes(selectedUser._id));
    }
  }, [onlineUsers, selectedUser]);

  // ✅ Fetch Last Seen when user is offline
  useEffect(() => {
    if (!isOnline && selectedUser?._id) {
      axios.get(`/api/last-seen/${selectedUser._id}`).then((res) => {
        setLastSeen(res.data.lastSeen);
      });
    }
  }, [isOnline, selectedUser?._id]);

  // ✅ Real-time Last Seen updates
  useEffect(() => {
    if (!socket || !selectedUser?._id) return;

    const handleLastSeenUpdate = ({ userId, lastSeen }) => {
      if (userId === selectedUser._id) setLastSeen(lastSeen);
    };

    socket.on("lastSeenUpdate", handleLastSeenUpdate);
    return () => socket.off("lastSeenUpdate", handleLastSeenUpdate);
  }, [socket, selectedUser]);

  // ✅ Typing Status
  useEffect(() => {
    if (selectedUser?._id) {
      setIsTyping(typingStatus[selectedUser._id] || false);
    }
  }, [typingStatus, selectedUser]);

  // ✅ Format Last Seen Time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Offline";
    const date = new Date(timestamp);
    return `Last seen at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // ✅ Call Handlers
  const handleCall = (type) => {
    setCallType(type);
    setShowModal(true);
  };

  const cancelCall = () => {
    setCallType(null);
    setShowModal(false);
  };

  const confirmCall = () => {
    setShowModal(false);

    const roomID = [localUser._id, selectedUser._id].sort().join("_");
    const callMode = callType === "voice" ? "voice" : "video";

    socket?.emit("incomingCall", {
      callerId: localUser._id,
      receiverId: selectedUser._id,
      callerName: localUser.username,
      callType: callMode,
      roomID,
    });

    navigate(`/call/${roomID}`, {
      state: {
        isCaller: true,
        callType: callMode,
        localUser,
        friend: selectedUser,
      },
    });
  };

  if (!selectedUser) return null;

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[#202c33] text-white border-b border-gray-700">
        <div className="flex items-center gap-3">
          {/* ✅ Back Button: Only show on Mobile & Inside Chat */}
          {isMobile && userId && (
            <button
              onClick={() => navigate("/messages")}
              className="mr-2 p-1 rounded-full hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* ✅ Profile Pic */}
          <div className="relative">
            <img
              src={selectedUser.profilePic || `https://i.pravatar.cc/40?u=${selectedUser._id}`}
              alt={selectedUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#202c33] rounded-full"></span>
            )}
          </div>

          {/* ✅ Username + Status */}
          <div>
            <p className="font-semibold text-sm">{selectedUser.username}</p>
            <p
              className={`text-xs ${
                isTyping
                  ? "text-green-400 italic"
                  : isOnline
                  ? "text-green-400"
                  : "text-gray-400"
              }`}
            >
              {isTyping
                ? "typing..."
                : isOnline
                ? "Online"
                : formatTime(lastSeen)}
            </p>
          </div>
        </div>

        {/* ✅ Call Buttons */}
        <div className="flex items-center gap-4">
          <button onClick={() => handleCall("voice")} title="Voice Call">
            <Phone className="w-5 h-5 hover:text-blue-400 transition" />
          </button>
          <button onClick={() => handleCall("video")} title="Video Call">
            <Video className="w-5 h-5 hover:text-blue-400 transition" />
          </button>
        </div>
      </div>

      {/* ✅ Call Confirmation Modal */}
      <CallConfirmationModal
        isOpen={showModal}
        type={callType}
        username={selectedUser.username}
        onCancel={cancelCall}
        onConfirm={confirmCall}
        friend={selectedUser}
      />
    </>
  );
};

export default ChatHeader;

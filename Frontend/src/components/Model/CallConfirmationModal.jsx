import { Video, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CallConfirmationModal = ({ isOpen, type, username, onCancel, onConfirm, friend }) => {
  const isVoice = type === "voice";
  const icon = isVoice ? <Phone className="w-6 h-6 text-blue-600" /> : <Video className="w-6 h-6 text-blue-600" />;
  const label = isVoice ? "Voice Call" : "Video Call";
  const navigate = useNavigate();

  if (!isOpen) return null;

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(); // optional callback

    // Navigate to ZEGOCLOUD call room with user._id as roomID
    navigate(`/call/${friend._id}`, {
      state: {
        isCaller: true,
        friend,
        callType: type,
        localUser: user,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm text-center animate-fade-in">
        <div className="flex items-center justify-center mb-4">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Start a {label}?</h2>
        <p className="text-sm text-gray-500 mb-6">
          You’re calling <span className="font-medium text-blue-600">{username}</span>
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Start Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallConfirmationModal;

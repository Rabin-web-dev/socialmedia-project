import { Phone, Video, PhoneOff } from "lucide-react";

const IncomingCallModal = ({
  isOpen,
  callerName,
  callerProfilePic,
  callType,
  onReject,
  onAccept,
}) => {
  if (!isOpen) return null;

  const isVoice = callType === "voice";
  const icon = isVoice ? (
    <Phone className="w-6 h-6 text-green-500" />
  ) : (
    <Video className="w-6 h-6 text-blue-500" />
  );
  const label = isVoice ? "Incoming Voice Call" : "Incoming Video Call";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm text-center animate-fade-in">
        {/* ✅ Profile Picture */}
        <div className="flex justify-center mb-4">
          <img
            src={callerProfilePic || "https://i.pravatar.cc/80"}
            alt={callerName}
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>

        {/* ✅ Call Type & Caller */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{callerName} is calling you...</p>

        {/* ✅ Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onReject}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2"
          >
            {icon}
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;

import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const ZegoCall = () => {
  const callContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Extract call data from location.state
  const { localUser, friend, callType, roomID } = location.state || {};
  const finalRoomID = roomID || [localUser?._id, friend?._id].sort().join("_");

  useEffect(() => {
    if (!callContainerRef.current || !localUser || !friend) return;

    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

    if (!appID || !serverSecret) {
      console.error("❌ Zego AppID/ServerSecret missing in .env");
      return;
    }

    // ✅ Generate Token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      finalRoomID,
      localUser._id,
      localUser.username
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    console.log("✅ Joining Zego Room:", finalRoomID);

    // ✅ Join Zego Room
    zp.joinRoom({
      container: callContainerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-to-1 call mode
      },
      showPreJoinView: false,
      turnOnCameraWhenJoining: callType === "video", // ✅ Camera ON for video
      turnOnMicrophoneWhenJoining: true,
      showScreenSharingButton: callType === "video", // ✅ Only show screen share in video mode
      onLeaveRoom: () => {
        console.log("📞 Call ended, navigating back to chat");
        navigate(`/messages/${friend._id}`, { state: { friend } });
      },
      onUserLeave: () => {
        console.log("👋 Other user left, ending call");
        navigate(`/messages/${friend._id}`, { state: { friend } });
      },
    });

    return () => {
      console.log("🔌 Cleaning up Zego instance");
      zp.destroy();
    };
  }, [localUser, friend, callType, finalRoomID, navigate]);

  if (!localUser || !friend) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-black">
        Invalid call data
      </div>
    );
  }

  return <div ref={callContainerRef} className="w-screen h-screen bg-black" />;
};

export default ZegoCall;

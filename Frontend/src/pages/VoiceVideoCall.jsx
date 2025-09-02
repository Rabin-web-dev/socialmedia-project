// import React, { useEffect, useRef, useState, useCallback } from "react";
// import Peer from "simple-peer";
// import { useLocation, useNavigate } from "react-router-dom";
// import useSocketContext from "../hooks/useSocketContext";

// const formatDuration = (seconds) => {
//   const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
//   const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
//   const s = String(seconds % 60).padStart(2, "0");
//   return `${h}:${m}:${s}`;
// };

// const VoiceVideoCall = () => {
//   const { socket } = useSocketContext();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { friend, isCaller, callType } = location.state || {};

//   // Redirect early if missing state
//   useEffect(() => {
//     if (!friend || !callType || typeof isCaller !== "boolean") {
//       console.warn("Missing call state. Redirecting...");
//       navigate("/messages");
//     }
//   }, [friend, callType, isCaller, navigate]);

//   const [stream, setStream] = useState(null);
//   const [streamInitialized, setStreamInitialized] = useState(false); // ✅ fix 1
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [isMicOn, setIsMicOn] = useState(true);
//   const [isCameraOn, setIsCameraOn] = useState(callType === "video");
//   const [callDuration, setCallDuration] = useState(0);

//   const myVideo = useRef(null);
//   const friendVideo = useRef(null);
//   const peerRef = useRef(null);
//   const timerRef = useRef(null);

//   const startTimer = () => {
//     timerRef.current = setInterval(() => {
//       setCallDuration((prev) => prev + 1);
//     }, 1000);
//   };

//   const endCall = useCallback(() => {
//     stream?.getTracks().forEach((track) => track.stop());
//     peerRef.current?.destroy();
//     clearInterval(timerRef.current);
//     socket.emit("endCall", { to: friend._id });
//     navigate("/messages");
//   }, [stream, socket, friend?._id, navigate]);

//   const setupPeer = useCallback(
//     (initiator, mediaStream, remoteSignal = null) => {
//       const peer = new Peer({ initiator, trickle: false, stream: mediaStream });

//       peer.on("signal", (signal) => {
//         if (initiator) {
//           socket.emit("sendOffer", {
//             to: friend._id,
//             from: socket.id,
//             signalData: signal,
//             name: "Caller",
//             callType,
//           });
//         } else {
//           socket.emit("sendAnswer", { to: friend._id, signal });
//         }
//       });

//       peer.on("stream", (remoteStream) => {
//         if (friendVideo.current) {
//           friendVideo.current.srcObject = remoteStream;
//         }
//       });

//       peer.on("error", (err) => {
//         console.error("❌ Peer error:", err);
//       });

//       peer.on("close", endCall);

//       if (remoteSignal) {
//         peer.signal(remoteSignal);
//       }

//       peerRef.current = peer;
//     },
//     [socket, friend?._id, callType, endCall]
//   );

//     useEffect(() => {
//   if (!friend || !callType) {
//     console.warn("🚨 Missing call state. Redirecting...");
//     navigate("/messages");
//   }
// }, [friend, callType, navigate]);

//   useEffect(() => {
//     if (!friend || !callType || streamInitialized) return;

//     navigator.mediaDevices
//       .getUserMedia({ video: callType === "video", audio: true })
//       .then((mediaStream) => {
//         setStream(mediaStream);
//         if (myVideo.current) {
//           myVideo.current.srcObject = mediaStream;
//         }

//         if (isCaller) {
//           setupPeer(true, mediaStream);
//         }

//         setStreamInitialized(true); // ✅ fixed: now set it correctly
//       })
//       .catch((err) => {
//         console.error("❌ Media access error:", err);
//         navigate("/messages");
//       });

    


//     return () => {
//       peerRef.current?.destroy();
//       stream?.getTracks().forEach((track) => track.stop());
//       clearInterval(timerRef.current);
//     };
//   }, [friend, callType, isCaller, streamInitialized, navigate, setupPeer, stream]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleReceiveOffer = ({ signal }) => {
//       if (!peerRef.current && stream) {
//         setupPeer(false, stream, signal);
//         setCallAccepted(true);
//         startTimer();
//       }
//     };

//     const handleReceiveAnswer = (signal) => {
//       if (peerRef.current) {
//         peerRef.current.signal(signal);
//         setCallAccepted(true);
//         startTimer();
//       }
//     };

//     const handleCallEnded = () => {
//       endCall();
//     };

//     socket.on("receiveOffer", handleReceiveOffer);
//     socket.on("receiveAnswer", handleReceiveAnswer);
//     socket.on("endCall", handleCallEnded);

//     return () => {
//       socket.off("receiveOffer", handleReceiveOffer);
//       socket.off("receiveAnswer", handleReceiveAnswer);
//       socket.off("endCall", handleCallEnded);
//     };
//   }, [socket, stream, endCall, setupPeer]);

//   const toggleMic = () => {
//     stream?.getAudioTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//       setIsMicOn(track.enabled);
//     });
//   };

//   const toggleCamera = () => {
//     stream?.getVideoTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//       setIsCameraOn(track.enabled);
//     });
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
//       <h2 className="text-xl mb-2">
//         {callType === "video" ? "Video" : "Voice"} Call with {friend?.username}
//       </h2>

//       {callAccepted && (
//         <p className="text-sm text-gray-400 mb-4">
//           Duration: {formatDuration(callDuration)}
//         </p>
//       )}

//       <div className="flex gap-6">
//         <div>
//           <p className="text-sm text-center mb-1">You</p>
//           <video
//             ref={myVideo}
//             autoPlay
//             muted
//             playsInline
//             className="w-64 h-48 bg-gray-700 rounded"
//           />
//         </div>
//         <div>
//           <p className="text-sm text-center mb-1">{friend?.username}</p>
//           {callAccepted ? (
//             <video
//               ref={friendVideo}
//               autoPlay
//               playsInline
//               className="w-64 h-48 bg-gray-700 rounded"
//             />
//           ) : (
//             <div className="w-64 h-48 flex items-center justify-center bg-gray-800 rounded text-gray-400">
//               Waiting for response...
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex gap-4 mt-6">
//         <button onClick={toggleMic} className="px-4 py-2 bg-gray-700 rounded">
//           {isMicOn ? "Mute Mic" : "Unmute Mic"}
//         </button>
//         {callType === "video" && (
//           <button onClick={toggleCamera} className="px-4 py-2 bg-gray-700 rounded">
//             {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
//           </button>
//         )}
//         <button
//           onClick={endCall}
//           className="px-6 py-2 bg-red-600 hover:bg-red-700 transition rounded"
//         >
//           End Call
//         </button>
//       </div>
//     </div>
//   );
// };

// export default VoiceVideoCall;

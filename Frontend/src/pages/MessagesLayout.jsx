// import useSocketContext from "../hooks/useSocketContext";
// import Chatsidebar from "../components/Chat/Chatsidebar";
// import { Outlet, useParams } from "react-router-dom";
// import { useState, useEffect } from "react";

// const MessagesLayout = () => {
//   const loggedInUser = JSON.parse(localStorage.getItem("user"));
//   const { onlineUsers, typingStatus } = useSocketContext();
//   const { userId } = useParams();

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   if (!loggedInUser) return <div className="p-4">Loading chats...</div>;

//   const shouldShowSidebar = !isMobile || !userId;

//   return (
//     <div className="h-screen w-full bg-[#0b141a] overflow-hidden">
//       {/* ✅ Flex container for sidebar + chat */}
//       <div className="flex h-full">
//         {/* Sidebar */}
//         {shouldShowSidebar && (
//           <div
//             className="bg-[#111b21] text-white h-full 
//                        hidden sm:block 
//                        sm:w-25 md:w-45 lg:w-70"
//           >
//             <Chatsidebar
//               currentUserId={loggedInUser._id}
//               onlineUsers={onlineUsers}
//               typingStatus={typingStatus}
//             />
//           </div>
//         )}

//         {/* Chat content (takes remaining space) */}
//         <div className="flex-1 flex flex-col h-full bg-[#f0f2f6]">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessagesLayout;


import useSocketContext from "../hooks/useSocketContext";
import Chatsidebar from "../components/Chat/Chatsidebar";
import { Outlet, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const MessagesLayout = () => {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const { onlineUsers, typingStatus } = useSocketContext();
  const { userId } = useParams();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!loggedInUser) return <div className="p-4">Loading chats...</div>;

  // ✅ Mobile → show only sidebar OR only chat content
  // ✅ Desktop/Tablet → show both
  return (
    <div className="h-screen w-full bg-[#0b141a] overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        {(!isMobile || !userId) && (
          <div
            className="bg-[#111b21] text-white h-full 
              w-full sm:w-[6rem] md:w-[10rem] lg:w-[20rem] xl:w-[20rem]"
          >
            <Chatsidebar
              currentUserId={loggedInUser._id}
              onlineUsers={onlineUsers}
              typingStatus={typingStatus}
            />
          </div>
        )}

        {/* Chat content */}
        {(!isMobile || userId) && (
          <div className="flex flex-col h-full flex-1">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesLayout;

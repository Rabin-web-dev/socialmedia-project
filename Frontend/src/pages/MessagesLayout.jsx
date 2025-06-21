import useSocketContext from "../hooks/useSocketContext";
import Chatsidebar from "../components/Chat/Chatsidebar";
import { Outlet } from "react-router-dom";

const MessagesLayout = () => {

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const { onlineUsers, typingStatus } = useSocketContext();

  if (!loggedInUser) return <div className="p-4">Loading chats...</div>;

  return (
    <div className="flex h-screen overflow-hidden">
        <Chatsidebar
          currentUserId={loggedInUser._id}
          onlineUsers={onlineUsers}
          typingStatus={typingStatus}
        />
      <div className="flex flex-col flex-1 h-full">
        <Outlet />
      </div>
    </div>
  );
};

export default MessagesLayout;

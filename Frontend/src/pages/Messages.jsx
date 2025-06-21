import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ChatHeader from "../components/Chat/ChatHeader";
import ChatBody from "../components/Chat/ChatBody";
import ChatInput from "../components/Chat/ChatInput";

const Messages = () => {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const { userId } = useParams();
  const location = useLocation();
  const stateFriend = location.state?.friend;

  const [friend, setFriend] = useState(stateFriend || null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${user?.username}/${userId}`);
        setFriend(res.data?.user || res.data); 
      } catch (err) {
        console.error("Error fetching friend:", err);
      }
    };
    if (!stateFriend && userId) fetchUser();
  }, [userId, stateFriend, user?.username]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages/${userId}`);
        setMessages(res.data.messages); 
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    if (userId) fetchMessages();
  }, [userId]);

  if (!user || !friend) return <div>Loading chat...</div>;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <ChatBody messages={messages} currentUserId={user._id} selectedUser={friend} />
      <ChatInput
        currentUserId={user._id}
        selectedUserId={friend._id}
        selectedUser={friend}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
};

export default Messages;

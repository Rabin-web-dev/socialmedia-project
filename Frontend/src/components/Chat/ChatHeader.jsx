import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ChatHeader = () => {
  const { userId } = useParams(); // 👈 get :userId from URL
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching chat user:', err);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (!user) return null; // or loading UI

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center space-x-3">
        <img
          src={user.profilePic || `https://i.pravatar.cc/40?u=${user._id}`}
          className="w-10 h-10 rounded-full"
          alt={user.username}
        />
        <div>
          <p className="font-semibold">{user.username}</p>
          <p className="text-green-500 text-sm">Online</p> {/* make this dynamic if you track online status */}
        </div>
      </div>
      <div className="space-x-4 text-purple-600 text-xl">
        <i className="fas fa-phone cursor-pointer" />
        <i className="fas fa-video cursor-pointer" />
        <i className="fas fa-info-circle cursor-pointer" />
      </div>
    </div>
  );
};

export default ChatHeader;

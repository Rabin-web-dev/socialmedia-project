import React from 'react';
import { useNavigate } from "react-router-dom";

const SwitchAccount = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const navigate = useNavigate();
  
    const handleSwitch = (user) => {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", user.token);
      window.dispatchEvent(new Event("storage"));
      navigate("/home");
    };
  
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Switch Account</h2>
        <ul className="space-y-2">
          {users.map((user, idx) => (
            <li
              key={idx}
              className="cursor-pointer px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => handleSwitch(user)}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>
    );
};

export default SwitchAccount
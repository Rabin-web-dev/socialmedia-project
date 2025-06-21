import React from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import { X } from "lucide-react";

const dummyAccounts = [
  { username: "rabin123", name: "Rabin Main", avatar: "/avatar1.png" },
  { username: "john_doe", name: "John Doe", avatar: "/avatar2.png" },
];

const AccountSwitcherModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleSwitch = (account) => {
    // You can modify how the token and user info are stored
    dispatch(setUser(account));
    localStorage.setItem("user", JSON.stringify(account));
    onClose(); // close the modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-80 p-6 relative">
        <button className="absolute top-3 right-3" onClick={onClose}>
          <X />
        </button>
        <h2 className="text-lg font-bold mb-4">Switch Account</h2>
        <ul className="space-y-3">
          {dummyAccounts.map((acc) => (
            <li
              key={acc.username}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => handleSwitch(acc)}
            >
              <img
                src={acc.avatar}
                alt={acc.username}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium">{acc.name}</p>
                <p className="text-sm text-gray-500">@{acc.username}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AccountSwitcherModal;

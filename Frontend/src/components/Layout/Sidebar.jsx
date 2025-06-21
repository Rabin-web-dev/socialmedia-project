import React from "react";
import DarkModeToggle from "../UI/DarkModeToggle";
import AccountSwitcherModal from "../UI/AccountSwitcherModal";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

import {
  Home,
  Compass,
  Send,
  Heart,
  PlusSquare,
  Menu,
  LogOutIcon,
  User
} from "lucide-react";

const Sidebar = () => {

  const [switcherOpen, setSwitcherOpen] = useState(false);

  const dispatch = useDispatch();

  const [moreOpen, setMoreOpen] = useState(false);

  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    console.log("Logging out...");
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage")); 
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-white text-black h-screen fixed left-0 top-0 border-r border-gray-200 p-4 flex flex-col justify-between">
      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold mb-8 px-4"> Social Media </h1>

        {/* Menu */}
        <nav className="space-y-6">
          <SidebarItem icon={<Home size={24} />} label="Home" to="/home" />
          <SidebarItem icon={<Compass size={24} />} label="Explore" to="/explore" />
          <SidebarItem icon={<Send size={24} />} label="Messages" to="/messages" />
          <SidebarItem icon={<Heart size={24} />} label="Notifications" to="/notifications" />
          <SidebarItem icon={<Heart size={24} />} label="Saved" to="/saved-posts" />
        </nav>
      </div>

      {/* Bottom */}
      <div className="space-y-2 px-2">
  <button
    onClick={() => setMoreOpen(!moreOpen)}
    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
  >
    <Menu size={24} />
    <span>More</span>
  </button>

  {moreOpen && (
    <div className="absolute left-64 bottom-20 w-56 bg-white shadow-lg rounded-lg p-3 border border-gray-200 z-50 space-y-2">
      
      <button
        onClick={() => navigate("/create-post")} // optional if you want navigation
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        <PlusSquare size={24} />
        <span>Create</span>
      </button>

      <button
        onClick={() => setSwitcherOpen(true)}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
      >
        <User size={24} />
        <span>Switch Account</span>
      </button>

      <AccountSwitcherModal 
        isOpen={switcherOpen} 
        onClose={() => setSwitcherOpen(false)} 
      />

      <DarkModeToggle />

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-100 rounded"
      >
        <LogOutIcon size={24} />
        <span>Logout</span>
      </button>
    </div>
  )}
</div>

    </aside>
  );
};

const SidebarItem = ({ icon, label, to, onClick }) => {
  const className =
    "flex items-center gap-4 hover:bg-gray-100 rounded-lg px-4 py-2 transition-all duration-200";

  if (to) {
    return (
      <Link to={to} className={className}>
        {icon}
        <span className="text-base">{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className + " w-full text-left"}>
      {icon}
      <span className="text-base">{label}</span>
    </button>
  );
};


export default Sidebar;


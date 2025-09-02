import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import axios from "axios";
import {
  Home,
  Compass,
  Send,
  Heart,
  PlusSquare,
  Menu,
  LogOutIcon,
  User,
  Bookmark,
} from "lucide-react";
import DarkModeToggle from "../UI/DarkModeToggle";

const Sidebar = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  //const moreRef = useRef(null);
 const mobileWrapperRef = useRef(null);
const desktopWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isMessagesPage = location.pathname.startsWith("/messages");

  const handleLogout = () => {
    console.log("🔴 Logging out user...");

    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];

    if (window.socket) {
      console.log("🔌 Closing socket connection...");
      window.socket.disconnect();
    }

    navigate("/login", { replace: true });
  };

// For desktop outside-click
useEffect(() => {
  function handleClickOutside(event) {
    if (desktopWrapperRef.current && !desktopWrapperRef.current.contains(event.target)) {
      setMoreOpen(false);
    }
  }

  if (window.innerWidth >= 768) { // md breakpoint and above
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    if (window.innerWidth >= 768) {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };
}, [desktopWrapperRef]);

// For mobile outside-click
useEffect(() => {
  function handleClickOutside(event) {
    if (mobileWrapperRef.current && !mobileWrapperRef.current.contains(event.target)) {
      setMoreOpen(false);
    }
  }

  if (window.innerWidth < 768) { // below md breakpoint
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    if (window.innerWidth < 768) {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };
}, [mobileWrapperRef]);


  return (
    <>
      {/* Sidebar for md+ */}
      <aside
        className={`
          hidden md:flex flex-col justify-between fixed top-0 left-0 h-screen bg-white dark:bg-gray-900  text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 z-40
        
          ${isMessagesPage ? "w-20 items-center" : "md:w-20 lg:w-64"} transition-all duration-300
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16">
          {isMessagesPage || window.innerWidth < 1024 ? (
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
          ) : (
            <h1 className="text-xl font-bold hidden lg:block">Stark</h1>
          )}
        </div>

        {/* Menu */}
        <nav
          className={`flex flex-col flex-1 mt-5 space-y-4 ${
            isMessagesPage || window.innerWidth < 1024 ? "items-center" : "px-2"
          }`}
        >
          <SidebarItem icon={<Home size={24} />} label="Home" to="/home" hideLabel={isMessagesPage || window.innerWidth < 1024} />
          <SidebarItem icon={<Compass size={24} />} label="Explore" to="/explore" hideLabel={isMessagesPage || window.innerWidth < 1024} />
          <SidebarItem icon={<Send size={24} />} label="Messages" to="/messages" hideLabel={isMessagesPage || window.innerWidth < 1024} />
          <SidebarItem icon={<Heart size={24} />} label="Notifications" to="/notifications" hideLabel={isMessagesPage || window.innerWidth < 1024} />
          <SidebarItem icon={<Bookmark size={24} />} label="Saved" to="/saved-posts" hideLabel={isMessagesPage || window.innerWidth < 1024} />
        </nav>

        {/* Bottom Actions */}
        <div
          ref={desktopWrapperRef} 
          className={`space-y-2 ${isMessagesPage || window.innerWidth < 1024 ? "" : "px-2"} relative mb-3`}
        >
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={`flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-200  hover:bg-gray-100 dark:hover:bg-gray-800   rounded relative group ${
              isMessagesPage || window.innerWidth < 1024 ? "justify-center w-12 h-12" : ""
            }`}
          >
            <Menu className="text-gray-800 dark:text-white flex-shrink-0" size={24} />
            {!(isMessagesPage || window.innerWidth < 1024) && <span className="hidden lg:inline">More</span>}
            {(isMessagesPage || window.innerWidth < 1024) && <Tooltip label="More" />}
          </button>

          {moreOpen && (
            <div 
            className="absolute left-full bottom-20 w-56 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700 z-[9999] space-y-2"
            onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/create-post");
                  console.log("Create post clicked");
                  setMoreOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <PlusSquare className="text-gray-800 dark:text-gray-200" size={24} />
                <span>Create Post</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/switch-account");
                  setMoreOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <User className="text-gray-800 dark:text-gray-200" size={24} />
                <span>Switch Account</span>
              </button>

              

              <DarkModeToggle />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                  console.log("Logout clicked");
                  setMoreOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-100 rounded"
              >
                <LogOutIcon className="text-red-600" size={24} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <MobileNav
        moreOpen={moreOpen}
        setMoreOpen={setMoreOpen}
        handleLogout={handleLogout}
        navigate={navigate}
        moreRef={mobileWrapperRef}
      />
    </>
  );
};

const SidebarItem = ({ icon, label, to, hideLabel }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center rounded-lg group transition-colors
        ${hideLabel ? "justify-center w-12 h-12" : "px-4 py-2 gap-4"}
        ${isActive 
          ? "bg-gray-100 dark:bg-gray-800 text-blue-600 font-semibold" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"}
      `}
    >
      <div className={`${isActive ? "text-blue-600" : "text-gray-800 dark:text-gray-200"}`}>{icon}</div>
      {!hideLabel && <span className="hidden lg:inline">{label}</span>}
      {hideLabel && <Tooltip label={label} />}
    </Link>
  );
};

const Tooltip = ({ label }) => (
  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 lg:hidden">
    {label}
  </div>
);

const MobileNav = ({ moreOpen, setMoreOpen, handleLogout, navigate,  mobileWrapperRef }) => {
  const location = useLocation();

  const navItems = [
    { to: "/home", icon: Home },
    { to: "/explore", icon: Compass },
    { to: "/messages", icon: Send },
    { to: "#", icon: Menu, isMore: true },
    { to: "/saved-posts", icon: Bookmark },
    { to: "/notifications", icon: Heart },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700  flex justify-around items-center h-14 md:hidden">
      {navItems.map(({ to, icon, isMore }) =>
        isMore ? (
          <button key="more" onClick={() => setMoreOpen((prev) => !prev)} className="relative flex flex-col items-center">
            {React.createElement(icon, { size: 26, className: "text-gray-700 dark:text-gray-200" })}
          </button>
        ) : (
          <Link key={to} to={to} className="relative flex flex-col items-center">
            {React.createElement(icon, {
              size: 26,
              className: location.pathname === to ? "text-blue-600" : "text-gray-700 dark:text-gray-200",
            })}
            {location.pathname === to && <div className="w-1 h-1 bg-blue-600 rounded-full mt-1"></div>}
          </Link>
        )
      )}

      {moreOpen && (
        <div
        ref={mobileWrapperRef }
          className="absolute left-1/2 -translate-x-1/2 bottom-16 w-56 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-7000 z-[9999] space-y-2"
          onClick={(e) => e.stopPropagation()} // ✅ stops closing when clicking inside
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/create-post");
              console.log("create post clicked");
              setMoreOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <PlusSquare className="text-gray-800 dark:text-gray-200" size={24} />
            <span>Create Post</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/switch-account");
              setMoreOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <User className="text-gray-800 dark:text-gray-200" size={24} />
            <span>Switch Account</span>
          </button>

          <DarkModeToggle />

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
              console.log("Logout clicked");
              setMoreOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-100 rounded"
          >
            <LogOutIcon className="text-red-600" size={24} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

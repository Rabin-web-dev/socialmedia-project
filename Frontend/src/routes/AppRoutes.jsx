import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import Explore from "../pages/Explore";
import UserProfile from "../pages/UserProfile";
import EditProfile from "../pages/EditProfile";
import SinglePost from "../pages/SinglePost";
import CreatePost from "../pages/CreatePost";
import SavedPost from "../pages/SavedPost";
import Notification from "../pages/Notification";
import Messages from "../pages/Messages";
import Settings from "../pages/Settings";
import BlockedUser from "../pages/BlockedUser";
import Report from "../pages/Report";
import FollowersList from "../pages/Followers";
import FollowingList from "../pages/Following";
import FollowRequest from "../pages/FollowRequest";
import Friends from "../pages/Friends";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import SwitchAccount from "../pages/SwitchAccount";
import MessagesLayout from "../pages/MessagesLayout";
import CreateProfile from "../pages/CreateProfile";
import SearchResult from "../pages/SearchResult";

const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const renderRoot = () => {
    if (!isAuthenticated) return <Login />;
    if (user?.username && user?._id) return <Navigate to={`/profile/${user.username}/${user._id}`} />;
    return <Navigate to="/create-profile" />;
  };

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        <div className={`${isAuthenticated ? "ml-64" : ""} p-5 w-full`}>
          <Routes>
            <Route path="/" element={renderRoot()} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {isAuthenticated && (
              <>
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="/home" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile/:username/:userId" element={<UserProfile />} />
                <Route path="/edit-profile/:username/:userId" element={<EditProfile />} />
                <Route path="/post/:postId" element={<SinglePost />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/saved-posts" element={<SavedPost />} />
                <Route path="/notifications" element={<Notification />} />
                <Route path="/messages" element={<MessagesLayout />}>
                  <Route path=":userId" element={<Messages />} />
                </Route>
                <Route path="/search" element={<SearchResult/>} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/blocked-users" element={<BlockedUser />} />
                <Route path="/report" element={<Report />} />
                <Route path="/profile/:username/:userId/followers" element={<FollowersList />} />
                <Route path="/profile/:username/:userId/following" element={<FollowingList />} />
                <Route path="/follow-requests" element={<FollowRequest />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/switch-account" element={<SwitchAccount />} />
              </>
            )}

            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default AppRoutes;

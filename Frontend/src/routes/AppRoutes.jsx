import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect } from "react";
import { logout } from "../redux/slices/authSlice";
import {jwtDecode} from "jwt-decode";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Explore from "../pages/Explore";
import UserProfile from "../pages/UserProfile";
import EditProfile from "../pages/EditProfile";
import SinglePost from "../pages/SinglePost";
import CreatePost from "../pages/CreatePost";
import SavedPost from "../pages/SavedPost";
import Notification from "../pages/Notification";
import Messages from "../pages/Messages";
import Settings from "../pages/Settings";
import Report from "../pages/Report";
import FollowersList from "../pages/Followers";
import FollowingList from "../pages/Following";
import SwitchAccount from "../pages/SwitchAccount";
import MessagesLayout from "../pages/MessagesLayout";
import CreateProfile from "../pages/CreateProfile";
import SearchResult from "../pages/SearchResult";
import ZegoCall from "../pages/ZegoCall";

// Layout
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token, user } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;
  const isMessagesPage = location.pathname.startsWith("/messages");

  // ✅ Check token expiry on route change
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("⚠️ Token expired, logging out...");
          dispatch(logout());
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("❌ Invalid token, logging out...",error);
        dispatch(logout());
        navigate("/login", { replace: true });
      }
    }
  }, [token, location.pathname, dispatch, navigate]);

  const renderRoot = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.username && user?._id)
      return <Navigate to={`/profile/${user.username}/${user._id}`} replace />;
    return <Navigate to="/create-profile" replace />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar hidden on messages page */}
      {isAuthenticated && !isMessagesPage && <Navbar />}

      <div className="flex flex-1">
        {/* Sidebar */}
        {isAuthenticated && <Sidebar />}

        <div
          className={`
            flex flex-col w-full flex-1 justify-center
            ${isMessagesPage ? "p-0 h-screen md:ml-20 lg:ml-20" : location.pathname === "/explore" ? "pb-14" : "pt-16 pb-14 md:pt-20"}
            ${isAuthenticated && !isMessagesPage ? "md:ml-20 lg:ml-64" : ""}
            transition-all duration-300
          `}
        >
          <div
            className={`
              ${isMessagesPage
                ? "h-full w-full"
                : ["/explore", "/notifications", "/saved-posts"].includes(location.pathname)
                ? "w-full px-2"
                : "md:max-w-xl w-full px-2 mx-auto"}
            `}
          >
            <Routes>
              <Route path="/" element={renderRoot()} />
             <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {isAuthenticated && (
                <>
                  <Route path="/create-profile" element={<CreateProfile />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/profile/:username/:userId" element={<UserProfile />} />
                  <Route path="/edit-profile/:username/:userId" element={<EditProfile />} />
                  <Route path="/posts/:id" element={<SinglePost />} />
                  <Route path="/create-post" element={<CreatePost />} />
                  <Route path="/saved-posts" element={<SavedPost />} />
                  <Route path="/notifications" element={<Notification />} />
                  <Route path="/messages" element={<MessagesLayout />}>
                    <Route path=":userId" element={<Messages />} />
                  </Route>
                  <Route path="/call/:roomID" element={<ZegoCall />} />
                  <Route path="/search" element={<SearchResult />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/profile/:username/:userId/followers" element={<FollowersList />} />
                  <Route path="/profile/:username/:userId/following" element={<FollowingList />} />
                  <Route path="/switch-account" element={<SwitchAccount />} />
                </>
              )}

              {/* Redirect unknown routes */}
              <Route
                path="*"
                element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppRoutes;

import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const { notifications: liveNotifications } = useContext(SocketContext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ Fetch notifications on page load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [token]);

  // ✅ Merge live notifications in real-time
  useEffect(() => {
    if (liveNotifications.length > 0) {
      setNotifications((prev) => {
        const merged = [...liveNotifications, ...prev];
        const unique = merged.filter(
          (v, i, arr) => arr.findIndex((n) => n._id === v._id) === i
        );
        return unique;
      });
    }
  }, [liveNotifications]);

  // ✅ Mark notification as read + optional navigation
  const markAsRead = async (n) => {
    try {
      await api.put(
        `/notifications/${n._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === n._id ? { ...item, isRead: true } : item
        )
      );

      // ✅ Navigate to post if notification is related to one
      if (n.post) navigate(`/post/${n.post}`);
      else navigate(`/profile/${n.sender?._id}`);
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  return (
    <div className="bg-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications yet</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                n.isRead ? "bg-gray-100" : "bg-blue-50 hover:bg-blue-100"
              }`}
            >
              <img
                src={n.sender?.profilePic || "/default-avatar.png"}
                alt="Sender"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col">
                <p className="text-sm">
                  <span className="font-bold">{n.sender?.username}</span> {n.message}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              {!n.isRead && (
                <div className="w-3 h-3 bg-blue-500 rounded-full ml-auto"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;

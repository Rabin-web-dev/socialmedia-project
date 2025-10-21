import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { Trash2, X } from "lucide-react"; // 🧩 icons

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const { notifications: liveNotifications } = useContext(SocketContext);
  const navigate = useNavigate();

  // 🔹 Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState(null);

  // 🔹 Fetch notifications initially
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  // 🔹 Merge new socket notifications in real-time
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

  // ✅ Mark as read
  const markAsRead = async (n) => {
    const notifId = n._id || n.id;
    if (!notifId) {
      console.warn("⚠️ Notification ID missing", n);
      return;
    }

    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          (item._id || item.id) === notifId ? { ...item, isRead: true } : item
        )
      );

      // 🔹 Redirect to post or profile
      if (n.post) navigate(`/post/${n.post._id || n.post}`);
      else navigate(`/profile/${n.sender?._id || n.sender?.id}`);
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  // 🗑️ Open delete modal
  const openDeleteModal = (id) => {
    setSelectedNotifId(id);
    setIsModalOpen(true);
  };

  // 🗑️ Delete notification
  const handleDeleteNotification = async () => {
    try {
      await api.delete(`/notifications/${selectedNotifId}`);
      setNotifications((prev) =>
        prev.filter((n) => (n._id || n.id) !== selectedNotifId)
      );
      setIsModalOpen(false);
      setSelectedNotifId(null);
      console.log("✅ Notification deleted:", selectedNotifId);
    } catch (err) {
      console.error("❌ Error deleting notification:", err);
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
              key={n._id || n.id}
              onClick={() => !n.isRead && markAsRead(n)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                n.isRead
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-blue-50 hover:bg-blue-100"
              }`}
            >
              <img
                src={n.sender?.profilePic || "/default-avatar.png"}
                alt="Sender"
                className="w-10 h-10 rounded-full"
              />

              <div className="flex flex-col flex-1">
                <p className="text-sm">
                  <span className="font-bold">{n.sender?.username}</span>{" "}
                  {n.message}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {/* 🔵 Blue dot for unread / 🗑️ delete for read */}
              {!n.isRead ? (
                <div className="w-3 h-3 bg-blue-500 rounded-full ml-auto"></div>
              ) : (
                <button
                  className="ml-auto text-red-500 hover:text-red-700 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent markAsRead navigation
                    openDeleteModal(n._id || n.id);
                  }}
                  title="Delete notification"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🧩 Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Delete Notification
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNotification}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;

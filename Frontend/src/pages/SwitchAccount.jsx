import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { setCredentials } from "../redux/slices/authSlice";

const AccountSwitcher = () => {
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const savedAccounts = JSON.parse(localStorage.getItem("users")) || [];
    setAccounts(savedAccounts);
  }, []);

  const handleSwitch = (account) => {
    if (currentUser?._id === account._id) {
      toast.success("You’re already logged into this account");
      return;
    }

    localStorage.setItem("user", JSON.stringify(account));
    localStorage.setItem("token", account.token);
    dispatch(setCredentials({ user: account, token: account.token }));

    if (account.profileCreated) {
      navigate(`/profile/${account.username}/${account._id}`);
    } else {
      navigate("/home");
    }

    toast.success(`Switched to @${account.username}`);
  };

  const handleRemove = (id) => {
    const updatedAccounts = accounts.filter((acc) => acc._id !== id);
    setAccounts(updatedAccounts);
    localStorage.setItem("users", JSON.stringify(updatedAccounts));

    if (currentUser?._id === id) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      dispatch(setCredentials({ user: null, token: null }));
      navigate("/login");
      toast.success("Removed current account. Please log in again.");
    } else {
      toast.success("Account removed successfully");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 overflow-hidden">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Switch Account</h2>

        {accounts.length === 0 ? (
          <p className="text-center text-gray-500">No accounts available</p>
        ) : (
          <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {accounts.map((acc) => (
              <li
                key={acc._id}
                className="flex items-center justify-between border p-2 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <div
                  className="flex items-center space-x-3"
                  onClick={() => handleSwitch(acc)}
                >
                  <img
                    src={acc.profilePic || "https://via.placeholder.com/40"}
                    alt={acc.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{acc.username}</p>
                    <p className="text-sm text-gray-500">{acc.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(acc._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            dispatch(setCredentials({ user: null, token: null }));
            navigate("/signup", { state: { fromSwitch: true } });
          }}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Add Another Account
        </button>
      </div>
    </div>
  );
};

export default AccountSwitcher;

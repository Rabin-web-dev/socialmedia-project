// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { token, user } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  useEffect(() => {
    if (isAuthenticated && user?.username && user?._id) {
      // ✅ Redirect if already logged in
      navigate(`/profile/${user.username}/${user._id}`);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Save credentials
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      dispatch(setCredentials({ user: data.user, token: data.token }));

      // ✅ Add to users list for switch account
      const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
      const alreadyExists = existingUsers.some((u) => u._id === data.user._id);
      if (!alreadyExists) {
        existingUsers.push({ ...data.user, token: data.token });
        localStorage.setItem("users", JSON.stringify(existingUsers));
      }
      window.dispatchEvent(new Event("storage"));

      // ✅ Redirect:
      if (location.state?.fromSwitch) {
        // came from "Add Another Account"
        navigate("/switch-account");
      } else {
        // normal login
        if (data.user.profileCreated) {
          navigate(`/profile/${data.user.username}/${data.user._id}`);
        } else {
          navigate("/create-profile");
        }
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-4">Login</h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <p
            className="text-right text-blue-500 text-sm cursor-pointer hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup", { state: location.state })}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

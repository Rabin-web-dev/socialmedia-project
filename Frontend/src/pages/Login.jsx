import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice"; // adjust the path if needed

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Submitting Login Form:", { identifier, password });

    if (!identifier || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }), // 🟡 send identifier
      });

      const data = await response.json();
      console.log("Login Response:", data);

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }
      console.log("Login successful", data);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("username", data.user.username);

      dispatch(setCredentials({ user: data.user, token: data.token }));
      window.dispatchEvent(new Event("storage"));

      // ✅ Conditional redirect based on profile creation
      if (data.user.profileCreated) {
        navigate(`/profile/${data.user.username}/${data.user._id}`);
      } else {
        navigate("/create-profile");
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

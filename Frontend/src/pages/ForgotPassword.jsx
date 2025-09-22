import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("https://stark-socialmedia.onrender.com/api/auth/forget-password", { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-green-600 mt-4">{message}</p>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-500 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

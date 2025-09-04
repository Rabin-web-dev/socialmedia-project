// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     gender: "other",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "username" ? value.toLowerCase() : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match!");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: formData.name,
//           username: formData.username,
//           email: formData.email,
//           password: formData.password,
//           gender: formData.gender,
//         }),
//       });

//       const data = await response.json();
//       setLoading(false);

//       if (!response.ok) {
//         throw new Error(data.message || "Signup failed");
//       }

//       // ✅ Save user session
//       const user = { ...data.user, token: data.token };
//       localStorage.setItem("user", JSON.stringify(user));
//       localStorage.setItem("token", data.token);

//       // ✅ Add to account switch list
//       let users = JSON.parse(localStorage.getItem("users")) || [];
//       const exists = users.some((u) => u._id === user._id);
//       if (!exists) {
//         users.push(user);
//         localStorage.setItem("users", JSON.stringify(users));
//       }

//       // ✅ Redirect properly
//       if (location.state?.fromSwitch) {
//         navigate("/account-switch"); // back to switcher
//       } else if (data?.user?.profileCreated) {
//         navigate(`/profile/${data.user.username}/${data.user._id}`);
//       } else {
//         navigate("/create-profile");
//       }
//     } catch (err) {
//       setLoading(false);
//       setError(err.message || "Something went wrong");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow-md bg-white">
//       <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Sign Up</h2>
//       {error && <p className="text-red-500 text-center mb-3">{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-3"
//           required
//         />
//         <input
//           type="text"
//           name="username"
//           placeholder="Username (lowercase only)"
//           value={formData.username}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-3"
//           required
//         />
//         <select
//           name="gender"
//           value={formData.gender}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-3"
//           required
//         >
//           <option value="">Select Gender</option>
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//           <option value="other">Other</option>
//         </select>
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-3"
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-3"
//           required
//         />
//         <input
//           type="password"
//           name="confirmPassword"
//           placeholder="Confirm Password"
//           value={formData.confirmPassword}
//           onChange={handleChange}
//           className="w-full p-2 border border-gray-300 rounded mb-3"
//           required
//         />
//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
//           disabled={loading}
//         >
//           {loading ? "Signing up..." : "Sign Up"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Signup;


import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signup } from "../services/authService";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "other",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const { data } = await signup({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
      });

      setLoading(false);

      // ✅ Save user session
      const user = { ...data.user, token: data.token };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", data.token);

      // ✅ Add to account switch list
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const exists = users.some((u) => u._id === user._id);
      if (!exists) {
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
      }

      // ✅ Redirect properly
      if (location.state?.fromSwitch) {
        navigate("/switch-account");
      } else if (data?.user?.profileCreated) {
        navigate(`/profile/${data.user.username}/${data.user._id}`);
      } else {
        navigate("/create-profile");
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Sign Up</h2>
      {error && <p className="text-red-500 text-center mb-3">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username (lowercase only)"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Signup;


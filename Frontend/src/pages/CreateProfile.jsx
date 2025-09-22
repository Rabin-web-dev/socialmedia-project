import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    profilePic: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      data.append("profilePic", formData.profilePic);

      const response = await axios.post("https://stark-socialmedia.onrender.com/profile/create-profile", data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { userId, username } = response.data;
      
      localStorage.setItem("user", JSON.stringify(response.data.user));

      
      // Redirect to user profile or home
      navigate(`/profile/${username}/${userId}`);
    } catch (err) {
      console.error("Profile creation failed", err);
      // show toast or error
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="text"
          name="username"
          placeholder="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <textarea
          name="bio"
          placeholder="Your bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full border rounded p-2"
          rows="3"
        />

        <input
          type="file"
          name="profilePic"
          accept="image/*"
          onChange={handleChange}
          className="w-full"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;

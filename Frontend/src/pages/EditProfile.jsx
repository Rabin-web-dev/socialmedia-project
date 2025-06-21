import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../components/UI/input";
import Button from "../components/UI/button";
import toast from "react-hot-toast";


const EditProfile = () => {
  const { username, userId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    gender: "other",
    bio: "",
    profilePic: "",
    profilePicFile: null,
    socialLinks: {
      twitter: "",
      instagram: "",
      linkedin: "",
    },
  });

  const [loading, setLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${username}/${userId}`);
        const data = res.data;

        setForm({
          name: data.user.name || "",
          username: data.user.username || "",
          gender: data.user.gender || "other",
          bio: data.bio || "",
          profilePic: data.user.profilePic || "",
          profilePicFile: null,
          socialLinks: data.socialLinks || {
            twitter: "",
            instagram: "",
            linkedin: "",
          },
        });
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, [username, userId]);

  // Handle change for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["twitter", "instagram", "linkedin"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle image file input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        profilePicFile: file,
      }));
    }
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "upload_Profile_Pic");

    const res = await axios.post("https://api.cloudinary.com/v1_1/dvt0tkt5x/image/upload", data);
    return res.data.secure_url;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      let finalProfilePic = form.profilePic;

      if (form.profilePicFile) {
        finalProfilePic = await uploadToCloudinary(form.profilePicFile);
      }

      const updatedData = {
        name: form.name,
        username: form.username,
        gender: form.gender,
        bio: form.bio,
        profilePic: finalProfilePic,
        socialLinks: JSON.stringify(form.socialLinks),
      };

      await axios.put(
        `http://localhost:5000/api/profile/edit-profile/${username}/${userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Redirect to updated profile page
      //navigate(`/profile/${username}/${userId}`);
      toast.success("Profile updated successfully!");
      navigate(`/profile/${form.username.toLowerCase()}/${userId}`);

    } catch (err) {
      console.error("❌ Update failed:", err);
      toast.error("Failed to update profile. Please try again!");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded space-y-6">
      <h2 className="text-2xl font-semibold">Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div>
          <label className="block font-medium">Username</label>
          <Input name="username" value={form.username} onChange={handleChange} required />
        </div>

        <div>
          <label className="block font-medium">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Bio</label>
          <Input name="bio" value={form.bio} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">Profile Pic URL</label>
          <Input name="profilePic" value={form.profilePic} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">Or Upload a New Image</label>
          <input type="file" onChange={handleImageChange} accept="image/*" className="w-full" />
        </div>

        <div>
          <label className="block font-medium">Twitter</label>
          <Input name="twitter" value={form.socialLinks.twitter} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">Instagram</label>
          <Input name="instagram" value={form.socialLinks.instagram} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">LinkedIn</label>
          <Input name="linkedin" value={form.socialLinks.linkedin} onChange={handleChange} />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};

export default EditProfile;

import React, { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useDropzone } from "react-dropzone";

const CreatePost = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tags, setTags] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(URL.createObjectURL(file));
      setImageFile(file); // For preview only
    },
  });

  const addEmoji = (emoji) => {
    setContent((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  setImage(URL.createObjectURL(file));
  setImageFile(file); 
};


  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    let imageUrl = "";

    // Upload to Cloudinary first
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "socialmedia_post_upload"); 
      formData.append("cloud_name", "dvt0tkt5x"); 

      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dvt0tkt5x/image/upload", {
        method: "POST",
        body: formData,
      });

      const cloudData = await cloudRes.json();
      imageUrl = cloudData.secure_url;
    }

    const postData = {
      content,
      image: imageUrl,
      tags: tags.split(",").map((tag) => tag.trim()),
    };

    const res = await fetch("http://localhost:5000/api/posts/create-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Post created successfully!");
      setContent("");
      setTags("");
      setImage(null);
      setImageFile(null);

      const currentUser = JSON.parse(localStorage.getItem("user"));
      window.location.href = `/profile/${currentUser.username}/${currentUser._id}`;
    } else {
      console.error("❌ Error creating post:", data.message);
    }
  } catch (error) {
    console.error("❌ Server error:", error);
  }
};


  return (
    <div className="bg-white p-4 rounded shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Post</h2>

      {/* Drag & Drop or File Upload */}
      <div {...getRootProps()} className="border-2 border-dashed p-4 text-center cursor-pointer">
        <input {...getInputProps()} />
        <p>Drag & drop an image here or click to select a file</p>
      </div>

      <div className="my-2">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {image && (
  <div className="relative mt-2">
    <img src={image} alt="preview" className="rounded w-full max-h-60 object-cover" />
    <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded px-2">X</button>
  </div>
)}

      {/* Textarea + Emoji Picker */}
      <textarea
        rows={4}
        className="w-full mt-4 p-2 border rounded"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-blue-600 mt-2">
        😊 Add Emoji
      </button>

      {showEmojiPicker && (
        <div className="absolute z-10">
          <Picker data={data} onEmojiSelect={addEmoji} />
        </div>
      )}

      {/* Tags */}
      <input
        type="text"
        className="w-full mt-4 p-2 border rounded"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      {/* Post Button */}
      <button   onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
        Post
      </button>
    </div>
  );
};

export default CreatePost;

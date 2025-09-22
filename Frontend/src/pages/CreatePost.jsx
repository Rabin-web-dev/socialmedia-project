import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.native);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Prevent dropdown/modal closing
    const file = e.dataTransfer.files[0];
    if (file) setImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Prevent unwanted bubbling
  };

  const handleSubmit = async (e) => {
    e.stopPropagation(); // ✅ Prevent accidental dropdown close
    if (!content && !imageFile) return;

    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "Postupload"); // ✅ Only preset needed

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dvt0tkt5x/image/upload",
          { method: "POST", body: formData }
        );

        const data = await res.json();
        imageUrl = data.secure_url;
      }

      const postRes = await fetch(
        "https://stark-socialmedia.onrender.com/api/posts/create-post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            content,
            image: imageUrl,
          }),
        }
      );

      if (!postRes.ok) {
        throw new Error("Failed to create post");
      }

      setContent("");
      setImageFile(null);

      // ✅ SPA navigation instead of reload
      navigate(`/profile/${currentUser.username}/${currentUser._id}`);
    } catch (err) {
      console.error("❌ Error creating post:", err.message);
      alert("Error creating post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg"
      onClick={(e) => e.stopPropagation()} // ✅ prevent modal close on inner click
    >
      <h2 className="text-xl font-bold mb-4">Create Post</h2>

      {/* Content Input */}
      <textarea
        className="w-full p-3 border rounded-xl resize-none"
        rows="3"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Emoji Picker Button */}
      <div className="flex items-center mt-2 relative">
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ prevent close
            setShowEmojiPicker((prev) => !prev);
          }}
          className="text-yellow-500 text-xl mr-2"
        >
          😀
        </button>
        {showEmojiPicker && (
          <div
            className="absolute top-10 z-50 bg-white border rounded-lg shadow-lg max-h-[200px] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // ✅ allow emoji selection
          >
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </div>

      {/* Drag & Drop Upload */}
      <div
        className="mt-4 p-4 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-gray-50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={(e) => {
          e.stopPropagation(); // ✅ Prevent modal closing
          fileInputRef.current.click();
        }}
      >
        {imageFile ? (
          <div className="flex flex-col items-center">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="w-40 h-40 object-cover rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation(); // ✅ prevent dropdown close
                setImageFile(null);
              }}
              className="mt-2 text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-gray-500">
            Drag & drop an image, or click to upload
          </p>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={(!content && !imageFile) || loading}
        className={`w-full mt-5 py-3 rounded-xl text-white font-semibold transition 
          ${
            (!content && !imageFile) || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default CreatePost;

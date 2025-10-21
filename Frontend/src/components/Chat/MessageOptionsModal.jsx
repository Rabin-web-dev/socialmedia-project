// src/components/Chat/MessageOptionsModal.jsx
import React, { useRef, useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function MessageOptionsModal({
  isOpen,
  onClose,
  onDelete,
  onCopy,
  onEdit,
  onReact, // callback when emoji is selected
}) {
  const modalRef = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
        setShowEmojiPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReactClick = () => {
    setShowEmojiPicker((prev) => !prev); // toggle emoji picker
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    if (onReact) onReact(emoji); // send emoji to parent
    setShowEmojiPicker(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-transparent rounded-lg p-4 w-64 shadow-lg"
      >
        <h3 className="font-bold text-lg mb-3 text-black">Message Options</h3>

        <button className="w-full text-left p-2 hover:bg-gray-200" onClick={onDelete}>
          🗑 Delete
        </button>
        <button className="w-full text-left p-2 hover:bg-gray-200" onClick={onCopy}>
          📋 Copy
        </button>
        <button className="w-full text-left p-2 hover:bg-gray-200" onClick={onEdit}>
          ✏️ Edit
        </button>
        <button className="w-full text-left p-2 hover:bg-gray-200" onClick={handleReactClick}>
          😊 React
        </button>

        {showEmojiPicker && (
          <div className="mt-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
}

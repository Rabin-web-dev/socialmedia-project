import React from "react";

const ImagePreviewModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <button
        className="absolute top-5 right-5 text-white text-3xl"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={imageUrl}
        alt="Profile Preview"
        className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
      />
    </div>
  );
};

export default ImagePreviewModal;

import React from 'react';

const ImageModal = ({ isVisible, imageUrl, onClose }) => {
  if (!isVisible || !imageUrl) {
    return null;
  }

  // 点击背景关闭图片
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-modal-overlay" onClick={handleOverlayClick}>
      <div className="image-modal-content">
        <img src={imageUrl} alt="放大图片" />
        <button className="image-modal-close" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
};

export default ImageModal;

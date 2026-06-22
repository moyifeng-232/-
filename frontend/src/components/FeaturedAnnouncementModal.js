import React, { useState } from 'react';
import ImageModal from './ImageModal';

const FeaturedAnnouncementModal = ({ isVisible, announcement, onClose }) => {
  // 图片放大模态框状态
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  if (!isVisible || !announcement) {
    return null;
  }

  // 解析图片URLs
  const images = announcement.imageUrls || [];

  // 处理图片点击，显示放大图片
  const handleImageClick = (imageUrl) => {
    setCurrentImage(imageUrl);
    setShowImageModal(true);
  };

  // 关闭图片放大模态框
  const closeImageModal = () => {
    setShowImageModal(false);
    setCurrentImage('');
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content featured-announcement-modal">
          <div className="modal-header">
            <h2>重点公告</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <h3 className="announcement-title">{announcement.title}</h3>
            <div className="announcement-meta">
              <p className="announcement-publisher">发布者: {announcement.publisherUsername}</p>
              <p className="announcement-time">发布时间: {new Date(announcement.createTime).toLocaleString()}</p>
            </div>
            <div className="announcement-content">
              <p>{announcement.content}</p>
              
              {images.length > 0 && (
                <div className="announcement-images">
                  {images.map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`公告图片 ${index + 1}`} 
                      className="announcement-image-item"
                      onClick={() => handleImageClick(image)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-primary" onClick={onClose}>我知道了</button>
          </div>
        </div>
      </div>
      
      {/* 图片放大模态框 */}
      <ImageModal
        isVisible={showImageModal}
        imageUrl={currentImage}
        onClose={closeImageModal}
      />
    </>
  );
};

export default FeaturedAnnouncementModal;

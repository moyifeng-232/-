import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../api/announcementApi';
import ImageModal from '../components/ImageModal';

const AnnouncementList = () => {
  // 公告数据
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 图片放大模态框状态
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  
  // 获取公告列表
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 调用后端API获取所有已发布的公告
      const response = await getAnnouncements();
      if (response && response.code === 200) {
        setAnnouncements(response.data || []);
      } else {
        throw new Error(response.message || '获取公告列表失败');
      }
    } catch (err) {
      console.error('获取公告列表失败:', err);
      setError('获取公告列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载数据
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
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
  
  // 渲染公告项
  const renderAnnouncementItem = (announcement) => {
    // 解析图片URLs
    const images = announcement.imageUrls || [];
    
    return (
      <div key={announcement.id} className="announcement-item-wrapper">
        <div className="announcement-item-main">
          <div className="announcement-info">
            <div className="announcement-header">
              <h3>{announcement.title}</h3>
              {announcement.isFeatured === 1 && (
                <span className="featured-badge">重点公告</span>
              )}
            </div>
            
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
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="announcement-list-page">
        <h2>公告栏</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">加载中...</div>
        ) : announcements.length === 0 ? (
          <div className="no-data">暂无公告数据</div>
        ) : (
          <div className="announcement-list">
            {announcements.map(announcement => renderAnnouncementItem(announcement))}
          </div>
        )}
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

export default AnnouncementList;

import React, { useState, useEffect } from 'react';
import { getAllAnnouncementsForAdmin, publishAnnouncement, revokeAnnouncement, setFeaturedAnnouncement } from '../api/announcementApi';
import { uploadImages } from '../api/productApi';
import ConfirmModal from '../components/ConfirmModal';
import ImageModal from '../components/ImageModal';

const AdminAnnouncementManagement = () => {
  // 使用useState存储用户信息，避免每次渲染都创建新对象
  const [user, setUser] = useState(() => {
    // 初始加载时从localStorage获取用户信息
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  // 公告数据
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 新建公告表单状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    imageUrls: []
  });
  
  // 图片预览
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // 弹窗相关状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  // 图片放大模态框状态
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  
  // 监听localStorage中用户信息的变化
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    
    // 监听storage事件
    window.addEventListener('storage', handleStorageChange);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 获取公告列表
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 调用后端API获取所有公告（包括已撤销）
      const response = await getAllAnnouncementsForAdmin();
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
    // 如果不是管理员，不执行获取数据的逻辑
    if (!user || user.userType !== 2) {
      setLoading(false);
      return;
    }
    fetchAnnouncements();
  }, [user]);
  
  // 检查用户是否为管理员
  if (!user || user.userType !== 2) {
    return <div className="not-found">您没有权限访问此页面</div>;
  }
  
  // 处理新建公告表单提交
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // 调用后端API发布公告
      const response = await publishAnnouncement({
        ...newAnnouncement,
        publisherId: user.id,
        isFeatured: 0 // 默认不是重点公告，管理员只能在发布后设置
      });
      
      if (response && response.code === 200) {
        // 重置表单
        setNewAnnouncement({
          title: '',
          content: '',
          imageUrls: []
        });
        setImagePreviews([]);
        setShowAddForm(false);
        // 重新获取公告列表
        fetchAnnouncements();
      } else {
        throw new Error(response.message || '发布公告失败');
      }
    } catch (err) {
      console.error('发布公告失败:', err);
      setError('发布公告失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理撤销公告
  const handleRevokeAnnouncement = (announcementId) => {
    setSelectedAnnouncementId(announcementId);
    setConfirmAction('revoke');
    setShowConfirmModal(true);
  };
  
  // 处理设置重点公告
  const handleSetFeaturedAnnouncement = (announcementId) => {
    setSelectedAnnouncementId(announcementId);
    setConfirmAction('featured');
    setShowConfirmModal(true);
  };
  
  // 确认弹窗处理
  const handleConfirm = async () => {
    if (!selectedAnnouncementId) return;
    
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (confirmAction === 'revoke') {
        // 调用后端API撤销公告
        response = await revokeAnnouncement(selectedAnnouncementId);
      } else if (confirmAction === 'featured') {
        // 调用后端API设置重点公告
        response = await setFeaturedAnnouncement(selectedAnnouncementId);
      }
      
      if (response && response.code === 200) {
        // 重新获取公告列表
        fetchAnnouncements();
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (err) {
      console.error(`${confirmAction === 'revoke' ? '撤销公告' : '设置重点公告'}失败:`, err);
      setError(`${confirmAction === 'revoke' ? '撤销公告' : '设置重点公告'}失败，请稍后重试`);
    } finally {
      setLoading(false);
      hideConfirmModal();
    }
  };
  
  // 隐藏确认弹窗
  const hideConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedAnnouncementId(null);
    setConfirmAction('');
  };
  
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
  
  // 切换新建公告表单显示
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };
  
  // 处理图片上传
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // 限制最多上传5张图片（包括已上传的）
    if (newAnnouncement.imageUrls.length + files.length > 5) {
      setError('最多只能上传5张图片');
      return;
    }
    
    setLoading(true);
    try {
      // 调用图片上传API
      const response = await uploadImages(files);
      if (response.code === 200) {
        const uploadedUrls = response.data;
        
        // 生成预览图片URL（本地blob URL用于预览）
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
        
        // 保存服务器返回的真实图片URL
        setNewAnnouncement(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls]
        }));
      } else {
        setError(response.message || '图片上传失败');
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      setError('图片上传失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 移除图片
  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewAnnouncement(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
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
              <h4>{announcement.title}</h4>
              {announcement.isFeatured === 1 && (
                <span className="featured-badge">重点公告</span>
              )}
              <span className={`status-badge ${announcement.status === 1 ? 'active' : 'inactive'}`}>
                {announcement.status === 1 ? '已发布' : '已撤销'}
              </span>
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
          
          {/* 操作按钮 */}
          <div className="announcement-actions">
            {announcement.status === 1 && (
              <button 
                className="btn-warning"
                onClick={() => handleRevokeAnnouncement(announcement.id)}
              >
                撤销公告
              </button>
            )}
            {announcement.status === 1 && announcement.isFeatured === 0 && (
              <button 
                className="btn-primary"
                onClick={() => handleSetFeaturedAnnouncement(announcement.id)}
              >
                设置为重点公告
              </button>
            )}
            {announcement.isFeatured === 1 && (
              <button 
                className="btn-primary disabled"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                已设为重点公告
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="admin-announcement-management">
      <div className="page-header">
        <h2>公告管理</h2>
        <button className="btn-primary" onClick={toggleAddForm}>
          {showAddForm ? '取消' : '发布新公告'}
        </button>
      </div>
      
      {/* 新建公告表单 */}
      {showAddForm && (
        <div className="add-announcement-form">
          <h3>发布新公告</h3>
          <form onSubmit={handleAddAnnouncement}>
            <div className="form-group">
              <label htmlFor="title">公告标题</label>
              <input
                type="text"
                id="title"
                className="form-input"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="content">公告内容</label>
              <textarea
                id="content"
                className="form-textarea"
                rows="5"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="images">上传图片（最多5张）</label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              
              {/* 图片预览 */}
              {imagePreviews.length > 0 && (
                <div className="image-preview-container">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`预览 ${index + 1}`} />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '发布中...' : '发布公告'}
              </button>
              <button type="button" className="btn-secondary" onClick={toggleAddForm} disabled={loading}>
                取消
              </button>
            </div>
          </form>
        </div>
      )}
      
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
      
      {/* 确认弹窗 */}
      <ConfirmModal
        isVisible={showConfirmModal}
        title={confirmAction === 'revoke' ? '撤销公告确认' : '设置重点公告确认'}
        message={confirmAction === 'revoke' ? '确定要撤销该公告吗？' : '确定要将该公告设为重点公告吗？'}
        onConfirm={handleConfirm}
        onCancel={hideConfirmModal}
        confirmText="确定"
        cancelText="取消"
      />
      
      {/* 图片放大模态框 */}
      <ImageModal
        isVisible={showImageModal}
        imageUrl={currentImage}
        onClose={closeImageModal}
      />
    </div>
  );
};

export default AdminAnnouncementManagement;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImages } from '../api/productApi';
import { updateUserInfo } from '../api/userApi';
import ConfirmModal from '../components/ConfirmModal';

const UserProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // 表单状态
  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: '',
    oldPassword: '',
    phone: user?.phone || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || 'https://images.pexels.com/photos/34692672/pexels-photo-34692672.jpeg'
  });
  
  // 图片预览
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || 'https://images.pexels.com/photos/34692672/pexels-photo-34692672.jpeg');
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); // success 或 error
  
  // 检查用户是否已登录
  useEffect(() => {
    if (!user) {
      // 未登录，跳转到登录页面
      navigate('/login');
    }
  }, [user, navigate]);
  
  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理头像上传
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      // 调用图片上传API
      const response = await uploadImages([file]);
      if (response.code === 200 && response.data && response.data.length > 0) {
        const uploadedUrl = response.data[0];
        setFormData(prev => ({
          ...prev,
          profilePicture: uploadedUrl
        }));
        setImagePreview(uploadedUrl);
      } else {
        setModalTitle('上传失败');
        setModalMessage('头像上传失败');
        setModalType('error');
        setModalVisible(true);
      }
    } catch (err) {
      console.error('头像上传失败:', err);
      setModalTitle('上传失败');
      setModalMessage('头像上传失败，请稍后重试');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  // 处理弹窗关闭
  const handleModalClose = () => {
    setModalVisible(false);
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.username.trim()) {
      setModalTitle('输入错误');
      setModalMessage('请输入用户名');
      setModalType('error');
      setModalVisible(true);
      return;
    }
    
    if (!formData.phone.trim()) {
      setModalTitle('输入错误');
      setModalMessage('请输入手机号');
      setModalType('error');
      setModalVisible(true);
      return;
    }
    
    // 如果修改密码，需要验证旧密码
    if (formData.password && !formData.oldPassword) {
      setModalTitle('输入错误');
      setModalMessage('修改密码时请输入旧密码');
      setModalType('error');
      setModalVisible(true);
      return;
    }
    
    setLoading(true);
    try {
      // 构建请求数据
      const requestData = {
        id: user.id,
        username: formData.username,
        phone: formData.phone,
        email: formData.email,
        profilePicture: formData.profilePicture,
        // 仅在需要修改密码时传递密码相关字段
        ...(formData.oldPassword && {
          oldPassword: formData.oldPassword,
          password: formData.password
        })
      };
      
      // 调用更新用户信息的API
      const response = await updateUserInfo(requestData);
      
      if (response.code === 200) {
        // 更新localStorage中的用户信息
        const updatedUser = {
          ...user,
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          profilePicture: formData.profilePicture
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setModalTitle('更新成功');
        setModalMessage('个人信息更新成功');
        setModalType('success');
        setModalVisible(true);
      } else {
        setModalTitle('更新失败');
        setModalMessage(response.message || '更新个人信息失败');
        setModalType('error');
        setModalVisible(true);
      }
    } catch (err) {
      console.error('更新个人信息失败:', err);
      setModalTitle('更新失败');
      setModalMessage('更新个人信息失败，请稍后重试');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  // 如果用户未登录，不渲染组件
  if (!user) {
    return null;
  }
  
  return (
    <div className="user-profile-container">
      <h2>个人信息</h2>
      
      <div className="profile-header">
        <div className="profile-picture-container">
          <img 
            src={imagePreview} 
            alt="用户头像" 
            className="profile-picture"
          />
          <div className="profile-picture-upload">
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="profilePicture" className="upload-btn">
              {loading ? '上传中...' : '更换头像'}
            </label>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>基本信息</h3>
          
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">手机号</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="请输入手机号"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>密码设置</h3>
          
          <div className="form-group">
            <label htmlFor="oldPassword">旧密码</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="请输入旧密码"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">新密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入新密码（留空则不修改）"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? '保存中...' : '保存修改'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/')}
          >
            返回首页
          </button>
        </div>
      </form>
      
      {/* 结果提示弹窗 */}
      <ConfirmModal
        isVisible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onConfirm={handleModalClose}
        onCancel={handleModalClose}
        confirmText="确定"
        cancelText=""
      />
    </div>
  );
};

export default UserProfile;

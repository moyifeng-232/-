import React, { useState } from 'react';
import { register } from '../api/userApi';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    realName: '',
    studentId: '',
    phone: '',
    email: '',
    userType: 0 // 默认普通用户
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 将userType转换为数字类型
    const processedValue = name === 'userType' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await register(formData);
      if (response.code === 200) {
        // 注册成功，跳转到登录页面
        navigate('/login');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('注册失败，请检查网络连接');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>注册</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="realName">真实姓名</label>
            <input
              type="text"
              id="realName"
              name="realName"
              value={formData.realName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentId">学号</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="userType">用户类型</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value={0}>普通用户</option>
              <option value={1}>商家用户</option>
            </select>
          </div>
          <button type="submit" className="register-button">注册</button>
        </form>
        <div className="login-link">
          已有账号？ <Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
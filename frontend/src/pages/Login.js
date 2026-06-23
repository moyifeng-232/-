import React, { useState } from 'react';
import { login } from '../api/userApi';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await login({ username, password });
      if (response.code === 200) {
        // 保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(response.data));
        // 根据用户类型跳转到不同页面
        const user = response.data;
        if (user.userType === 2) {
          // 管理员跳转到管理员界面
          navigate('/admin', { replace: true });
        } else {
          // 普通用户和商家用户跳转到首页
          navigate('/', { replace: true });
        }
        // 刷新页面，确保Navigation组件能获取到最新的用户信息
        window.location.reload();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('登录失败，请检查网络连接');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h2>登录</h2>
          <div className="login-underline"></div>
          <p className="login-subtitle">欢迎回来，请登录您的账户</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="login-button">登录</button>
        </form>
        <div className="register-link">
          还没有账号？ <Link to="/register" className="register-link-text">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
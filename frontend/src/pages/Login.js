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
        // 跳转到首页，使用replace避免返回登录页
        navigate('/', { replace: true });
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
        <h2>登录</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">登录</button>
        </form>
        <div className="register-link">
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
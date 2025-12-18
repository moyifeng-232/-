import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// 导入页面组件
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import PurchaseHistory from './pages/PurchaseHistory';

// 导航组件，包含登录状态管理
const Navigation = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 检查用户是否已登录
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 退出登录
  const handleLogout = () => {
    // 清除本地存储的用户信息
    localStorage.removeItem('user');
    // 重置用户状态
    setUser(null);
    // 跳转到登录页面
    navigate('/login');
  };

  return (
    <header className="App-header">
      <div className="header-content">
        <Link to="/" className="logo">
          校园二手交易平台
        </Link>
        <nav className="nav-menu">
          <Link to="/">首页</Link>
          {user ? (
            // 已登录状态
            <>
              <Link to="/purchases">已购买</Link>
              <div className="user-info">
                <span className="welcome-message">欢迎您，{user.username}</span>
                <button className="logout-button" onClick={handleLogout}>退出登录</button>
              </div>
            </>
          ) : (
            // 未登录状态
            <>
              <Link to="/login">登录</Link>
              <Link to="/register">注册</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const App = () => {
  return (
    <Router>
      <div className="App">
        {/* 顶部导航栏（带登录状态管理） */}
        <Navigation />
        
        {/* 主内容区域 */}
        <main className="App-main">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/purchases" element={<PurchaseHistory />} />
          </Routes>
        </main>
        
        {/* 页脚 */}
        <footer className="App-footer">
          <p>© 2025 校园二手交易平台. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

// 导入页面组件
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import PurchaseHistory from './pages/PurchaseHistory';
import PublishedProducts from './pages/PublishedProducts';
import PublishProduct from './pages/PublishProduct';
// 导入管理员页面
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminReviewManagement from './pages/AdminReviewManagement';
// 导入用户API
import { applyForMerchant } from './api/userApi';

// 根据用户类型重定向首页
const HomeRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // 管理员用户重定向到管理员界面
  if (user && user.userType === 2) {
    return <Navigate to="/admin" replace />;
  }
  
  // 普通用户和游客重定向到商品列表
  return <Navigate to="/home" replace />;
};

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

  // 商家申请弹窗状态
  const [showMerchantApplicationModal, setShowMerchantApplicationModal] = useState(false);

  // 处理申请成为商家
  const handleApplyMerchant = () => {
    setShowMerchantApplicationModal(true);
  };

  // 关闭商家申请弹窗
  const handleCloseMerchantApplicationModal = () => {
    setShowMerchantApplicationModal(false);
  };

  // 提交商家申请
  const handleSubmitMerchantApplication = async () => {
    try {
      // 从localStorage获取当前用户信息
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert('用户未登录');
        return;
      }
      
      const currentUser = JSON.parse(storedUser);
      // 调用后端API提交申请
      const response = await applyForMerchant(currentUser.id);
      
      if (response && response.code === 200) {
        // 更新localStorage中的用户状态为待审核
        const updatedUser = { ...currentUser, status: 0 };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        // 关闭弹窗
        setShowMerchantApplicationModal(false);
        // 提示用户申请已提交
        alert('已递交申请，等待管理员审核');
      } else {
        alert(response.message || '申请失败，请稍后重试');
      }
    } catch (err) {
      console.error('提交商家申请失败:', err);
      alert('申请失败，请稍后重试');
    }
  };

  return (
    <header className="App-header">
      <div className="header-content">
        <Link to="/" className="logo">
          校园二手交易平台
        </Link>
        <nav className="nav-menu">
          {/* 根据用户类型显示不同的首页 */}
          {user && user.userType === 2 ? (
            <Link to="/admin">首页</Link>
          ) : (
            <Link to="/home">首页</Link>
          )}
          
          {user ? (
            // 已登录状态
            <>
              {/* 非管理员用户显示已购买页面 */}
              {user.userType !== 2 && (
                <Link to="/purchases">已购买</Link>
              )}
              
              {/* 商家用户显示已发布和发布商品页面 */}
              {user.userType === 1 && (
                <>
                  <Link to="/published">已发布</Link>
                  <Link to="/publish">发布商品</Link>
                </>
              )}
              
              {/* 管理员用户显示管理页面 */}
              {user.userType === 2 && (
                <>
                  <Link to="/admin/users">用户管理</Link>
                  <Link to="/admin/reviews">审核管理</Link>
                </>
              )}
              
              <div className="user-info">
                <span className="welcome-message">欢迎您，{user.username}</span>
                
                {/* 普通用户显示成为商家按钮 */}
                {user.userType === 0 && (
                  <button 
                    className="merchant-application-button"
                    onClick={handleApplyMerchant}
                  >
                    成为商家用户
                  </button>
                )}
                
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
      
      {/* 商家申请弹窗 */}
      {showMerchantApplicationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>申请成为商家用户</h2>
            <p>请确认您要申请成为商家用户，提交后将等待管理员审核。</p>
            <div className="modal-buttons">
              <button 
                className="modal-cancel-button"
                onClick={handleCloseMerchantApplicationModal}
              >
                取消
              </button>
              <button 
                className="modal-confirm-button"
                onClick={handleSubmitMerchantApplication}
              >
                确认申请
              </button>
            </div>
          </div>
        </div>
      )}
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
            {/* 首页路由 - 根据用户类型重定向 */}
            <Route path="/" element={<HomeRedirect />} />
            
            {/* 普通用户和游客路由 */}
            <Route path="/home" element={<ProductList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/purchases" element={<PurchaseHistory />} />
            <Route path="/published" element={<PublishedProducts />} />
            <Route path="/publish" element={<PublishProduct />} />
            
            {/* 管理员路由 */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/reviews" element={<AdminReviewManagement />} />
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
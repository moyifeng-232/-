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
import AnnouncementList from './pages/AnnouncementList';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
// 导入管理员页面
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminReviewManagement from './pages/AdminReviewManagement';
import AdminProductManagement from './pages/AdminProductManagement';
import AdminAnnouncementManagement from './pages/AdminAnnouncementManagement';
import AdminStatistics from './pages/AdminStatistics';
// 导入支付宝支付页面
import AlipayPay from './pages/AlipayPay';
// 导入用户API
import { applyForMerchant } from './api/userApi';
// 导入确认弹窗组件
import ConfirmModal from './components/ConfirmModal';
// 导入重点公告弹窗组件
import FeaturedAnnouncementModal from './components/FeaturedAnnouncementModal';
// 导入公告API
import { getFeaturedAnnouncement } from './api/announcementApi';

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
  const [featuredAnnouncement, setFeaturedAnnouncement] = useState(null);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const navigate = useNavigate();

  // 检查用户是否已登录
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 获取重点公告
  useEffect(() => {
    const fetchFeaturedAnnouncement = async () => {
      try {
        const response = await getFeaturedAnnouncement();
        if (response && response.code === 200 && response.data) {
          // 检查是否已经显示过该公告
          const lastShownId = localStorage.getItem('lastShownAnnouncementId');
          if (lastShownId !== response.data.id.toString()) {
            setFeaturedAnnouncement(response.data);
            setShowFeaturedModal(true);
            // 存储已显示的公告ID
            localStorage.setItem('lastShownAnnouncementId', response.data.id.toString());
          }
        }
      } catch (err) {
        console.error('获取重点公告失败:', err);
      }
    };

    fetchFeaturedAnnouncement();
  }, []);

  // 关闭重点公告弹窗
  const handleCloseFeaturedModal = () => {
    setShowFeaturedModal(false);
  };

  // 退出登录
  const handleLogout = () => {
    // 显示确认弹窗
    setShowLogoutConfirmModal(true);
  };
  
  // 确认退出登录
  const confirmLogout = () => {
    // 清除本地存储的用户信息
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // 重置用户状态
    setUser(null);
    // 跳转到登录页面
    navigate('/login');
    // 关闭弹窗
    setShowLogoutConfirmModal(false);
  };
  
  // 取消退出登录
  const cancelLogout = () => {
    // 关闭弹窗
    setShowLogoutConfirmModal(false);
  };

  // 商家申请弹窗状态
  const [showMerchantApplicationModal, setShowMerchantApplicationModal] = useState(false);
  
  // 退出登录确认弹窗状态
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

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
                  <>
                      <Link to="/admin">控制面板</Link>
                      <Link to="/admin/statistics">统计与分析</Link>
                  </>
              ) : (
                  <Link to="/home">首页</Link>
              )}

              {/* 所有用户都可以访问公告栏 */}
              <Link to="/announcements">公告栏</Link>

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

                  {/* 管理员用户不再显示单独的管理页面按钮，统一通过控制面板访问 */}

                  {/* 所有已登录用户显示对话按钮 */}
                  <Link to="/chat" className="chat-link">对话</Link>

                  <div className="user-info">
                    <Link to="/profile" className="user-profile-link">
                      <img 
                        src={user.profilePicture || 'https://images.pexels.com/photos/34692672/pexels-photo-34692672.jpeg'} 
                        alt="用户头像" 
                        className="user-avatar"
                      />
                      <span className="username">{user.username}</span>
                    </Link>

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
        
        {/* 退出登录确认弹窗 */}
        <ConfirmModal
          isVisible={showLogoutConfirmModal}
          title="退出登录"
          message="确定退出登录吗？"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
          confirmText="确定"
          cancelText="取消"
        />
        
        {/* 重点公告弹窗 */}
        <FeaturedAnnouncementModal
          isVisible={showFeaturedModal}
          announcement={featuredAnnouncement}
          onClose={handleCloseFeaturedModal}
        />
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
              {/* 公告栏路由 */}
              <Route path="/announcements" element={<AnnouncementList />} />
              {/* 个人信息路由 */}
              <Route path="/profile" element={<UserProfile />} />
              {/* 对话路由 */}
              <Route path="/chat" element={<Chat />} />
              {/* 支付宝支付路由 */}
              <Route path="/alipay/pay" element={<AlipayPay />} />

              {/* 管理员路由 */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/reviews" element={<AdminReviewManagement />} />
              <Route path="/admin/products" element={<AdminProductManagement />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementManagement />} />
              <Route path="/admin/statistics" element={<AdminStatistics />} />
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
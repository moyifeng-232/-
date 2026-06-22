import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // 检查用户是否为管理员 - 移到return之前，避免Hook调用顺序问题
  if (!user || user.userType !== 2) {
    return <div className="not-found">您没有权限访问此页面</div>;
  }
  
  return (
    <div className="admin-dashboard">
      <h2>管理员控制面板</h2>
      
      <div className="admin-stats-grid">
        <div className="stat-card">
          <h3>用户管理</h3>
          <p>管理平台所有用户</p>
          <Link to="/admin/users" className="btn-primary">进入用户管理</Link>
        </div>
        
        <div className="stat-card">
          <h3>审核管理</h3>
          <p>审核商家用户申请和商品发布</p>
          <Link to="/admin/reviews" className="btn-primary">进入审核管理</Link>
        </div>
        
        <div className="stat-card">
          <h3>商品管理</h3>
          <p>管理平台所有商品</p>
          <Link to="/admin/products" className="btn-primary">进入商品管理</Link>
        </div>
        
        <div className="stat-card">
          <h3>公告管理</h3>
          <p>发布和管理平台公告</p>
          <Link to="/admin/announcements" className="btn-primary">进入公告管理</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { getPendingMerchantApplications, reviewMerchantApplication } from '../api/userApi';
import { getPendingProducts, reviewProduct } from '../api/productApi';

const AdminReviewManagement = () => {
  // 使用useState存储用户信息，避免每次渲染都创建新对象
  const [user, setUser] = useState(() => {
    // 初始加载时从localStorage获取用户信息
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('merchants'); // 'merchants' 或 'products'
  
  // 商家申请数据
  const [merchantApplications, setMerchantApplications] = useState([]);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [merchantError, setMerchantError] = useState('');
  
  // 待审核商品数据
  const [pendingProducts, setPendingProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState('');
  
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
  
  // 获取待审核商家申请
  const fetchMerchantApplications = async () => {
    try {
      setMerchantLoading(true);
      const response = await getPendingMerchantApplications();
      if (response && response.code === 200) {
        setMerchantApplications(response.data);
      } else {
        throw new Error(response.message || '获取商家申请失败');
      }
      setMerchantError('');
    } catch (err) {
      console.error('获取商家申请失败:', err);
      setMerchantError('获取商家申请失败，请稍后重试');
    } finally {
      setMerchantLoading(false);
    }
  };
  
  // 获取待审核商品
  const fetchPendingProducts = async () => {
    try {
      setProductLoading(true);
      const response = await getPendingProducts();
      if (response && response.code === 200) {
        setPendingProducts(response.data);
      } else {
        throw new Error(response.message || '获取待审核商品失败');
      }
      setProductError('');
    } catch (err) {
      console.error('获取待审核商品失败:', err);
      setProductError('获取待审核商品失败，请稍后重试');
    } finally {
      setProductLoading(false);
    }
  };
  
  // 初始加载数据
  useEffect(() => {
    // 如果不是管理员，不执行获取数据的逻辑
    if (!user || user.userType !== 2) {
      setMerchantLoading(false);
      setProductLoading(false);
      return;
    }
    fetchMerchantApplications();
    fetchPendingProducts();
  }, [user]);
  
  // 检查用户是否为管理员
  if (!user || user.userType !== 2) {
    return <div className="not-found">您没有权限访问此页面</div>;
  };
  
  // 处理商家申请审核
  const handleReviewMerchant = async (applicationId, approved) => {
    try {
      const response = await reviewMerchantApplication(applicationId, approved);
      if (response && response.code === 200) {
        // 从列表中移除已审核的申请
        setMerchantApplications(prev => prev.filter(app => app.id !== applicationId));
        alert(`商家申请${approved ? '审核通过' : '审核拒绝'}`);
      } else {
        throw new Error(response.message || '审核失败');
      }
    } catch (err) {
      console.error('审核商家申请失败:', err);
      alert('审核失败，请稍后重试');
    }
  };
  
  // 处理商品审核
  const handleReviewProduct = async (productId, approved) => {
    try {
      const response = await reviewProduct(productId, approved);
      if (response && response.code === 200) {
        // 从列表中移除已审核的商品
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
        alert(`商品审核${approved ? '审核通过' : '审核拒绝'}`);
      } else {
        throw new Error(response.message || '审核失败');
      }
    } catch (err) {
      console.error('审核商品失败:', err);
      alert('审核失败，请稍后重试');
    }
  };
  
  return (
    <div className="admin-review-management">
      <h2>审核管理</h2>
      
      <div className="review-tabs">
        <button 
          className={`tab-btn ${activeTab === 'merchants' ? 'active' : ''}`}
          onClick={() => setActiveTab('merchants')}
        >
          商家用户申请
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          商品审核
        </button>
      </div>
      
      <div className="review-content">
        {activeTab === 'merchants' ? (
          // 商家申请审核
          <div className="merchant-applications">
            <h3>待审核商家用户申请</h3>
            
            {merchantError && <div className="error-message">{merchantError}</div>}
            
            {merchantLoading ? (
              <div className="loading">加载中...</div>
            ) : merchantApplications.length === 0 ? (
              <div className="no-data">暂无待审核商家申请</div>
            ) : (
              <div className="application-list">
                {merchantApplications.map(application => (
                  <div key={application.id} className="application-item">
                    <div className="application-info">
                      <h4>{application.username} - {application.realName}</h4>
                      <p>学号: {application.studentId}</p>
                      <p>手机号: {application.phone}</p>
                      <p>邮箱: {application.email}</p>
                      <p>申请时间: {application.createTime}</p>
                    </div>
                    <div className="application-actions">
                      <button 
                        className="btn-success"
                        onClick={() => handleReviewMerchant(application.id, true)}
                      >
                        通过
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleReviewMerchant(application.id, false)}
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // 商品审核
          <div className="product-review">
            <h3>待审核商品</h3>
            
            {productError && <div className="error-message">{productError}</div>}
            
            {productLoading ? (
              <div className="loading">加载中...</div>
            ) : pendingProducts.length === 0 ? (
              <div className="no-data">暂无待审核商品</div>
            ) : (
              <div className="product-list">
                {pendingProducts.map(product => (
                  <div key={product.id} className="product-item">
                    <div className="product-info">
                      <h4>{product.title}</h4>
                      <p>价格: ¥{product.price}</p>
                      <p>分类: {product.categoryId}</p>
                      <p>发布时间: {product.createTime}</p>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="btn-success"
                        onClick={() => handleReviewProduct(product.id, true)}
                      >
                        通过
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleReviewProduct(product.id, false)}
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewManagement;
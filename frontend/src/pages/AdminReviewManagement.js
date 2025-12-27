import React, { useState, useEffect } from 'react';
import { getPendingMerchantApplications, reviewMerchantApplication } from '../api/userApi';
import { getPendingProducts, reviewProduct } from '../api/productApi';
import { getAllCategories } from '../api/categoryApi';
import ConfirmModal from '../components/ConfirmModal';

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
  
  // 商品展开状态，存储商品ID到展开状态的映射
  const [expandedProducts, setExpandedProducts] = useState({});
  
  // 审核确认弹窗状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' 或 'reject'
  const [currentProductId, setCurrentProductId] = useState(null);
  
  // 分类数据，用于将分类ID转换为分类名称
  const [categories, setCategories] = useState({}); // 分类ID到分类名称的映射
  
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
  
  // 获取所有分类，用于将分类ID转换为分类名称
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response && response.code === 200) {
        // 创建分类ID到分类名称的映射
        const categoryMap = {};
        response.data.forEach(category => {
          categoryMap[category.id] = category.name;
        });
        setCategories(categoryMap);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
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
    fetchCategories();
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
  
  // 切换商品展开/折叠状态
  const toggleProductExpand = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  // 显示审核确认弹窗
  const showReviewConfirmModal = (productId, action) => {
    setCurrentProductId(productId);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };
  
  // 隐藏审核确认弹窗
  const hideReviewConfirmModal = () => {
    setShowConfirmModal(false);
    setCurrentProductId(null);
    setConfirmAction(null);
  };
  
  // 处理商品审核
  const handleReviewProduct = async () => {
    if (!currentProductId || !confirmAction) return;
    
    try {
      const isApproved = confirmAction === 'approve';
      const response = await reviewProduct(currentProductId, isApproved);
      if (response && response.code === 200) {
        // 从列表中移除已审核的商品
        setPendingProducts(prev => prev.filter(p => p.id !== currentProductId));
        // 关闭弹窗
        hideReviewConfirmModal();
      } else {
        throw new Error(response.message || '审核失败');
      }
    } catch (err) {
      console.error('审核商品失败:', err);
      alert('审核失败，请稍后重试');
      // 关闭弹窗
      hideReviewConfirmModal();
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
                {pendingProducts.map(product => {
                  // 解析图片URLs
                  const images = product.imageUrls ? JSON.parse(product.imageUrls) : [];
                  // 获取分类名称
                  const categoryName = categories[product.categoryId] || product.categoryId;
                  
                  return (
                    <div key={product.id} className="product-item-wrapper">
                      {/* 商品项主体 */}
                      <div className="product-item-main">
                        {/* 商品基本信息，可点击展开 */}
                        <div 
                          className="product-info clickable"
                          onClick={() => toggleProductExpand(product.id)}
                        >
                          <h4>
                            {product.title}
                            <span className={`expand-icon ${expandedProducts[product.id] ? 'expanded' : ''}`}>
                              {expandedProducts[product.id] ? '▼' : '▶'}
                            </span>
                          </h4>
                          
                          {/* 价格单独一行 */}
                          <p className="product-price">价格: ¥{product.price}</p>
                          
                          {/* 分类和发布时间并列显示 */}
                          <div className="product-meta-row">
                            <p className="product-category">分类: {categoryName}</p>
                            <p className="product-time">发布时间: {product.createTime}</p>
                          </div>
                        </div>
                        
                        {/* 商品详细信息，展开时显示 */}
                        {expandedProducts[product.id] && (
                          <div className="product-details">
                            {/* 商品图片 */}
                            {images.length > 0 ? (
                              <div className="product-images">
                                {images.map((image, index) => (
                                  <div key={index} className="product-image-item">
                                    <img src={image} alt={`商品图片 ${index + 1}`} />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-images">暂无商品图片</div>
                            )}
                            
                            {/* 商品描述 */}
                            <div className="product-description">
                              <h5>商品描述:</h5>
                              <p>{product.description || '暂无描述'}</p>
                            </div>
                            
                            {/* 发布者信息栏，展开时显示 */}
                            <div className="product-publisher">
                              <h5>发布者信息:</h5>
                              <div className="publisher-info">
                                <p className="publisher-id">发布者ID: {product.userId}</p>
                                <p className="publisher-username">发布者用户名: {product.sellerUsername}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* 审核按钮，右侧放置 */}
                      <div className="product-actions">
                        <button 
                          className="btn-success"
                          onClick={() => showReviewConfirmModal(product.id, 'approve')}
                        >
                          通过
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => showReviewConfirmModal(product.id, 'reject')}
                        >
                          拒绝
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 审核确认弹窗 */}
      <ConfirmModal
        isVisible={showConfirmModal}
        title={`商品审核${confirmAction === 'approve' ? '通过' : '拒绝'}确认`}
        message={`确定要${confirmAction === 'approve' ? '通过' : '拒绝'}该商品的审核吗？`}
        onConfirm={handleReviewProduct}
        onCancel={hideReviewConfirmModal}
        confirmText="确定"
        cancelText="取消"
      />
    </div>
  );
};

export default AdminReviewManagement;
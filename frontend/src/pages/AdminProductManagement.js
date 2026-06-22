import React, { useState, useEffect } from 'react';
import { getProductList, offlineProduct, getProductDetail } from '../api/productApi';
import { getAllCategories } from '../api/categoryApi';
import ConfirmModal from '../components/ConfirmModal';

const AdminProductManagement = () => {
  // 使用useState存储用户信息，避免每次渲染都创建新对象
  const [user, setUser] = useState(() => {
    // 初始加载时从localStorage获取用户信息
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  // 商品数据
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 搜索相关状态
  const [searchType, setSearchType] = useState('name');
  const [keyword, setKeyword] = useState('');
  
  // 商品展开状态，存储商品ID到展开状态的映射
  const [expandedProducts, setExpandedProducts] = useState({});
  
  // 分类数据，用于将分类ID转换为分类名称
  const [categories, setCategories] = useState({});
  
  // 商品详细信息，存储商品ID到详细信息的映射
  const [productDetails, setProductDetails] = useState({});
  
  // 弹窗相关状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
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
  
  // 获取商品列表
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 构建请求参数
      const params = {
        page: 1,
        size: 100, // 一次获取所有商品，简化实现
      };
      
      // 根据搜索类型和关键词添加搜索参数
      if (keyword.trim()) {
        if (searchType === 'name') {
          params.keyword = keyword.trim();
        } else if (searchType === 'id') {
          params.id = keyword.trim();
        } else if (searchType === 'publisherId') {
          params.userId = keyword.trim();
        }
      }
      
      // 调用后端API获取商品列表
      const response = await getProductList(params);
      if (response && response.code === 200) {
        // 假设后端返回的是PageResult对象，包含data属性
        setProducts(response.data?.records || response.data || []);
      } else {
        throw new Error(response.message || '获取商品列表失败');
      }
    } catch (err) {
      console.error('获取商品列表失败:', err);
      setError('获取商品列表失败，请稍后重试');
    } finally {
      setLoading(false);
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
      setLoading(false);
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [user]);
  
  // 检查用户是否为管理员
  if (!user || user.userType !== 2) {
    return <div className="not-found">您没有权限访问此页面</div>;
  }
  
  // 切换商品展开/折叠状态
  const toggleProductExpand = async (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
    
    // 无论是否已经获取过详细信息，都重新获取，确保数据最新
    try {
      const result = await getProductDetail(productId);
      if (result && result.code === 200) {
        setProductDetails(prev => ({
          ...prev,
          [productId]: result.data
        }));
      }
    } catch (err) {
      console.error('获取商品详情失败:', err);
    }
  };
  
  // 处理搜索
  const handleSearch = () => {
    fetchProducts();
  };
  
  // 处理清除搜索
  const handleClearSearch = () => {
    setKeyword('');
    // 确保重新获取全部列表
    fetchProducts();
  };
  
  // 显示下架确认弹窗
  const showOfflineConfirmModal = (productId) => {
    setSelectedProductId(productId);
    setShowConfirmModal(true);
  };
  
  // 隐藏下架确认弹窗
  const hideOfflineConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedProductId(null);
  };
  
  // 处理商品下架
  const handleOfflineProduct = async () => {
    if (!selectedProductId) return;
    
    try {
      // 调用后端API下架商品
      const response = await offlineProduct(selectedProductId);
      if (response && response.code === 200) {
        // 更新本地状态
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === selectedProductId ? { ...product, status: 2 } : product
          )
        );
      } else {
        throw new Error(response.message || '下架商品失败');
      }
    } catch (err) {
      console.error('下架商品失败:', err);
      alert('下架商品失败，请稍后重试');
    } finally {
      hideOfflineConfirmModal();
    }
  };
  
  return (
    <div className="admin-product-management">
      <h2>商品管理</h2>
      
      {/* 搜索容器 */}
      <div className="search-container">
        <select 
          className="search-select"
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="name">商品名称</option>
          <option value="id">商品ID</option>
          <option value="publisherId">发布者ID</option>
        </select>
        <input
          type="text"
          className="search-input"
          placeholder="请输入搜索关键词"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="btn-search" onClick={handleSearch}>
          搜索
        </button>
        {keyword && (
          <button className="btn-clear" onClick={handleClearSearch}>
            清除搜索
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">加载中...</div>
      ) : products.length === 0 ? (
        <div className="no-data">暂无商品数据</div>
      ) : (
        <div className="product-list">
          {products.map(product => {
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
                      <p className="product-status">
                        状态: 
                        <span className={`status-badge ${product.status === 1 ? 'active' : 'inactive'}`}>
                          {/* 确保状态码正确映射 */}
                          {product.status === 0 ? '待审核' : 
                           product.status === 1 ? '在售' : 
                           product.status === 2 ? '已下架' : 
                           product.status === 3 ? '已售出' : '未知状态'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* 商品详细信息，展开时显示 */}
                  {expandedProducts[product.id] && (
                    <div className="product-details">
                      {/* 商品图片 */}
                      {images.length > 0 ? (
                        <div className="product-images">
                          {images.map((image, index) => (
                            <div key={index} className="product-image-item" style={{ position: 'relative' }}>
                              {/* 移除商品图片上的冗余状态标签，只在商品信息中显示 */}
                              <img src={image} alt={`商品图片 ${index + 1}`} style={{ display: 'block' }} />
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
                      
                      {/* 发布者信息栏 */}
                      <div className="product-publisher">
                        <h5>发布者信息:</h5>
                        <div className="publisher-info">
                          <p className="publisher-id">发布者ID: {product.userId}</p>
                          <p className="publisher-username">发布者用户名: {productDetails[product.id]?.sellerUsername || '获取中...'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 操作按钮，右侧放置 */}
                <div className="product-actions">
                  {/* 仅待审核(0)和在售(1)状态可强制下架 */}
                  {(product.status === 0 || product.status === 1) ? (
                    <button 
                      className="btn-danger"
                      onClick={() => showOfflineConfirmModal(product.id)}
                    >
                      强制下架
                    </button>
                  ) : (
                    <button 
                      className="btn-danger"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                      强制下架
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* 下架确认弹窗 */}
      <ConfirmModal
        isVisible={showConfirmModal}
        title="强制下架商品确认"
        message="确定要强制下架该商品吗？下架后无法恢复上架。"
        onConfirm={handleOfflineProduct}
        onCancel={hideOfflineConfirmModal}
        confirmText="确定"
        cancelText="取消"
      />
    </div>
  );
};

export default AdminProductManagement;
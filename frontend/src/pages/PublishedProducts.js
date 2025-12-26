import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsByUserId } from '../api/productApi';
import { Link } from 'react-router-dom';

const PublishedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取已发布商品列表
  const fetchPublishedProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await getProductsByUserId(user.id);
      if (response.code === 200) {
        setProducts(response.data);
      } else {
        setError('获取已发布商品列表失败');
      }
    } catch (err) {
      setError('获取已发布商品列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 检查用户是否已登录
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      // 未登录，跳转到登录页面
      navigate('/login');
      return;
    }
    
    // 检查用户是否为商家用户
    if (user.userType !== 1) {
      // 不是商家用户，跳转到首页
      navigate('/');
      return;
    }
    
    fetchPublishedProducts();
  }, [navigate]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="published-products-container">
      <h2>已发布商品</h2>
      {products.length === 0 ? (
        <div className="no-products">暂无已发布商品</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div className="product-card" key={product.id}>
              <Link to={`/product/${product.id}`}>
                <div className="product-image">
                  {/* 假设imageUrls是JSON字符串，需要解析 */}
                  {product.imageUrls && JSON.parse(product.imageUrls).length > 0 ? (
                    <img 
                      src={JSON.parse(product.imageUrls)[0]} 
                      alt={product.title} 
                    />
                  ) : (
                    <div className="no-image">暂无图片</div>
                  )}
                  {/* 商品状态标签 */}
                  {product.status === 0 && (
                    <div className="status-badge pending">待审核</div>
                  )}
                  {product.status === 1 && (
                    <div className="status-badge selling">在售</div>
                  )}
                  {product.status === 2 && (
                    <div className="status-badge offline">已下架</div>
                  )}
                  {product.status === 3 && (
                    <div className="status-badge sold">已售出</div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.title}</h4>
                  <p className="product-price">¥{product.price.toFixed(2)}</p>
                  <p className="product-description">{product.description.substring(0, 50)}...</p>
                  <div className="product-meta">
                    <span className="view-count">浏览 {product.viewCount}</span>
                    <span className="create-time">{new Date(product.createTime).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublishedProducts;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPurchaseHistory } from '../api/orderApi';

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取已购买商品列表
  const fetchPurchaseHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await getPurchaseHistory(user.id);
      if (response.code === 200) {
        setPurchases(response.data);
      } else {
        setError('获取已购买商品列表失败');
      }
    } catch (err) {
      setError('获取已购买商品列表失败，请检查网络连接');
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
    fetchPurchaseHistory();
  }, [navigate]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="purchase-history-container">
      <h2>已购买商品</h2>
      {purchases.length === 0 ? (
        <div className="no-purchases">暂无已购买商品</div>
      ) : (
        <div className="purchase-list">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="purchase-item">
              <div className="purchase-item-left">
                <div className="purchase-product-image">
                  {purchase.product && purchase.product.imageUrls ? (
                    <img 
                      src={JSON.parse(purchase.product.imageUrls)[0]} 
                      alt={purchase.product.title} 
                    />
                  ) : (
                    <div className="no-image">暂无图片</div>
                  )}
                </div>
                <div className="purchase-product-info">
                  <h3>{purchase.product ? purchase.product.title : '商品已下架'}</h3>
                  <p className="purchase-price">¥{purchase.totalAmount.toFixed(2)}</p>
                  <p className="purchase-time">购买时间：{new Date(purchase.createTime).toLocaleString()}</p>
                </div>
              </div>
              <div className="purchase-item-right">
                <span className="purchase-status">已完成</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
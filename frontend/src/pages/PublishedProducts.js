import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsByUserId, offlineProduct, deleteProduct } from '../api/productApi';
import { getOrdersByUserId, evaluateUser } from '../api/orderApi';
import ConfirmModal from '../components/ConfirmModal';

const PublishedProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evaluatedOrders, setEvaluatedOrders] = useState(new Set());
  
  // 确认弹窗状态（用于下架/删除商品）
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalAction, setConfirmModalAction] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);
  
  // 点赞确认弹窗状态
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentBuyerId, setCurrentBuyerId] = useState(null);
  const [likeSuccess, setLikeSuccess] = useState(false);

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

  // 获取卖家订单
  const fetchSellerOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await getOrdersByUserId({ userId: user.id, status: 1, page: 1, size: 100 });
      if (response.code === 200) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error('获取卖家订单失败:', err);
    }
  };

  // 打开点赞确认弹窗
  const openLikeModal = (orderId, buyerId) => {
    setCurrentOrderId(orderId);
    setCurrentBuyerId(buyerId);
    setLikeSuccess(false);
    setLikeModalVisible(true);
  };

  // 关闭点赞确认弹窗
  const closeLikeModal = () => {
    setLikeModalVisible(false);
    setCurrentOrderId(null);
    setCurrentBuyerId(null);
    setLikeSuccess(false);
  };

  // 确认点赞买家
  const confirmLikeBuyer = async () => {
    if (!currentOrderId || !currentBuyerId) {
      closeLikeModal();
      return;
    }

    try {
      const response = await evaluateUser(currentOrderId, currentBuyerId);
      if (response.code === 200) {
        setLikeSuccess(true);
        setEvaluatedOrders(new Set(evaluatedOrders).add(currentOrderId));
      } else {
        alert('点赞失败：' + (response.message || '未知错误'));
        closeLikeModal();
      }
    } catch (err) {
      alert('点赞失败，请检查网络连接');
      closeLikeModal();
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
    fetchSellerOrders();
  }, [navigate]);

  // 显示确认弹窗
  const showConfirmModal = (title, message, action, productId) => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    setConfirmModalAction(action);
    setCurrentProductId(productId);
    setConfirmModalVisible(true);
  };

  // 隐藏确认弹窗
  const hideConfirmModal = () => {
    setConfirmModalVisible(false);
    setConfirmModalAction(null);
    setCurrentProductId(null);
  };

  // 处理确认操作
  const handleConfirmAction = async () => {
    if (confirmModalAction && currentProductId) {
      try {
        let response;
        if (confirmModalAction === 'offline') {
          response = await offlineProduct(currentProductId);
        } else if (confirmModalAction === 'delete') {
          response = await deleteProduct(currentProductId);
        }
        
        if (response.code === 200) {
          // 操作成功，重新获取商品列表
          fetchPublishedProducts();
        } else {
          alert(confirmModalAction === 'offline' ? '下架失败' : '删除失败');
        }
      } catch (err) {
        alert(confirmModalAction === 'offline' ? '下架失败，请检查网络连接' : '删除失败，请检查网络连接');
      } finally {
        hideConfirmModal();
      }
    }
  };

  // 处理商品下架
  const handleOffline = (productId) => {
    showConfirmModal('确认下架', '确定要下架该商品吗？', 'offline', productId);
  };

  // 处理商品删除
  const handleDelete = (productId) => {
    showConfirmModal('确认删除', '确定要删除该记录吗？', 'delete', productId);
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
      <div className="purchase-history-container">
        <h2>已发布商品</h2>
        {products.length === 0 ? (
          <div className="no-purchases">暂无已发布商品</div>
        ) : (
          <div className="purchase-list">
            {products.map(product => (
              <div key={product.id} className="purchase-item">
                <div className="purchase-item-left">
                  <div className="purchase-product-image">
                    {product.imageUrls && JSON.parse(product.imageUrls).length > 0 ? (
                      <img
                        src={JSON.parse(product.imageUrls)[0]}
                        alt={product.title}
                      />
                    ) : (
                      <div className="no-image">暂无图片</div>
                    )}
                  </div>
                  <div className="purchase-product-info">
                    <h3>{product.title}</h3>
                    <div className="purchase-price">¥{product.price.toFixed(2)}</div>
                    <div className="purchase-time">
                      发布时间：{new Date(product.createTime).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="purchase-item-right">
                  {/* 商品状态标签 */}
                  <span
                    className={`purchase-status ${ 
                      product.status === 0 ? 'pending' : 
                      product.status === 1 ? 'selling' : 
                      product.status === 2 ? 'offline' : 'sold' 
                    }`}
                  >
                    {product.status === 0 ? '待审核' : 
                     product.status === 1 ? '在售' : 
                     product.status === 2 ? '已下架' : '已售出'}
                  </span>

                  {/* 下架商品按钮 - 仅在售商品可下架，已售出商品不可下架 */}
                  <button
                    className="return-button"
                    onClick={() => handleOffline(product.id)}
                    disabled={product.status !== 1}
                  >
                    下架商品
                  </button>

                  {/* 删除记录按钮 */}
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(product.id)}
                  >
                    删除记录
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 已售出商品订单 */}
        <h2 style={{ marginTop: '2rem' }}>已售出商品订单</h2>
        {orders.length === 0 ? (
          <div className="no-purchases">暂无已售出商品订单</div>
        ) : (
          <div className="purchase-list">
            {orders.map(order => (
              <div key={order.id} className="purchase-item">
                <div className="purchase-item-left">
                  <div className="purchase-product-info">
                    <h3>订单号：{order.orderNo}</h3>
                    <div className="purchase-price">¥{order.totalAmount.toFixed(2)}</div>
                    <div className="purchase-time">
                      下单时间：{new Date(order.createTime).toLocaleString()}
                    </div>
                    <div className="purchase-buyer">
                      买家ID：{order.buyerId}
                    </div>
                  </div>
                </div>
                <div className="purchase-item-right">
                  {/* 订单状态标签 */}
                  <span
                    className={`purchase-status ${order.status === 1 ? 'completed' : 'other'}`}
                  >
                    {order.status === 1 ? '已完成' : '其他'}
                  </span>

                  {/* 点赞买家按钮 */}
                  {order.status === 1 && !evaluatedOrders.has(order.id) && (
                    <button
                      className="evaluate-button"
                      onClick={() => openLikeModal(order.id, order.buyerId)}
                    >
                      点赞
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 确认弹窗组件（用于下架/删除商品） */}
        <ConfirmModal
          isVisible={confirmModalVisible}
          title={confirmModalTitle}
          message={confirmModalMessage}
          onConfirm={handleConfirmAction}
          onCancel={hideConfirmModal}
          confirmText="确定"
          cancelText="取消"
        />
        
        {/* 点赞确认弹窗 */}
        <ConfirmModal
          isVisible={likeModalVisible}
          title={likeSuccess ? '点赞成功' : '确认点赞'}
          message={likeSuccess ? '点赞成功，对方信誉值+1' : '确定要给买家点赞吗？'}
          onConfirm={likeSuccess ? closeLikeModal : confirmLikeBuyer}
          onCancel={closeLikeModal}
          confirmText={likeSuccess ? '确定' : '点赞'}
          cancelText={likeSuccess ? undefined : '取消'}
        />
      </div>
    );
};

export default PublishedProducts;
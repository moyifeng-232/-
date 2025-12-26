import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPurchaseHistory, returnProduct, deletePurchaseRecord } from '../api/orderApi';
import ConfirmModal from '../components/ConfirmModal';

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [returning, setReturning] = useState(null); // 正在退货的订单ID
  const [deleting, setDeleting] = useState(null); // 正在删除的订单ID
  
  // 弹窗状态
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [confirmModalAction, setConfirmModalAction] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

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

  // 显示确认弹窗
  const showConfirmModal = (title, message, action, data) => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    setConfirmModalAction(action);
    setConfirmModalData(data);
    setConfirmModalVisible(true);
  };

  // 关闭确认弹窗
  const closeConfirmModal = () => {
    setConfirmModalVisible(false);
    setConfirmModalAction(null);
    setConfirmModalData(null);
  };

  // 确认操作
  const handleConfirm = async () => {
    if (confirmModalAction === 'return') {
      await handleReturn(confirmModalData);
    } else if (confirmModalAction === 'delete') {
      await handleDeletePurchaseRecord(confirmModalData);
    }
    closeConfirmModal();
  };

  // 处理退货
  const handleReturn = async (orderId) => {
    setReturning(orderId);
    try {
      const response = await returnProduct(orderId);
      if (response.code === 200) {
        // 退货成功，重新获取购买记录
        fetchPurchaseHistory();
      } else {
        setError('退货失败：' + response.message);
      }
    } catch (err) {
      setError('退货失败，请检查网络连接');
    } finally {
      setReturning(null);
    }
  };

  // 处理删除购买记录
  const handleDeletePurchaseRecord = async (orderId) => {
    setDeleting(orderId);
    try {
      const response = await deletePurchaseRecord(orderId);
      if (response.code === 200) {
        // 删除成功，重新获取购买记录
        fetchPurchaseHistory();
      } else {
        setError('删除失败：' + response.message);
      }
    } catch (err) {
      setError('删除失败，请检查网络连接');
    } finally {
      setDeleting(null);
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
                {/* 根据订单状态显示不同的状态文本 */}
                <span className={`purchase-status ${purchase.status === 5 ? 'returned' : ''}`}>
                  {purchase.status === 0 ? '待支付' : 
                   purchase.status === 1 ? '待发货' : 
                   purchase.status === 2 ? '待收货' : 
                   purchase.status === 3 ? '已完成' : 
                   purchase.status === 4 ? '已取消' : 
                   purchase.status === 5 ? '已退货' : '未知状态'}
                </span>
                
                {/* 退货按钮 - 只有已完成的订单才能退货 */}
                {purchase.status === 3 && (
                  <button 
                    className="return-button"
                    onClick={() => showConfirmModal('确认退货', '确定要退货吗？', 'return', purchase.id)}
                    disabled={returning === purchase.id}
                  >
                    {returning === purchase.id ? '退货中...' : '退货'}
                  </button>
                )}
                
                {/* 删除按钮 - 所有状态的订单都可以删除 */}
                <button 
                  className="delete-button"
                  onClick={() => showConfirmModal('确认删除', '确定要删除该购买记录吗？', 'delete', purchase.id)}
                  disabled={deleting === purchase.id}
                >
                  {deleting === purchase.id ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 确认弹窗 */}
      <ConfirmModal
        isVisible={confirmModalVisible}
        title={confirmModalTitle}
        message={confirmModalMessage}
        onConfirm={handleConfirm}
        onCancel={closeConfirmModal}
      />
    </div>
  );
};

export default PurchaseHistory;
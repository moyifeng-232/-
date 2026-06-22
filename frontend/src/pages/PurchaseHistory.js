import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPurchaseHistory, cancelOrder, returnProduct, deletePurchaseRecord, evaluateUser } from '../api/orderApi';
import ConfirmModal from '../components/ConfirmModal';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evaluatedOrders, setEvaluatedOrders] = useState(new Set());
  const navigate = useNavigate();
  
  // 确认点赞弹窗状态
  const [confirmLikeModalVisible, setConfirmLikeModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentSellerId, setCurrentSellerId] = useState(null);
  const [likeSuccess, setLikeSuccess] = useState(false);

  // 获取购买历史
  const fetchPurchaseHistory = async () => {
    setLoading(true);
    setError('');
    try {
      // 获取当前登录用户
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await getPurchaseHistory(user.id);
      if (response.code === 200) {
        setPurchases(response.data);
      } else {
        setError('获取购买记录失败');
      }
    } catch (err) {
      setError('获取购买记录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseHistory();
  }, [navigate]);

  // 取消订单
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('确定要取消该订单吗？')) {
      try {
        const response = await cancelOrder(orderId);
        if (response.code === 200) {
          // 刷新订单列表
          fetchPurchaseHistory();
          alert('订单已取消');
        } else {
          alert('取消订单失败：' + (response.message || '未知错误'));
        }
      } catch (err) {
        alert('取消订单失败，请检查网络连接');
      }
    }
  };

  // 退货申请
  const handleReturnOrder = async (orderId) => {
    if (window.confirm('确定要申请退货吗？')) {
      try {
        const response = await returnProduct(orderId);
        if (response.code === 200) {
          // 刷新订单列表
          fetchPurchaseHistory();
          alert('退货申请已提交，等待商家审核');
        } else {
          alert('退货申请失败：' + (response.message || '未知错误'));
        }
      } catch (err) {
        alert('退货申请失败，请检查网络连接');
      }
    }
  };

  // 删除订单
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('确定要删除该订单记录吗？删除后不可恢复！')) {
      try {
        const response = await deletePurchaseRecord(orderId);
        if (response.code === 200) {
          // 刷新订单列表
          fetchPurchaseHistory();
          alert('订单记录已删除');
        } else {
          alert('删除订单失败：' + (response.message || '未知错误'));
        }
      } catch (err) {
        alert('删除订单失败，请检查网络连接');
      }
    }
  };

  // 跳转到支付宝支付页面
  const handleGoToPay = (orderId) => {
    navigate(`/alipay/pay?orderId=${orderId}`);
  };

  // 打开点赞确认弹窗
  const openLikeModal = (orderId, sellerId) => {
    setCurrentOrderId(orderId);
    setCurrentSellerId(sellerId);
    setLikeSuccess(false);
    setConfirmLikeModalVisible(true);
  };

  // 关闭点赞确认弹窗
  const closeLikeModal = () => {
    setConfirmLikeModalVisible(false);
    setCurrentOrderId(null);
    setCurrentSellerId(null);
    setLikeSuccess(false);
  };

  // 确认点赞
  const confirmLike = async () => {
    if (!currentOrderId || !currentSellerId) {
      closeLikeModal();
      return;
    }

    try {
      const response = await evaluateUser(currentOrderId, currentSellerId);
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

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
      <div className="purchase-history-container">
        <h2>我的购买记录</h2>
        {purchases.length === 0 ? (
            <div className="no-purchases">暂无购买记录</div>
        ) : (
            <div className="purchase-list">
              {purchases.map((purchase) => (
                  <div key={purchase.id} className="purchase-item">
                    <div className="purchase-item-left">
                      <div className="purchase-product-image">
                        {purchase.product.imageUrls ? (
                            <img
                                src={JSON.parse(purchase.product.imageUrls)[0]}
                                alt={purchase.product.title}
                            />
                        ) : (
                            <div className="no-image">暂无图片</div>
                        )}
                      </div>
                      <div className="purchase-product-info">
                        <h3>{purchase.product.title}</h3>
                        <div className="purchase-price">¥{purchase.totalAmount.toFixed(2)}</div>
                        <div className="purchase-time">
                          下单时间：{new Date(purchase.createTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="purchase-item-right">
                      {/* 订单状态标签 */}
                      <span
                          className={`purchase-status ${
                              purchase.status === 0 ? 'pending' :
                                  purchase.status === 1 ? 'completed' :
                                      purchase.status === 2 ? 'cancelled' : 'returned'
                          }`}
                      >
                  {purchase.status === 0 ? '待支付' :
                      purchase.status === 1 ? '已完成' :
                          purchase.status === 2 ? '已取消' : '已退货'}
                </span>

                      {/* 待支付订单显示「去支付」按钮 */}
                      {purchase.status === 0 && (
                          <button
                              className="pay-button"
                              onClick={() => handleGoToPay(purchase.id)}
                          >
                            去支付
                          </button>
                      )}

                      {/* 已完成订单显示「申请退货」按钮和「评价卖家」按钮 */}
                      {purchase.status === 1 && (
                          <>
                            <button
                                className="return-button"
                                onClick={() => handleReturnOrder(purchase.id)}
                            >
                              申请退货
                            </button>
                            {!evaluatedOrders.has(purchase.id) && (
                                <button
                                    className="evaluate-button"
                                    onClick={() => openLikeModal(purchase.id, purchase.product.userId)}
                                >
                                  点赞
                                </button>
                            )}
                          </>
                      )}

                      {/* 待支付订单显示「取消订单」按钮 */}
                      {purchase.status === 0 && (
                          <button
                              className="delete-button"
                              onClick={() => handleCancelOrder(purchase.id)}
                          >
                            取消订单
                          </button>
                      )}

                      {/* 已取消/已退货订单显示「删除记录」按钮 */}
                      {(purchase.status === 2 || purchase.status === 3) && (
                          <button
                              className="delete-button"
                              onClick={() => handleDeleteOrder(purchase.id)}
                          >
                            删除记录
                          </button>
                      )}
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* 点赞确认弹窗 */}
        <ConfirmModal
          isVisible={confirmLikeModalVisible}
          title={likeSuccess ? '点赞成功' : '确认点赞'}
          message={likeSuccess ? '点赞成功，对方信誉值+1' : '确定要给卖家点赞吗？'}
          onConfirm={likeSuccess ? closeLikeModal : confirmLike}
          onCancel={closeLikeModal}
          confirmText={likeSuccess ? '确定' : '点赞'}
          cancelText={likeSuccess ? undefined : '取消'}
        />
      </div>
    );
};

export default PurchaseHistory;
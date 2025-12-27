import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetail, increaseViewCount } from '../api/productApi';
import { createOrder } from '../api/orderApi';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 当前显示的图片索引
    const [showSuccessModal, setShowSuccessModal] = useState(false); // 购买成功弹窗状态
    const [orderId, setOrderId] = useState(''); // 新增：保存创建的订单ID

    // 获取商品详情
    const fetchProductDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getProductDetail(id);
            if (response.code === 200) {
                setProduct(response.data);
                // 重置当前图片索引
                setCurrentImageIndex(0);
            } else {
                setError('获取商品详情失败');
            }
        } catch (err) {
            setError('获取商品详情失败，请检查网络连接');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchProductDetail();
            // 页面加载时调用一次增加浏览量API，确保只增加一次
            await increaseViewCount(id);
        };
        fetchData();
    }, [id]);

    // 切换图片
    const handleImageChange = (index) => {
        setCurrentImageIndex(index);
    };

    // 下单功能
    const handleOrder = async () => {
        // 检查用户是否已登录
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            // 未登录，跳转到登录页面
            navigate('/login');
            return;
        }

        // 检查商品是否已售出
        if (product.status === 3) {
            setError('该商品已售出');
            return;
        }

        try {
            // 创建订单
            const orderData = {
                buyerId: user.id,
                sellerId: product.userId,
                productId: product.id,
                totalAmount: product.price
            };
            const response = await createOrder(orderData);
            if (response.code === 200) {
                // 保存后端返回的订单ID
                setOrderId(response.data);
                // 下单成功，显示购买成功弹窗
                setShowSuccessModal(true);
            } else {
                setError('下单失败');
            }
        } catch (err) {
            setError('下单失败，请检查网络连接');
        }
    };

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!product) {
        return <div className="not-found">商品不存在</div>;
    }

    // 解析图片URLs
    const images = product.imageUrls ? JSON.parse(product.imageUrls) : [];

    return (
        <div className="product-detail-container">
            <div className="product-detail-content">
                {/* 左侧内容：图片、名称、价格、元数据 */}
                <div className="product-detail-left">
                    {/* 商品图片 */}
                    <div className="product-detail-images">
                        <div className="main-image">
                            {images.length > 0 ? (
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${product.title} - ${currentImageIndex + 1}`}
                                />
                            ) : (
                                <div className="no-image">暂无图片</div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="thumbnails">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail-item ${currentImageIndex === index ? 'active' : ''}`}
                                        onClick={() => handleImageChange(index)}
                                    >
                                        <img src={image} alt={`${product.title} - ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 商品基本信息 */}
                    <div className="product-basic-info">
                        <h2 className="product-title">{product.title}</h2>
                        <div className="product-price">¥{product.price.toFixed(2)}</div>
                        <div className="product-meta">
                            <span className="view-count">浏览 {product.viewCount}</span>
                            <span className="create-time">发布时间：{new Date(product.createTime).toLocaleString()}</span>
                            <span className="seller-info">卖家：{product.sellerUsername}</span>
                        </div>
                    </div>
                </div>

                {/* 右侧内容：描述、下单按钮 */}
                <div className="product-detail-right">
                    <div className="product-description">
                        <h3>商品描述</h3>
                        <p>{product.description}</p>
                    </div>
                    <div className="order-section">
                        {product.status === 3 ? (
                            <div className="sold-out-button">已售出</div>
                        ) : (
                            <button className="order-button" onClick={handleOrder}>
                                立即下单
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 购买成功弹窗（带支付按钮） */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>下单成功</h2>
                        <p>您已成功创建订单，请尽快完成支付</p>
                        <p>订单ID：{orderId}</p>
                        <div className="modal-buttons">
                            <button
                                className="modal-confirm-button"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    // 跳转到支付宝支付页面
                                    navigate(`/alipay/pay?orderId=${orderId}`);
                                }}
                            >
                                立即支付
                            </button>
                            <button
                                className="modal-cancel-button"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/purchases');
                                }}
                            >
                                稍后支付
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
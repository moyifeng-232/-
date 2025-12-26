import axiosInstance from '../utils/axiosInstance';

/**
 * 生成支付宝支付订单
 * @param {number} orderId - 订单ID
 * @returns {Promise} - 支付页面HTML
 */
export const createAlipayOrder = (orderId) => {
    return axiosInstance.post('/alipay/pay', null, { params: { orderId } });
};

/**
 * 查询支付宝支付状态
 * @param {string} outTradeNo - 支付订单号
 * @returns {Promise} - 支付状态
 */
export const queryAlipayStatus = (outTradeNo) => {
    return axiosInstance.get('/alipay/query', { params: { outTradeNo } });
};

/**
 * 更新订单支付状态
 * @param {number} orderId - 订单ID
 * @returns {Promise} - 更新结果
 */
export const refreshOrderStatus = (orderId) => {
    return axiosInstance.get('/order/detail', { params: { id: orderId } });
};
import axiosInstance from '../utils/axiosInstance';

/**
 * 创建订单
 * @param {Object} data - 订单信息
 * @returns {Promise} - 订单ID
 */
export const createOrder = (data) => {
  return axiosInstance.post('/order/create', data);
};

/**
 * 更新订单状态
 * @param {number} orderId - 订单ID
 * @param {number} status - 订单状态
 * @returns {Promise} - 更新结果
 */
export const updateOrderStatus = (orderId, status) => {
  return axiosInstance.put('/order/update-status', { orderId, status });
};

/**
 * 根据订单号获取订单
 * @param {string} orderNo - 订单号
 * @returns {Promise} - 订单信息
 */
export const getOrderByOrderNo = (orderNo) => {
  return axiosInstance.get('/order/get-by-no', { params: { orderNo } });
};

/**
 * 根据用户ID获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.userId - 用户ID
 * @param {number} [params.status] - 订单状态
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise} - 订单列表
 */
export const getOrdersByUserId = (params) => {
  return axiosInstance.get('/order/list', { params });
};

/**
 * 根据订单ID获取订单详情
 * @param {number} id - 订单ID
 * @returns {Promise} - 订单详情
 */
export const getOrderById = (id) => {
  return axiosInstance.get('/order/detail', { params: { id } });
};

/**
 * 获取当前用户已购买商品列表
 * @param {number} userId - 用户ID
 * @returns {Promise} - 已购买商品列表
 */
export const getPurchaseHistory = (userId) => {
  return axiosInstance.get('/order/purchase-history', { params: { userId } });
};
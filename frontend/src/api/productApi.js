import axiosInstance from '../utils/axiosInstance';

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} [params.categoryId] - 分类ID
 * @param {string} [params.keyword] - 关键词
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise} - 商品列表
 */
export const getProductList = (params) => {
  return axiosInstance.get('/product/list', { params });
};

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 * @returns {Promise} - 商品详情
 */
export const getProductDetail = (id) => {
  return axiosInstance.get('/product/detail', { params: { id } });
};

/**
 * 增加商品浏览量
 * @param {number} id - 商品ID
 * @returns {Promise} - 增加结果
 */
export const increaseViewCount = (id) => {
  return axiosInstance.post(`/product/view/${id}`);
};

/**
 * 发布商品
 * @param {Object} data - 商品信息
 * @returns {Promise} - 发布结果
 */
export const publishProduct = (data) => {
  return axiosInstance.post('/product/publish', data);
};

/**
 * 更新商品信息
 * @param {Object} data - 商品信息
 * @returns {Promise} - 更新结果
 */
export const updateProduct = (data) => {
  return axiosInstance.put('/product/update', data);
};

/**
 * 下架商品
 * @param {number} id - 商品ID
 * @returns {Promise} - 下架结果
 */
export const offlineProduct = (id) => {
  return axiosInstance.put('/product/offline', { params: { id } });
};

/**
 * 根据用户ID获取商品列表
 * @param {number} userId - 用户ID
 * @param {number} [page=1] - 页码
 * @param {number} [size=10] - 每页数量
 * @returns {Promise} - 商品列表
 */
export const getProductsByUserId = (userId, page = 1, size = 10) => {
  return axiosInstance.get('/product/user', { params: { userId, page, size } });
};

/**
 * 获取待审核的商品列表
 * @param {number} [page=1] - 页码
 * @param {number} [size=10] - 每页数量
 * @returns {Promise} - 待审核商品列表
 */
export const getPendingProducts = (page = 1, size = 10) => {
  return axiosInstance.get('/product/pending', { params: { page, size } });
};

/**
 * 审核商品
 * @param {number} productId - 商品ID
 * @param {boolean} approved - 是否通过
 * @returns {Promise} - 审核结果
 */
export const reviewProduct = (productId, approved) => {
  return axiosInstance.put('/product/review', null, { params: { productId, approved } });
};
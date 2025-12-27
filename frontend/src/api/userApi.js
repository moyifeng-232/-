import axiosInstance from '../utils/axiosInstance';

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} - 登录结果
 */
export const login = (data) => {
  return axiosInstance.post('/user/login', data);
};

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @returns {Promise} - 注册结果
 */
export const register = (data) => {
  return axiosInstance.post('/user/register', data);
};

/**
 * 获取用户信息
 * @param {number} id - 用户ID
 * @returns {Promise} - 用户信息
 */
export const getUserInfo = (id) => {
  return axiosInstance.get('/user/info', { params: { id } });
};

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise} - 更新结果
 */
export const updateUserInfo = (data) => {
  return axiosInstance.put('/user/update', data);
};

/**
 * 获取待审核的商家用户申请
 * @returns {Promise} - 待审核用户列表
 */
export const getPendingMerchantApplications = () => {
  return axiosInstance.get('/user/pending-merchants');
};

/**
 * 审核商家用户申请
 * @param {number} userId - 用户ID
 * @param {boolean} approved - 是否通过
 * @returns {Promise} - 审核结果
 */
export const reviewMerchantApplication = (userId, approved) => {
  return axiosInstance.put('/user/review-merchant', null, { params: { userId, approved } });
};

/**
 * 获取所有用户列表
 * @returns {Promise} - 用户列表
 */
export const getAllUsers = () => {
  return axiosInstance.get('/user/all');
};

/**
 * 更新用户状态（封禁/解封）
 * @param {number} userId - 用户ID
 * @param {number} status - 状态：1正常，2禁用
 * @returns {Promise} - 操作结果
 */
export const updateUserStatus = (userId, status) => {
  return axiosInstance.put('/user/status', null, { params: { userId, status } });
};

/**
 * 申请成为商家用户
 * @param {number} userId - 用户ID
 * @returns {Promise} - 申请结果
 */
export const applyForMerchant = (userId) => {
  return axiosInstance.put('/user/apply-merchant', null, { params: { userId } });
};

/**
 * 搜索用户
 * @param {string} searchType - 搜索类型：id、username、realName、studentId
 * @param {string} keyword - 搜索关键词
 * @returns {Promise} - 搜索结果
 */
export const searchUsers = (searchType, keyword) => {
  return axiosInstance.get('/user/search', { params: { searchType, keyword } });
};
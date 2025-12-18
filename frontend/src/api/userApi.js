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
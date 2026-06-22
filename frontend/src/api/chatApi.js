import axiosInstance from '../utils/axiosInstance';

/**
 * 获取两个用户之间的对话记录
 * @param {number} userId1 用户1 ID
 * @param {number} userId2 用户2 ID
 * @returns {Promise} 对话记录列表
 */
export const getChatHistory = (userId1, userId2) => {
  return axiosInstance.get('/chat/history', { params: { userId1, userId2 } });
};

/**
 * 发送消息
 * @param {object} message 消息对象
 * @returns {Promise} 发送结果
 */
export const sendMessage = (message) => {
  return axiosInstance.post('/chat/send', message);
};

/**
 * 获取用户的所有对话对象
 * @param {number} userId 用户ID
 * @returns {Promise} 对话对象ID列表
 */
export const getChatUsers = (userId) => {
  return axiosInstance.get('/chat/users', { params: { userId } });
};

/**
 * 更新消息为已读
 * @param {number} senderId 发送者ID
 * @param {number} receiverId 接收者ID
 * @returns {Promise} 更新结果
 */
export const updateMessageReadStatus = (senderId, receiverId) => {
  return axiosInstance.put('/chat/read', null, { params: { senderId, receiverId } });
};

/**
 * 获取用户未读消息数量
 * @param {number} userId 用户ID
 * @returns {Promise} 未读消息数量
 */
export const getUnreadMessageCount = (userId) => {
  return axiosInstance.get('/chat/unread-count', { params: { userId } });
};

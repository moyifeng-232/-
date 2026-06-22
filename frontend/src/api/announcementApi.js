import axiosInstance from '../utils/axiosInstance';

/**
 * 获取所有已发布的公告
 * @returns {Promise} - 公告列表
 */
export const getAnnouncements = () => {
    return axiosInstance.get('/announcement/list');
};

/**
 * 获取重点展示的公告
 * @returns {Promise} - 重点公告
 */
export const getFeaturedAnnouncement = () => {
    return axiosInstance.get('/announcement/featured');
};

/**
 * 获取公告详情
 * @param {number} id - 公告ID
 * @returns {Promise} - 公告详情
 */
export const getAnnouncementDetail = (id) => {
    return axiosInstance.get('/announcement/detail', { params: { id } });
};

/**
 * 管理员：获取所有公告（包括已撤销）
 * @returns {Promise} - 公告列表
 */
export const getAllAnnouncementsForAdmin = () => {
    return axiosInstance.get('/announcement/admin/list');
};

/**
 * 管理员：发布公告
 * @param {Object} data - 公告信息
 * @returns {Promise} - 发布结果
 */
export const publishAnnouncement = (data) => {
    return axiosInstance.post('/announcement/admin/publish', data);
};

/**
 * 管理员：撤销公告
 * @param {number} id - 公告ID
 * @returns {Promise} - 撤销结果
 */
export const revokeAnnouncement = (id) => {
    return axiosInstance.put('/announcement/admin/revoke', null, { params: { id } });
};

/**
 * 管理员：设置重点公告
 * @param {number} id - 公告ID
 * @returns {Promise} - 设置结果
 */
export const setFeaturedAnnouncement = (id) => {
    return axiosInstance.put('/announcement/admin/featured', null, { params: { id } });
};

import axiosInstance from '../utils/axiosInstance';

/**
 * 获取统计数据
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Promise} - 包含统计数据的Promise对象
 */
export const getStatisticsData = (startDate, endDate) => {
  return axiosInstance.get('/statistics', {
    params: {
      startDate,
      endDate
    }
  });
};
import axiosInstance from '../utils/axiosInstance';

/**
 * 获取所有分类
 * @returns {Promise} - 分类列表
 */
export const getAllCategories = () => {
  return axiosInstance.get('/category/all');
};

/**
 * 根据父分类ID获取子分类
 * @param {number} parentId - 父分类ID
 * @returns {Promise} - 子分类列表
 */
export const getCategoriesByParentId = (parentId) => {
  return axiosInstance.get('/category/children', { params: { parentId } });
};

/**
 * 获取一级分类
 * @returns {Promise} - 一级分类列表
 */
export const getLevelOneCategories = () => {
  return axiosInstance.get('/category/level-one');
};
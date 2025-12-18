package com.campus.secondhand.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.secondhand.entity.Category;

import java.util.List;

/**
 * 商品分类Service接口
 */
public interface CategoryService extends IService<Category> {

    /**
     * 获取所有分类
     * @return 分类列表
     */
    List<Category> getAllCategories();

    /**
     * 根据父分类ID获取子分类
     * @param parentId 父分类ID
     * @return 子分类列表
     */
    List<Category> getCategoriesByParentId(Long parentId);

    /**
     * 获取一级分类
     * @return 一级分类列表
     */
    List<Category> getLevelOneCategories();

}
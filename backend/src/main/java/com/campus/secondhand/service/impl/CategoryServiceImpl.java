package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Category;
import com.campus.secondhand.mapper.CategoryMapper;
import com.campus.secondhand.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品分类Service实现类
 */
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Category> getAllCategories() {
        return baseMapper.selectList(null);
    }

    @Override
    public List<Category> getCategoriesByParentId(Long parentId) {
        QueryWrapper<Category> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("parent_id", parentId);
        return baseMapper.selectList(queryWrapper);
    }

    @Override
    public List<Category> getLevelOneCategories() {
        QueryWrapper<Category> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("level", 1);
        return baseMapper.selectList(queryWrapper);
    }

}
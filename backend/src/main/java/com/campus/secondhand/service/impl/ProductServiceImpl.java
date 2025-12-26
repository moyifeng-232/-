package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Category;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.mapper.ProductMapper;
import com.campus.secondhand.service.CategoryService;
import com.campus.secondhand.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 商品Service实现类
 */
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    @Autowired
    private CategoryService categoryService;

    @Override
    public boolean publishProduct(Product product) {
        // 设置默认状态为待审核
        product.setStatus(0);
        // 设置默认浏览次数为0
        product.setViewCount(0);
        // 插入商品
        return save(product);
    }

    @Override
    public List<Product> getProductList(Long categoryId, String keyword, Integer page, Integer size) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        // 查询在售和已售出的商品
        queryWrapper.in("status", Arrays.asList(1, 3));
        // 根据分类ID查询
        if (categoryId != null) {
            // 获取所有分类信息
            List<Category> allCategories = categoryService.getAllCategories();
            // 找到当前分类
            Category currentCategory = allCategories.stream()
                    .filter(cat -> cat.getId().equals(categoryId))
                    .findFirst()
                    .orElse(null);
            
            if (currentCategory != null) {
                // 如果是一级分类，查询该分类下所有二级分类的商品
                if (currentCategory.getLevel() == 1) {
                    // 获取该父分类下的所有子分类
                    List<Category> subCategories = allCategories.stream()
                            .filter(cat -> cat.getParentId().equals(categoryId))
                            .collect(Collectors.toList());
                    
                    if (!subCategories.isEmpty()) {
                        // 提取子分类ID列表
                        List<Long> subCategoryIds = subCategories.stream().map(Category::getId).collect(Collectors.toList());
                        queryWrapper.in("category_id", subCategoryIds);
                    } else {
                        // 如果没有子分类，查询该分类下的商品（例如"其他"分类）
                        queryWrapper.eq("category_id", categoryId);
                    }
                } else {
                    // 如果是二级分类，直接查询该分类下的商品
                    queryWrapper.eq("category_id", categoryId);
                }
            }
        }
        // 根据关键词查询
        if (keyword != null && !keyword.isEmpty()) {
            queryWrapper.like("title", keyword).or().like("description", keyword);
        }
        // 按创建时间倒序排序
        queryWrapper.orderByDesc("create_time");
        // 分页查询
        Page<Product> productPage = new Page<>(page, size);
        baseMapper.selectPage(productPage, queryWrapper);
        return productPage.getRecords();
    }

    @Override
    public Product getProductById(Long id) {
        // 只获取商品详情，不增加浏览量
        return baseMapper.selectById(id);
    }
    
    @Override
    public boolean increaseViewCount(Long id) {
        Product product = baseMapper.selectById(id);
        if (product != null) {
            // 增加浏览次数
            product.setViewCount(product.getViewCount() + 1);
            baseMapper.updateById(product);
            return true;
        }
        return false;
    }

    @Override
    public boolean updateProduct(Product product) {
        // 验证商品是否存在
        Product existingProduct = baseMapper.selectById(product.getId());
        if (existingProduct != null) {
            return updateById(product);
        } else {
            return false;
        }
    }

    @Override
    public boolean offlineProduct(Long id) {
        Product product = new Product();
        product.setId(id);
        product.setStatus(2); // 2表示已下架
        return updateById(product);
    }

    @Override
    public List<Product> getProductsByUserId(Long userId, Integer page, Integer size) {
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId);
        // 按创建时间倒序排序
        queryWrapper.orderByDesc("create_time");
        // 分页查询
        Page<Product> productPage = new Page<>(page, size);
        baseMapper.selectPage(productPage, queryWrapper);
        return productPage.getRecords();
    }

    @Override
    public List<Product> getPendingProducts(Integer page, Integer size) {
        // 查询待审核的商品：status=0（待审核）
        QueryWrapper<Product> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", 0);
        // 按创建时间倒序排序
        queryWrapper.orderByDesc("create_time");
        // 分页查询
        Page<Product> productPage = new Page<>(page, size);
        baseMapper.selectPage(productPage, queryWrapper);
        return productPage.getRecords();
    }

    @Override
    public boolean reviewProduct(Long productId, boolean approved) {
        Product product = baseMapper.selectById(productId);
        if (product == null) {
            return false;
        }
        
        if (approved) {
            // 审核通过：设置为在售状态
            product.setStatus(1); // 1表示在售
        } else {
            // 审核拒绝：设置为已下架状态
            product.setStatus(2); // 2表示已下架
        }
        
        return updateById(product);
    }

}
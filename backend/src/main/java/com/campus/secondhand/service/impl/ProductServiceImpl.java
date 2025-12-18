package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.mapper.ProductMapper;
import com.campus.secondhand.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 商品Service实现类
 */
@Service
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

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
            queryWrapper.eq("category_id", categoryId);
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

}
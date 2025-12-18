package com.campus.secondhand.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.secondhand.entity.Product;

import java.util.List;

/**
 * 商品Service接口
 */
public interface ProductService extends IService<Product> {

    /**
     * 发布商品
     * @param product 商品信息
     * @return 发布结果
     */
    boolean publishProduct(Product product);

    /**
     * 获取商品列表
     * @param categoryId 分类ID
     * @param keyword 关键词
     * @param page 页码
     * @param size 每页数量
     * @return 商品列表
     */
    List<Product> getProductList(Long categoryId, String keyword, Integer page, Integer size);

    /**
     * 根据ID获取商品详情
     * @param id 商品ID
     * @return 商品详情
     */
    Product getProductById(Long id);

    /**
     * 更新商品信息
     * @param product 商品信息
     * @return 更新结果
     */
    boolean updateProduct(Product product);

    /**
     * 下架商品
     * @param id 商品ID
     * @return 下架结果
     */
    boolean offlineProduct(Long id);

    /**
     * 根据用户ID获取商品列表
     * @param userId 用户ID
     * @param page 页码
     * @param size 每页数量
     * @return 商品列表
     */
    List<Product> getProductsByUserId(Long userId, Integer page, Integer size);
    
    /**
     * 增加商品浏览量
     * @param id 商品ID
     * @return 增加结果
     */
    boolean increaseViewCount(Long id);

}
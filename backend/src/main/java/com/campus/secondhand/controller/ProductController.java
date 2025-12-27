package com.campus.secondhand.controller;

import com.campus.secondhand.common.Result;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品Controller
 */
@RestController
@RequestMapping("/api/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * 发布商品
     * @param product 商品信息
     * @return 发布结果
     */
    @PostMapping("/publish")
    public Result<Boolean> publishProduct(@RequestBody Product product) {
        boolean result = productService.publishProduct(product);
        if (result) {
            return Result.success(true, "商品发布成功，请等待审核");
        } else {
            return Result.error("商品发布失败");
        }
    }

    /**
     * 获取商品列表
     * @param categoryId 分类ID
     * @param keyword 关键词
     * @param page 页码
     * @param size 每页数量
     * @return 分页商品列表
     */
    @GetMapping("/list")
    public Result<com.campus.secondhand.dto.PageResult<Product>> getProductList(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer size) {
        com.campus.secondhand.dto.PageResult<Product> products = productService.getProductList(categoryId, keyword, page, size);
        return Result.success(products, "获取商品列表成功");
    }

    /**
     * 根据ID获取商品详情
     * @param id 商品ID
     * @return 商品详情
     */
    @GetMapping("/detail")
    public Result<com.campus.secondhand.dto.ProductDetailDto> getProductById(@RequestParam Long id) {
        com.campus.secondhand.dto.ProductDetailDto product = productService.getProductDetailDtoById(id);
        if (product != null) {
            return Result.success(product, "获取商品详情成功");
        } else {
            return Result.error("商品不存在");
        }
    }
    
    /**
     * 增加商品浏览量
     * @param id 商品ID
     * @return 增加结果
     */
    @PostMapping("/view/{id}")
    public Result<Boolean> increaseViewCount(@PathVariable Long id) {
        boolean result = productService.increaseViewCount(id);
        if (result) {
            return Result.success(true, "浏览量增加成功");
        } else {
            return Result.error("浏览量增加失败");
        }
    }

    /**
     * 更新商品信息
     * @param product 商品信息
     * @return 更新结果
     */
    @PutMapping("/update")
    public Result<Boolean> updateProduct(@RequestBody Product product) {
        boolean result = productService.updateProduct(product);
        if (result) {
            return Result.success(true, "商品信息更新成功");
        } else {
            return Result.error("商品信息更新失败");
        }
    }

    /**
     * 下架商品
     * @param id 商品ID
     * @return 下架结果
     */
    @PutMapping("/offline")
    public Result<Boolean> offlineProduct(@RequestParam Long id) {
        boolean result = productService.offlineProduct(id);
        if (result) {
            return Result.success(true, "商品下架成功");
        } else {
            return Result.error("商品下架失败");
        }
    }
    
    /**
     * 删除商品
     * @param id 商品ID
     * @return 删除结果
     */
    @DeleteMapping("/delete")
    public Result<Boolean> deleteProduct(@RequestParam Long id) {
        boolean result = productService.deleteProduct(id);
        if (result) {
            return Result.success(true, "商品删除成功");
        } else {
            return Result.error("商品删除失败");
        }
    }

    /**
     * 根据用户ID获取商品列表
     * @param userId 用户ID
     * @param page 页码
     * @param size 每页数量
     * @return 商品列表
     */
    @GetMapping("/user")
    public Result<List<Product>> getProductsByUserId(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        List<Product> products = productService.getProductsByUserId(userId, page, size);
        return Result.success(products, "获取用户商品列表成功");
    }
    
    /**
     * 获取待审核的商品列表
     * @param page 页码
     * @param size 每页数量
     * @return 待审核商品列表
     */
    @GetMapping("/pending")
    public Result<List<com.campus.secondhand.dto.ProductReviewDto>> getPendingProducts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        List<com.campus.secondhand.dto.ProductReviewDto> products = productService.getPendingProducts(page, size);
        return Result.success(products, "获取待审核商品列表成功");
    }
    
    /**
     * 审核商品
     * @param productId 商品ID
     * @param approved 是否通过
     * @return 审核结果
     */
    @PutMapping("/review")
    public Result<Boolean> reviewProduct(@RequestParam Long productId, @RequestParam Boolean approved) {
        boolean result = productService.reviewProduct(productId, approved);
        if (result) {
            return Result.success(true, "商品审核成功");
        } else {
            return Result.error("商品审核失败");
        }
    }

}
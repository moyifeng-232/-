package com.campus.secondhand.dto;

import com.campus.secondhand.entity.Product;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 商品详情DTO，包含卖家信息
 */
@Data
public class ProductDetailDto {
    
    /**
     * 商品ID
     */
    private Long id;
    
    /**
     * 发布用户ID
     */
    private Long userId;
    
    /**
     * 卖家用户名
     */
    private String sellerUsername;
    
    /**
     * 商品标题
     */
    private String title;
    
    /**
     * 商品描述
     */
    private String description;
    
    /**
     * 价格
     */
    private BigDecimal price;
    
    /**
     * 分类ID
     */
    private Long categoryId;
    
    /**
     * 状态：0待审核，1在售，2已下架，3已售出
     */
    private Integer status;
    
    /**
     * 图片URLs
     */
    private String imageUrls;
    
    /**
     * 浏览次数
     */
    private Integer viewCount;
    
    /**
     * 创建时间
     */
    private Date createTime;
    
    /**
     * 更新时间
     */
    private Date updateTime;
    
    /**
     * 从Product对象转换为ProductDetailDto
     * @param product 商品对象
     * @param sellerUsername 卖家用户名
     * @return 商品详情DTO
     */
    public static ProductDetailDto fromProduct(Product product, String sellerUsername) {
        ProductDetailDto dto = new ProductDetailDto();
        dto.setId(product.getId());
        dto.setUserId(product.getUserId());
        dto.setSellerUsername(sellerUsername);
        dto.setTitle(product.getTitle());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategoryId(product.getCategoryId());
        dto.setStatus(product.getStatus());
        dto.setImageUrls(product.getImageUrls());
        dto.setViewCount(product.getViewCount());
        dto.setCreateTime(product.getCreateTime());
        dto.setUpdateTime(product.getUpdateTime());
        return dto;
    }
}
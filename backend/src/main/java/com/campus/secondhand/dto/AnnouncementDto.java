package com.campus.secondhand.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

/**
 * 公告DTO
 */
@Data
public class AnnouncementDto {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 公告标题
     */
    private String title;

    /**
     * 公告内容
     */
    private String content;

    /**
     * 图片URL列表
     */
    private List<String> imageUrls;

    /**
     * 发布者ID
     */
    private Long publisherId;

    /**
     * 发布者用户名
     */
    private String publisherUsername;

    /**
     * 是否重点展示：0否，1是
     */
    private Integer isFeatured;

    /**
     * 状态：0已撤销，1已发布
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}

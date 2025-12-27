package com.campus.secondhand.dto;

import lombok.Data;

import java.util.List;

/**
 * 分页结果DTO
 * @param <T>
 */
@Data
public class PageResult<T> {
    
    /**
     * 总记录数
     */
    private long total;
    
    /**
     * 总页数
     */
    private long pages;
    
    /**
     * 当前页
     */
    private long current;
    
    /**
     * 每页大小
     */
    private long size;
    
    /**
     * 记录列表
     */
    private List<T> records;
    
    /**
     * 是否有下一页
     */
    private boolean hasNext;
    
    /**
     * 是否有上一页
     */
    private boolean hasPrevious;
    
    /**
     * 从MyBatis Plus的Page对象转换为PageResult
     * @param page MyBatis Plus的Page对象
     * @param <T> 数据类型
     * @return PageResult对象
     */
    public static <T> PageResult<T> fromPage(com.baomidou.mybatisplus.extension.plugins.pagination.Page<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setTotal(page.getTotal());
        result.setPages(page.getPages());
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setRecords(page.getRecords());
        result.setHasNext(page.hasNext());
        result.setHasPrevious(page.hasPrevious());
        return result;
    }
}
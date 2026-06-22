package com.campus.secondhand.service;

import com.campus.secondhand.common.Result;

import java.util.Date;

/**
 * 统计与分析服务接口
 */
public interface StatisticsService {

    /**
     * 获取统计数据
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计数据
     */
    Result getStatisticsData(Date startDate, Date endDate);
}
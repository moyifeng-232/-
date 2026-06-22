package com.campus.secondhand.controller;

import com.campus.secondhand.common.Result;
import com.campus.secondhand.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

/**
 * 统计与分析控制器
 */
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping
    public Result getStatisticsData(
            @RequestParam(required = true) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = true) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        return statisticsService.getStatisticsData(startDate, endDate);
    }
}
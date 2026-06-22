package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.campus.secondhand.common.Result;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.mapper.ProductMapper;
import com.campus.secondhand.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

/**
 * 统计与分析服务实现类
 */
@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductMapper productMapper;

    // 品类减排系数映射 (单位kg CO₂/件)
    private final Map<String, Double> categoryReductionCoefficients = new HashMap<>();

    // 初始化品类减排系数
    public StatisticsServiceImpl() {
        categoryReductionCoefficients.put("手机", 22.0);
        categoryReductionCoefficients.put("电脑", 85.0);
        categoryReductionCoefficients.put("平板", 30.0);
        categoryReductionCoefficients.put("教材", 0.8);
        categoryReductionCoefficients.put("课外书", 0.5);
        categoryReductionCoefficients.put("服饰", 3.2);
        categoryReductionCoefficients.put("家具", 12.0);
        categoryReductionCoefficients.put("其他", 2.0);
    }

    @Override
    public Result getStatisticsData(Date startDate, Date endDate) {
        // 扩展结束日期到当天的23:59:59，确保包含当天所有数据
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(endDate);
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 999);
        Date endDateExtended = calendar.getTime();

        // 1. 获取交易总量和总金额
        QueryWrapper<Order> orderWrapper = new QueryWrapper<>();
        orderWrapper.between("create_time", startDate, endDateExtended);
        List<Order> orders = orderMapper.selectList(orderWrapper);

        int totalTransactions = orders.size();
        BigDecimal totalAmount = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. 获取热门商品类别分布
        QueryWrapper<Product> productWrapper = new QueryWrapper<>();
        productWrapper.between("create_time", startDate, endDateExtended);
        List<Product> products = productMapper.selectList(productWrapper);

        // 统计各品类商品数量
        Map<String, Integer> categoryCountMap = new HashMap<>();
        for (Product product : products) {
            String categoryName = getCategoryNameById(product.getCategoryId());
            categoryCountMap.put(categoryName, categoryCountMap.getOrDefault(categoryName, 0) + 1);
        }

        int hotCategoryCount = products.size();

        // 3. 计算环境效益
        double totalEnvironmentalBenefit = 0.0;
        List<Map<String, Object>> environmentalBenefitDetails = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : categoryCountMap.entrySet()) {
            String categoryName = entry.getKey();
            int count = entry.getValue();
            double coefficient = categoryReductionCoefficients.getOrDefault(categoryName, 0.0);
            double reduction = count * coefficient;
            totalEnvironmentalBenefit += reduction;

            Map<String, Object> detail = new HashMap<>();
            detail.put("categoryName", categoryName);
            detail.put("productCount", count);
            detail.put("coefficient", coefficient);
            detail.put("reduction", reduction);
            environmentalBenefitDetails.add(detail);
        }

        // 4. 计算会费收入（这里假设会费收入是固定的，实际业务中可能需要从其他表获取）
        // 这里简化处理，实际应根据业务逻辑实现
        BigDecimal membershipIncome = BigDecimal.ZERO;

            // 5. 按月份统计交易趋势
        Map<String, Integer> monthlyTransactions = new HashMap<>();
        // 初始化过去6个月的月份标签
        for (int i = 5; i >= 0; i--) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -i);
            String monthLabel = (cal.get(Calendar.MONTH) + 1) + "月";
            monthlyTransactions.put(monthLabel, 0);
        }
        
        // 统计每个订单的月份并累加到对应月份
        for (Order order : orders) {
            Calendar cal = Calendar.getInstance();
            cal.setTime(order.getCreateTime());
            String monthLabel = (cal.get(Calendar.MONTH) + 1) + "月";
            monthlyTransactions.put(monthLabel, monthlyTransactions.getOrDefault(monthLabel, 0) + 1);
        }

        // 6. 组装返回结果
        Map<String, Object> resultData = new HashMap<>();
        resultData.put("totalTransactions", totalTransactions);
        resultData.put("totalAmount", totalAmount);
        resultData.put("hotCategoryCount", hotCategoryCount);
        resultData.put("membershipIncome", membershipIncome);
        resultData.put("environmentalBenefit", totalEnvironmentalBenefit);
        resultData.put("environmentalBenefitDetails", environmentalBenefitDetails);
        resultData.put("categoryDistribution", categoryCountMap);
        resultData.put("monthlyTransactions", monthlyTransactions);

        return Result.success(resultData, "获取统计数据成功");
    }

    /**
     * 根据分类ID获取分类名称
     * @param categoryId 分类ID
     * @return 分类名称
     */
    private String getCategoryNameById(Long categoryId) {
        // 这里需要根据实际的分类ID映射关系返回对应的分类名称
        // 假设分类ID与名称的映射关系如下：
        // 1-电子产品，2-手机，3-电脑，4-平板，5-书籍，6-教材，7-课外书，8-生活用品，9-服饰，10-家具，11-其他
        switch (categoryId.intValue()) {
            case 2: return "手机";
            case 3: return "电脑";
            case 4: return "平板";
            case 6: return "教材";
            case 7: return "课外书";
            case 9: return "服饰";
            case 10: return "家具";
            case 11: return "其他";
            default: return "其他";
        }
    }
}
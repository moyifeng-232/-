package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.mapper.ProductMapper;
import com.campus.secondhand.service.OrderService;
import com.campus.secondhand.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 订单Service实现类
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    @Autowired
    private ProductService productService;

    @Override
    public Long createOrder(Order order) {
        // 生成订单号
        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        // 设置默认状态为待支付
        order.setStatus(0);
        // 设置创建时间和更新时间
        order.setCreateTime(new Date());
        order.setUpdateTime(new Date());
        // 插入订单
        save(order);
        
        // 更新商品状态为已售出
        Product product = productService.getProductById(order.getProductId());
        if (product != null) {
            product.setStatus(3); // 3表示已售出
            productService.updateProduct(product);
        }
        
        return order.getId();
    }

    @Override
    public boolean updateOrderStatus(Long orderId, Integer status) {
        Order order = new Order();
        order.setId(orderId);
        order.setStatus(status);
        order.setUpdateTime(new Date());
        return updateById(order);
    }

    @Override
    public Order getOrderByOrderNo(String orderNo) {
        QueryWrapper<Order> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("order_no", orderNo);
        return baseMapper.selectOne(queryWrapper);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId, Integer status, Integer page, Integer size) {
        QueryWrapper<Order> queryWrapper = new QueryWrapper<>();
        // 根据用户ID查询（包括买家和卖家）
        queryWrapper.eq("buyer_id", userId).or().eq("seller_id", userId);
        // 根据状态查询
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        // 按创建时间倒序排序
        queryWrapper.orderByDesc("create_time");
        // 分页查询
        Page<Order> orderPage = new Page<>(page, size);
        baseMapper.selectPage(orderPage, queryWrapper);
        return orderPage.getRecords();
    }

    @Override
    public Order getOrderById(Long id) {
        return baseMapper.selectById(id);
    }

    /**
     * 生成订单号
     * @return 订单号
     */
    private String generateOrderNo() {
        // 订单号格式：时间戳 + 6位随机数
        return System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6);
    }

}
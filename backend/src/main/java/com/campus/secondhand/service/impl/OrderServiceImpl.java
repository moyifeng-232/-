package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.mapper.OrderMapper;
import com.campus.secondhand.service.OrderService;
import com.campus.secondhand.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 订单Service实现类
 * 最终修复：补全updateById方法，解决接口实现完整性问题
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
        // 支付流程：创建订单时设为待支付（0），而非直接完成
        order.setStatus(0);
        // 设置创建时间和更新时间
        order.setCreateTime(new Date());
        order.setUpdateTime(new Date());
        // 插入订单
        save(order);

        // 移除：创建订单时不修改商品状态（支付成功后再改）
        // Product product = productService.getProductById(order.getProductId());
        // if (product != null) {
        //     product.setStatus(3); // 3表示已售出
        //     productService.updateProduct(product);
        // }

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

    @Override
    public Order getByOrderNo(String orderNo) {
        return getOrderByOrderNo(orderNo);
    }

    @Override
    @Transactional
    public boolean returnProduct(Long orderId) {
        Order order = getOrderById(orderId);
        if (order == null) {
            return false;
        }
        // 更新订单状态为退货（假设4表示退货）
        order.setStatus(4);
        order.setUpdateTime(new Date());
        boolean updateResult = updateById(order);

        // 退货后恢复商品状态为在售（假设1表示在售）
        if (updateResult) {
            Product product = productService.getById(order.getProductId());
            if (product != null) {
                product.setStatus(1);
                productService.updateById(product);
            }
        }
        return updateResult;
    }

    @Override
    @Transactional
    public boolean deletePurchaseRecord(Long orderId) {
        Order order = getOrderById(orderId);
        if (order == null) {
            return false;
        }
        // 标记订单状态为"已删除/已取消"（用5表示）
        order.setStatus(5);
        order.setUpdateTime(new Date());
        return updateById(order);
    }

    @Override
    public List<Order> getPurchaseHistory(Long userId) {
        QueryWrapper<Order> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("buyer_id", userId) // 只查买家的订单
                .orderByDesc("create_time");
        return baseMapper.selectList(queryWrapper);
    }

    // 关键修复：显式实现OrderService接口中的updateById方法
    @Override
    public boolean updateById(Order order) {
        // 复用父类ServiceImpl的实现（已包含完整的更新逻辑）
        return super.updateById(order);
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
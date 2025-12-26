package com.campus.secondhand.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.secondhand.entity.Order;

import java.util.List;

/**
 * 订单Service接口
 */
public interface OrderService extends IService<Order> {

    /**
     * 创建订单
     * @param order 订单信息
     * @return 订单ID
     */
    Long createOrder(Order order);

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 订单状态
     * @return 更新结果
     */
    boolean updateOrderStatus(Long orderId, Integer status);

    /**
     * 根据订单号获取订单
     * @param orderNo 订单号
     * @return 订单信息
     */
    Order getOrderByOrderNo(String orderNo);

    /**
     * 根据用户ID获取订单列表
     * @param userId 用户ID
     * @param status 订单状态
     * @param page 页码
     * @param size 每页数量
     * @return 订单列表
     */
    List<Order> getOrdersByUserId(Long userId, Integer status, Integer page, Integer size);

    /**
     * 根据订单ID获取订单详情
     * @param id 订单ID
     * @return 订单详情
     */
    Order getOrderById(Long id);
    
    /**
     * 退货
     * @param orderId 订单ID
     * @return 退货结果
     */
    boolean returnProduct(Long orderId);
    
    /**
     * 删除购买记录
     * @param orderId 订单ID
     * @return 删除结果
     */
    boolean deletePurchaseRecord(Long orderId);

}
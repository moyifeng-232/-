package com.campus.secondhand.controller;

import com.campus.secondhand.entity.Order;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.service.OrderService;
import com.campus.secondhand.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 订单Controller
 */
@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ProductService productService;

    /**
     * 创建订单
     * @param order 订单信息
     * @return 创建结果
     */
    @PostMapping("/create")
    public Result<Long> createOrder(@RequestBody Order order) {
        Long orderId = orderService.createOrder(order);
        if (orderId != null) {
            return Result.success(orderId, "订单创建成功");
        } else {
            return Result.error("订单创建失败");
        }
    }

    /**
     * 更新订单状态
     * @param orderId 订单ID
     * @param status 订单状态
     * @return 更新结果
     */
    @PutMapping("/update-status")
    public Result<Boolean> updateOrderStatus(@RequestParam Long orderId, @RequestParam Integer status) {
        boolean result = orderService.updateOrderStatus(orderId, status);
        if (result) {
            return Result.success(true, "订单状态更新成功");
        } else {
            return Result.error("订单状态更新失败");
        }
    }

    /**
     * 根据订单号获取订单
     * @param orderNo 订单号
     * @return 订单信息
     */
    @GetMapping("/get-by-no")
    public Result<Order> getOrderByOrderNo(@RequestParam String orderNo) {
        Order order = orderService.getOrderByOrderNo(orderNo);
        if (order != null) {
            return Result.success(order, "获取订单成功");
        } else {
            return Result.error("订单不存在");
        }
    }

    /**
     * 根据用户ID获取订单列表
     * @param userId 用户ID
     * @param status 订单状态
     * @param page 页码
     * @param size 每页数量
     * @return 订单列表
     */
    @GetMapping("/list")
    public Result<List<Order>> getOrdersByUserId(
            @RequestParam Long userId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        List<Order> orders = orderService.getOrdersByUserId(userId, status, page, size);
        return Result.success(orders, "获取订单列表成功");
    }

    /**
     * 根据订单ID获取订单详情
     * @param id 订单ID
     * @return 订单详情
     */
    @GetMapping("/detail")
    public Result<Order> getOrderById(@RequestParam Long id) {
        Order order = orderService.getOrderById(id);
        if (order != null) {
            return Result.success(order, "获取订单详情成功");
        } else {
            return Result.error("订单不存在");
        }
    }
    
    /**
     * 获取用户已购买商品列表
     * @return 已购买商品列表
     */
    @GetMapping("/purchase-history")
    public Result<List<Map<String, Object>>> getPurchaseHistory(@RequestParam Long userId) {
        // 只获取用户作为买家的订单
        List<Order> orders = orderService.getOrdersByUserId(userId, null, 1, 100);
        
        // 关联查询商品信息
        List<Map<String, Object>> purchaseList = new ArrayList<>();
        for (Order order : orders) {
            // 只返回用户作为买家的订单
            if (order.getBuyerId().equals(userId)) {
                Map<String, Object> purchase = new HashMap<>();
                purchase.put("id", order.getId());
                purchase.put("orderNo", order.getOrderNo());
                purchase.put("totalAmount", order.getTotalAmount());
                purchase.put("status", order.getStatus());
                purchase.put("createTime", order.getCreateTime());
                
                // 查询关联的商品信息
                Product product = productService.getProductById(order.getProductId());
                if (product != null) {
                    purchase.put("product", product);
                }
                
                purchaseList.add(purchase);
            }
        }
        
        return Result.success(purchaseList, "获取已购买商品列表成功");
    }

    /**
     * 通用结果类
     */
    static class Result<T> {
        private Integer code;
        private String message;
        private T data;

        public Result() {
        }

        public Result(Integer code, String message, T data) {
            this.code = code;
            this.message = message;
            this.data = data;
        }

        public static <T> Result<T> success(T data, String message) {
            return new Result<>(200, message, data);
        }

        public static <T> Result<T> error(String message) {
            return new Result<>(500, message, null);
        }

        // getter and setter
        public Integer getCode() {
            return code;
        }

        public void setCode(Integer code) {
            this.code = code;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public T getData() {
            return data;
        }

        public void setData(T data) {
            this.data = data;
        }
    }

}
package com.campus.secondhand.controller;

import com.campus.secondhand.common.Result;
import com.campus.secondhand.dto.OrderIdRequest;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.entity.Product;
import com.campus.secondhand.service.OrderService;
import com.campus.secondhand.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 订单Controller
 * 完整适配前端调用规则 + 完善参数校验 + 统一返回格式
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
        // 1. 参数非空校验
        if (order == null) {
            return Result.error("订单信息不能为空");
        }
        if (order.getBuyerId() == null) {
            return Result.error("买家ID不能为空");
        }
        if (order.getSellerId() == null) {
            return Result.error("卖家ID不能为空");
        }
        if (order.getProductId() == null) {
            return Result.error("商品ID不能为空");
        }
        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return Result.error("订单金额必须大于0");
        }

        // 2. 调用服务层创建订单
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
        // 1. 参数校验
        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }
        if (status == null) {
            return Result.error("订单状态不能为空");
        }
        // 校验状态值合法性（0-待支付，1-待发货，2-待收货，3-已完成，4-已取消，5-已退货）
        if (status < 0 || status > 5) {
            return Result.error("订单状态值不合法（0-5）");
        }

        // 2. 调用服务层更新状态
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
        // 1. 参数校验
        if (orderNo == null || orderNo.trim().isEmpty()) {
            return Result.error("订单号不能为空");
        }

        // 2. 调用服务层查询订单
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
        // 1. 参数校验
        if (userId == null) {
            return Result.error("用户ID不能为空");
        }
        if (page < 1) {
            return Result.error("页码必须大于0");
        }
        if (size < 1 || size > 100) {
            return Result.error("每页数量必须在1-100之间");
        }

        // 2. 调用服务层查询订单列表
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
        // 1. 参数校验
        if (id == null) {
            return Result.error("订单ID不能为空");
        }

        // 2. 调用服务层查询订单
        Order order = orderService.getOrderById(id);
        if (order != null) {
            return Result.success(order, "获取订单详情成功");
        } else {
            return Result.error("订单不存在");
        }
    }

    /**
     * 获取用户已购买商品列表
     * @param userId 用户ID
     * @return 已购买商品列表
     */
    @GetMapping("/purchase-history")
    public Result<List<Map<String, Object>>> getPurchaseHistory(@RequestParam Long userId) {
        // 1. 参数校验
        if (userId == null) {
            return Result.error("用户ID不能为空");
        }

        // 2. 只获取用户作为买家的订单（分页参数设为1/100，获取全部）
        List<Order> orders = orderService.getOrdersByUserId(userId, null, 1, 100);

        // 3. 关联查询商品信息，组装返回数据
        List<Map<String, Object>> purchaseList = new ArrayList<>();
        for (Order order : orders) {
            // 过滤：只返回当前用户作为买家的订单
            if (order.getBuyerId() != null && order.getBuyerId().equals(userId)) {
                Map<String, Object> purchase = new HashMap<>();
                purchase.put("id", order.getId());
                purchase.put("orderNo", order.getOrderNo());
                purchase.put("totalAmount", order.getTotalAmount());
                purchase.put("status", order.getStatus());
                purchase.put("createTime", order.getCreateTime());
                purchase.put("updateTime", order.getUpdateTime());

                // 关联查询商品信息
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
     * 退货接口（基于DTO接收参数）
     * @param request 订单ID请求体
     * @return 退货结果
     */
    @PostMapping("/return")
    public Result<Boolean> returnProduct(@RequestBody OrderIdRequest request) {
        // 1. 参数校验
        if (request == null || request.getOrderId() == null) {
            return Result.error("订单ID不能为空");
        }
        Long orderId = request.getOrderId();

        // 2. 校验订单是否存在
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            return Result.error("订单不存在");
        }

        // 3. 校验退货条件（仅待发货/已完成订单可退货）
        if (order.getStatus() != 1 && order.getStatus() != 3) {
            return Result.error("仅待发货（1）/已完成（3）订单可申请退货");
        }

        // 4. 调用服务层处理退货
        boolean result = orderService.returnProduct(orderId);
        if (result) {
            return Result.success(true, "退货成功");
        } else {
            return Result.error("退货失败");
        }
    }

    /**
     * 删除购买记录
     * @param orderId 订单ID
     * @return 删除结果
     */
    @DeleteMapping("/delete")
    public Result<Boolean> deletePurchaseRecord(@RequestParam Long orderId) {
        // 1. 参数校验
        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }

        // 2. 校验订单是否存在
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            return Result.error("订单不存在");
        }

        // 3. 调用服务层删除订单
        boolean result = orderService.deletePurchaseRecord(orderId);
        if (result) {
            return Result.success(true, "删除成功");
        } else {
            return Result.error("删除失败");
        }
    }

    /**
     * 取消订单接口
     * @param orderId 订单ID
     * @return 取消结果
     */
    @PutMapping("/cancel")
    public Result<Boolean> cancelOrder(@RequestParam Long orderId) {
        // 1. 参数校验
        if (orderId == null) {
            return Result.error("订单ID不能为空");
        }

        // 2. 校验订单是否存在
        Order order = orderService.getOrderById(orderId);
        if (order == null) {
            return Result.error("订单不存在");
        }

        // 3. 校验取消条件（仅待支付订单可取消）
        if (order.getStatus() != 0) {
            return Result.error("仅待支付（0）订单可取消");
        }

        // 4. 更新订单状态为已取消（4）
        boolean result = orderService.updateOrderStatus(orderId, 4);
        if (result) {
            return Result.success(true, "取消订单成功");
        } else {
            return Result.error("取消订单失败");
        }
    }
}
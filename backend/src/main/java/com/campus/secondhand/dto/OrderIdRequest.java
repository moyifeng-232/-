package com.campus.secondhand.dto;

import lombok.Data;

/**
 * 接收前端传递的订单ID参数（用于退货、取消订单等接口）
 */
@Data
public class OrderIdRequest {
    // 订单ID（和前端传递的字段名 orderId 保持一致）
    private Long orderId;
}
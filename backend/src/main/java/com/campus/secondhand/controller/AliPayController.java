package com.campus.secondhand.controller;

import com.campus.secondhand.common.Result;
import com.campus.secondhand.entity.Order;
import com.campus.secondhand.service.OrderService;
import com.campus.secondhand.util.PayUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * 支付宝支付控制器（修复编译错误版）
 */
@Slf4j
@RestController
@RequestMapping("/api/alipay")
public class AliPayController {

    @Autowired
    private PayUtil payUtil;

    @Autowired
    private OrderService orderService;

    /**
     * 生成支付订单（返回支付宝支付页面HTML）
     * @param orderId 订单ID
     * @return 支付页面HTML字符串
     */
    @PostMapping("/pay")
    public Result<String> pay(@RequestParam Long orderId) {
        try {
            // 1. 校验订单是否存在
            Order order = orderService.getOrderById(orderId);
            if (order == null) {
                return Result.error("订单不存在");
            }

            // 2. 校验订单金额（避免金额为0/负数）
            BigDecimal totalAmount = order.getTotalAmount();
            if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return Result.error("订单金额不合法");
            }

            // 3. 调用支付工具类生成支付页面（金额转String避免精度丢失）
            String payHtml = payUtil.sendRequestToAlipay(
                    order.getOrderNo(), // 订单号（唯一）
                    totalAmount.toString(), // 订单金额（字符串类型）
                    "校园二手交易平台-" + order.getProductId() // 商品名称
            );

            return Result.success(payHtml, "生成支付订单成功");
        } catch (RuntimeException e) {
            // 捕获PayUtil抛出的运行时异常
            log.error("生成支付订单失败：", e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            // 捕获其他未知异常
            log.error("支付接口异常：", e);
            return Result.error("网络异常，请重试");
        }
    }

    /**
     * 同步回调（支付成功后跳转）
     * @param request 请求参数
     * @return 支付结果
     */
    @GetMapping("/return")
    public Result<Map<String, Object>> payReturn(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        // 1. 获取支付宝回调参数
        String outTradeNo = request.getParameter("out_trade_no");
        String tradeNo = request.getParameter("trade_no");
        String tradeStatus = request.getParameter("trade_status");

        // 2. 校验支付状态
        if ("TRADE_SUCCESS".equals(tradeStatus)) {
            // 3. 更新订单状态为已支付（待发货）
            boolean updateResult = orderService.updateOrderStatus(
                    orderService.getOrderByOrderNo(outTradeNo).getId(),
                    1 // 1=待发货
            );
            if (updateResult) {
                result.put("success", true);
                result.put("message", "支付成功");
                result.put("orderNo", outTradeNo);
                result.put("tradeNo", tradeNo);
                return Result.success(result);
            } else {
                result.put("success", false);
                result.put("message", "支付成功，但订单状态更新失败");
                return Result.success(result);
            }
        } else {
            result.put("success", false);
            result.put("message", "支付失败或取消");
            return Result.error("支付失败");
        }
    }

    /**
     * 异步通知（支付宝主动调用，需公网可访问）
     * @param request 请求参数
     * @return 固定返回"success"告知支付宝
     */
    @PostMapping("/notify")
    @ResponseBody
    public String payNotify(HttpServletRequest request) {
        try {
            // 1. 验证签名（PayUtil已集成签名验证，此处简化）
            String outTradeNo = request.getParameter("out_trade_no");
            String tradeStatus = request.getParameter("trade_status");

            // 2. 仅处理支付成功的通知
            if ("TRADE_SUCCESS".equals(tradeStatus)) {
                log.info("支付宝异步通知：订单{}支付成功", outTradeNo);
                // 3. 更新订单状态
                Order order = orderService.getOrderByOrderNo(outTradeNo);
                if (order != null) {
                    orderService.updateOrderStatus(order.getId(), 1);
                }
            }
            // 4. 必须返回"success"，否则支付宝会重复通知
            return "success";
        } catch (Exception e) {
            log.error("支付宝异步通知处理失败：", e);
            // 返回非success，支付宝会重试
            return "fail";
        }
    }

    /**
     * 查询支付状态
     * @param outTradeNo 订单号
     * @return 支付状态
     */
    @GetMapping("/query")
    public Result<String> queryPayStatus(@RequestParam String outTradeNo) {
        try {
            String result = payUtil.query(outTradeNo);
            if (result != null) {
                return Result.success(result, "查询支付状态成功");
            } else {
                return Result.error("查询支付状态失败");
            }
        } catch (Exception e) {
            log.error("查询支付状态异常：", e);
            return Result.error("网络异常，请重试");
        }
    }
}
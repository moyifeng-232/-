package com.campus.secondhand.util;

import com.alibaba.fastjson.JSONObject;
import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.request.AlipayTradePagePayRequest;
import com.alipay.api.request.AlipayTradeQueryRequest;
import com.alipay.api.response.AlipayTradeQueryResponse;
import com.campus.secondhand.service.OrderService;
import com.alipay.api.internal.util.AlipaySignature;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

/**
 * 支付宝支付工具类（完整可运行版）
 */
@Slf4j
@Component // 核心：注册为Spring Bean
public class PayUtil {
    @Autowired
    private OrderService orderService; // 确保OrderService有@Service注解

    // 支付宝配置（沙箱环境）
    private final String APP_ID = "9021000158678807";
    private final String APP_PRIVATE_KEY = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCwi24d1ID4HtgQmxsi6wOPplRXGhOOQnvwkECvUIzpWOYcRSVFJ54CbplwAxIou+4So0tOCgwtnjjQk0VnRat5wZuzTy5scn4HCd/Kr8a3OlrKFG/AormVlLlC7Wwej1tdAcwXczyMg6D7Seu+HdUQU22kjz+WhsiRPvyKChZMNrRliLVgTeRwk1xty99Ehsz4+nsXdIn8XtxHbE8BbkYYYn5yz6qxIhgwK+1WrQgdRhpAqcKFmBhcagaHLiKfVj2SHaYd1yR2An8QaLBYmDfHAR0QTkQrTR5PHSJ/LzgDAdoUNkSrIjV3Qtwzb3aa0EUhdHxx4Ia875lJ7oH6RdQNAgMBAAECggEBAJRCc5ZPiINWe8LuTwqy7ImteDSxrGySvrzWl8vizIOGabCiDNuXmqWWNfsQSSa2NAeo5KvD2lhRAIuAsg85PfkBM32Q6H6gY+ALVcpEdZAYTHhaU0MmJM5OWIqxElRTtblUsg2bc+TZAc8mU/iT2wNb3L8OoasKw9LeX3yZXgJfpK0xRR4mSGf6gZSQo0x6mswxFbZjWIXvgkrwH1Ke/teKeNROoKR7evaFrJ99QMNDz5DPwYYt8BDnzdSxsOEinFsNoXxYco15aRfHNRbePiORriVGBH59IW7+Pfp1bHSQE0cNBedZYqGXVnb7kj/rkPhubQHN5smd/2Cp7IJuY60CgYEA4sYodgaYkj374H6YKwoFCpQePEITMDcI9QSQAL3fdgJisnSst1cNH+svuVguviAz/aziPML4rkUPCnGHPW+4jnRF4f69GRAZC0sXQB9vNIbK7RJTCFSjHyfKmg5xnX5hf9dU2wDvrzdSxFcDhjkgGhzHPqNg/khKv6IUXlttef8CgYEAx0wUIohvPrKakL6WyNMQgWCfmcj9Fv044KF94EhIP6qQYTdA+JfwxmpjjpDT08/wpm7cDpPKREtnxc4M3ZdOxT6zVDyG410cksRV1HYA+4omw8NfblT6ysrCvm5HNiP8b/Rml6IPiVtlM5+zrm1HxHuCXzd4xZKlhlKNk3ZO+fMCgYBoyHslngKdgDqEDrqtGGIf8zTNTxKisqtW25bWYOWCF7QXFUZBKN4No5RXpeFjRGoBiwK2ZLiXfZ1ni/Gbd6XlXOB1fklN7VxFFZtWq6+sq6PUSyVGsiT1XmOFL6tbxGu0sICq+RHG+l8qDbK5MGge6LE/xiopFKpFRdT3jHNXbQKBgQCXwR+H2BnVRQya8PVCAC2ORnPhFwFYswLPUUjXMlMJX6hGzlsDsDaf7zzVvwP9QlY9dSbNVs3qyPxAy5BSXzeUzBSjLN+NW0Y5n5S3jg9beivgXvFYww6gwlodxT0mRaqf2RsRlU59SgG6mH2qcP336BAyzruAvhSaPlwdkDW87wKBgGtreKbu2GLXLsCreeD5ID6bqlrRyDHz6ABRjSvoi4/P6naQyNhYQGSQAnaOpWnMrHfHNpwR7yrcET+gAzlJZ23VQxC8hOl60yDoPKuhbF4pN+eefajBqv5PAKAwCThowWZu1NiVg3mkvK6sX61ox5j9Yhf0eFoZCfYacJHJ5Nsn";
    private final String CHARSET = "UTF-8";
    private final String ALIPAY_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApN8eW/5gzSWFb6cYLK8whH39NbNtNAVHdDy4SK9GoBSgmLeRUF2azZQDsxHGdCR9rhc+k13ni9OJD66iI2Dx2sPyZkJFwSlmVjjk3HDsWrL5lk5R7LO8gFG8AAfw8VAmsRImF7Wuu3Il4t6hpyZp5GvOCAs72+l+GF6x8FD168hVh5AjGZw7HWsi0Cz7h4BKLN8ihNRDJL55xGsBmlAG/nBm/8Lt+/YSD4olivX2WYYWczawFfamOfMuC2lwwmbla+fFZXClgqUem2Cp5E+FZSvSwd/N7mimCne6XMmBdk0akGlG+WIChzQwgNiuVfj7IsLj6F+Y6M1/7syaM4DIVQIDAQAB";
    private final String GATEWAY_URL = "https://openapi-sandbox.dl.alipaydev.com/gateway.do";
    private final String FORMAT = "JSON";
    private final String SIGN_TYPE = "RSA2";
    private final String NOTIFY_URL = "http://t9c38a67.natappfree.cc/api/alipay/notify";
    private final String RETURN_URL = "http://localhost:3000/pay-result";

    // 懒加载支付宝客户端
    private volatile AlipayClient alipayClient;

    /**
     * 获取支付宝客户端（线程安全）
     */
    private AlipayClient getAlipayClient() {
        if (alipayClient == null) {
            synchronized (this) {
                if (alipayClient == null) {
                    alipayClient = new DefaultAlipayClient(
                            GATEWAY_URL, APP_ID, APP_PRIVATE_KEY,
                            FORMAT, CHARSET, ALIPAY_PUBLIC_KEY, SIGN_TYPE
                    );
                }
            }
        }
        return alipayClient;
    }

    /**
     * 生成支付宝支付页面HTML
     */
    public String sendRequestToAlipay(String outTradeNo, String totalAmount, String subject) {
        try {
            AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
            request.setReturnUrl(RETURN_URL);
            request.setNotifyUrl(NOTIFY_URL);

            JSONObject bizContent = new JSONObject();
            bizContent.put("out_trade_no", outTradeNo);
            bizContent.put("total_amount", totalAmount);
            bizContent.put("subject", subject);
            bizContent.put("body", "校园二手交易平台订单");
            bizContent.put("product_code", "FAST_INSTANT_TRADE_PAY");
            request.setBizContent(bizContent.toJSONString());

            String payHtml = getAlipayClient().pageExecute(request).getBody();
            log.info("支付宝返回HTML：{}", payHtml);
            return payHtml;
        } catch (AlipayApiException e) {
            log.error("支付请求失败：{}", e.getErrMsg(), e);
            throw new RuntimeException("生成支付订单失败：" + e.getErrMsg());
        }
    }

    /**
     * 查询支付状态
     */
    public String query(String outTradeNo) {
        try {
            AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();
            JSONObject bizContent = new JSONObject();
            bizContent.put("out_trade_no", outTradeNo);
            request.setBizContent(bizContent.toJSONString());

            AlipayTradeQueryResponse response = getAlipayClient().execute(request);
            if (response.isSuccess()) {
                log.info("查询成功：{}", response.getBody());
                return response.getBody();
            } else {
                log.error("查询失败：{}", response.getSubMsg());
                return null;
            }
        } catch (AlipayApiException e) {
            log.error("查询异常：{}", e.getErrMsg(), e);
            return null;
        }
    }

    /**
     * 重载方法：兼容数字金额
     */
    public String sendRequestToAlipay(String outTradeNo, Number totalAmount, String subject) {
        return sendRequestToAlipay(outTradeNo, totalAmount.toString(), subject);
    }

    /**
     * 验证支付宝回调签名（标准实现，必须替换你当前的空方法）
     */
    public boolean verifyAlipaySign(HttpServletRequest request) {
        try {
            // 1. 提取支付宝回调传递的所有参数（封装为键值对Map）
            Map<String, String> params = new HashMap<>();
            Map<String, String[]> requestParams = request.getParameterMap();

            for (Iterator<String> iter = requestParams.keySet().iterator(); iter.hasNext(); ) {
                String name = iter.next();
                String[] values = requestParams.get(name);
                String valueStr = "";

                for (int i = 0; i < values.length; i++) {
                    valueStr = (i == values.length - 1) ? valueStr + values[i] : valueStr + values[i] + ",";
                }
                // 去除参数值首尾空格，避免格式问题导致校验失败
                params.put(name, valueStr.trim());
            }

            // 2. 调用支付宝SDK的标准方法进行签名验证
            // 参数说明：请求参数Map、支付宝公钥、编码格式、签名算法（与你的配置一致）
            return AlipaySignature.rsaCheckV1(
                    params,
                    ALIPAY_PUBLIC_KEY,
                    CHARSET,
                    SIGN_TYPE
            );
        } catch (Exception e) {
            // 捕获校验过程中的异常（如参数格式错误、密钥不匹配等）
            log.error("支付宝签名验证异常：", e);
            return false;
        }
    }
}
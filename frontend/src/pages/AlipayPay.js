import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createAlipayOrder, queryAlipayStatus, refreshOrderStatus } from '../api/alipayApi';

const AlipayPay = () => {
    // 路由参数（获取orderId）
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 状态管理
    const [payHtml, setPayHtml] = useState(''); // 支付宝支付页面HTML
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [payResult, setPayResult] = useState(null); // 支付结果
    const outTradeNo = useRef(''); // 支付订单号
    const timerRef = useRef(null); // 轮询定时器
    const payContainerRef = useRef(null); // 支付容器Ref

    // 初始化：生成支付订单
    const initPay = async () => {
        const orderId = searchParams.get('orderId');
        if (!orderId) {
            setErrorMsg('订单ID不能为空');
            setLoading(false);
            return;
        }

        try {
            // 调用后端生成支付订单接口
            const res = await createAlipayOrder(orderId);
            if (res.code === 200) {
                setPayHtml(res.data); // 渲染支付宝支付页面
                outTradeNo.current = extractOutTradeNo(res.data); // 提取支付订单号

                // 关键修复：手动触发表单提交（替代支付宝自动脚本）
                setTimeout(() => {
                    if (payContainerRef.current) {
                        const form = payContainerRef.current.querySelector('form');
                        if (form) {
                            form.submit(); // 强制提交表单跳转到支付宝
                        }
                    }
                }, 100);

                // 启动轮询查询支付状态
                startPolling();
            } else {
                setErrorMsg(res.message || '生成支付订单失败');
            }
        } catch (err) {
            setErrorMsg('网络异常，请重试');
            console.error('生成支付订单失败：', err);
        } finally {
            setLoading(false);
        }
    };

    // 提取支付订单号（从支付宝HTML中解析）
    const extractOutTradeNo = (html) => {
        const reg = /out_trade_no=['"](\w+)['"]/;
        const match = html.match(reg);
        return match ? match[1] : '';
    };

    // 轮询查询支付状态（每3秒查一次，持续60秒）
    const startPolling = () => {
        let count = 0;
        timerRef.current = setInterval(async () => {
            if (count >= 20) { // 60秒后停止轮询
                clearInterval(timerRef.current);
                return;
            }
            if (!outTradeNo.current) return;

            try {
                const res = await queryAlipayStatus(outTradeNo.current);
                if (res.code === 200) {
                    const resultData = JSON.parse(res.data); // 解析支付宝返回的JSON
                    const tradeStatus = resultData.trade_status;
                    // 支付成功/完成
                    if (['TRADE_SUCCESS', 'TRADE_FINISHED'].includes(tradeStatus)) {
                        setPayResult({
                            success: true,
                            outTradeNo: outTradeNo.current,
                            tradeStatus
                        });
                        clearInterval(timerRef.current);
                        // 刷新订单状态
                        await refreshOrderStatus(searchParams.get('orderId'));
                    }
                    // 支付关闭/超时
                    else if (['TRADE_CLOSED', 'WAIT_BUYER_PAY'].includes(tradeStatus) && count >= 19) {
                        setPayResult({
                            success: false,
                            outTradeNo: outTradeNo.current,
                            tradeStatus
                        });
                        clearInterval(timerRef.current);
                    }
                }
            } catch (err) {
                console.error('查询支付状态失败：', err);
            }
            count++;
        }, 3000);
    };

    // 重新支付
    const retryPay = () => {
        setPayResult(null);
        setLoading(true);
        initPay();
    };

    // 返回订单列表
    const goBack = () => {
        navigate('/purchases');
    };

    // 跳转到订单详情
    const goToOrderDetail = () => {
        navigate('/purchases');
    };

    // 生命周期
    useEffect(() => {
        // 检查用户是否登录
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }

        initPay();
        // 组件卸载时清除定时器
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [navigate]);

    if (loading && !errorMsg) {
        return (
            <div className="loading">
                <p>正在生成支付订单...</p>
            </div>
        );
    }

    return (
        <div className="alipay-pay-container">
            {/* 关键修复：添加ref，确保能获取到渲染后的DOM */}
            {payHtml && !payResult && (
                <div
                    ref={payContainerRef}
                    className="alipay-html"
                    dangerouslySetInnerHTML={{ __html: payHtml }}
                    style={{ width: '100%', height: '100vh' }}
                ></div>
            )}

            {/* 错误提示 */}
            {errorMsg && (
                <div className="error-message">
                    <p>{errorMsg}</p>
                    <button onClick={goBack} className="back-btn">返回已购买列表</button>
                </div>
            )}

            {/* 支付结果 */}
            {payResult && (
                <div className="pay-result">
                    {payResult.success ? (
                        <div className="success">
                            <span className="icon">✓</span>
                            <h3>支付成功！</h3>
                            <p>订单号：{payResult.outTradeNo}</p>
                            <button onClick={goToOrderDetail} className="detail-btn">查看订单详情</button>
                        </div>
                    ) : (
                        <div className="fail">
                            <span className="icon">✗</span>
                            <h3>支付失败/已取消</h3>
                            <p>状态：{payResult.tradeStatus}</p>
                            <button onClick={retryPay} className="retry-btn">重新支付</button>
                            <button onClick={goBack} className="back-btn">返回已购买列表</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlipayPay;
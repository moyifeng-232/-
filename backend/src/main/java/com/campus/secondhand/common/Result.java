package com.campus.secondhand.common;

/**
 * 通用返回结果类
 * 适配项目的统一响应格式
 */
public class Result<T> {
    // 状态码（200成功，500失败）
    private int code;
    // 响应消息
    private String message;
    // 响应数据
    private T data;

    // 私有构造方法
    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // 成功响应（带数据 + 自定义消息）✅ 新增
    public static <T> Result<T> success(T data, String message) {
        return new Result<>(200, message, data);
    }

    // 成功响应（带数据，默认消息）
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data);
    }

    // 成功响应（无数据，默认消息）
    public static <T> Result<T> success() {
        return new Result<>(200, "操作成功", null);
    }

    // 成功响应（无数据 + 自定义消息）✅ 新增（可选，提升灵活性）
    public static <T> Result<T> success(String message) {
        return new Result<>(200, message, null);
    }

    // 失败响应
    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }

    // 失败响应（自定义状态码）
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    // getter/setter
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
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
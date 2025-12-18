package com.campus.secondhand.controller;

import com.campus.secondhand.entity.User;
import com.campus.secondhand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户Controller
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 用户登录
     * @param loginRequest 登录请求
     * @return 登录结果
     */
    @PostMapping("/login")
    public Result login(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        
        // 先检查用户名和密码是否正确（不考虑状态）
        User user = userService.findByUsername(username);
        if (user == null) {
            return Result.error("用户名或密码错误");
        }
        
        // 检查密码是否正确
        if (!user.getPassword().equals(password)) {
            return Result.error("用户名或密码错误");
        }
        
        // 检查用户状态
        if (user.getStatus() == 0) {
            return Result.error("账号待审核，请等待管理员审核");
        }
        
        if (user.getStatus() == 2) {
            return Result.error("账号已被禁用，请联系管理员");
        }
        
        // 状态正常，登录成功
        return Result.success(user, "登录成功");
    }
    
    /**
     * 登录请求类
     */
    static class LoginRequest {
        private String username;
        private String password;
        
        // getter and setter
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getPassword() {
            return password;
        }
        
        public void setPassword(String password) {
            this.password = password;
        }
    }

    /**
     * 用户注册
     * @param user 用户信息
     * @return 注册结果
     */
    @PostMapping("/register")
    public Result register(@RequestBody User user) {
        boolean result = userService.register(user);
        if (result) {
            return Result.success("注册成功，请等待审核");
        } else {
            return Result.error("用户名或学号已存在");
        }
    }

    /**
     * 获取用户信息
     * @param id 用户ID
     * @return 用户信息
     */
    @GetMapping("/info")
    public Result getUserInfo(@RequestParam Long id) {
        User user = userService.getById(id);
        if (user != null) {
            return Result.success(user);
        } else {
            return Result.error("用户不存在");
        }
    }

    /**
     * 更新用户信息
     * @param user 用户信息
     * @return 更新结果
     */
    @PutMapping("/update")
    public Result updateUserInfo(@RequestBody User user) {
        boolean result = userService.updateUserInfo(user);
        if (result) {
            return Result.success("更新成功");
        } else {
            return Result.error("更新失败");
        }
    }

    /**
     * 通用结果类
     */
    static class Result {
        private Integer code;
        private String message;
        private Object data;

        public Result() {
        }

        public Result(Integer code, String message, Object data) {
            this.code = code;
            this.message = message;
            this.data = data;
        }

        public static Result success(Object data, String message) {
            return new Result(200, message, data);
        }

        public static Result success(String message) {
            return new Result(200, message, null);
        }

        public static Result success(Object data) {
            return new Result(200, "success", data);
        }

        public static Result error(String message) {
            return new Result(500, message, null);
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

        public Object getData() {
            return data;
        }

        public void setData(Object data) {
            this.data = data;
        }
    }

}
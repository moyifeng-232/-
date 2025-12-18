package com.campus.secondhand.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.secondhand.entity.User;

/**
 * 用户Service接口
 */
public interface UserService extends IService<User> {

    /**
     * 用户登录
     * @param username 用户名
     * @param password 密码
     * @return 用户信息
     */
    User login(String username, String password);

    /**
     * 用户注册
     * @param user 用户信息
     * @return 注册结果
     */
    boolean register(User user);

    /**
     * 更新用户信息
     * @param user 用户信息
     * @return 更新结果
     */
    boolean updateUserInfo(User user);

    /**
     * 根据用户名查询用户
     * @param username 用户名
     * @return 用户信息
     */
    User findByUsername(String username);

    /**
     * 根据学号查询用户
     * @param studentId 学号
     * @return 用户信息
     */
    User findByStudentId(String studentId);

}
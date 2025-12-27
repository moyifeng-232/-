package com.campus.secondhand.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.secondhand.entity.User;
import java.util.List;

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
    
    /**
     * 获取待审核的商家用户申请
     * @return 待审核用户列表
     */
    List<User> getPendingMerchantApplications();
    
    /**
     * 审核商家用户申请
     * @param userId 用户ID
     * @param approved 是否通过
     * @return 审核结果
     */
    boolean reviewMerchantApplication(Long userId, boolean approved);
    
    /**
     * 获取所有用户列表
     * @return 用户列表
     */
    List<User> getAllUsers();
    
    /**
     * 封禁/解封用户
     * @param userId 用户ID
     * @param status 状态：1正常，2禁用
     * @return 操作结果
     */
    boolean updateUserStatus(Long userId, Integer status);
    
    /**
     * 申请成为商家用户
     * @param userId 用户ID
     * @return 申请结果
     */
    boolean applyForMerchant(Long userId);

    /**
     * 搜索用户
     * @param searchType 搜索类型：id、username、realName、studentId
     * @param keyword 搜索关键词
     * @return 用户列表
     */
    List<User> searchUsers(String searchType, String keyword);

}
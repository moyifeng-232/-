package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.mapper.UserMapper;
import com.campus.secondhand.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户Service实现类
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public User login(String username, String password) {
        // 先检查用户名和密码是否正确，不考虑状态
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username)
                .eq("password", password);
        User user = baseMapper.selectOne(queryWrapper);
        
        // 如果用户存在，但状态不是正常（1），也返回null，让Controller处理提示信息
        return user != null && user.getStatus() == 1 ? user : null;
    }

    @Override
    public boolean register(User user) {
        // 检查用户名是否已存在
        if (findByUsername(user.getUsername()) != null) {
            return false;
        }
        // 检查学号是否已存在
        if (findByStudentId(user.getStudentId()) != null) {
            return false;
        }
        // 设置默认状态为正常（1），方便测试
        user.setStatus(1);
        // 设置默认用户类型为普通用户（0）
        user.setUserType(0);
        // 设置默认信誉等级为0
        user.setCreditLevel(0);
        // 插入用户
        return save(user);
    }

    @Override
    public boolean updateUserInfo(User user) {
        return updateById(user);
    }

    @Override
    public User findByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        return baseMapper.selectOne(queryWrapper);
    }

    @Override
    public User findByStudentId(String studentId) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("student_id", studentId);
        return baseMapper.selectOne(queryWrapper);
    }

    @Override
    public List<User> getPendingMerchantApplications() {
        // 查询待审核的商家用户申请：userType=0（普通用户）且status=0（待审核）
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_type", 0)
                .eq("status", 0);
        return baseMapper.selectList(queryWrapper);
    }

    @Override
    public boolean reviewMerchantApplication(Long userId, boolean approved) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        
        if (approved) {
            // 审核通过：设置为商家用户，状态正常
            user.setUserType(1); // 1表示商家用户
            user.setStatus(1); // 1表示正常
        } else {
            // 审核拒绝：保持普通用户，状态正常
            user.setStatus(1); // 1表示正常
        }
        
        return updateById(user);
    }

    @Override
    public List<User> getAllUsers() {
        // 查询所有用户，按ID倒序排序
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("id");
        return baseMapper.selectList(queryWrapper);
    }

    @Override
    public boolean updateUserStatus(Long userId, Integer status) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        
        // 只能更新状态，不能修改其他信息
        user.setStatus(status);
        return updateById(user);
    }
    
    @Override
    public boolean applyForMerchant(Long userId) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        
        // 只有普通用户才能申请成为商家用户
        if (user.getUserType() != 0) {
            return false;
        }
        
        // 将用户状态设置为待审核
        user.setStatus(0);
        return updateById(user);
    }

}
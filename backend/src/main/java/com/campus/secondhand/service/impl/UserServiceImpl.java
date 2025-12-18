package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.mapper.UserMapper;
import com.campus.secondhand.service.UserService;
import org.springframework.stereotype.Service;

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

}
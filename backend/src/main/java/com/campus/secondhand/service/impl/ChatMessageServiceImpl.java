package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.ChatMessage;
import com.campus.secondhand.mapper.ChatMessageMapper;
import com.campus.secondhand.service.ChatMessageService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 对话消息Service实现类
 */
@Service
public class ChatMessageServiceImpl extends ServiceImpl<ChatMessageMapper, ChatMessage> implements ChatMessageService {
    
    @Override
    public List<ChatMessage> getChatHistory(Long userId1, Long userId2) {
        return baseMapper.getChatHistory(userId1, userId2);
    }
    
    @Override
    public List<Long> getChatUsers(Long userId) {
        return baseMapper.getChatUsers(userId);
    }
    
    @Override
    public boolean updateMessageReadStatus(Long senderId, Long receiverId) {
        return baseMapper.updateMessageReadStatus(senderId, receiverId) > 0;
    }
    
    @Override
    public int getUnreadMessageCount(Long userId) {
        return baseMapper.getUnreadMessageCount(userId);
    }
    
    @Override
    public boolean sendMessage(ChatMessage message) {
        // 设置默认状态
        message.setReadStatus(0); // 未读
        return save(message);
    }
}

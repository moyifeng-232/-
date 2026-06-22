package com.campus.secondhand.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.secondhand.entity.ChatMessage;

import java.util.List;

/**
 * 对话消息Service
 */
public interface ChatMessageService extends IService<ChatMessage> {
    
    /**
     * 获取两个用户之间的对话记录
     * @param userId1 用户1 ID
     * @param userId2 用户2 ID
     * @return 对话记录列表
     */
    List<ChatMessage> getChatHistory(Long userId1, Long userId2);
    
    /**
     * 获取用户的所有对话对象ID
     * @param userId 用户ID
     * @return 对话对象ID列表
     */
    List<Long> getChatUsers(Long userId);
    
    /**
     * 更新消息为已读
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @return 更新结果
     */
    boolean updateMessageReadStatus(Long senderId, Long receiverId);
    
    /**
     * 获取用户未读消息数量
     * @param userId 用户ID
     * @return 未读消息数量
     */
    int getUnreadMessageCount(Long userId);
    
    /**
     * 发送消息
     * @param message 消息对象
     * @return 发送结果
     */
    boolean sendMessage(ChatMessage message);
}

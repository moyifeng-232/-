package com.campus.secondhand.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.campus.secondhand.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 对话消息Mapper
 */
@Mapper
public interface ChatMessageMapper extends BaseMapper<ChatMessage> {
    
    /**
     * 获取两个用户之间的对话记录
     * @param userId1 用户1 ID
     * @param userId2 用户2 ID
     * @return 对话记录列表
     */
    List<ChatMessage> getChatHistory(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    /**
     * 获取用户的所有对话对象
     * @param userId 用户ID
     * @return 对话对象列表
     */
    List<Long> getChatUsers(@Param("userId") Long userId);
    
    /**
     * 更新消息为已读
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @return 更新结果
     */
    int updateMessageReadStatus(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
    
    /**
     * 获取用户未读消息数量
     * @param userId 用户ID
     * @return 未读消息数量
     */
    int getUnreadMessageCount(@Param("userId") Long userId);
}

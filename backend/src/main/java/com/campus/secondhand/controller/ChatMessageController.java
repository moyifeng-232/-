package com.campus.secondhand.controller;

import com.campus.secondhand.common.Result;
import com.campus.secondhand.entity.ChatMessage;
import com.campus.secondhand.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 对话消息Controller
 */
@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {
    
    @Autowired
    private ChatMessageService chatMessageService;
    
    /**
     * 获取两个用户之间的对话记录
     * @param userId1 用户1 ID
     * @param userId2 用户2 ID
     * @return 对话记录列表
     */
    @GetMapping("/history")
    public Result getChatHistory(@RequestParam Long userId1, @RequestParam Long userId2) {
        List<ChatMessage> chatHistory = chatMessageService.getChatHistory(userId1, userId2);
        return Result.success(chatHistory, "获取对话记录成功");
    }
    
    /**
     * 发送消息
     * @param message 消息对象
     * @return 发送结果
     */
    @PostMapping("/send")
    public Result sendMessage(@RequestBody ChatMessage message) {
        boolean result = chatMessageService.sendMessage(message);
        if (result) {
            return Result.success("发送消息成功");
        } else {
            return Result.error("发送消息失败");
        }
    }
    
    /**
     * 获取用户的所有对话对象ID
     * @param userId 用户ID
     * @return 对话对象ID列表
     */
    @GetMapping("/users")
    public Result getChatUsers(@RequestParam Long userId) {
        List<Long> chatUsers = chatMessageService.getChatUsers(userId);
        return Result.success(chatUsers, "获取对话对象列表成功");
    }
    
    /**
     * 更新消息为已读
     * @param senderId 发送者ID
     * @param receiverId 接收者ID
     * @return 更新结果
     */
    @PutMapping("/read")
    public Result updateMessageReadStatus(@RequestParam Long senderId, @RequestParam Long receiverId) {
        boolean result = chatMessageService.updateMessageReadStatus(senderId, receiverId);
        if (result) {
            return Result.success("更新消息状态成功");
        } else {
            return Result.error("更新消息状态失败");
        }
    }
    
    /**
     * 获取用户未读消息数量
     * @param userId 用户ID
     * @return 未读消息数量
     */
    @GetMapping("/unread-count")
    public Result getUnreadMessageCount(@RequestParam Long userId) {
        int count = chatMessageService.getUnreadMessageCount(userId);
        return Result.success(count, "获取未读消息数量成功");
    }
}

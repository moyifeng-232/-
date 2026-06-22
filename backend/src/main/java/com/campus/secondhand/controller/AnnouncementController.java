package com.campus.secondhand.controller;

import com.campus.secondhand.dto.AnnouncementDto;
import com.campus.secondhand.service.AnnouncementService;
import com.campus.secondhand.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 公告Controller
 */
@RestController
@RequestMapping("/api/announcement")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    /**
     * 获取所有已发布的公告
     * @return 公告列表
     */
    @GetMapping("/list")
    public Result<List<AnnouncementDto>> getAllPublishedAnnouncements() {
        List<AnnouncementDto> announcements = announcementService.getAllPublishedAnnouncements();
        return Result.success(announcements, "获取公告列表成功");
    }

    /**
     * 获取重点展示的公告
     * @return 重点公告
     */
    @GetMapping("/featured")
    public Result<AnnouncementDto> getFeaturedAnnouncement() {
        AnnouncementDto announcement = announcementService.getFeaturedAnnouncement();
        return Result.success(announcement, "获取重点公告成功");
    }

    /**
     * 获取公告详情
     * @param id 公告ID
     * @return 公告详情
     */
    @GetMapping("/detail")
    public Result<AnnouncementDto> getAnnouncementById(@RequestParam Long id) {
        AnnouncementDto announcement = announcementService.getAnnouncementById(id);
        if (announcement != null) {
            return Result.success(announcement, "获取公告详情成功");
        } else {
            return Result.error("公告不存在");
        }
    }

    /**
     * 管理员：获取所有公告（包括已撤销）
     * @return 公告列表
     */
    @GetMapping("/admin/list")
    public Result<List<AnnouncementDto>> getAllAnnouncements() {
        List<AnnouncementDto> announcements = announcementService.getAllAnnouncements();
        return Result.success(announcements, "获取所有公告成功");
    }

    /**
     * 管理员：发布公告
     * @param announcementDto 公告信息
     * @return 发布结果
     */
    @PostMapping("/admin/publish")
    public Result<Boolean> publishAnnouncement(@RequestBody AnnouncementDto announcementDto) {
        boolean success = announcementService.publishAnnouncement(announcementDto);
        if (success) {
            return Result.success(true, "发布公告成功");
        } else {
            return Result.error("发布公告失败");
        }
    }

    /**
     * 管理员：撤销公告
     * @param id 公告ID
     * @return 撤销结果
     */
    @PutMapping("/admin/revoke")
    public Result<Boolean> revokeAnnouncement(@RequestParam Long id) {
        boolean success = announcementService.revokeAnnouncement(id);
        if (success) {
            return Result.success(true, "撤销公告成功");
        } else {
            return Result.error("撤销公告失败");
        }
    }

    /**
     * 管理员：设置重点公告
     * @param id 公告ID
     * @return 设置结果
     */
    @PutMapping("/admin/featured")
    public Result<Boolean> setFeaturedAnnouncement(@RequestParam Long id) {
        boolean success = announcementService.setFeaturedAnnouncement(id);
        if (success) {
            return Result.success(true, "设置重点公告成功");
        } else {
            return Result.error("设置重点公告失败");
        }
    }
}

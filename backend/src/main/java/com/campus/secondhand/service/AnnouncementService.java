package com.campus.secondhand.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.campus.secondhand.entity.Announcement;
import com.campus.secondhand.dto.AnnouncementDto;

import java.util.List;

/**
 * 公告Service接口
 */
public interface AnnouncementService extends IService<Announcement> {
    /**
     * 获取所有已发布的公告
     * @return 公告列表
     */
    List<AnnouncementDto> getAllPublishedAnnouncements();

    /**
     * 获取重点展示的公告
     * @return 重点公告
     */
    AnnouncementDto getFeaturedAnnouncement();

    /**
     * 发布公告
     * @param announcementDto 公告信息
     * @return 是否发布成功
     */
    boolean publishAnnouncement(AnnouncementDto announcementDto);

    /**
     * 撤销公告
     * @param id 公告ID
     * @return 是否撤销成功
     */
    boolean revokeAnnouncement(Long id);

    /**
     * 设置重点公告
     * @param id 公告ID
     * @return 是否设置成功
     */
    boolean setFeaturedAnnouncement(Long id);

    /**
     * 获取公告详情
     * @param id 公告ID
     * @return 公告详情
     */
    AnnouncementDto getAnnouncementById(Long id);

    /**
     * 获取所有公告（包括已撤销）
     * @return 公告列表
     */
    List<AnnouncementDto> getAllAnnouncements();
}

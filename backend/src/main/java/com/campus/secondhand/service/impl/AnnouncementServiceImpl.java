package com.campus.secondhand.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.campus.secondhand.entity.Announcement;
import com.campus.secondhand.mapper.AnnouncementMapper;
import com.campus.secondhand.service.AnnouncementService;
import com.campus.secondhand.dto.AnnouncementDto;
import com.campus.secondhand.entity.User;
import com.campus.secondhand.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 公告Service实现类
 */
@Service
public class AnnouncementServiceImpl extends ServiceImpl<AnnouncementMapper, Announcement> implements AnnouncementService {

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 将Announcement实体转换为AnnouncementDto
     */
    private AnnouncementDto convertToDto(Announcement announcement) {
        AnnouncementDto dto = new AnnouncementDto();
        BeanUtils.copyProperties(announcement, dto);

        // 转换图片URLs
        if (announcement.getImageUrls() != null) {
            try {
                List<String> imageUrls = objectMapper.readValue(announcement.getImageUrls(), List.class);
                dto.setImageUrls(imageUrls);
            } catch (JsonProcessingException e) {
                dto.setImageUrls(new ArrayList<>());
            }
        }

        // 获取发布者用户名
        User publisher = userService.getById(announcement.getPublisherId());
        if (publisher != null) {
            dto.setPublisherUsername(publisher.getUsername());
        }

        return dto;
    }

    @Override
    public List<AnnouncementDto> getAllPublishedAnnouncements() {
        List<Announcement> announcements = lambdaQuery()
                .eq(Announcement::getStatus, 1)
                .orderByDesc(Announcement::getCreateTime)
                .list();

        List<AnnouncementDto> dtos = new ArrayList<>();
        for (Announcement announcement : announcements) {
            dtos.add(convertToDto(announcement));
        }
        return dtos;
    }

    @Override
    public AnnouncementDto getFeaturedAnnouncement() {
        Announcement announcement = lambdaQuery()
                .eq(Announcement::getStatus, 1)
                .eq(Announcement::getIsFeatured, 1)
                .one();
        return announcement != null ? convertToDto(announcement) : null;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean publishAnnouncement(AnnouncementDto announcementDto) {
        Announcement announcement = new Announcement();
        BeanUtils.copyProperties(announcementDto, announcement);

        // 处理图片URLs
        if (announcementDto.getImageUrls() != null && !announcementDto.getImageUrls().isEmpty()) {
            try {
                announcement.setImageUrls(objectMapper.writeValueAsString(announcementDto.getImageUrls()));
            } catch (JsonProcessingException e) {
                announcement.setImageUrls(null);
            }
        }

        announcement.setStatus(1); // 已发布
        boolean success = save(announcement);

        // 如果设置为重点公告，先取消其他所有公告的重点展示
        if (success && announcementDto.getIsFeatured() == 1) {
            lambdaUpdate()
                    .ne(Announcement::getId, announcement.getId())
                    .set(Announcement::getIsFeatured, 0)
                    .update();
        }

        return success;
    }

    @Override
    public boolean revokeAnnouncement(Long id) {
        return lambdaUpdate()
                .eq(Announcement::getId, id)
                .set(Announcement::getStatus, 0)
                .update();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean setFeaturedAnnouncement(Long id) {
        // 先取消所有公告的重点展示
        lambdaUpdate()
                .set(Announcement::getIsFeatured, 0)
                .update();

        // 设置当前公告为重点展示
        return lambdaUpdate()
                .eq(Announcement::getId, id)
                .set(Announcement::getIsFeatured, 1)
                .update();
    }

    @Override
    public AnnouncementDto getAnnouncementById(Long id) {
        Announcement announcement = getById(id);
        return announcement != null ? convertToDto(announcement) : null;
    }

    @Override
    public List<AnnouncementDto> getAllAnnouncements() {
        List<Announcement> announcements = lambdaQuery()
                .orderByDesc(Announcement::getCreateTime)
                .list();

        List<AnnouncementDto> dtos = new ArrayList<>();
        for (Announcement announcement : announcements) {
            dtos.add(convertToDto(announcement));
        }
        return dtos;
    }
}

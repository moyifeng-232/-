package com.campus.secondhand.controller;

import com.campus.secondhand.common.Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 文件上传控制器
 */
@RestController
@RequestMapping("/api/file")
public class FileController {

    /**
     * 图片上传目录，从配置文件读取或使用默认值
     * 使用绝对路径，确保在任何环境下都能正确保存文件
     */
    @Value("${file.upload-dir:d:/uploads}")
    private String uploadDir;

    /**
     * 图片访问基础URL
     */
    @Value("${file.access-url:http://localhost:8080}")
    private String accessUrl;

    /**
     * 上传多张图片
     * @param files 上传的图片文件数组
     * @return 上传结果，包含图片URL列表
     */
    @PostMapping("/upload")
    public Result<List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        List<String> imageUrls = new ArrayList<>();

        // 创建上传目录（如果不存在）
        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
        }

        try {
            // 处理每张上传的图片
            for (MultipartFile file : files) {
                // 验证文件是否为空
                if (file.isEmpty()) {
                    continue;
                }

                // 生成唯一文件名，避免重复
                String originalFilename = file.getOriginalFilename();
                String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
                String fileName = UUID.randomUUID().toString() + suffix;

                // 保存文件到上传目录
                File dest = new File(uploadDir + File.separator + fileName);
                file.transferTo(dest);

                // 生成图片访问URL
                String imageUrl = accessUrl + "/uploads/" + fileName;
                imageUrls.add(imageUrl);
            }

            return Result.success(imageUrls, "图片上传成功");
        } catch (IOException e) {
            return Result.error("图片上传失败：" + e.getMessage());
        }
    }
}

package com.campus.secondhand.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 静态资源配置类
 * 用于配置静态资源访问路径，包括上传的图片
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    /**
     * 图片上传目录，从配置文件读取或使用默认值
     * 使用绝对路径，确保在任何环境下都能正确访问文件
     */
    @Value("${file.upload-dir:d:/uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源访问路径
        // 前端访问：http://localhost:8080/uploads/xxx.jpg
        // 实际文件：uploadDir/xxx.jpg
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}

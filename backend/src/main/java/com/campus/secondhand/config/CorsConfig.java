package com.campus.secondhand.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 完整跨域配置（解决OPTIONS预检请求405问题）
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 允许前端地址跨域
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOriginPattern("*"); // 兜底兼容
        // 允许携带Cookie
        config.setAllowCredentials(true);
        // 允许所有请求方法（显式放行OPTIONS）
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        // 允许所有请求头
        config.addAllowedHeader("*");
        // 暴露响应头
        config.addExposedHeader("Authorization");
        // 预检请求有效期（1小时）
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
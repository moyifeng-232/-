-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_secondhand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campus_secondhand;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `student_id` VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `email` VARCHAR(50) COMMENT '邮箱',
  `user_type` TINYINT NOT NULL DEFAULT 0 COMMENT '用户类型：0普通用户，1商家用户，2管理员',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待审核，1正常，2禁用',
  `credit_level` INT NOT NULL DEFAULT 0 COMMENT '信誉等级',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 商品分类表
CREATE TABLE IF NOT EXISTS `category` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `parent_id` BIGINT NOT NULL DEFAULT 0 COMMENT '父分类ID',
  `level` TINYINT NOT NULL DEFAULT 1 COMMENT '分类级别',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS `product` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '发布用户ID',
  `title` VARCHAR(100) NOT NULL COMMENT '商品标题',
  `description` TEXT COMMENT '商品描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `category_id` BIGINT NOT NULL COMMENT '分类ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待审核，1在售，2已下架，3已售出',
  `image_urls` JSON COMMENT '图片URLs',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` VARCHAR(30) NOT NULL UNIQUE COMMENT '订单号',
  `buyer_id` BIGINT NOT NULL COMMENT '买家ID',
  `seller_id` BIGINT NOT NULL COMMENT '卖家ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态：0待支付，1待发货，2待收货，3已完成，4已取消',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 站内信表
CREATE TABLE IF NOT EXISTS `message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sender_id` BIGINT NOT NULL COMMENT '发送者ID',
  `receiver_id` BIGINT NOT NULL COMMENT '接收者ID',
  `content` TEXT NOT NULL COMMENT '内容',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0未读，1已读',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内信表';

-- 公告表
CREATE TABLE IF NOT EXISTS `announcement` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` VARCHAR(100) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `publisher_id` BIGINT NOT NULL COMMENT '发布者ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_publisher_id` (`publisher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- 评价表
CREATE TABLE IF NOT EXISTS `review` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `reviewer_id` BIGINT NOT NULL COMMENT '评价者ID',
  `reviewed_id` BIGINT NOT NULL COMMENT '被评价者ID',
  `rating` TINYINT NOT NULL COMMENT '评分：1-5',
  `content` TEXT COMMENT '评价内容',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_reviewed_id` (`reviewed_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';

-- 初始化数据
-- 插入管理员用户
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `phone`, `email`, `user_type`, `status`) 
VALUES ('admin', 'admin123', '管理员', 'admin001', '13800138000', 'admin@example.com', 2, 1);

-- 插入商品分类
INSERT INTO `category` (`name`, `parent_id`, `level`, `sort`) 
VALUES ('电子产品', 0, 1, 1),
       ('手机', 1, 2, 1),
       ('电脑', 1, 2, 2),
       ('平板', 1, 2, 3),
       ('书籍', 0, 1, 2),
       ('教材', 5, 2, 1),
       ('课外书', 5, 2, 2),
       ('生活用品', 0, 1, 3),
       ('服饰', 8, 2, 1),
       ('家具', 8, 2, 2);
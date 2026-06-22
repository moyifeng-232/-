-- 示例商品数据
USE campus_secondhand;

-- 插入示例商品（Pexels高清图URL）
INSERT INTO `product` (`user_id`, `title`, `description`, `price`, `category_id`, `status`, `image_urls`, `view_count`) VALUES
(1, '全新iPhone 14 Pro', '全新未拆封iPhone 14 Pro，256GB，深空黑色，支持国行保修', 7999.00, 2, 1, '["https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg","https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg","https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg"]', 120),
(1, '二手MacBook Air M2', '2023款MacBook Air M2，8GB+256GB，几乎全新，带原装充电器', 7599.00, 3, 1, '["https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg","https://images.pexels.com/photos/406152/pexels-photo-406152.jpeg"]', 85),
(1, 'iPad Pro 11英寸', '2022款iPad Pro，128GB，Wi-Fi版，带Apple Pencil', 5999.00, 4, 1, '["https://images.pexels.com/photos/812363/pexels-photo-812363.jpeg"]', 67),
(2, 'Python编程从入门到精通', '全新Python编程教材，适合零基础入门，附带练习题', 35.00, 6, 1, '["https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg"]', 45),
(2, '大学英语四级词汇手册', '全新词汇手册，包含最新词汇和例句', 25.00, 6, 1, '["https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg"]', 32),
(2, '高等数学教材上下册', '大学高等数学教材，九成新，有少量笔记', 60.00, 6, 1, '["https://images.pexels.com/photos/374746/pexels-photo-374746.jpeg","https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"]', 58),
(3, '篮球鞋 Nike Air Jordan', '九成新，尺码42，正品保证，适合实战', 399.00, 9, 1, '["https://images.pexels.com/photos/1004819/pexels-photo-1004819.jpeg","https://images.pexels.com/photos/293322/pexels-photo-293322.jpeg"]', 76),
(3, '羽绒服 北面 The North Face', '冬季保暖羽绒服，尺码M，黑色，九成新', 599.00, 9, 1, '["https://images.pexels.com/photos/1028984/pexels-photo-1028984.jpeg"]', 43),
(3, '牛仔裤 Levi\'s', '经典款牛仔裤，尺码32，蓝色，八成新', 199.00, 9, 1, '["https://images.pexels.com/photos/990824/pexels-photo-990824.jpeg"]', 29),
(4, '书桌 简约现代', '实木书桌，120*60*75cm，九成新，同城自提', 499.00, 10, 1, '["https://images.pexels.com/photos/307740/pexels-photo-307740.jpeg","https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg"]', 52),
(4, '椅子 人体工学', '办公椅，可调节高度，带腰托，九成新', 299.00, 10, 1, '["https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg"]', 37),
(4, '衣柜 组装式', '简易衣柜，180*90*50cm，八成新，免费赠送', 99.00, 10, 1, '["https://images.pexels.com/photos/145685/pexels-photo-145685.jpeg"]', 23);

-- 插入示例用户（如果不存在）
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `phone`, `user_type`, `status`) 
VALUES 
('seller1', 'password123', '张三', '20210001', '13800138001', 1, 1),
('seller2', 'password123', '李四', '20210002', '13800138002', 1, 1),
('seller3', 'password123', '王五', '20210003', '13800138003', 1, 1),
('seller4', 'password123', '赵六', '20210004', '13800138004', 1, 1),
('admin', 'admin123', '管理员', 'admin001', '13800138000', 2, 1)
ON DUPLICATE KEY UPDATE id = id;

-- 插入示例公告
INSERT INTO `announcement` (`title`, `content`, `image_urls`, `publisher_id`, `is_featured`, `status`) VALUES
('平台新功能上线', '校园二手交易平台新增商品分类功能，支持多级分类浏览，欢迎大家体验！', '["https://images.pexels.com/photos/316466/pexels-photo-316466.jpeg"]', 6, 1, 1),
('用户行为规范公告', '为了营造良好的交易环境，平台制定了新的用户行为规范，请大家遵守相关规定，共同维护平台秩序。', NULL, 6, 0, 1),
('新年促销活动', '新年大促开始啦！全场商品八折起，购买指定商品还可获得精美礼品一份，活动时间有限，先到先得！', '["https://images.pexels.com/photos/1082320/pexels-photo-1082320.jpeg","https://images.pexels.com/photos/262666/pexels-photo-262666.jpeg"]', 6, 0, 1),
('系统维护通知', '平台将于今晚23:00-次日凌晨2:00进行系统维护，期间部分功能可能无法正常使用，给大家带来的不便敬请谅解！', NULL, 6, 0, 0);

-- 生成91条购买记录和91条商品记录
DELIMITER //

-- 生成商品记录的存储过程
CREATE PROCEDURE GenerateTestProducts()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE max_id INT DEFAULT 110;
    
    -- 开始事务
    START TRANSACTION;
    
    WHILE i < 91 DO
        -- 插入商品记录
        INSERT INTO product (
            id, user_id, title, description, price, category_id, status, image_urls, view_count, create_time
        ) VALUES (
            max_id + i, 
            FLOOR(1 + (RAND() * 69)), -- user_id在1~69之间随机
            'TEST', 
            'TEST', 
            500.00, 
            11, -- 固定分类
            2, -- 状态为下架
            '[]', -- 无图片
            0, -- 浏览量为0
            DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 180) DAY) -- 过去6个月内的随机时间
        );
        
        SET i = i + 1;
    END WHILE;
    
    -- 提交事务
    COMMIT;
END //

-- 生成订单记录的存储过程
CREATE PROCEDURE GenerateTestOrders()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE max_id INT DEFAULT 110;
    DECLARE buyer_id INT;
    DECLARE seller_id INT;
    DECLARE order_time DATETIME;
    
    -- 开始事务
    START TRANSACTION;
    
    WHILE i < 91 DO
        -- 生成不同的buyer_id和seller_id
        SET buyer_id = FLOOR(1 + (RAND() * 69));
        SET seller_id = FLOOR(1 + (RAND() * 69));
        
        -- 确保buyer_id和seller_id不同
        WHILE buyer_id = seller_id DO
            SET seller_id = FLOOR(1 + (RAND() * 69));
        END WHILE;
        
        -- 生成过去6个月内的随机时间
        SET order_time = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 180) DAY);
        
        -- 插入订单记录
        INSERT INTO `order` (
            order_no, buyer_id, seller_id, product_id, total_amount, status, create_time
        ) VALUES (
            CONCAT('ORDER_', DATE_FORMAT(order_time, '%Y%m%d'), '_', LPAD(i, 4, '0')), -- 生成订单号
            buyer_id, 
            seller_id, 
            max_id + i, -- product_id从110开始增长
            500.00, -- 价格均为500
            1, -- 订单状态为已完成
            order_time
        );
        
        SET i = i + 1;
    END WHILE;
    
    -- 提交事务
    COMMIT;
END //

-- 调用存储过程生成数据
CALL GenerateTestProducts();
CALL GenerateTestOrders();

-- 删除存储过程
DROP PROCEDURE IF EXISTS GenerateTestProducts;
DROP PROCEDURE IF EXISTS GenerateTestOrders;

DELIMITER ;

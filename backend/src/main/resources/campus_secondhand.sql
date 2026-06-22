-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_secondhand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_secondhand;

-- ====================== 用户表（user） ======================
-- 实体完整性：主键id（NOT NULL + AUTO_INCREMENT + PRIMARY KEY）
-- 参照完整性：无外键（基础表）
-- 用户自定义完整性：UNIQUE/NOT NULL/DEFAULT/CHECK（字段格式/范围）
DROP TABLE IF EXISTS `user`;
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
`profile_picture` VARCHAR(255) NOT NULL DEFAULT 'https://images.pexels.com/photos/34692672/pexels-photo-34692672.jpeg' COMMENT '用户头像URL',
-- 1. 实体完整性（主键约束）
PRIMARY KEY (`id`),
-- 2. 用户自定义完整性（字段规则校验）
CONSTRAINT `chk_user_user_type` CHECK (`user_type` IN (0,1,2)),  -- 限制用户类型范围
CONSTRAINT `chk_user_status` CHECK (`status` IN (0,1,2)),        -- 限制账号状态范围
CONSTRAINT `chk_user_phone` CHECK (`phone` REGEXP '^1[3-9][0-9]{9}$'),  -- 校验手机号格式（11位）
CONSTRAINT `chk_user_email` CHECK (`email` IS NULL OR `email` REGEXP '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')  -- 邮箱格式校验（可选字段）
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ====================== 商品分类表（category） ======================
-- 实体完整性：主键id（NOT NULL + AUTO_INCREMENT + PRIMARY KEY）
-- 参照完整性：自关联外键parent_id（关联自身id）
-- 用户自定义完整性：NOT NULL/DEFAULT/CHECK（层级范围）
DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
`name` VARCHAR(50) NOT NULL COMMENT '分类名称',
`parent_id` BIGINT NOT NULL DEFAULT 0 COMMENT '父分类ID',
`level` TINYINT NOT NULL DEFAULT 1 COMMENT '分类级别',
`sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
`create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
-- 1. 实体完整性（主键约束）
PRIMARY KEY (`id`),
-- 2. 参照完整性（自关联外键）
CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT,  -- 父分类被引用则禁止删除
-- 3. 用户自定义完整性
CONSTRAINT `chk_category_level` CHECK (`level` BETWEEN 1 AND 3),  -- 限制分类层级（1-3级）
CONSTRAINT `uk_category_name_parent` UNIQUE (`name`, `parent_id`)  -- 同一父分类下分类名称唯一
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- ====================== 商品表（product） ======================
-- 实体完整性：主键id（NOT NULL + AUTO_INCREMENT + PRIMARY KEY）
-- 参照完整性：外键user_id（关联user.id）、category_id（关联category.id）
-- 用户自定义完整性：NOT NULL/DEFAULT/CHECK（价格/状态范围）
DROP TABLE IF EXISTS `product`;
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
-- 1. 实体完整性（主键约束）
PRIMARY KEY (`id`),
-- 2. 参照完整性（外键约束）
CONSTRAINT `fk_product_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,  -- 用户删除则商品同步删除
CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT,  -- 分类被引用则禁止删除
-- 3. 用户自定义完整性
CONSTRAINT `chk_product_price` CHECK (`price` > 0),  -- 价格必须大于0
CONSTRAINT `chk_product_status` CHECK (`status` IN (0,1,2,3)),  -- 商品状态范围限制
CONSTRAINT `chk_product_view_count` CHECK (`view_count` >= 0)  -- 浏览次数非负
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- ====================== 订单表（order） ======================
-- 实体完整性：主键id（NOT NULL + AUTO_INCREMENT + PRIMARY KEY）
-- 参照完整性：外键buyer_id/seller_id（关联user.id）、product_id（关联product.id）
-- 用户自定义完整性：UNIQUE/NOT NULL/DEFAULT/CHECK（金额/状态范围）
DROP TABLE IF EXISTS `order`;
CREATE TABLE IF NOT EXISTS `order` (
`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
`order_no` VARCHAR(30) NOT NULL UNIQUE COMMENT '系统订单号',
`alipay_order_no` VARCHAR(64) COMMENT '支付宝订单号（沙箱）',
`buyer_id` BIGINT NOT NULL COMMENT '买家ID',
`seller_id` BIGINT NOT NULL COMMENT '卖家ID',
`product_id` BIGINT NOT NULL COMMENT '商品ID',
`total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
`status` TINYINT NOT NULL DEFAULT 0 COMMENT '订单状态：0待支付，1已完成，2已取消，3已退货',
`pay_time` DATETIME COMMENT '支付时间',
`is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除：0未删，1已删（软删除）',
`create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
-- 1. 实体完整性（主键约束）
PRIMARY KEY (`id`),
-- 2. 参照完整性（外键约束）
CONSTRAINT `fk_order_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT,  -- 买家账号存在才允许创建订单
CONSTRAINT `fk_order_seller` FOREIGN KEY (`seller_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT,  -- 卖家账号存在才允许创建订单
CONSTRAINT `fk_order_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT,  -- 商品存在才允许创建订单
-- 3. 用户自定义完整性
CONSTRAINT `chk_order_total_amount` CHECK (`total_amount` > 0),  -- 订单金额必须大于0
CONSTRAINT `chk_order_status` CHECK (`status` IN (0,1,2,3)),     -- 订单状态范围限制
CONSTRAINT `chk_order_is_deleted` CHECK (`is_deleted` IN (0,1)), -- 软删除标记范围
CONSTRAINT `chk_order_pay_time` CHECK (`pay_time` IS NULL OR `pay_time` >= `create_time`)  -- 支付时间不早于创建时间
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- ====================== 站内信表（chat_message） ======================
-- 实体完整性：主键id（NOT NULL + AUTO_INCREMENT + PRIMARY KEY）
-- 参照完整性：外键sender_id/receiver_id（关联user.id）
-- 用户自定义完整性：NOT NULL/DEFAULT/CHECK（已读状态范围）
DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE IF NOT EXISTS `chat_message` (
`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
`sender_id` BIGINT NOT NULL COMMENT '发送者ID',
`receiver_id` BIGINT NOT NULL COMMENT '接收者ID',
`content` TEXT NOT NULL COMMENT '内容',
`is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0未读，1已读',
`create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
-- 1. 实体完整性（主键约束）
PRIMARY KEY (`id`),
-- 2. 参照完整性（外键约束）
CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,  -- 发送者删除则消息同步删除
CONSTRAINT `fk_message_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,  -- 接收者删除则消息同步删除
-- 3. 用户自定义完整性
CONSTRAINT `chk_message_is_read` CHECK (`is_read` IN (0,1)),  -- 已读状态范围限制
CONSTRAINT `chk_message_sender_receiver` CHECK (`sender_id` != `receiver_id`)  -- 禁止给自己发消息
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内信表';

-- ====================== 公告表（announcement） ======================
-- 实体完整性：主键id（NOT NULL + AUTO_INCREMENT + PRIMARY KEY）
-- 参照完整性：外键publisher_id（关联user.id）
-- 用户自定义完整性：NOT NULL/DEFAULT/CHECK（状态/重点展示范围）
DROP TABLE IF EXISTS `announcement`;
CREATE TABLE IF NOT EXISTS `announcement` (
`id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
`title` VARCHAR(100) NOT NULL COMMENT '公告标题',
`content` TEXT NOT NULL COMMENT '公告内容',
`image_urls` JSON COMMENT '图片URLs',
`publisher_id` BIGINT NOT NULL COMMENT '发布者ID',
`is_featured` TINYINT NOT NULL DEFAULT 0 COMMENT '是否重点展示：0否，1是',
`status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0已撤销，1已发布',
`create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
-- 1. 实体完整性（主键约束）
PRIMARY KEY (`id`),
-- 2. 参照完整性（外键约束）
CONSTRAINT `fk_announcement_publisher` FOREIGN KEY (`publisher_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT,  -- 发布者存在才允许发布公告
-- 3. 用户自定义完整性
CONSTRAINT `chk_announcement_is_featured` CHECK (`is_featured` IN (0,1)),  -- 重点展示标记范围
CONSTRAINT `chk_announcement_status` CHECK (`status` IN (0,1)),            -- 公告状态范围限制
CONSTRAINT `chk_announcement_title` CHECK (LENGTH(`title`) >= 2)  -- 公告标题至少2个字符
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

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
       ('家具', 8, 2, 2),
       ('其他', 0, 1, 4);

-- 插入用户数据
INSERT INTO `user` (`username`, `password`, `real_name`, `student_id`, `phone`, `email`, `user_type`, `status`, `credit_level`)
VALUES ('admin', 'admin123', '管理员', 'admin001', '13800138000', 'admin@example.com', 2, 1, 100),
       ('seller1', 'seller123', '张三', '2021001', '13800138001', 'seller1@example.com', 1, 1, 95),
       ('seller2', 'seller123', '李四', '2021002', '13800138002', 'seller2@example.com', 1, 1, 92),
       ('buyer1', 'buyer123', '王五', '2021003', '13800138003', 'buyer1@example.com', 0, 1, 90),
       ('buyer2', 'buyer123', '赵六', '2021004', '13800138004', 'buyer2@example.com', 0, 1, 88);

-- 插入公告数据
INSERT INTO `announcement` (`title`, `content`, `image_urls`, `publisher_id`, `is_featured`, `status`)
VALUES ('平台上线公告', '欢迎使用校园二手交易平台，我们致力于为同学们提供安全、便捷的二手交易服务。', '["https://example.com/banner1.jpg"]', 1, 1, 1),
       ('交易须知', '请在交易前仔细核对商品信息，选择安全的交易地点，保护好个人财物。', '["https://example.com/banner2.jpg"]', 1, 0, 1),
       ('系统维护通知', '本周日将进行系统维护，维护期间平台暂停服务，给您带来不便敬请谅解。', NULL, 1, 0, 1);

-- 插入商品数据
INSERT INTO `product` (`user_id`, `title`, `description`, `price`, `category_id`, `status`, `image_urls`, `view_count`)
VALUES (2, 'iPhone 13 128G 蓝色', '9成新，无拆无修，配件齐全', 4599.00, 2, 1, '["https://example.com/iphone13.jpg"]', 120),
       (2, 'MacBook Pro 13寸 M1', '8成新，电池健康90%，带充电器', 7899.00, 3, 1, '["https://example.com/macbook.jpg"]', 85),
       (3, '高等数学教材 上下册', '全新未使用，2023年版', 50.00, 6, 1, '["https://example.com/mathbook.jpg"]', 230),
       (3, '篮球鞋 42码', '穿过3次，几乎全新，原价899', 399.00, 9, 1, '["https://example.com/basketballshoes.jpg"]', 67),
       (2, '小米平板5 11寸', '95成新，带键盘保护套', 1899.00, 4, 2, '["https://example.com/xiaomipad.jpg"]', 45),
       (3, '折叠椅', '全新未拆封，适合宿舍使用', 29.90, 10, 1, '["https://example.com/foldingchair.jpg"]', 156);

-- 插入订单数据
INSERT INTO `order` (`order_no`, `buyer_id`, `seller_id`, `product_id`, `total_amount`, `status`, `pay_time`)
VALUES ('202405010001', 4, 2, 1, 4599.00, 1, '2024-05-01 14:30:00'),
       ('202405020002', 5, 3, 3, 50.00, 1, '2024-05-02 09:15:00'),
       ('202405030003', 4, 3, 4, 399.00, 2, NULL),
       ('202405040004', 5, 2, 2, 7899.00, 0, NULL);

-- 插入站内信数据
INSERT INTO `message` (`sender_id`, `receiver_id`, `content`, `is_read`)
VALUES (2, 4, '您好，您购买的iPhone 13已发货，请注意查收。', 1),
       (4, 2, '收到，谢谢！', 1),
       (3, 5, '您的订单已完成，欢迎下次光临。', 0),
       (1, 2, '您的商品已通过审核，可以正常销售。', 1),
       (1, 3, '请注意保持商品信息的真实性，避免虚假宣传。', 0);

-- 为商品表创建复合索引：发布时间+商品状态
CREATE INDEX idx_product_create_status ON product(create_time DESC, status);

-- 验证索引创建（MySQL）
SHOW INDEX FROM product;

-- 创建商品交易统计视图
CREATE VIEW v_product_trade_stats AS
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(CASE WHEN p.status = 1 THEN 1 END) AS on_sale_count,  -- 在售数量
    COUNT(CASE WHEN p.status = 3 THEN 1 END) AS sold_count,     -- 成交数量
    AVG(p.price) AS avg_price                                   -- 平均价格
FROM category c
LEFT JOIN product p ON c.id = p.category_id
GROUP BY c.id, c.name;

-- 查看视图数据
SELECT * FROM v_product_trade_stats;

-- from+where+order by
SELECT 
    id, title, price, create_time 
FROM product 
WHERE category_id = (SELECT id FROM category WHERE name = '数码产品') 
  AND status = 1 
ORDER BY price DESC;

-- from+group by+having
SELECT 
    u.id, u.username, COUNT(p.id) AS product_count 
FROM `user` u
LEFT JOIN product p ON u.id = p.user_id
GROUP BY u.id, u.username
HAVING product_count >= 2;

-- 多表join+where+order by
SELECT 
    o.order_no, 
    b.username AS buyer_name, 
    s.username AS seller_name, 
    p.title AS product_name, 
    o.total_amount, 
    o.pay_time 
FROM `order` o
JOIN `user` b ON o.buyer_id = b.id  -- 关联买家
JOIN `user` s ON o.seller_id = s.id  -- 关联卖家
JOIN product p ON o.product_id = p.id  -- 关联商品
WHERE o.status = 1  -- 已完成订单
  AND o.pay_time >= '2025-01-01 00:00:00'
ORDER BY o.pay_time DESC;

-- 多表join+group by+having
SELECT 
    u.id, u.username, COUNT(cm.id) AS unread_msg_count 
FROM `user` u
JOIN chat_message cm ON u.id = cm.receiver_id
WHERE cm.is_read = 0  -- 未读消息
GROUP BY u.id, u.username
HAVING COUNT(cm.id) >= 3;

-- 多表join+where+order by
SELECT 
    a.title, a.content, u.username AS publisher_name, a.create_time 
FROM announcement a
JOIN `user` u ON a.publisher_id = u.id
WHERE a.is_featured = 1  -- 重点展示
  AND a.status = 1       -- 已发布
ORDER BY a.create_time DESC;

-- 插入用户（密码建议加密，此处为示例）
INSERT INTO `user`(username, password, real_name, student_id, phone, email, user_type, status)
VALUES ('zhangsan', '123456abc', '张三', '2023001001', '13800138000', 'zhangsan@school.com', 0, 1);

-- 插入商品（关联上述用户，分类ID假设1为数码产品）
INSERT INTO product(user_id, title, description, price, category_id, status)
VALUES (
    (SELECT id FROM `user` WHERE username = 'zhangsan'),
    '9成新笔记本电脑',
    '酷睿i5，16G内存，512G固态，使用1年',
    3500.00,
    1,
    1
);

UPDATE product
SET status = 3, update_time = NOW()
WHERE id = 1;

-- 联动更新订单：若该商品有未完成订单，改为已完成（示例）
UPDATE `order`
SET status = 1, pay_time = NOW(), update_time = NOW()
WHERE product_id = 1 AND status = 0;

-- 方式1：软删除订单（推荐，保留数据）
UPDATE `order`
SET is_deleted = 1, update_time = NOW()
WHERE id = 10 AND status = 2;  -- 软删除已取消的订单ID=10

-- 方式2：物理删除3个月前的已读站内信（清理无效数据）
DELETE FROM chat_message
WHERE is_read = 1 
  AND create_time < DATE_SUB(NOW(), INTERVAL 3 MONTH);

  -- 创建用户（若不存在，需指定主机，%表示任意主机）
CREATE USER IF NOT EXISTS 'test_user'@'%' IDENTIFIED BY 'Test@123456';

-- 授予查询权限
GRANT SELECT ON campus_secondhand.product TO 'test_user'@'%';
GRANT SELECT ON campus_secondhand.`order` TO 'test_user'@'%';
-- 授予订单插入权限
GRANT INSERT ON campus_secondhand.`order` TO 'test_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 撤销订单表插入权限
REVOKE INSERT ON campus_secondhand.`order` FROM 'test_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证权限
SHOW GRANTS FOR 'test_user'@'%';



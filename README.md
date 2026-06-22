# 目标：
1.实现用户（普通用户、商家用户、管理员）的实名注册、登录及权限管理功能，保障交易环境的安全性。
2.提供二手物品发布、查询、筛选、沟通、下单等核心交易流程功能，支持多图上传与富文本描述。
3.集成模拟支付功能，完成会员会费缴纳流程，支持灵活的订单管理与信誉评价机制。
4.实现平台公告发布、站内信沟通等辅助功能，提升用户互动体验。
5.提供交易数据统计、热门商品分析及环境效益估算功能，为平台运营与决策提供数据支撑。
6.系统响应时间≤3 秒，支持同时在线用户≥5000人，保障校园场景下的稳定运行。
# 模块：
1.用户管理模块：包含用户的注册、登录、信息维护，管理员对用户信息的审核与管理。
2.商品管理模块：商家用户发布、编辑、下架二手物品信息，支持多图上传与文本描述；普通用户浏览、搜索、筛选商品。
3.交易沟通模块：用户与其他用户之间通过站内信进行交易细节沟通，一对一沟通。
4.订单管理模块：用户下单、发布商品的用户审核订单，记录交易状态流转。
5.信誉评价模块：交易完成后，双方进行互评，生成信誉度分数与评价记录。
6.公告管理模块：管理员发布、编辑、删除校园二手交易相关公告与新闻。
7.数据统计模块：管理员统计交易总量、热门商品类别，统计商品去向等数据。 
# 开发环境：
1.前端：React + Axios
2.后端：Spring Boot + MyBatis-Plus
3.数据库：MySQL

# 状态码定义：
## 用户状态码

### 用户类型 (userType)
| 状态码 | 含义           |
|--------|---------------|
| 0      | 普通用户       |
| 1      | 商家用户       |
| 2      | 管理员         |

### 用户状态 (status)
| 状态码 | 含义           |
|--------|---------------|
| 0      | 待审核         |
| 1      | 正常           |
| 2      | 禁用           |

### 商品状态 (status)
| 状态码 | 含义           |
|--------|---------------|
| 0      | 待审核         |
| 1      | 在售           |
| 2      | 已下架         |
| 3      | 已售出         |

## 订单状态码

### 订单状态 (status)
| 状态码 | 含义           |
|--------|---------------|
| 0      | 待支付         |
| 1      | 已完成         |
| 2      | 已取消         |
| 3      | 已退货         |

前端启动方法：
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

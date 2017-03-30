# subwayapp
Subway App by Ioinc and Cordova
# 这是什么？
这是一个可以查询上海地铁路线的App，你可以：
 - 自动路线查询
 - 手动路线查询
 - 地铁新闻推送
 - 地铁图浏览
 - 获取周围地铁站信息
 
如果你是管理员，还可以：
 - 路线数据管理（增删改查）
 - 登陆注册
 
![img](https://images-manager.oss-cn-shanghai.aliyuncs.com/subway/subway-home.jpg)
![img](https://images-manager.oss-cn-shanghai.aliyuncs.com/subway/subway-detail.jpg)

# Client

客户端代码，主要书写内容为www目录

  - 包括AngularJS-UI路由
  - Ionic框架布局
  - controller.js中路径查找算法
  - ionic server 在浏览器中查看 或者 ionic run android/ionic run ios 在真机或模拟器中查看
# server
服务端代码。
  - MongoDB数据库
  - app.js中express框架与原生MongoDB数据库驱动
  - 启动服务node app

### Version
2.0.0

### Installation

requires nodejs and Android SDK to run.

### Run

cd server:
```sh
$ node app 
```

cd subwayapp:
```sh
$ ionic serve
```

License
----

MIT




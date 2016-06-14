SWOOLE_IM

使用PHP+Swoole实现的网页即时聊天工具，在线体验地址：http://115.29.50.187/user/login

    支持单聊/群聊 功能
    支持未读消息提醒 功能
    支持单用户登录，（即相同的用户 后登录的会把前面登录的用户踢掉）
    保存聊天记录
    基于Server PUSH的即时内容更新，登录/登出/消息等会内容即时更新
    支持发送连接/图片/文件（开发中）
    
    
安装

swoole扩展

 参考：http://wiki.swoole.com/wiki/page/6.html

swoole框架

 参考：http://wiki.swoole.com/wiki/page/71.html
 

运行

先安装配置好mysql,redis。再将client目录配置到Nginx/Apache的虚拟主机目录中，使client/index.php 可访问。 修改client/config.js,Server/config.php中，IP和端口为对应的配置。

php Client/app_server.php start

php Server/user_server.php  
 

详细部署说明
 
1. 新建数据库，导入swim.sql
    source "dir/swim.sql"
    
2.Ningx配置
 
nginx 
    server {
        listen       80;
        server_name  im.cc;
        index index.html index.htm index.php;
        root /user/data/im/Client; 
        location / {
                if (!-e $request_filename){
                   proxy_pass http://127.0.0.1:9501;
                }
          } 
            location ~ \.php$ {
            root           /user/data/im/Client;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
            include        fastcgi_params;
           
        }
   }
 

3.修改配置SWOOLE_IM/Server/config.php 与 Client/apps/configs/db.php

config.php:

$config['server'] = array(
    //监听的HOST
    'host' => '0.0.0.0',
    //监听的端口
    'port' => '9502', 
    'url' => 'ws://所配置的域名:9502', 
    'origin' => 'http://所配置的域名:9502',
);

 //redis相关配置
$config['redis'] = array(
    'host'    => "127.0.0.1", 
    'port'    => 6379,
    'password' => '',
    'timeout' => 0.25,
    'pconnect' => false,
    'database' => 1,
);


数据库相关配置：
db.php: 
$db['master'] = array(
    'type'       => Swoole\Database::TYPE_MYSQL,
    'host'       => "127.0.0.1",
    'port'       => 3306,
    'dbms'       => 'mysql',
    'engine'     => 'MyISAM',
    'user'       => "user1",
    'passwd'     => "123",
    'name'       => "swim",
    'charset'    => "utf8",
    'setname'    => true,
    'persistent' => false, //MySQL?胯??
);

 

4.启动服务器

php Client/app_server.php start

php Server/user_server.php  
 
 
5.绑定host与访问聊天窗口（可选）
 
vi /etc/hosts

增加

127.0.0.1 im.cc

用浏览器打开：http://im.cc
 
 
<?php
define('DEBUG', 'on');
define('WEBPATH', dirname(__DIR__));
require __DIR__.'/vendor/autoload.php';

Swoole\Loader::vendor_init();

Swoole\Loader::addNameSpace('SW', __DIR__.'/App/');

$config = require __DIR__.'/config.php';

$userServer = new SW\UserServer($config);

$userServer->loadSetting(__DIR__."/swoole.ini"); //加载配置文件

$server = new Swoole\Network\Server($config['server']['host'], $config['server']['port']);

$server->setProtocol($userServer);

$server->run($config['swoole']);
exit;
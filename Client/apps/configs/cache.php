<?php
$cache['session'] = array(
    'type' => 'FileCache',
    'cache_dir' => WEBPATH.'/cache/filecache/',
);
/* session save is  redis

$cache['session'] = array(
    'type' => 'Redis',
    'host'    => "127.0.0.1",
    'port'    => 6379,
    'password' => '',
    'timeout' => 0.25,
    'pconnect' => false
);
 * */

$cache['master'] = array(
    'type' => 'Memcache',
);
return $cache;
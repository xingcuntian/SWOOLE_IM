<?php
namespace SW;

use Swoole;
use Swoole\Filter;
use SW\Store;


class UserServer extends Swoole\Protocol\WebSocket
{
    protected  $store;
    protected  $redis;
    protected  $users;
    protected  $clientUser;
    const  MESSAGE_MAX_LEN     = 1024; //单条消息不得超过1K
    const  TOKEN = 'SWOOLE_IM';
    const  ONLINE_CONNECTION  = 'im_hash_online_connect';    //登录记录用户连接信息表
    const  IM_NO_READ_MESSAGE = 'im_no_read_message_table'; //未读消息表


    function __construct($config = array())
    {
        //将配置写入config.js
        $config_js = <<<HTML
var webim = {
    'server' : '{$config['server']['url']}'
}
HTML;
        file_put_contents(WEBPATH . '/Client/static/js/config.js', $config_js);

        //检测日志目录是否存在
        if (isset($config['user']['log_file']) && !empty($config['user']['log_file'])) {
            $log_dir = dirname($config['user']['log_file']);
        }
        if (isset($log_dir))
        {
            !is_dir($log_dir)? mkdir($log_dir, 0777, true):'';
            $logger = new Swoole\Log\FileLog($config['user']['log_file']);
            $this->setLogger($logger);   //Logger
        }
        $this->store = (new \SW\Store\File($config['user']['data_dir'],$config['user']['online_dir']));
        $this->redis =  new Swoole\Redis($config['redis']);
        $this->origin = $config['server']['origin'];
        parent::__construct($config);
     }

    /**
     * 登录
     * @param $client_id
     * @param $msg
     */
    function cmd_login($client_id, $msg)
    {
        $info['user_id'] = Filter::escape($msg['user_id']);
        $info['token']   = Filter::escape($msg['token']);
        $info['user_name'] = Filter::escape($msg['user_name']);
        $resMsg = array(
            'cmd' => 'login',
            'fd' => $client_id,
            'data' => '请登录'
         );
        if(empty($info['user_id']) || empty($info['token'])) {
            $resMsg['data'] = '请登录';
            $this->sendJson($client_id, $resMsg);
            exit;
        }

        $userKey = 'cmd_'.$info['user_id'];

       if(strcmp($info['token'], md5($info['user_id'].self::TOKEN) ) != 0){
             $resMsg['data'] = '用户信息不正确,请重新登录';
             $this->sendJson($client_id, $resMsg);
             exit;
       }
         $login_client_id  = $this->redis->hget(self::ONLINE_CONNECTION, $userKey);
          if(!empty($login_client_id)){
              //表示已经有人登录了 回复给登录用户
              $resMsg['fd']   = $login_client_id;
              $resMsg['data'] = '你的帐号在别的地方登录';
              unset( $this->users[$info['user_id']],$this->clientUser[$login_client_id] );
             //将下线消息发送给之前的登录人
             $this->sendJson($login_client_id, $resMsg);
          }
        $this->redis->hset(self::ONLINE_CONNECTION, $userKey,$client_id);
        $resMsg = array(
            'cmd' => 'login_success',
            'fd'  => $client_id,
            'data'=> '登录成功'
        );
        $this->sendJson($client_id, $resMsg);

        //把会话存起来
        $resMsg['user_name'] =   $info['user_name'];
        $resMsg['user_id']   =   $info['user_id'];
        unset($resMsg['data'],$resMsg['cmd']);

        $this->users[$resMsg['user_id']] = $resMsg;
        $this->clientUser[$client_id] = $resMsg;

        $this->store->login($resMsg['user_id'], $resMsg);

        //用户登录消息
        $loginMsg = array(
            'cmd' => 'newUser',
            'from' => 0,
            'channal' => 0,
            'to' => 0,
            'fromuserid' => $resMsg['user_id'],
            'from_username' => $resMsg['user_name'],
            'title' =>  'hello '.$resMsg['user_name'].'上线了',
            'data' =>  " hi 我上线了 让咱们 hi 起来吧！"
        );
        file_put_contents('/zhang/IMlog/sw.log',var_export($loginMsg,true),FILE_APPEND);
        $this->broadcastJson($client_id, $loginMsg);
  }


    /**
     * 获取在线列表 ok
     */
    function cmd_getOnline($client_id, $msg)
    {
        $resMsg = array(
            'cmd' => 'getOnline',
        );
        $list =  array();
        $userList =  $this->users;
        foreach($userList as $index => $val){
            $list[] = array($val['user_name'],$val['fd'],$val['user_id']);
        }
        $resMsg['list'] = $list;
        $resMsg['userList'] = $userList;
        file_put_contents('/zhang/IMlog/sw.log',var_export($resMsg,true),FILE_APPEND);
        $this->sendJson($client_id, $resMsg);
    }


    /**
     * 获取历史聊天记录
     */
    function cmd_getHistory($client_id, $msg)
    {
        $resMsg = array(
            'cmd' => 'gethistory',
        );
        $history =  $this->store->getHistory();
        $to_userid = $msg['touser_id'];
        $userid    = $msg['user_id'];
        $page  = $msg['page'];
        $limit = 10;
        $data  = array();
        $key  = $userid.'_'.$to_userid;
        $key1 = $to_userid.'_'.$userid;
        if(isset($history[$key])){
            $data = $history[$key];
        }
        if(isset($history[$key1])){
            $data = $history[$key1];
        }

        $resMsg['data'] = $data;

        file_put_contents('/zhang/IMlog/swhis.log',var_export($history,true),FILE_APPEND);

        $this->sendJson($client_id, $resMsg);

     }

    /*
     * 获取未读消息
     * */
    function cmd_getNoReadMessage($client_id, $msg)
    {
        $resMsg = array(
            'cmd' => 'getnoreadmessage',
            'data' => ''
        );
        $user_id = $msg['user_id'];
        $message_key = 'cmd_'.$user_id;
        $message = $this->redis->hget(self::IM_NO_READ_MESSAGE,$message_key);
        if(empty($message)){
            $this->sendJson($client_id, $resMsg);
            return true;
        }
        $message = json_decode($message,true);
        $resMsg['data'] = $message;
        $this->sendJson($client_id, $resMsg);

        $this->redis->hdel(self::IM_NO_READ_MESSAGE,$message_key);

    }


    /**
     * 下线时，通知所有人
     */
    function onExit($client_id)
    {
        $userInfo = $this->store->getUser($client_id);
        if ($userInfo)
        {
            $resMsg = array(
                'cmd' => 'offline',
                'fd' => $client_id,
                'from' => 0,
                'channal' => 0,
                'from_username' => $userInfo['user_name'],
                'title' =>  'hello '.$userInfo['user_name'].'下线了',
                'data' =>  " hi 我有事先离开会！ 稍等一会会，马上回来！！！",
            );
          //  unset( $this->users[$userInfo['user_id']],$this->clientUser[$client_id] );
            $this->store->logout($userInfo['user_id']);

            //清 redis
            $userKey = 'cmd_'.$userInfo['user_id'];
            $this->redis->hdel(self::ONLINE_CONNECTION, $userKey);

            //将下线消息发送给所有人
            $this->broadcastJson($client_id, $resMsg);
        }
        $this->log("onOffline: " . $client_id);
    }


    /**
     * 发送信息请求 好友单聊
     */
    function cmd_message($client_id, $msg)
    {
        $resMsg = $msg;
        $resMsg['cmd'] = 'fromMsg';

        if (strlen($msg['data']) > self::MESSAGE_MAX_LEN)
        {
            $this->sendErrorMessage($client_id, 102, 'message max length is '.self::MESSAGE_MAX_LEN);
            return;
        }

        $fromUserInfo = $this->users[$resMsg['fromuserid']];
        $toUserInfo  = $this->users[$msg['to']];

        $touser_id  = $toUserInfo['user_id'];
        $resMsg['touser_id'] = $touser_id;
        $resMsg['touser_name'] = $toUserInfo['user_name'];
        $resMsg['from_clientid'] =  $fromUserInfo['fd'];
        $resMsg['from_username'] =  $fromUserInfo['user_name'];
        $resMsg['from_userid']   =  $fromUserInfo['user_id'];
        $resMsg['add_message'] = '1';
        $this->sendJson($toUserInfo['fd'], $resMsg);
        file_put_contents('/zhang/IMlog/sw.log',var_export($resMsg,true),FILE_APPEND);
        $this->store->addHistory($resMsg['from_userid'], $msg['data'],$touser_id);
    }


    /**
     * 发送信息请求 群聊
     */
    function cmd_qmessage($client_id, $msg)
    {
        $resMsg = $msg;
        $resMsg['cmd'] = 'qfromMsg';

        if (strlen($msg['data']) > self::MESSAGE_MAX_LEN)
        {
            $this->sendErrorMessage($client_id, 102, 'message max length is '.self::MESSAGE_MAX_LEN);
            return;
        }
        $touser_id  = 'all';
        $fromUserInfo = $this->users[$resMsg['fromuserid']];
        $resMsg['from_username'] =  $fromUserInfo['user_name'];
        $resMsg['from_userid']   =  $fromUserInfo['user_id'];
        $resMsg['add_message'] = '1';
        $resMsg['time'] = time();

        $this->broadcastJson($client_id, $resMsg);

        file_put_contents('/zhang/IMlog/sw.log',var_export($resMsg,true),FILE_APPEND);
        $this->store->addHistory($resMsg['from_userid'], $msg['data'],$touser_id);

    }








    /**
     * 接收到消息时
     * @see WSProtocol::onMessage()
     */
    function onMessage($client_id, $ws)
    {
        $this->log("onMessage #$client_id: " . $ws['message']);
        $msg = json_decode($ws['message'], true);
        if (empty($msg['cmd']))
        {
            $this->sendErrorMessage($client_id, 101, "invalid command");
            return;
        }
        $func = 'cmd_'.$msg['cmd'];
        if (method_exists($this, $func))
        {
            $this->$func($client_id, $msg);
        }
        else
        {
            $this->sendErrorMessage($client_id, 102, "command $func no support.");
            return;
        }
    }

    /**
     * 发送错误信息
     * @param $client_id
     * @param $code
     * @param $msg
     */
    function sendErrorMessage($client_id, $code, $msg)
    {
        $this->sendJson($client_id, array('cmd' => 'error', 'code' => $code, 'msg' => $msg));
    }

    /**
     * 发送JSON数据
     * @param $client_id
     * @param $array
     */
    function sendJson($client_id, $array)
    {
        $tmp = array('return'=>array('client_id'=>$client_id,'msg'=>$array));

        file_put_contents('/zhang/IMlog/send.log',var_export($tmp,true),FILE_APPEND);


        $msg = json_encode($array);
        if ($this->send($client_id, $msg) === false)
        {
            $this->close($client_id);

            if(!isset($array['add_message']) || $array['add_message'] != '1'){
                 return true;
            }
               $client_user = $this->clientUser[$client_id];
               $user_id     = $array['from_userid'];
               $message_key = 'cmd_'.$client_user['user_id'];
               $log[0] = array('user_id' => $user_id,'user_name'=>$array['from_username'],'data' => $array['data'],'time' => time());
               $message = $this->redis->hget(self::IM_NO_READ_MESSAGE,$message_key);
               if(!empty($message))
               {
                   $message = json_decode($message,true);
               }else{
                   $message = array();
               }
               $log = array_merge($message,$log);
               $this->redis->hset(self::IM_NO_READ_MESSAGE,$message_key,json_encode($log));
            }
    }


    /**
     * 广播JSON数据
     * @param $client_id
     * @param $array
     */
    function broadcastJson($sesion_id, $array)
    {
        $msg = json_encode($array);
        $this->broadcast($sesion_id, $msg);
    }

    function broadcast($current_session_id, $msg)
    {
        foreach ($this->users as $key => $value)
        {
            if ($current_session_id != $value['fd'])
            {
                $this->send($value['fd'], $msg);
            }
        }
    }



    function onTask($serv, $task_id, $from_id, $data)
    {
        $req = unserialize($data);
        if ($req)
        {
            switch($req['cmd'])
            {
                case 'getHistory':
                    $history = array('cmd'=> 'getHistory', 'history' => $this->store->getHistory());
                    if ($this->isCometClient($req['fd']))
                    {
                        return $req['fd'].json_encode($history);
                    }
                    //WebSocket客户端可以task中直接发送
                    else
                    {
                        $this->sendJson(intval($req['fd']), $history);
                    }
                    break;

                default:
                    break;
            }
        }
    }



    function onFinish($serv, $task_id, $data)
    {
        $this->send(substr($data, 0, 32), substr($data, 32));
    }



}
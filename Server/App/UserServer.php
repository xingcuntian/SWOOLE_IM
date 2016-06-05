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
    const  MESSAGE_MAX_LEN     = 1024; //单条消息不得超过1K
    const  TOKEN = 'SWOOLE_IM';
    const  ONLINE_CONNECTION = 'hash_online_connect';


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

             unset( $this->users[$info['user_id']] );
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
        $this->store->login($client_id, $resMsg);

//        //广播给其它在线用户
//        $resMsg['cmd'] = 'newUser';
//        //将上线消息发送给所有人
//        $this->broadcastJson($client_id, $resMsg);

        //用户登录消息
        $loginMsg = array(
            'cmd' => 'fromMsg',
            'from' => 0,
            'channal' => 0,
            'data' =>  $resMsg['user_name'] . "上线了",
            'username' => $resMsg['user_name']
        );
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
            $list[] = array($val['user_name'],$val['user_id'],$val['fd']);
        }
        $resMsg['list'] = $list;
        $resMsg['userList'] = $userList;
        file_put_contents('/zhang/IMlog/sw.log',var_export($resMsg,true),FILE_APPEND);
        $this->sendJson($client_id, $resMsg);
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
                'data' => $userInfo['name'] . "下线了",
            );
            unset( $this->users[$userInfo['user_id']] );
            $this->store->logout($client_id);
            //将下线消息发送给所有人
            $this->broadcastJson($client_id, $resMsg);
        }
        $this->log("onOffline: " . $client_id);
    }



    

    /**
     * 发送信息请求
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

        //表示群发
        if ($msg['channal'] == 0)
        {
            $this->broadcastJson($client_id, $resMsg);
            $this->getSwooleServer()->task(serialize(array(
                'cmd' => 'addHistory',
                'msg' => $msg,
                'fd'  => $client_id,
            )), self::WORKER_HISTORY_ID);
        }
        //表示私聊
        elseif ($msg['channal'] == 1)
        {
            $this->sendJson($msg['to'], $resMsg);
            $this->store->addHistory($client_id, $msg['data']);
        }
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

        $msg = json_encode($array);
        if ($this->send($client_id, $msg) === false)
        {
            $this->close($client_id);
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






    ///---------------------------------------------

    /*  getRedisInstance
     *  实例化 redis
     * */
    public static function getRedisInstance()
    {
        $config = self::$clconfig;
        if(!(self::$_redisClient instanceof Swoole\Redis))
        {
            try{
               self::$_redisClient = new Swoole\Redis($config['redis']);
            }catch(\Exception $e)
            {
                self::$_redisClient = NULL;
            }
        }
        return self::$_redisClient;
    }

    /*  getMysqlInstance
    *   实例化 mysql
    * */
    public static function getMysqlInstance()
    {
        $config = self::$clconfig;
        if(!(self::$_mysqlClient instanceof Swoole\Database))
        {
            try{
                //$db = new  Swoole\Database( $config['dbmaster'] );

                self::$_mysqlClient = new Swoole\Database($config['dbmaster']);
            }catch(\Exception $e)
            {
                self::$_mysqlClient = NULL;
            }
        }
        return self::$_mysqlClient;
    }


    /*setSession
     * 实例化SESSION
     * */
  public  static  function getSession()
  {

      if(!(self::$_sessionClient instanceof Swoole\Session))
      {
          try{
              $conf = array(
                  'type' => '0',
                  'cache_dir' => WEBPATH.'/cache/filecache/'
              );
              $filecache = Swoole\Cache::create($conf);
              self::$_sessionClient = new Swoole\Session($filecache);
          }catch(\Exception $e)
          {
              self::$_sessionClient = NULL;
          }
      }
      return self::$_sessionClient;
  }

    /*getUserData
     *获取用户信息
     *@return array
     * */
    public static function getUserData($username,$password)
    {
        $apt =  self::getMysqlInstance();
        $apt->db_apt->from('users');
        $apt->db_apt->equal('username', $username);
        $apt->db_apt->equal('password', ($password));
        $res = $apt->db_apt->getall();
        return $res;
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
                case 'addHistory':
                    if (empty($req['msg']))
                    {
                        $req['msg'] = '';
                    }
                    $this->store->addHistory($req['fd'], $req['msg']);
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
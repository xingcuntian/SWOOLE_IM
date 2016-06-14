<?php
namespace App\Controller;
use Swoole;

class User extends Swoole\Controller
{
    function login()
    {
        //使用crypt密码
        Swoole\Auth::$password_hash = Swoole\Auth::HASH_CRYPT;

        $this->session->start();
        //已经登录了，跳转到
        if ($this->user->isLogin())
        {
            $this->http->redirect('/admin/index/');
            return;
        }
        if (!empty($_POST['password']))
        {
            $autologin = isset($_POST['autologin'])?$_POST['autologin']:false;
            $r = $this->user->login(trim($_POST['username']), $_POST['password'],$autologin);
            if ($r)
            {
                $this->http->redirect('/admin/index/');
                return;
            }
            else
            {
                echo "登录失败";
            }
        }
        else
        {
            $this->display('user/login.php');
        }
    }

    function home()
    {
        $this->session->start();
        var_dump($_SESSION);
        Swoole\Auth::loginRequire();
    }

    function logout()
    {
        $this->session->start();
        $this->user->logout();
    }



    function register()
    {
        //使用crypt密码
        Swoole\Auth::$password_hash = Swoole\Auth::HASH_CRYPT;
        if (!empty($_POST['user_name']) && !empty($_POST['password']))
        {
            $this->session->start();

            $r = $this->user->register(trim($_POST['user_name']), $_POST['password']);
            if ($r)
            {
                $data = array('code'=>'0','msg'=>'注册成功');
            }
            else
            {
                $data = array('code'=>'1','msg'=>'注册失败');
            }
            echo json_encode($data);
            exit;
        }
        else
        {
            $this->display('user/register.html');
        }
    }

}
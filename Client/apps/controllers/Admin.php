<?php
namespace App\Controller;
use Swoole;

class Admin extends Swoole\Controller
{
    function index()
    {
        $this->session->start();
       // var_dump($_SESSION);
        Swoole\Auth::loginRequire();
        $this->display('admin/index.php');
    }


    function logout()
    {
        $this->session->start();
        $this->user->logout();
    }

    public  function logint()
    {
        $this->display('user/logint.php');
    }
}
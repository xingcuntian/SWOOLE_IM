<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>网页聊天</title>
<script type="text/javascript" src="/static/js/jquery.js"></script>

<script type="text/javascript">
    var user_id = "<?php echo isset($_SESSION['user_id'])?$_SESSION['user_id']:''; ?>";
    var token = "<?php echo isset($_SESSION['token'])?$_SESSION['token']:''; ?>";
    var user_name = "<?php echo isset($_SESSION['user_name'])?$_SESSION['user_name']:''; ?>";
</script>
<script src="/static/js/jquery.json.js"></script>
<script type="text/javascript" src="/static/js/config.js"></script>
<script type="text/javascript" src="/static/js/chat.js"></script>
<script type="text/javascript" src="/static/js/dandan.js"></script>
<script type="text/javascript">
$admin_name = user_name;
    //成员数组
    $arr_user= new Array(
        Array(user_name,'0','')
    )
//    Array('今心','user_img/002.jpg'),
//    Array('老猪','user_img/003.jpg'),
//    Array('涛涛','user_img/004.jpg'),
//    Array('张三'),
//    Array('李四'),
//    Array('王五'))
</script>
<link href="/static/images/dandan.css" rel="stylesheet" media="screen" type="text/css" />
<style type="text/css">

</style>
</head>
<body>

<div id="mid_top">
<!--  <div class="list">
    <table border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td class="td_user td_user_click">老猪</td>
        <td class="td_hide td_hide_click">X</td>
      </tr>
    </table>
  </div>-->
</div>
<div id="top">头部</div>
<div id="body">
  <div id="left">
    <div class="box">
      <h3 class="h3 h3_1">最近聊天(<span class="n_geshu_1"></span>)</h3>
      <ul class="ul ul_1">
        <li>老猪</li>
      </ul>
      <h3 class="h3 h3_2">我的好友(<span class="n_geshu_2"></span>)</h3>
      <ul class="ul ul_2">
        <li>蛋蛋</li>
      </ul>
    </div>
    <div class="box_f"></div>
  </div>
  <div id="right">
    <div class="right_box">
      <div id="right_top">
        <!--<p><img src="images/head.jpg" alt="头象" /></p>
        老猪--></div>
      <div id="right_mid"></div>
      <div id="right_foot">蛋蛋</div>
      <div class="blank"></div>
    </div>
    <div class="right_box_foot"></div>
  </div>
  <div id="mid">
    <div id="mid_con">
      <div class="my_show">
        <div class="con_box"><div class="dandan_liaotian"><img src="/static/user_img/dandan.jpg" alt="蛋蛋聊天界面" /></div></div>
      </div>
    </div>
    <div id="mid_mid"></div>
    <div id="mid_foot">
      <div id="mid_say">
        <textarea name="" cols="" rows="" id="texterea"></textarea>
      </div>
      <div id="mid_sand">发送</div>
      <div class="blank"></div>
    </div>
    <div class="mid_box"></div>
  </div>
</div>
</body>
</html>

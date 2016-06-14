var ws = {};
var client_id = 0;
var userlist = {};
var showMsgHtml= "<div id=\"msg_win\" style=\"display:block;top:450px;visibility:visible;opacity:2;\"><div class=\"icos\"></a><a id=\"msg_close\" title=\"关闭\" href=\"javascript:void 0\">×</a></div><div id=\"msg_title\"></div><div id=\"msg_content\"></div></div>";

$(document).ready(function () {
    //使用原生WebSocket
    if (window.WebSocket || window.MozWebSocket)
    {
        ws = new WebSocket(webim.server);
    }
    //使用flash websocket
    else if (webim.flash_websocket)
    {
        WEB_SOCKET_SWF_LOCATION = "/static/flash-websocket/WebSocketMain.swf";
        $.getScript("/static/flash-websocket/swfobject.js", function () {
            $.getScript("/static/flash-websocket/web_socket.js", function () {
                ws = new WebSocket(webim.server);
            });
        });
    }
    //使用http xhr长轮循
    else
    {
        ws = new Comet(webim.server);
    }

    listenEvent();
});


function listenEvent() {
    /**
     * 连接建立时触发
     */
    ws.onopen = function (e) {
         if (user_id=='' || token == '') {
            alert('请登录');
            ws.close();
            return false;
        }
        //连接成功
        console.log("connect webim server success.");
        //发送登录信息
        msg = new Object();
        msg.cmd = 'login';
        msg.user_id = user_id;
        msg.token = token;
        msg.user_name = user_name;
        ws.send($.toJSON(msg));
    };

    //有消息到来时触发
    ws.onmessage = function (e) {
        var message = $.evalJSON(e.data);
        var cmd = message.cmd;
        switch(cmd)
        {
            case 'login_success':
               // alert(message.data);
                //获取在线人数
                ws.send($.toJSON({cmd : 'getOnline'}));

               //群聊消息
                var msg = {};
                msg.cmd = 'getHistory';
                msg.touser_id = 'all';
                msg.user_id = user_id;
                msg.page = 1;
                ws.send($.toJSON(msg));

                //获取未读消息
                var  msg = new Object();
                msg.cmd = 'getNoReadMessage';
                msg.user_id = user_id;
                ws.send($.toJSON(msg));
                break;
            case 'login':
                alert(message.data);
                ws.close();
                actionlogin();
                break;

             case 'newUser': //新用户上线
             case 'offline': //用户下线
                 ws.send($.toJSON({cmd : 'getOnline'}));
                 if($("#msg_win").length  >0){
                      $("#msg_win").show();
                 }else{
                      $(document.body).append(showMsgHtml);
                 }
                    $("#msg_title").text(message.title);
                    $("#msg_content").text(message.data);
                    setTimeout(function() {
                        $("#msg_win").hide();
                     },4000);
                break;

             case 'fromMsg': //消息来临时
                //ws.send($.toJSON({cmd : 'getOnline'}));
                findUserMsg(message,ws);
                break;

             case 'gethistory': //消息记录
                    showMsgHistory(message);
                break;

            case 'getOnline':  //在线列表
                showOnlineList(message.list);
                break;

            case 'getnoreadmessage': //未读消息
                 getnoreadmessage(message);
                break;

            case 'qfromMsg': 
                   showQlUserMsg(message);
                break;

        }
    };

    /**
     * 连接关闭事件
     */
    ws.onclose = function (e) {
        if (confirm("聊天服务器已关闭")) {
            //alert('您已退出聊天室');
            ws.close();
            actionlogin();
            //location.href = '/user/login';
        }
    };

    /**
     * 异常事件
     */
    ws.onerror = function (e) {
        alert("异常:" + e.data);
        ws.close();
        actionlogin();
        console.log("onerror");
    };
}


document.onkeydown = function (e) {
    var ev = document.all ? window.event : e;
    if (ev.keyCode == 13) {
        sendMsg($('#msg_content').val(), 'text');
        return false;
    } else {
        return true;
    }
};

function selectUser(userid) {
    $('#userlist').val(userid);
}

/*
* 重复登录，退出当前帐号 跳转到登录页
* */
function actionlogin()
{
    var rand = Math.random();
    $.ajax({
        'url': '/user/logout?t='+rand,
        "cache": false,
        "method": "POST",
        async:false,
        //"dataType": "json",
        "dataType": "jsonp",
        jsonp:'callback',
        jsonpCallback:"success_jsonpCallback",
        'success': function (data) {
            //alert(data);
        }
    });
    location.href = '/user/login?t='+rand;
}

/**
 * 显示所有用户在线列表
 * @param dataObj
 */
function showOnlineList(dataObj) {
    //加载用户
    $(".ul").html("");//
    for(i=0;i<dataObj.length;i++){
         dandan.newuser('.ul_2',dataObj[i],i);//创建用户
    }
}

/*
* 遍历用户列表，找出 clientID，使其自动执行click事件
* */
function findUserMsg(dataObj,ws)
{
   var ing_user = 'title_user'+dataObj.fromuserid;
   var id = 'user'+dataObj.fromuserid;
    if($("#user_con"+ing_user).length <= 0){
         $("#"+id).click();
    }
   var t=" "+ new Date().toLocaleTimeString();//当前时间
   $("#user_con"+ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">'+dataObj.from_username+t+"</font><p><font color=\"#333333\">"+dataObj.data+'</font></p></div>');
   $("#right_mid").html(dataObj.data);//右边显示刚发送的文字
   $("#zititle_user"+dataObj.fromuserid).addClass("td_user_msg");
   $("#zinotitle_user"+dataObj.fromuserid).addClass("td_user_msg");
   $(".my_show").scrollTop($(".con_box").height()-$(".my_show").height());//让滚动滚到最底端

    document.title = dataObj.data;
    //标题闪烁
    var timerArr = $.blinkTitle.show();
    setTimeout(function() {//此处是过一定时间后自动消失
        $.blinkTitle.clear(timerArr);
    }, 10000);
    document.title = webtitle;
   ////

}



/*
* 显示群聊消息
* */
function showQlUserMsg(dataObj)
{
    var timestamp3 = dataObj.time;
    var newDate  = new Date();
    newDate.setTime(timestamp3 *1000);
    var t = " "+newDate.toLocaleTimeString();
    var divArr = $(".con_box div[id^='user_contitle_user']");
     if(divArr.length == 0 || (divArr.length >0 && $("#user_contitle_userall").length == 0) ){
        dandan.title_newuser('title_userall','群聊','all');
    }
    $("#zititle_userall").addClass("td_user_msg");
    $("#zinotitle_userall").addClass("td_user_msg");
    $("#user_contitle_userall").html( $("#msg_all").html() );
    if($("#user_contitle_userall").length > 0)
    {
        $("#user_contitle_userall").append('<div class="my_say_con"><font color=\"#0000FF\">'+dataObj.from_username+t+"</font><p><font color=\"#333333\">"+dataObj.data+'</font></p></div>');
    }
    $("#msg_all").append('<div class="my_say_con"><font color=\"#0000FF\">'+dataObj.from_username+t+"</font><p><font color=\"#333333\">"+dataObj.data+'</font></p></div>');

    document.title = dataObj.data;
    //标题闪烁
    var timerArr = $.blinkTitle.show();
    setTimeout(function() {//此处是过一定时间后自动消失
        $.blinkTitle.clear(timerArr);
    }, 10000);
    document.title = webtitle;
  ////
    $(".my_show").scrollTop($(".con_box").height()-$(".my_show").height());//让滚动滚到最底端
}






//显示消息记录
function showMsgHistory(message)
{
    var data = message.data;
    var i =0;
    $.each(data,function(key,value) {
		if(value.user_name == null){
               return;
           }
        //console.log("key:"+key+" ----value:"+value);
        var timestamp3 = value.time;
        var newDate  = new Date();
        newDate.setTime(timestamp3 *1000);
        var t = " "+newDate.toLocaleTimeString();
        var from_user_id = value.user_id;
        var touserid = value.touserid;
        if(touserid =='all'){
            $("#msg_all").append('<div class="my_say_con"><font color=\"#0000FF\">'+value.user_name+t+"</font><p><font color=\"#333333\">"+value.msg+'</font></p></div>');
             return ;
        }
        if(from_user_id == user_id){
               from_user_id = value.touserid;
           }
        var ing_user =  'title_user'+from_user_id;
        if(i==0)
        {
            $("#user_con"+ing_user+">div").remove(".my_say_con");
            i++;
        }
        $("#user_con"+ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">'+value.user_name+t+"</font><p><font color=\"#333333\">"+value.msg+'</font></p></div>');
      });
    $(".my_show").scrollTop($(".con_box").height()-$(".my_show").height());//让滚动滚到最底端
}

/*
* 未读消息
* */
function getnoreadmessage(message)
{
    var data = message.data;
    if(data.length <1){
         return true;
    }
    $.each(data,function(key,value) {
        var id = $("#user"+value.user_id);
        if(typeof(id)=='undefined' || id.length <=0){
            var arrlen = $arr_user.length+1;
            $arr_user[arrlen] = Array(value.user_name,'0',value.user_id);
            dandan.newuser('.ul_2',$arr_user[arrlen],arrlen);//创建用户
        }
        var id =  "user"+value.user_id;
        var ing_user =  $("#"+id).attr("data-index");
        if($("#user_con"+ing_user).length <= 0){
            $("#"+id).click();
        }
        $("#zi"+ing_user).addClass("td_user_msg");
        $("#zinot"+ing_user).addClass("td_user_msg");
        var timestamp3 = value.time;
        var newDate  = new Date();
        newDate.setTime(timestamp3 *1000);
        var t = " "+newDate.toLocaleTimeString();
        $("#user_con"+ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">'+value.user_name+t+"</font><p><font color=\"#333333\">"+value.data+'</font></p></div>');
     });
    $(".my_show").scrollTop($(".con_box").height()-$(".my_show").height());//让滚动滚到最底端
}

 
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
   var t= new Date().toLocaleTimeString();//当前时间
   $("#user_con"+ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">'+dataObj.from_username+t+"</font><p><font color=\"#333333\">"+dataObj.data+'</font></p></div>');
   $("#right_mid").html(dataObj.data);//右边显示刚发送的文字
   $("#zititle_user"+dataObj.fromuserid).addClass("td_user_msg");
   $("#zinotitle_user"+dataObj.fromuserid).addClass("td_user_msg");
}



/*
* 显示群聊消息
* */
function showQlUserMsg(dataObj)
{
    var timestamp3 = dataObj.time;
    var newDate  = new Date();
    newDate.setTime(timestamp3 *1000);
    var t = newDate.toLocaleTimeString();
    var divArr = $(".con_box div[id^='user_contitle_user']");
     if(divArr.length == 0 || (divArr.length >0 && $("#user_contitle_userall").length == 0) ){
        dandan.title_newuser('title_userall','群聊','all');
    }

    $("#user_contitle_userall").html( $("#msg_all").html() );

    if($("#user_contitle_userall").length > 0)
    {
        $("#user_contitle_userall").append('<div class="my_say_con"><font color=\"#0000FF\">'+dataObj.from_username+t+"</font><p><font color=\"#333333\">"+dataObj.data+'</font></p></div>');
    }
    $("#msg_all").append('<div class="my_say_con"><font color=\"#0000FF\">'+dataObj.from_username+t+"</font><p><font color=\"#333333\">"+dataObj.data+'</font></p></div>');

}





//显示消息记录
function showMsgHistory(message)
{
    var data = message.data;
    var i =0;
    $.each(data,function(key,value) {
        //console.log("key:"+key+" ----value:"+value);
        var from_user_id = value.user_id;
        if(from_user_id == user_id){
               from_user_id = value.touserid;
           }
        //var ing_user = $(".client_"+from_user_id).attr('data-index');

        var ing_user =  'title_user'+from_user_id;
        if(i==0)
        {
            $("#user_con"+ing_user+">div").remove(".my_say_con");
            i++;
        }
        var timestamp3 = value.time;
        var newDate  = new Date();
        newDate.setTime(timestamp3 *1000);
        var t = newDate.toLocaleTimeString();
        $("#user_con"+ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">'+value.user_name+t+"</font><p><font color=\"#333333\">"+value.msg+'</font></p></div>');
      });

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
        var timestamp3 = value.time;
        var newDate  = new Date();
        newDate.setTime(timestamp3 *1000);
        var t = newDate.toLocaleTimeString();
        $("#user_con"+ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">'+value.user_name+t+"</font><p><font color=\"#333333\">"+value.data+'</font></p></div>');
     });

}






//function showMsgData(dataObj) {
//    var t = new Date().toLocaleTimeString();//当前时间
//    $("#user_con" + ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">' +dataObj.username + t + "</font><p><font color=\"#333333\">" + trim2(trim(dataObj.data)) + '</font></p></div>');
//    $("#right_mid").html($("#texterea").val());//右边显示刚发送的文字
//    $("#texterea").val("");
//    $(".my_show").scrollTop($(".con_box").height() - $(".my_show").height());//让滚动滚到最底端
//}

/**
 * 显示所有在线列表
 * @param dataObj
 */
function showHistory(dataObj) {
    var msg;
    console.dir(dataObj);
    for (var i = 0; i < dataObj.history.length; i++) {
        msg = dataObj.history[i]['msg'];
        if (!msg) continue;
        msg['time'] = dataObj.history[i]['time'];
        msg['user'] = dataObj.history[i]['user'];
        if (dataObj.history[i]['type'])
        {
            msg['type'] = dataObj.history[i]['type'];
        }
        msg['channal'] = 3;
        showNewMsg(msg);
    }
}

/**
 * 当有一个新用户连接上来时
 * @param dataObj
 */
function showNewUser(dataObj) {
    if (!userlist[dataObj.fd]) {
        userlist[dataObj.fd] = dataObj.name;
        if (dataObj.fd != client_id) {
            $('#userlist').append("<option value='" + dataObj.fd + "' id='user_" + dataObj.fd + "'>" + dataObj.name + "</option>");

        }
        $('#left-userlist').append(
            "<li id='inroom_" + dataObj.fd + "'>" +
                '<a href="javascript: selectUser(\'' + dataObj.fd + '\')">' + "<img src='" + dataObj.avatar
                + "' width='50' height='50'></a></li>");
    }
}

/**
 * 显示新消息
 */
function showNewMsg(dataObj) {

    var content;
    if (!dataObj.type || dataObj.type == 'text') {
        content = xssFilter(dataObj.data);
    }
    else if (dataObj.type == 'image') {
        var image = eval('(' + dataObj.data + ')');
        content = '<br /><a href="' + image.url + '" target="_blank"><img src="' + image.thumb + '" /></a>';
    }

    var fromId = dataObj.from;
    var channal = dataObj.channal;

    content = parseXss(content);
    var said = '';
    var time_str;

    if (dataObj.time) {
        time_str = GetDateT(dataObj.time)
    } else {
        time_str = GetDateT()
    }

    $("#msg-template .msg-time").html(time_str);
    if (fromId == 0) {
        $("#msg-template .userpic").html("");
        $("#msg-template .content").html(
            "<span style='color: green'>【系统消息】</span>" + content);
    }
    else {
        var html = '';
        var to = dataObj.to;

        //历史记录
        if (channal == 3)
        {
            said = '对大家说:';
            html += '<span style="color: green">【历史记录】</span><span style="color: orange">' + dataObj.user.name + said;
            html += '</span>';
        }
        //如果说话的是我自己
        else {
            if (client_id == fromId) {
                if (channal == 0) {
                    said = '我对大家说:';
                }
                else if (channal == 1) {
                    said = "我悄悄的对" + userlist[to] + "说:";
                }
                html += '<span style="color: orange">' + said + ' </span> ';
            }
            else {
                if (channal == 0) {
                    said = '对大家说:';
                }
                else if (channal == 1) {
                    said = "悄悄的对我说:";
                }

                html += '<span style="color: orange"><a href="javascript:selectUser('
                    + fromId + ')">' + userlist[fromId] + said;
                html += '</a></span> '
            }
        }
        html += content + '</span>';
        $("#msg-template .content").html(html);
    }
    $("#chat-messages").append($("#msg-template").html());
    $('#chat-messages')[0].scrollTop = 1000000;
}

function xssFilter(val) {
    val = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x22/g, '&quot;').replace(/\x27/g, '&#39;');
    return val;
}

function parseXss(val) {
    val = val.replace(/#(\d*)/g, '<img src="/static/img/face/$1.gif" />');
    val = val.replace('&amp;', '&');
    return val;
}


function GetDateT(time_stamp) {
    var d;
    d = new Date();

    if (time_stamp) {
        d.setTime(time_stamp * 1000);
    }
    var h, i, s;
    h = d.getHours();
    i = d.getMinutes();
    s = d.getSeconds();

    h = ( h < 10 ) ? '0' + h : h;
    i = ( i < 10 ) ? '0' + i : i;
    s = ( s < 10 ) ? '0' + s : s;
    return h + ":" + i + ":" + s;
}

function getRequest() {
    var url = location.search; // 获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);

        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            var decodeParam = decodeURIComponent(strs[i]);
            var param = decodeParam.split("=");
            theRequest[param[0]] = param[1];
        }

    }
    return theRequest;
}

function selectUser(userid) {
    $('#userlist').val(userid);
}

function delUser(userid) {
    $('#user_' + userid).remove();
    $('#inroom_' + userid).remove();
    delete (userlist[userid]);
}

function sendMsg(content, type) {
    var msg = {};

    if (typeof content == "string") {
        content = content.replace(" ", "&nbsp;");
    }

    if (!content) {
        return false;
    }

    if ($('#userlist').val() == 0) {
        msg.cmd = 'message';
        msg.from = client_id;
        msg.channal = 0;
        msg.data = content;
        msg.type = type;
        ws.send($.toJSON(msg));
    }
    else {
        msg.cmd = 'message';
        msg.from = client_id;
        msg.to = $('#userlist').val();
        msg.channal = 1;
        msg.data = content;
        msg.type = type;
        ws.send($.toJSON(msg));
    }
    showNewMsg(msg);
    $('#msg_content').val('')
}

$(document).ready(function () {
    var a = '';
    for (var i = 1; i < 20; i++) {
        a = a + '<a class="face" href="#" onclick="selectFace(' + i + ');return false;"><img src="/static/img/face/' + i + '.gif" /></a>';
    }
    $("#show_face").html(a);
});

(function ($) {
    $.fn.extend({
        insertAtCaret: function (myValue) {
            var $t = $(this)[0];
            if (document.selection) {
                this.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            }
            else if ($t.selectionStart || $t.selectionStart == '0') {

                var startPos = $t.selectionStart;
                var endPos = $t.selectionEnd;
                var scrollTop = $t.scrollTop;
                $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
                this.focus();
                $t.selectionStart = startPos + myValue.length;
                $t.selectionEnd = startPos + myValue.length;
                $t.scrollTop = scrollTop;
            }
            else {

                this.value += myValue;
                this.focus();
            }
        }
    })
})(jQuery);


function selectFace(id) {
    var img = '<img src="/static/img/face/' + id + '.gif" />';
    $("#msg_content").insertAtCaret("#" + id);
    closeChatFace();
}


function showChatFace() {
    $("#chat_face").attr("class", "chat_face chat_face_hover");
    $("#show_face").attr("class", "show_face show_face_hovers");
}

function closeChatFace() {
    $("#chat_face").attr("class", "chat_face");
    $("#show_face").attr("class", "show_face");
}

function toggleFace() {
    $("#chat_face").toggleClass("chat_face_hover");
    $("#show_face").toggleClass("show_face_hovers");
}


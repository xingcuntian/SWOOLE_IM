$(function (){
/*
作者：mr yang
网站：www.seejoke.com
email:admin@seejoke.com
*/						
   window['dandan']={}
   var ing_user;//当前用户
   var ing_clientid ; //发送的连接ID
   var to_user_id;
   var groupid;
   //浏览器
   function liulanqi(){
	  var h=$(window).height();
	  var w=$(window).width();
	  $("#top").width(w);
	  $("#foot").html(h);
	 
	  $(".box").height(h-135);
	  $("#mid_con").height(h-255);
	  $(".right_box").height(h-134);
	  $("#mid_say textarea").width(w-480);
	  
	  if($(".box").height()<350){
		$(".box").height(350)
		 }
	  if($("#mid_con").height()<230){
		 $("#mid_con").height(230)
		  }
	  if($(".right_box").height()<351){
		 $(".right_box").height(351)
		  }
	  if($("#mid_say textarea").width()<320){
		  $("#mid_say textarea").width(320)
		  }
	 
/*	 if($("#mid_foot").width()<400){
		 $("#mid_foot").width(400)
		 }  */
		  
	  	  
		  
	  if(w<=800){
		  $("#top").width(800);
		  $("#body").width(800)
		   }else{
		  $("#body").css("width","100%")  
		}	  
	  //$("#top").html(b_h);
	  
	  $(".my_show").height($("#mid_con").height()-30);//显示的内容的高度出现滚动条
	  //$(".my_show").scrollTop($(".con_box").height()-$(".my_show").height());//让滚动滚到最底端.在这里不加这句了，没多用，可能还卡
	  
	  //右边的高度
	  r_h=$(".right_box").height()-40*3;
	  $("#right_top").height(r_h*0.25)
	  $("#right_mid").height(r_h*0.45)
	  $("#right_foot").height(r_h*0.3)
	  
   }
   window['dandan']['liulanqi']=liulanqi;
   
 //时间
function mytime(){
   var now=(new Date()).getHours();
    if(now>0&&now<=6){
	  return "午夜好";
    }else if(now>6&&now<=11){
	  return  "早上好";
    }else if(now>11&&now<=14){
	  return "中午好";
    }else if(now>14&&now<=18){
	  return "下午好";
   }else{
	  return "晚上好";
   }
}
window['dandan']['mytime']=mytime;   
   
   
   
   
//触发浏览器   
$(window).scroll( function() { dandan.liulanqi();  } );//滚动触发
$(window).resize(function(){ dandan.liulanqi(); return false; });//窗口触发
//alert("??????")
dandan.liulanqi();




//ctrl+回车
    $("body").bind('keyup',function(event) {   
         if(event.ctrlKey&&event.keyCode==13){   
            saysay();
        }
		if(!event.ctrlKey&&event.keyCode==13){
			myenter();
			}
    }); 
//发送按钮 
    $("#mid_sand").click(function (){
           	saysay();						   
    })
	 
	

			 
//替换所有的回车换行   
function trim2(content)   
{   
    var string = content;   
    try{   
        string=string.replace(/\r\n/g,"<br />")   
        string=string.replace(/\n/g,"<br />");         
    }catch(e) {   
        alert(e.message);   
    }   
    return string;   
} 	
//替换所有的空格
function trim(content)   
{   
    var string = content;   
    try{   
        string=string.replace(/ /g,"&nbsp;")        
    }catch(e) {   
        alert(e.message);   
    }   
    return string;   
} 	

			 
			 
function myenter(){
    //回车键的时候换行，留以后可以有用
}			 
			 
			 

	

//显示个数
function user_geshu(){
     var length1=$(".ul_1 > li").length;
     var length2=$(".ul_2 > li").length;
     $(".n_geshu_1").text(length1);
     $(".n_geshu_2").text(length2);	
}
user_geshu()
//alert(length1)

//点击展开会员
$(".h3").click(function (){
	 $(this).toggleClass("click_h3").next(".ul").toggle(600);
});

//鼠标经过会员的时候
function hover_user($this){
  $($this).hover(
    function () {
     $(this).addClass("hover");
    },
    function () {
      $(this).removeClass("hover");
    }
  );
}

//经过输入文本框的时候
$("#texterea").hover(
  function () {
    $(this).addClass("textarea2");
  },
  function () {
    $(this).removeClass("textarea2");
  }
);
//alert($admin_name);
$("#right_foot").html('<p><img src="/static/images/head.jpg" alt="头象" /></p>'+$admin_name);


//过滤所有的空格
function kongge(content)   
{   
    return content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');   
} 
window['dandan']['kongge']=kongge;



/*******************************************************************************************/
//创建新用户
function newuser($this,arr,i,ing){
	var id="user";

    $arr_user[arr[2]] = arr;

	//alert(ing)
	if(ing!=undefined){//创建最近聊天
        var ischid = $($this).find("#"+id+arr[2]+"");
        if(ischid.length > 0){
               return true;
        }
	   //alert("最近聊天为真");
	   $($this).prepend('<li  data-index="title_'+id+arr[2]+'"  class="client_'+arr[2]+'"  id="'+id+arr[2]+'">'+arr[0]+'</li>');
	   $('#'+id+arr[2]).click(function(){title_newuser('title_'+id+ing,arr[0],arr[2]); });//给按钮加事件
	}else{//创建好友
	  $($this).append('<li data-index="title_'+id+arr[2]+'"  class="client_'+arr[2]+'" id="'+id+arr[2]+'">'+arr[0]+'</li>');
	  $('#'+id+arr[2]).click(function(){title_newuser('title_'+id+arr[2],arr[0],arr[2]); });//给按钮加事件
	}
	hover_user('#'+id+arr[2]);//给经过触发
	user_geshu();//更新人数
}
window['dandan']['newuser']=newuser;

////更新最近聊天的位置
function ing_my_user($this,arr,i,ing){
	var id="user";
	$("#"+id+arr[2]).remove();
	$($this).prepend('<li  data-index="title_'+id+arr[2]+'"  class="client_'+arr[2]+'"  id="'+id+arr[2]+'">'+arr[0]+'</li>');
	$('#'+id+arr[2]).click(function(){title_newuser('title_'+id+ing,arr[0],arr[2]); });//给按钮加事件
	hover_user('#'+id+i);//给经过触发	
}

//创建标题栏和主控制（原是有一个主控制，忘了，就合在一起了，哈哈）
function title_newuser(id,user,fto_user_id){
    //群聊
    //var groupChatLen = $("#msg_all>div").length;
    //if(groupChatLen >=1){
    //    groupid = 'title_userall';
    //    var groupuser = '我的好友们';
    //    if($("#"+groupid).length <1 ){
    //        $("#mid_top").append('<div id="'+groupid+'" class="list"><table border="0" cellspacing="0" cellpadding="0"><tr><td id="zi'+groupid+'" class="td_user td_user_click">'+groupuser+'</td><td id="zino'+groupid+'" class="td_hide td_hide_click">X</td></tr></table></div>');
    //        $('#'+groupid).click(function(){title_newuser(groupid,groupuser,'all'); });//给按钮加事件
    //        //关闭
    //        $("#zino"+groupid).click(function(){delete_user(groupid,groupuser,'all'); return false });//关闭打开的
    //        my_user_con(groupuser,groupid);
    //    }else{
    //        $("#zino"+groupid).addClass("td_hide_click");//给自己加样式
    //        $("#zi"+groupid).addClass("td_user_click");//给自己加样式
    //    }
    //
    //    my_siblings("#"+groupid);//去掉兄弟样式
    //}
    //群聊 end

	  if($("#"+id).length<1){
	  $("#mid_top").append('<div id="'+id+'" class="list"><table border="0" cellspacing="0" cellpadding="0"><tr><td id="zi'+id+'" class="td_user td_user_click">'+user+'</td><td id="zino'+id+'" class="td_hide td_hide_click">X</td></tr></table></div>');

	  //创建完成后给事件
	  //alert('#'+id)
	  $('#'+id).click(function(){title_newuser(id,user,to_user_id); });//给按钮加事件
	  //关闭
	  $("#zino"+id).click(function(){delete_user(id,user,to_user_id); return false });//关闭打开的
	  
	  
	  }else{
	  $("#zino"+id).addClass("td_hide_click");//给自己加样式
	  $("#zi"+id).addClass("td_user_click");//给自己加样式
	  }
	  my_siblings("#"+id);//去掉兄弟样式
	  
	  //创建内容框
	  my_user_con(user,id);
	  
	  //创建头像
	  my_user_head(user,id,to_user_id);
	  
	  ing_user=id;//当前用户
      to_user_id = fto_user_id;
      groupid = '';

	  $("#right_mid").html("");//清空右边的内容
}

 window['dandan']['title_newuser'] = title_newuser;

//去掉兄弟的样式
function my_siblings($this){
     $($this).siblings().children().children().children().children().removeClass("td_hide_click td_user_click");
}

//创建右边的头像
function my_user_head(user,id,img){
	if($(".head"+id).length<1){
	   img="/static/user_img/0.jpg";
       $("#right_top").append('<div class="head'+id+'"><p><img src="'+img+'" alt="'+user+'" /></p>'+user+'<div>');
	   $(".head"+id).hide();//默认是隐藏，让它有一点效果
	}
	sibli_hide(".head"+id);
}
//隐藏兄弟头像
function sibli_hide($this){
     $($this).show(500,function(){$(".my_show").scrollTop($(".con_box").height()-$(".my_show").height());/*让滚动滚到最底端*/}).siblings().hide(500);//隐藏其他兄弟
}
//创建内容框
function my_user_con(user,id){
	if($("#user_con"+id).length<1){
	   $(".con_box").append('<div id="user_con'+id+'"><font color="#CCCCCC">请在下面文本框里输入你想要聊天的内容，与用户【'+user+'】聊天 【<a href="javascript:showHistory(\''+id+'\')">点击查看消息记录</a>】</font></div>');
	   $("#user_con"+id).hide();//默认隐藏，增加效果
	}
	sibli_hide("#user_con"+id);//隐藏兄弟
}

//关闭打开的窗口
function delete_user(id,user,img){
	if(ing_user==id){
		if(confirm('你确定要关闭 '+user+' 聊天窗口吗？\n 注意哦，关闭后你跟 '+user+' 的聊天记录就不见了哦')){
	    //alert(id);
		//alert($("#user_con"+id).text());//内容
		//alert($(".head"+id).html());//头像
		$("#"+id).remove();//栏目栏目
		$("#user_con"+id).remove();//删除内容
		$(".head"+id).remove();//删除头像
		 //alert($(".list").length);//还有几个栏目
		 if($(".list").length>0){
			 var eq=$(".list").length-1;
			 //alert($(".list:eq("+eq+")").attr("id"));
			 var old_id=$(".list:eq("+eq+")").attr("id");
			 sibli_hide(".head"+old_id);//显示最后一个的头像
			 sibli_hide("#user_con"+old_id);//显示最后一个的内容
			 $("#zino"+old_id).addClass("td_hide_click");//给最后一个加样式
	         $("#zi"+old_id).addClass("td_user_click");//给最后一个加样式
			 ing_user=old_id;//给聊天框定位
			 //alert(ing_user);
			 
		 }else{
		     //alert("已经全部删除");
			 $("#msg_all").show(500)
		 };
		
	    }
	}else{
		title_newuser(id,user,img);
	}
}


//发送后调用此方法
 function saysay(){
     var content = $("#texterea").val();
          content = content.replace(" ", "&nbsp;");
     var msg = {};
     var t = new Date().toLocaleTimeString();//当前时间

     if(content.length ==0 ){
          alert("你输入的内容为空")
          return false;
     }

     var divArr = $(".con_box div[id^='user_contitle_user']");
     $.each(divArr,function(i,n){
         var is_hidle = $(n).css('display');
         if(is_hidle =='block'){
             var getid = $(n).attr('id');
             to_user_id =  getid.replace("user_contitle_user","");
         }
     });

     //群聊
	 if(typeof(to_user_id) == "undefined"  || to_user_id =='all'){
         msg.cmd = 'qmessage';
         msg.to = 'all';
         msg.fromuserid = user_id;
         msg.data= content;
         msg.type=1;
         ws.send($.toJSON(msg));
         $("#msg_all").append('<div class="my_say_con"><font color=\"#0000FF\">'+user_name+t+"</font><p><font color=\"#333333\">"+content+'</font></p></div>');
         if($("#user_contitle_userall").length > 0)
         {
             $("#user_contitle_userall").append('<div class="my_say_con"><font color=\"#0000FF\">'+user_name+t+"</font><p><font color=\"#333333\">"+content+'</font></p></div>');
         }
         $("#texterea").val("");
         return false;
		 }

      //单聊
	  $("#user_con"+ing_user).append('<div class="my_say_con"><font color=\"#0000FF\">'+$admin_name+t+"</font><p><font color=\"#333333\">"+trim2(trim($("#texterea").val()))+'</font></p></div>');
	  $("#right_mid").html($("#texterea").val());//右边显示刚发送的文字
	  $("#texterea").val("");
	  $(".my_show").scrollTop($(".con_box").height()-$(".my_show").height());//让滚动滚到最底端

      //websocket start
              msg.cmd = 'message';
              msg.to = to_user_id;
              msg.fromuserid = user_id;
              msg.data= content;
              msg.type=0;
              ws.send($.toJSON(msg));
         // websocket end

	   var ing_id=ing_user.substring(10,ing_user.length);
          $("#texterea").focus();//光标焦点
         if(ing_id == 'all'){
             return true;
         }
	   if($("#usering"+ing_id).length<1){//创建最近聊天人
	       dandan.newuser('.ul_1',$arr_user[ing_id],ing_id,ing_id);//创建最近聊天
	   }else{
		   ing_my_user('.ul_1',$arr_user[ing_id],ing_id,ing_id);//更新最近聊天的位置
	   }


	}  




//欢迎
$("#top").html('<br />&nbsp;&nbsp;'+dandan.mytime()+','+$admin_name+',欢迎你的到来！！');

//加载用户
$(".ul").html("");//初始清空原来留在那里让w3c通过的
for(i=0;i<$arr_user.length;i++){
    dandan.newuser('.ul_2',$arr_user[i],i);//创建用户
	
}

})

//获取历史记录
function showHistory(id){
  var msg = {};
  id = id.replace("title_", "");
  var user  = $("#"+id).attr("class");
  var touser_id = user.replace("client_", "");
      msg.cmd = 'getHistory';
      msg.touser_id = touser_id;
      msg.user_id = user_id;
      msg.page = 1;
      ws.send($.toJSON(msg));
}
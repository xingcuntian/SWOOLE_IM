<!DOCTYPE HTML>
<html>
<head>
    <title>Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="keywords" content="Baxster Responsive web template, Bootstrap Web Templates, Flat Web Templates, Android Compatible web template,
SmartPhone Compatible web template, free WebDesigns for Nokia, Samsung, LG, SonyEricsson, Motorola web design" />
    <script type="application/x-javascript"> addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false); function hideURLbar(){ window.scrollTo(0,1); } </script>
    <!-- Bootstrap Core CSS -->
    <link href="/static/css/bootstrap.css" rel='stylesheet' type='text/css' />
    <!-- Custom CSS -->
    <link href="/static/css/style.css" rel='stylesheet' type='text/css' />
    <!-- font CSS -->
    <link rel="icon" href="favicon.ico" type="image/x-icon" >
    <!-- font-awesome icons -->
    <link href="/static/css/font-awesome.css" rel="stylesheet">

</head>
<body class="login-bg">
<div class="login-body">
    <div class="login-heading">
        <h1>Login</h1>
    </div>
    <div class="login-info">
        <form action="/user/login" method="post">
            <input type="text" class="user"  name="username"  required="">
            <input type="password"name="password" class="lock" placeholder="Password">
            <div class="forgot-top-grids">
                <div class="forgot-grid">
                    <ul>
                        <li>
                            <input type="checkbox" name="autologin" id="brand1" value="1">
                            <label for="brand1"><span></span>Remember me</label>
                        </li>

                        <li style="margin-left:120px;">
                            <label for="brand1"><span></span><a href="/user/register"> 注册用户</a></label>
                        </li>

                    </ul>
                </div>
                <div class="forgot">
                </div>
                <div class="clearfix"> </div>
            </div>
            <input type="submit" name="Sign In" value="Login">
            <div class="signup-text">
                <a href="/user/register">Don't have an account? Create one now</a>
            </div>
            <hr>

        </form>
    </div>
</div>
<div class="go-back login-go-back">
    <a href="index.html">Go To Home</a>
</div>
<div class="copyright login-copyright">
    <p>Copyright &copy; 2016.Company name All rights reserved.<a target="_blank" href="http://sc.chinaz.com/moban/">&#x7F51;&#x9875;&#x6A21;&#x677F;</a></p>
</div>
</body>
</html>

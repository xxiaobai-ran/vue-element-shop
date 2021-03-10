<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="@/assets/logo.png"/>
      </div>
    <!--登陆表单区域-->
    <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="0px" class="login_form">
      <!--用户名-->
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
      </el-form-item>
      <!--密码-->
      <!--通过prop，绑定相应的验证规则-->
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" prefix-icon="el-icon-lollipop" type="password"></el-input>
      </el-form-item>
      <!--按钮区域-->
      <el-form-item class="btns">
        <!--登录之前要对整个表单进行预验证-->
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data(){
      return{
        loginForm:{
          username:'admin',
          password:'123456'
        },
        // 表单的验证规则
        rules:{
          username:[
            { required: true, message: '请输入用户名称', trigger: 'blur' },
          ],
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods:{
      //点击按钮进行重置表单
      resetLoginForm(){
        this.$refs.loginFormRef.resetFields();
      },
      login(){
        this.$refs.loginFormRef.validate(async valid=>{
          // console.log(valid); 如果表单全部验证通过，则valid返回为true,否则为false
          if(!valid){
            return;
          }else {
            const {data: res} = await this.$http.post("login", this.loginForm);
            if(res.meta.status !==200){
              this.$message.error('登陆失败');
            }else{
              this.$message.success('登录成功')
              //1. 将登录成功之后的token,保存到客户端的sessionStorage中
              //   1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
              //   1.2 token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
              //把token保存到sessionStorage中
              window.sessionStorage.setItem("token",res.data.token);
              //2. 通过编程式导航跳转到后台主页，路由地址是/home
              this.$router.push("/home");
            }
          }
        })
      }

    }
  }
</script>

<style scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}

.avatar_box{
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px;
  background-color: white;

}

.avatar_box img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;

}
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns{
    display: flex;
    justify-content: flex-end;
  }

</style>
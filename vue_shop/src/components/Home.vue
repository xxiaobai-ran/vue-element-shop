<template>
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="@/assets/Home/heima.png"/>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse ? '64px' :'200px'">
        <div class="toggle-button" @click="toogleCollapse">|||</div>
        <!--侧边栏菜单区域-->
        <el-menu
                :default-active = "activePath"
                :router="true"
                background-color="#333744"
                text-color="#fff"
                active-text-color="#409FFF"
                :unique-opened="true"
                :collapse="isCollapse"
                :collapse-transition="false"
        >
          <!--:router="true"可以简写为router-->
          <!--一级菜单-->
          <!--想要点第一个菜单,后面的不跟着展开,就需要index值不一样,又因为index只接收字符串,不接受数值,所以加一个空字符串-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!--一级菜单的模板区域-->
            <template slot="title">
              <!--图标-->
              <i :class="iconsObj[item.id]"></i>
              <!--文本-->
              <span>{{item.authName}}</span>
            </template>

            <!--以索引值路由跳转，当索引值为path设置时，直接跳转到对应的path，然后路由中又设置了path对应的情况-->
            <el-menu-item :index="'/' + subItem.path"  v-for="subItem in item.children" :key="subItem.id"
@click="saveNavState(item.path)">         <!--二级菜单的模板区域-->
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容主体-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        //左侧菜单数据
        menulist: [],
        //左侧的一级图标图案每个不同
        iconsObj: {
          '125': 'el-icon-star-off',
          '103': 'el-icon-rank',
          '101': 'el-icon-magic-stick',
          '102': 'el-icon-coordinate',
          '145': 'el-icon-present',
        },
        //是否折叠
        isCollapse: false,
        //被激活的地址
        activePath:'',
      }
    },
    created() {
      this.getMenuList()
      //页面一被创建，就从sessiongStorage中获取键对应的激活的path
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    name: "Home",
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push("/login");
      },
      //获取所有的菜单
      async getMenuList() {
        const {data: res} = await this.$http.get('menus')
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        } else {
          this.menulist = res.data
        }

      },
      //点击按钮，切换菜单的折叠与展开
      toogleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      //保存链接的激活状态
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        // this.activePath = activePath
      }
    }

  }
</script>

<style scoped>
  .el-button {
    position: absolute;
    right: 20px;
  }

  .el-header {
    background-color: #373D41;
    display: flex;
    align-items: center;
    padding-left: 0;
    color: #fff;
    font-size: 20px;
  }

  .el-header > div {
    display: flex;
    align-items: center;
  }

  .el-header span {
    margin-left: 15px;
  }

  .el-aside {
    background-color: #333744;
  }

  .el-aside .el-menu {
    border-right: none;
  }

  .el-main {
    background-color: #eaedf1;
  }

  .home-container {
    height: 100%;
  }

  .el-submenu__title i {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4A5064;
    justify-content: center;
    display: flex;
    color: white;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

</style>
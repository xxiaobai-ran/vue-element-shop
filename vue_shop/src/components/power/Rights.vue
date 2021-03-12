<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片试图-->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <!--authName是看接口手册里的-->
        <!--在el-table-column中用prop属性来对应对象中的键名即可填入数据-->
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径名称" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!--作用域插槽-->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>

      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Rights",
    data(){
      return{
        //权限列表
        rightsList:[]
      }
    },
    //生命周期函数，一开始就要获取权限信息
    created(){
      //获取所有的权限
      this.getRightsList()
    },
    methods:{
     async getRightsList(){
      const {data: res} = await this.$http.get('rights/list')
       if(res.meta.status !== 200){
        return this.$message.error('获取权限列表失败')
       }else{
        this.rightsList = res.data
         console.log(this.rightsList);
       }
      }
    }

  }
</script>

<style scoped>

</style>
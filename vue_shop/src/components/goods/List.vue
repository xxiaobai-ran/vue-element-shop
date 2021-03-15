<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <!--@clear="getGoodsList"为了点取消键时，显示出现在的列表-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList" >
            <el-button slot="append" icon="el-icon-search"  @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"  @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!--商品列表区域-->
      <el-table
            :data="goodsList"
            border
            style="width: 100%"
            stripe
      >
        <el-table-column type="index" label="#" min-width="5%"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" min-width="70%"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" min-width="10%"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" min-width="10%"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" min-width="20%">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px" min-width="10%">
        <template slot-scope="scope">
          <!--修改-->
          <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
          <!--删除-->
          <el-button type="danger" icon="el-icon-delete" size="mini"  @click="removeUserById(scope.row.goods_id)"></el-button>
        </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[10, 15, 20, 25]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              background="">
      </el-pagination>
    </el-card>

    
  </div>
</template>

<script>
  export default {
    name: "List",
    data(){
      return{
        //获取商品列表
        goodsList:[],
        //查询条件，向后台查询时需要的请求参数
        queryInfo: {
          //搜索区肯定是会输入内容进行搜索的
          query:'',
          pagenum: 1,
          pagesize: 10

        },
        total:0,
    }
    },
    created(){
      this.getGoodsList()
    },
    methods:{
      //获取商品列表
      async getGoodsList(){
      const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
        if(res.meta.status !== 200){
            this.$message.error('获取商品列表失败')}else{
          this.goodsList = res.data.goods
          this.total = res.data.total
          console.log(res.data);
        }
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      //根据ID删除对应的用户信息
      async removeUserById(id) {
        // console.log(id);
        //弹框询问用户是否删除数据,如果点确认删除，会返回一个字符串
        //confirm,如果点取消，则会报错，所以用catch去捕捉错误，并return 出去，此时点取消删除，会返回一个字符串cancel,
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // .catch(err => {return err})
        if (confirmResult !== 'confirm') {
          return this.$message.info('已经取消了删除')
        } else {
          const {data: res} = await this.$http.delete('goods/' + id)
          if (res.meta.status !== 200) {
            this.$message.error('删除商品失败')
          } else {
            this.$message.success('已经成功删除商品')
            //刷新用户的信息表
            this.getGoodsList()
          }
        }
      },
      //跳转到添加商品页面
      goAddpage(){
        this.$router.push('/goods/add')
      }
    }
  }
</script>

<style scoped>

</style>
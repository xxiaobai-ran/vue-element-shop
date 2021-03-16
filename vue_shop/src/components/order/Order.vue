<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!--订单列表区域-->
      <el-table
              :data="orderList"
              border
              style="width: 100%"
              stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" min-width="300px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" min-width="120px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100px">
          <template slot-scope="scope">
            <!--修改-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <!--物流进度-->
            <el-button type="success" icon="el-icon-location" size="mini" ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>

      <!--修改地址的对话框-->
      <el-dialog
              title="修改地址"
              :visible.sync="addressVisible"
              width="50%">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData" v-model="addressForm.address1" @close="addressDialogClosed"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
  </span>
      </el-dialog>

      <!--展示物流进度-->
      <el-dialog
              title="物流进度"
              :visible.sync="progressVisible"
              width="50%"
      >
        <el-timeline>
          <el-timeline-item
                  v-for="(activity, index) in wuliuProgress"
                  :key="index"
                  :timestamp="activity.time">
            {{activity.content}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>

    </el-card>

  </div>
</template>

<script>
  import cityData from './citydata'

  export default {
    name: "Order",
    data() {
      return {
        //获取用户列表的参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        //订单列表
        orderList: [],
        total: 0,
        //修改地址的对话框
        addressVisible: false,
        addressForm: {
          address1: [],
          address2: ''
        },
        addressFormRules: {
          address1: [
            {required: true, message: '请选择省市区/县', trigger: 'blur'},
          ],
          address2: [
            {required: true, message: '请填写详细地址', trigger: 'blur'},
          ]
        },
        cityData: cityData,
        //展示物流进度
        progressVisible: false,
        wuliuProgress:[]
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      async getOrderList() {
        const {data: res} = await this.$http.get(`orders`, {params: this.queryInfo})
        if (res.meta.status !== 200) {
          return this.$message.error('获取订单列表数据失败')
        } else {
          this.orderList = res.data.goods
          this.total = res.data.total
          console.log('this.orderList');
          console.log(this.orderList);

        }
      },
      //监听pagesize 改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      //展示修改地址的对话框
      showBox() {
        this.addressVisible = true
      },
      addressDialogClosed() {
        this.$refs.addressFormRef.resetFields()
      },
      //展示物流进度
     // async showProgressBox() {
     //  const {data:res} = await this.$http.get('/kuaidi/1106975712662')
     //   if(res.meta.status !== 200){
     //    return this.$message.error('获取物流进度失败')
     //   }else{
     //     this.wuliuProgress = res.data
     //     this.progressVisible = true
     //     console.log(this.wuliuProgress);
     //   }
     //  }

    }
  }
</script>

<style scoped>
  .el-cascader {
    width: 100%;
  }
</style>
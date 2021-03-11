<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable="" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--用户列表区域-->
      <el-table
              :data="userlist"
              border
              style="width: 100%"
              border
              stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <!--scope.row显示当前这一行的数据-->
            <el-switch
                    v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
            <!--分配权限-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
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
    </el-card>

    <!--添加用户的对话框-->
    <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed"
    >
      <!--内容主体区-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <!--点击取消或确定都会隐藏对话框-->
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
    >
      <span>
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled=""></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
             <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
            </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>


  </div>
</template>

<script>
  export default {
    name: "Users",
    data() {
      //验证邮箱的校验规则
      var checkEmail = (rule, value, cb) => {
        //验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

        if (regEmail.test(value)) {
          //合法的邮箱
          return cb()
        } else {
          cb(new Error('请输入合法的邮箱'))
        }
      }

      //验证手机号的校验规则
      var checkMobile = (rule, value, cb) => {
        //验证手机号的正则表达式
        // const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        const regMobile = /^([a-zA-Z0-9_-])/

        if (regMobile.test(value)) {
          //合法的邮箱
          return cb()
        } else {
          cb(new Error('请输入合法的手机号'))
        }
      }

      return {
        //获取用户列表的参数对象
        queryInfo: {
          query: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 2
        },
        userlist: [],
        total: 0,
        //控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: '',
        },
        //添加表单的验证规则对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        //修改用户对话框的显示于隐藏
        editDialogVisible: false,
        //查询到的用户信息对象
        editForm: {}
      }
    },
    // 调用该函数，发送ajax请求，get请求返回一个promise对象
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const {data: res} = await this.$http.get('users', {params: this.queryInfo})
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        } else {
          this.userlist = res.data.users
          this.total = res.data.total
        }
      },
      //监听pagesize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },

      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage);
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },

      // //监听 switch 开关状态的改变--1.3.3  只要有请求，返回的就是promise
      async userStateChanged(userInfo) {
        console.log(userInfo);
        // this.$http.put(`users/:uId/state/:type`)
        const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败')
        } else {
          this.$message.success('更新用户状态成功')
        }
      },

      // //监听添加用户对话框的关闭事件,关闭之后清空表单中的内容
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },

      //点击按钮，添加新用户，进行预校验
      addUser() {
        // console.log('被点击了');
        this.$refs.addFormRef.validate(async valid => {
          console.log(valid);
          if (!valid) {
            return
          } else {
            //可以发起添加用户的网络请求
            const {data: res} = await this.$http.post('users', this.addForm)

            if (res.meta.status !== 201) {
              this.$message.error('添加用户失败')
            } else {
              this.$message.success('添加用户成功')
              //隐藏添加用户的对话框
              this.addDialogVisible = false
              //刷新用户的信息表
              this.getUserList()
            }
          }
        })
      },

      //展示编辑用户的对话框--1.3.4
      // 根据id查询到对应的用户信息，并保存到editForm
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户信息失败!')
        } else {
          this.editForm = res.data
          this.editDialogVisible = true
        }
      },

      //监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },

      //发起编辑用户的网络请求
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          console.log(valid);
          if (!valid) {
            return
          } else {
            //可以发起修改用户的网络请求
            const {data: res} = await this.$http.put('users/' + this.editForm.id, {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            })

            if (res.meta.status !== 200) {
              this.$message.error('编辑用户失败')
            } else {
              this.$message.success('编辑用户成功')
              //隐藏添加用户的对话框
              this.editDialogVisible = false
              //刷新用户的信息表
              this.getUserList()
            }
          }
        })
      },

      //根据ID删除对应的用户信息
      async removeUserById(id) {
        // console.log(id);
        //弹框询问用户是否删除数据,如果点确认删除，会返回一个字符串
        //confirm,如果点取消，则会报错，所以用catch去捕捉错误，并return 出去，此时点取消删除，会返回一个字符串cancel,
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // .catch(err => {return err})
        if (confirmResult !== 'confirm') {
          return this.$message.info('已经取消了删除')
        } else {
          const {data: res} = await this.$http.delete('users/' + id)
          if(res.meta.status !== 200){
             this.$message.error('删除用户失败')
          }else{
            this.$message.success('已经成功删除用户')
            //刷新用户的信息表
            this.getUserList()
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
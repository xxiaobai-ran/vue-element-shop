<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!--角色列表区域-->
    <el-table :data="rolelist" border stripe="">
      <!--展开列-->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <!--一共分为24列-->
          <el-row :class="['bdbottom', i1 === 0? 'bdtop':'','vcenter']" v-for="(item1, i1) in scope.row.children"
                  :key="item1.id">
            <!--渲染一级权限-->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!--渲染二级和三级权限-->
            <el-col :span="19">
              <!--通过for循环，嵌套渲染二级权限-->
              <el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2, i2) in item1.children"
                      :key="item2.id">
                <!--二级权限-->
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}
                  </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!--三级权限-->
                <!--item3.id是对应权限id-->
                <el-col :span="18">
                  <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item2.id" closable
                          @close="removeRightById(scope.row, item3.id)">{{item3.authName}}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>

          </el-row>
        </template>
      </el-table-column>
      <!--索引列-->
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!--修改-->
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <!--删除-->
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          <!--分配权限-->
          <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分配权限的对话框-->
    <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="setRightDialogClosed"
    >
      <!--树形控件-->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defkeys"
               ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        //所有角色列表数据
        rolelist: [],
        //控制分配权限对话框的显示与隐藏
        setRightDialogVisible: false,
        //所有权限的数据
        rightslist: [],
        //树形控件的属性绑定对象
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        //默认选中的节点ID值数组
        defkeys: [],
        //当前即将分配权限的角色id
        roleId: [],

      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      //获取所有角色的列表
      async getRolesList() {
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        } else {
          this.rolelist = res.data
          // console.log(this.rolelist);
        }
      },
      //根据Id删除对应的权限--1.5.7
      async removeRightById(role, rightId) {
        // console.log(id);
        //弹框询问用户是否删除数据,如果点确认删除，会返回一个字符串
        //confirm,如果点取消，则会报错，所以用catch去捕捉错误，并return 出去，此时点取消删除，会返回一个字符串cancel,
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // .catch(err => {return err})
        if (confirmResult !== 'confirm') {
          return this.$message.info('已经取消了删除')
        } else {
          const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          if (res.meta.status !== 200) {
            this.$message.error('删除权限失败')
          } else {
            this.$message.success('已经成功删除权限')
            //刷新用户的信息表
            // 直接这样调用getRolesList的话,会整个页面重新渲染
            // this.getRolesList()
            role.children = res.data
          }
        }
      },
      //展示分配权限的对话框
      async showSetRightDialog(role) {
        //保存当前展开的分配权限的用户的id
        this.roleId = role.id

        //获取所有权限的数据--1.4.1
        const {data: res} = await this.$http.get('rights/tree')
        this.setRightDialogVisible = true
        if (res.meta.status !== 200) {
          this.$message.error('获取权限失败')
        } else {
          //把获取到的权限数据保存到data中
          this.rightslist = res.data
          //递归获取三级节点的ID
          this.getLeafKeys(role, this.defkeys)

          this.$message.success('已经成功获取权限')

        }
      },
      //通过递归的形式，获取角色下所有三级权限的id,并保存到defkeys数组中
      getLeafKeys(node, arr) {
        //如果当前node节点不包含children属性，则是三级节点
        //如果包含，就往下接着寻找
        if (!node.children) {
          return arr.push(node.id)
        } else {
          node.children.forEach(item => this.getLeafKeys(item, arr))
        }
      },
      //监听分配权限对话框的关闭事件，关闭的时候，要把defkeys数组清空，不然的话，每次都往里存，会越来越多
      setRightDialogClosed() {
        this.defkeys = []
      },
      //点击为角色分配权限--点确定了之后，将分配权限加入后台数据中
      //1.5.6
      async allotRights() {
        // 点中的节点和半节点
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        //通过请求体发送
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
        if (res.meta.status !== 200) {
         return this.$message.error('角色分配权限失败')
        } else {
          this.$message.success('角色分配权限获成功')
        }
        //刷新角色列表
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }

</script>

<style scoped>
  .el-tag {
    margin-top: 7px;
    margin-left: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
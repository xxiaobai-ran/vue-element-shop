<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--提示区-->
      <el-alert
              title="添加商品信息"
              type="info"
              center
              show-icon
              :closable="false">
      </el-alert>
      <!--步骤条区域-->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--tab栏区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="`left`" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                      v-model="addForm.goods_cat"
                      :options="cateList"
                      :props="cateProps"
                      @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <!--渲染表单的item项-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!--复选框组-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>


          <el-tab-pane label="商品属性" name="2">
            <!--静态属性渲染-->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <!--action为上传图片的后台地址-->
            <!--本来这个上传图片，没有经过axios发送请求，所以我们直接这样上传是有问题的，会显示无效的token,所以这里添加手动header-->
            <el-upload
                    :action="uploadURL"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    list-type="picture"
                    :headers="headerObj"
                    :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!--添加商品的按钮-->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--图片预览-->
    <!--<span>这是一段信息</span>-->
    <!--此处的span替换为img-->
    <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%"
    >
      <img :src="previewPath" class="previewImg"/>
    </el-dialog>

  </div>
</template>

<script>
  import {quillEditor} from 'vue-quill-editor'
  import _ from 'lodash'

  export default {
    name: "Add",
    components: {
      quillEditor
    },
    data() {
      return {
        //默认点亮的索引值
        activeIndex: '0',
        //添加商品的表单数据对象
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          //级联选择器所选择的，商品所属的分类数组
          goods_cat: [],
          //图片的数组
          pics: [],
          //商品的详情描述-富文本
          goods_introduce: '',
          //静态属性和动态属性需要放一起
          attrs: []
        },
        addFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'},
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'},
            {type: 'number', message: '商品价格必须为数字值'}
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'},
            {type: 'number', message: '商品重量必须为数字值'}
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'},
            {type: 'number', message: '商品数量必须为数字值'}
          ],
          goods_cat: [
            {required: true, message: '请选择商品分类', trigger: 'blur'},
          ]
        },
        //获取的所有商品分类数据
        cateList: [],
        //级联选择器参数(商品分类列表)
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        //动态参数列表数据
        manyTableData: [],
        //静态参数列表数据
        onlyTableData: [],
        //上传图片的地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        //图片上传组件的headers请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        previewVisible: false

      }
    },
    created() {
      this.getCateLise()
    },
    methods: {
      //获取所有商品分类数据
      async getCateLise() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类数据失败')
        } else {
          this.cateList = res.data
        }
      },
      //级联选择器选中项变化，会触发这个函数
      handleChange() {
        console.log(this.addForm.goods_cat);
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },
      //不满足要求，标签页不能跳转到下一步
      beforeTabLeave(activeName, oldActiveName) {
        // console.log('即将离开的标签页名是' + oldActiveName);
        // console.log('即将进入的标签页名是' + activeName);
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类！')
          //return false禁止跳转
          return false
        }
      },
      //当前激活的index
      async tabClicked() {
        // console.log(this.activeIndex);
        // 证明当前访问的是动态参数面板
        if (this.activeIndex === '1') {
          // console.log('动态参数面板');
          //传入的第三级商品分类的ID，所以是[2]
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数列表失败')
          } else {
            console.log('动态参数数据');
            console.log(res.data);
            res.data.forEach(item => {
              item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
            })
            this.manyTableData = res.data
          }
        } else if (this.activeIndex === '2') {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态参数列表失败')
          } else {
            this.onlyTableData = res.data
            console.log(this.onlyTableData);
          }
        }
      },
      //处理图片预览效果，图片旁边有一个名称，一点击，图片就变大了
      handlePreview(file) {
        // console.log(file);
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      //处理移除图片的操作
      handleRemove(file) {
        console.log(file);
        //1.获取将要删除的图片的临时路径(pic)
        const filePath = file.response.data.tmp_path
        //2.从pics数组中，找到这个图片对应索引值
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        //3.调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.addForm.pics.splice(i, 1)
        // console.log(this.addForm.pics);

      },
      //监听图片上传成功的事件
      handleSuccess(response) {
        console.log(response);
        //1.拼接得到一个图片信息对象
        const picInfo = {
          pic: response.data.tmp_path
        }
        //2.将图片信息对象，push到pics数组中
        this.addForm.pics.push(picInfo)
        console.log(this.addForm);
      },
      //添加商品
      add() {
        //最后确认添加商品之前，对整个表单进行预验证
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项')
          } else {
            //执行添加的步骤
            //由于goods_cat在级联选择器的双向绑定里，需要是数组，而在添加商品上传到服务器里，需要是字符串，所以这里，需要对addForm做深拷lodash cloneDeep(obj)做一个深拷贝
            const form = _.cloneDeep(this.addForm)
            form.goods_cat = form.goods_cat.join(',')
            //处理动态属性
            this.manyTableData.forEach(item => {
              const newInfo = {
                attr_id: item.attr_id,
                attr_value: item.attr_vals.join(' ')
              }
              this.addForm.attrs.push(newInfo)
            })
            //处理静态参数
            this.onlyTableData.forEach(item => {
              const newInfo = {
                attr_id: item.attr_id,
                attr_value: item.attr_vals
              }
              this.addForm.attrs.push(newInfo)
            })
            form.attrs = this.addForm.attrs
            console.log('输出form');
            console.log(form);
            //发起请求，添加商品
            //商品的名称，必须是唯一的
            const {data: res} = await this.$http.post('goods', form)
            console.log('res.data');
            console.log(res.data)
            if (res.meta.status !== 201) {
              return this.$message.error('添加商品失败')
            } else {
              this.$message.success('添加商品成功')
              this.$router.push('/goods')
            }
          }
        })
      }
    },
    computed: {
      //计算第三级分类的id
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        } else {
          return null
        }
      }
    }
  }
</script>

<style scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 60%;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>
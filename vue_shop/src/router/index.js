import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: '/login',
    component:()=>import('@/components/Login')
  },
  {
    path:'/login',
    name:'Login',
    component:()=>import('@/components/Login')
  },
  {
    path: '/home',
    name: 'Home',
    component:()=>import('@/components/Home')
  }
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next)=>{
  //to: 去哪儿
  //from: 从哪儿来
  //next是一个函数，表示放行
  //next()放行，next('/login') 强制调制
  if(to.path==='/login'){
    return next()
  }else{
    //获取token
    const tokenStr = window.sessionStorage.getItem('token')
    // 如果token为空
    if(!tokenStr){
      return next('/login')
    }else{
      next()
    }
  }
})



export default router

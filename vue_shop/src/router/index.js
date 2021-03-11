import Vue from 'vue'
import VueRouter from 'vue-router'

// const welcome = () => import('@/components/Welcome')
// const login = () => import('@/components/Login')
// const Home = () => import('@/components/Home')
const Users = () => import('@/components/user/Users')


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: ()=>import('@/components/Login')
  },
  {
    path: '/home',
    component: () => import('@/components/Home'),
    children: [
      {
        path:'welcome',
        component:  () => import('@/components/Welcome')
      },
      {
        path:'',
        redirect:'welcome'
      },
      {
        path:'users',
        component:Users
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to: 去哪儿
  //from: 从哪儿来
  //next是一个函数，表示放行
  //next()放行，next('/login') 强制调制
  if (to.path === '/login') {
    return next()
  } else {
    //获取token
    const tokenStr = window.sessionStorage.getItem('token')
    // 如果token为空
    if (!tokenStr) {
      return next('/login')
    } else {
      next()
    }
  }
})


export default router

import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
import { importManager } from 'less'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'


// 导入nprogress
import NProgress from 'nprogress'


// axios配置
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器
// 在request拦截器中显示进度条， NProgress.start()
axios.interceptors.request.use(config =>{
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器中显示进度条， NProgress.done()
axios.interceptors.response.use(config =>{
  NProgress.done()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})


Vue.prototype.$http = axios;

Vue.config.productionTip = false

// 将富文本编辑器的注册
Vue.use(VueQuillEditor, /* { default global options } */)


Vue.component ('tree-table',TreeTable)

Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  
  const y =dt.getFullYear()
  const m =(dt.getMonth()+1+'').padStart(2,'0') 
  const d = (dt.getDate()+'').padStart(2,'0')
  const hh = (dt.getHours()+'').padStart(2,'0')
  const mm = (dt.getMinutes()+'').padStart(2,'0')
  const ss = (dt.getSeconds()+'').padStart(2,'0')
  
  return  `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

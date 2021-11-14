// 引入 uni-ajax 模块
import ajax from '@/uni_modules/u-ajax/js_sdk'
import { hideLoading, toast } from './util.js'
// 创建实例
const _ajax = ajax.create({
    // 默认配置（配置参数如下）
    timeout: 15000
})

// 注册请求拦截器
_ajax.interceptors.request.use(
    config => {
        return config
    },
    error => {
        // 对请求错误做些什么
        hideLoading()
        return error
    }
)

// 注册响应拦截器
_ajax.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        return response
    },
    error => {
        // 对响应错误做点什么
        hideLoading()
        return error
    }
)

// 如果您是像我下面这样挂载在 Vue 原型链上，则通过 this.$ajax 调用
Vue.prototype.$ajax = _ajax

// 导出创建后的实例
export default _ajax

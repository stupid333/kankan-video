## 2.3.0（2021-06-01）
- 【重要】优化 重构底层代码，执行效率提升 42%
- 【重要】调整 修改错误事件拦截器返回触发回调机制 [详情][https://uniajax.ponjs.com/instance/interceptor.html]
- 【重要】移除 移除通过传入回调属性的方式获取 RequestTask 对象 [详情][https://uniajax.ponjs.com/usage/request-task.html]
- 【重要】调整 Typescript 类型 AjaxPromise 改为 Request，AjaxExecutor 改为 AjaxInvoke
- 新增 支持添加多个拦截器、移除指定拦截器 [详情][https://uniajax.ponjs.com/instance/interceptor.html#移除拦截器]
- 新增 可自定义请求方法 adapter [详情][https://uniajax.ponjs.com/instance/create.html#adapter]

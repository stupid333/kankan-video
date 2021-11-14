<template>
  <view class="wv-page"></view>
</template>

<script>
// 视频播放专用 webview 
import { 
  showLoading, 
  getStorage, 
  setStorage, 
  removeStorage, 
  getOnlineTime, 
  statusBarHeight, 
  screenWidth, 
  brand, 
  model, 
  system
} from "@/common/utils/util.js";

function encodeStr (str) {
  return encodeURIComponent(str)
}

let currentWebview

const defaultUrlFilter = ['cnzz', 'umeng']
const defaultAppFilter = ['quickapp', 'alipays', 'taobao', 'tmall', 'jdMobile', 'sinawei', 'weibo', 'meituan', 'androidamap', 'iosamap', 'baidumap', 'qqmap']

export default {
  data () {
    return {
      url: "",
    };
  },
  methods: {
    onLeave () {
      uni.hideLoading();
      uni.setKeepScreenOn({
        keepScreenOn: false,
      });
      currentWebview && currentWebview.hide()
    },
    goback () {
      this.onLeave();
      uni.navigateTo({
        url: '../back/back'
      })
    },
    wvLoaded () {
      uni.hideLoading()
      uni.setKeepScreenOn({
        keepScreenOn: true,
      });
      // #ifdef APP-PLUS
      plus.screen.lockOrientation("landscape-primary");
      // #endif
    }
  },
  async onReady () {
  },
  onLoad (opt) {
    if (!opt.url) return
    showLoading('正在加载')
    const _this = this
    const config = getStorage('config') || {}

    const url = `${opt.url}${opt.url.includes('?') ? '&' : '?'}from=leduo&brand=${encodeStr(brand)}&model=${encodeStr(model)}&system=ios&title=${opt.title}`;
    currentWebview = this.$scope.$getAppWebview()
    currentWebview.setStyle({
      plusrequire: "none", //禁止远程网页使用plus的API，有些使用mui制作的网页可能会监听plus.key，造成关闭页面混乱，可以通过这种方式禁止
      "uni-app": "none", //不加载uni-app渲染层框架，避免样式冲突
      hardwareAccelerated: true,
      render: "always",
      background: '#333333',
      top: 0, //放置在titleNView下方。如果还想在webview上方加个地址栏的什么的，可以继续降低TOP值
      bottom: 0,
    })
    currentWebview.loadURL(url)
    currentWebview.onloaded = () => {
      _this.wvLoaded()
    }
    currentWebview.onerror = () => {
      uni.showModal({
        content: "重试 或 稍后再试",
        showCancel: false,
        success (res) {
          if (res.confirm) {
            _this.goback()
          }
        },
      })
    }
    
    setTimeout(() => {
      this.wvLoaded()
    }, 1000)

  },

  onBackPress (e) {
    this.goback()
    return true
  },
};
</script>

<style lang="scss" scoped>
.wv-page {
  width: 100vw;
  height: 100vh;
  background: #333333;
}
</style>

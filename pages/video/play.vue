<template>
  <view class="page play-page flex-blcok justify-between center-items">
    <video
      id="playVideo"
      controls
      class="play-video"
      :enable-progress-gesture="false"
      :enable-play-gesture="true"
      :play-strategy="3"
      :src="src"
      :initial-time="startTime"
      @timeupdate="timeupdate"
      @error="videoErrorCallback"
    ></video>
  </view>
</template>

<script>
const dlna = uni.requireNativePlugin('JX-Dlna');

export default {
  data () {
    return {
      src: '',
      startTime: 0,
      currentTime: 0,
      duration: 0
    };
  },

  methods: {
    onLeave () {
      uni.hideLoading();
      this.src = '';
      uni.setKeepScreenOn({
        keepScreenOn: false
      });
    },
    goback () {
      this.onLeave();
      uni.navigateTo({
        url: '../back/back'
      });
    },
    timeupdate (e) {
      if (this.currentTime !== e.detail.currentTime) {
        this.currentTime = e.detail.currentTime;
      }
      this.duration = e.detail.duration;
    },

    videoErrorCallback (e) {
      const _this = this;
      uni.showModal({
        content: '重试 或 稍后再试',
        showCancel: false,
        success (res) {
          if (res.confirm) {
            _this.goback();
          }
        }
      });
    }
  },
  onReady () {
    this.context = uni.createVideoContext('playVideo', this);
  },

  onShow () {
    this.context = uni.createVideoContext('playVideo', this);
  },

  onLoad (opt, type) {
    uni.hideLoading();
    this.src = opt.url;

    uni.setKeepScreenOn({
      keepScreenOn: true
    });
    uni.hideLoading();
    // #ifdef APP-PLUS
    setTimeout(() => {
      plus.screen.lockOrientation('landscape-primary');
    }, 1000)
    // #endif
  },

  onBackPress (e) {
    this.goback()
    return true;
  }
};
</script>

<style lang="scss">
.play-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  video {
    width: 100vw;
    height: 100vh;
  }
}
</style>

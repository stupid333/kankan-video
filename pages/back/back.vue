<template>
  <view>

  </view>
</template>

<script>
export default {
  data () {
    return {

    }
  },
  methods: {

  },
  onLoad () {
    console.log('进入返回页')
    // #ifdef APP-PLUS
    plus.screen.lockOrientation("portrait-primary");
    // #endif
    uni.navigateBack({
      delta: 2
    })
  }
}
</script>

<style>
</style>

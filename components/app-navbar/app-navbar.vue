<template>
  <view
    class="search-bar flex-block center-items justify-between"
    :style="propStype"
  >
    <u-icon
      class="goback"
      name="arrow-left"
      v-if="showBack"
      @click="goback"
      :size="iconSize"
    ></u-icon>
    <view
      class="flex-block center-items"
      :style="propAlign"
    >
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: "app-navbar",
  props: {
    showBack: {
      type: Boolean,
      default: true
    },
    bgColor: {
      type: String,
      default: '#fff'
    },
    alignCenter: {
      type: Boolean,
      default: false
    },
    iconSize: {
      type: String | Number,
      default: 40
    },
    borderBold: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {};
  },
  computed: {
    propStype () {
      return {
        backgroundColor: this.bgColor,
        borderBottom: `.5px solid ${this.borderBold ? '#000' : '#f0f0f0'}`
      };
    },
    propAlign () {
      if (this.alignCenter) {
        return {
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          transform: `translateX(-${this.iconSize}rpx)`
        };
      }
      return {
        justifyContent: 'flex-end',
        flex: 1
      };
    }
  },
  methods: {
    goback () {
      uni.navigateBack();
    }
  }
};
</script>

<style lang="scss">
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  transform: translateZ(0);
  background-color: #fff;
  display: flex;
  width: 100vw;
  min-height: calc(var(--status-bar-height) + 80rpx);
  align-items: center;
  flex: 1;
  padding: calc(var(--status-bar-height) + 10rpx) 40rpx 10rpx;
  border-bottom: 0.5px solid #f0f0f0;

  .goback {
    padding-right: 40rpx;
  }
}
</style>

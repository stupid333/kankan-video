<template>
  <view class="page search-page">
    <app-navbar :align-center="true">
      <view class="title">{{ title }}</view>
    </app-navbar>

    <view class="main flex-block">
      <scroll-view
        scroll-y="true"
        class="right flex-block flex-col show-scroll-bar"
      >
        <view
          class="list-item flex-block"
          v-for="(item, index) in searchList"
          :key="searchIndex + '' + index"
          @click="openDetail(item.id[0], item.detail)"
        >
          <view class="image-wrap">
            <u-lazy-load
              class="image"
              style="width: 200rpx"
              :index="searchIndex + '' + index"
              :image="item.pic[0] || ''"
            >
            </u-lazy-load>
          </view>
          <view class="video-info flex-block flex-col justify-center">
            <view>
              <text class="name">{{ item.name[0] || "" }}</text>
            </view>
            <view>
              <text>
                <text class="name">导演：</text>
                {{ item.director[0] || "" }}
              </text>
            </view>
            <view class="actor">
              <text>
                <text class="name">演员：</text>
                {{ item.actor[0] || "" }}
              </text>
            </view>
            <view>
              <text>{{ item.last[0] || "" }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <!-- #ifdef APP-PLUS -->
    <!-- #ifdef APP-NVUE -->
    <cell>
      <!-- #endif -->
      <view
        class="ad-view"
      >
        <ad
          class="ad"
          adpid="1945824407"
          channel="video-search"
        ></ad>
      </view>
      <!-- #ifdef APP-NVUE -->
    </cell>
    <!-- #endif -->
    <!-- #endif -->
    <u-back-top
      :scroll-top="scrollTop"
      :icon-style="{ fontSize: '40rpx', color: '#3cc51f' }"
      :custom-style="{border: '1px solid #3cc51f'}"
    >
    </u-back-top>
  </view>
</template>

<script>
import { createNamespacedHelpers } from "vuex";
import _ from "@/common/utils/lodash.js";
import { toast, getStorage, platform } from "@/common/utils/util.js";

const { mapState, mapMutations, mapActions } = createNamespacedHelpers("video");

export default {
  data () {
    return {
      sw: "",
      scrollTop: 0,
    };
  },
  computed: {
    ...mapState(["searchList"]),
    title () {
      return `搜索"${this.sw}"`;
    },
  },
  methods: {
    ...mapMutations([
      "updateDetail",
      "updatePlayIndex",
      "updateSearchLoading"
    ]),
    ...mapActions(["searchVideoData", "getDetail"]),

    async selectSite (index) {
      await this.updateSearchLoading();
      await this.searchVideoData(this.sw);
    },
    openDetail (vid, url) {
      vid && url
        ? uni.navigateTo({
          url: `./detail?vid=${vid}&url=${encodeURIComponent(url)}`,
        })
        : toast("数据错误，请稍后重试");
    },

  },
  onLoad (opt) {
    const sw = opt.sw;
    this.sw = sw;
    this.searchVideoData(sw);
  },
  onShow () {
    this.updatePlayIndex();
  },
  onHide(){
      this.updateSearchLoading()
  },
  onPageScroll (e) {
    this.scrollTop = e.scrollTop;
  },
};
</script>

<style lang="scss">
.search-page {
  position: relative;
  box-sizing: border-box;
  width: 100vw;
  height: auto;
  min-height: calc(100vh - var(--window-bottom));
  padding-top: calc(var(--status-bar-height) + 80rpx);
  margin: 0;
  overflow: hidden;
  .main {
    position: relative;
    width: 100%;
    padding: 0 10px 5px;
    height: calc(
      100vh - var(--status-bar-height) - var(--window-bottom) - 90rpx
    );
    overflow: hidden;
    .right {
      flx: 1;
      height: 100%;
      margin-left: 5px;
      background-color: #ecf5ff;
      .list-item {
        margin-bottom: 5px;
        background-color: #fff;
        .video-info {
          .name {
            font-weight: bold;
          }
        }
      }
      .video-info {
        margin-left: 5px;
        .actor {
          height: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      }
    }
  }
}
</style>

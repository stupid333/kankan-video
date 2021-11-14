<template>
  <view
    class="page index-page"
    :class="{ 'overflow-y-hidden': dropDownIsOpen }"
  >
    <app-navbar :show-back="false">
      <view class="flex-block center-items flex-1">
        <u-search
          placeholder="搜片"
          v-model="keyword"
          input-align="center"
          action-text="清除"
          shape="square"
          height="72"
          :clearabled="true"
          :animation="true"
          :isFocus="isFocus"
          @focus="focus"
          @search="search"
          @custom="cancel"
          @clear="cancel"
        >
        </u-search>
      </view>
    </app-navbar>
    <u-gap height="15"> </u-gap>
    <view class="index-content">
      <view v-show="!flowList.length && !keyword">
        <view class="flex-block flex-wrap justify-center center-items">
          <u-loading mode="circle"></u-loading>
        </view>
        <view class="flex-block flex-wrap justify-center center-items">
          若加载异常，请下拉刷新
        </view>
        <view class="flex-block flex-wrap justify-center center-items">
          依旧异常，换源站或分类
        </view>
      </view>
      <view v-show="!flowList.length && keyword">
        <view class="flex-block flex-wrap justify-center center-items">
          <u-loading
            v-show="loading"
            mode="circle"
          ></u-loading>
          <u-empty
            v-show="!loading"
            mode="search"
          ></u-empty>
        </view>
      </view>
      <view class="index-wrap show-scroll-bar flex-block flex-wrap">
        <u-waterfall
          v-if="flowList.length"
          v-model="flowList"
          ref="uWaterfall"
        >
          <template v-slot:left="{ leftList }">
            <view
              class="cell"
              v-for="(item, index) in leftList"
              :key="index + item.id[0]"
              @tap="openDetail(item.id[0])"
            >
              <view class="class-wrap">
                <u-lazy-load
                  threshold="750"
                  :index="`l${index}`"
                  :image="item.pic[0]"
                >
                </u-lazy-load>
              </view>
              <view class="video-info">
                <view>
                  <text class="name">{{ getVideoName(item.name[0] || "") }}</text>
                </view>
                <view class="flex-block justify-between">
                  <text>{{ getCateName(item.tid[0]) || "" }}</text>
                </view>
                <view>
                  <text>{{ item.last[0] || "" }}</text>
                </view>
              </view>
            </view>
          </template>
          <template v-slot:right="{ rightList }">
            <view
              class="cell"
              v-for="(item, index) in rightList"
              :key="index + item.name"
              @tap="openDetail(item.id[0])"
            >
              <view class="class-wrap">
                <u-lazy-load
                  threshold="750"
                  :index="`r${index}`"
                  :image="item.pic[0]"
                >
                </u-lazy-load>
              </view>
              <view class="video-info">
                <view>
                  <text class="name">{{ getVideoName(item.name[0] || "") }}</text>
                </view>
                <view class="flex-block justify-between">
                  <text>{{ getCateName(item.tid[0]) || "" }}</text>
                </view>
                <view>
                  <text>{{ item.last[0] || "" }}</text>
                </view>
              </view>
            </view>
          </template>
        </u-waterfall>
      </view>
      <u-loadmore
        v-show="!!flowList.length"
        :status="status"
        :load-text="loadText"
      />
    </view>
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
import { toast, getStorage } from "@/common/utils/util.js";

const { mapState, mapGetters, mapMutations, mapActions } =
  createNamespacedHelpers("video");

let timer = null;

export default {
  data () {
    return {
      childMode: !!getStorage("childMode"),
      cateFilters: "",
      nameFilters: "",
      value1: 0,
      value2: -1,
      keyword: "",
      modalVisible: false,
      isFocus: false,
      dropDownIsOpen: false,
      scrollTop: 0,
      customStyle: {
        border: "none",
        backgroundColor: "#f2f2f2",
      },
      loadText: {
        loadmore: "下拉刷新&上拉更多",
        loading: "拼命加载中",
        nomore: "实在没有了",
      },
      flowList: [],
    };
  },
  computed: {
    ...mapState([
      "videoList",
      "curSite",
      "curCate",
      "siteOptions",
      "cateOptions",
      "loading",
    ]),
    ...mapGetters(["status"]),
    curSiteName () {
      return (this.siteOptions[this.curSite || 0] || {}).label || "源站";
    },
    curCateName () {
      const cate = _.find(this.cateOptions, c => c.value === this.curCate)
      const cateName = _.get(cate, 'label', '最近更新')
      return cateName
    },
  },
  watch: {
    curSite (val) {
      if (val) this.value1 = val;
    },
    curCate (val) {
      if (val) this.value2 = val;
    },
    loading (val, old) {
      if (!_.isEqual(val, old)) this.modalVisible = val;
    },
    videoList (val, old) {
      if (!_.isEqual(val, old)) {
        this.flowList = val.filter((e, i, a) => {
          const idx = a.findIndex((f) => f.id === e.id);
          return idx === i;
        });
      }
    }
  },
  methods: {
    ...mapMutations([
      "updateCurCate",
      "updatePage",
      'updateDetail',
      "updatePageCount",
      "clearVideoList",
      "updatePlayIndex",
      "updateCateOptions",
    ]),
    ...mapActions(["getCates", "getVideoData"]),

    async clear () {
      this.$refs.uWaterfall && this.$refs.uWaterfall.clear();
      this.keyword = "";
      await this.updateCurCate(-1);
      await this.getCates();
      await this.updatePage();
      await this.updatePageCount();
      await this.clearVideoList();
      await this.getVideoData();
    },
    getVideoName (name) {
      return name.replace(/\&nbsp\;?/g, '').replace(/\{.*?\}/g, '')
    },
    getCateName (id) {
      const item = _.find(this.cateOptions, (c) => c.id === id) || {};
      return item.label || id;
    },
    openDetail (vid) {
      vid
        ? uni.navigateTo({
          url: `./detail?vid=${vid}`,
        })
        : toast("请稍后重试");
    },
    focus () {
      this.isFocus = true;
      this.dropDownIsOpen = false;
    },
    async search (val) {
      val = this.$u.trim(val);
      if (!val) return this.cancel();
      const _this = this;
      const kw = this.keyword;
      this.isFocus = false;
      kw
        ? uni.navigateTo({
          url: `./search?sw=${kw}`,
          complete () {
            _this.keyword = "";
          },
        })
        : toast("数据错误，请稍后重试");
    },
    async cancel (e) {
      if (this.keyword) {
        this.keyword = "";
        this.isFocus = false;
      }
    },
 
    async onLoadData () {
      uni.stopPullDownRefresh();
      this.$refs.uWaterfall && this.$refs.uWaterfall.clear();
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await this.getCates();
        await this.updatePage();
        await this.updatePageCount();
        await this.clearVideoList();
        await this.getVideoData();
      }, 300);
    },
    onShowData () {
      this.updateDetail()
      this.updatePlayIndex();
      uni.setKeepScreenOn({
        keepScreenOn: false,
      });
      // #ifdef APP-PLUS
      setTimeout(() => {
        plus.screen.lockOrientation("portrait-primary");
      }, 500)
      // #endif
    },
  },
  onPageScroll (e) {
    this.scrollTop = e.scrollTop;
  },
  onLoad () {
    this.onLoadData();
  },
  onHide () {
    uni.hideLoading();
    this.isFocus = false;
  },
  onShow () {
    this.onShowData();
  },
  onReachBottom () {
    clearTimeout(timer);
    if (this.status === "nomore" || this.loading) {
      return;
    }
    timer = setTimeout(() => {
      this.getVideoData();
    }, 500);
  },
  onPullDownRefresh () {
    if (!this.loading) {
      clearTimeout(timer);
      this.$refs.uWaterfall && this.$refs.uWaterfall.clear();
      timer = setTimeout(async () => {
        await this.clearVideoList();
        await this.updatePage();
        await this.updatePageCount();
        await this.getVideoData();
      }, 300);
    } else {
      uni.stopPullDownRefresh();
    }
  },
};
</script>

<style lang="scss">
.index-page {
  position: relative;
  box-sizing: border-box;
  width: 100vw;
  height: auto;
  min-height: calc(100vh - var(--window-bottom));
  padding-top: calc(var(--status-bar-height) + 100rpx);
  margin: 0;
  overflow: hidden auto;

  &.overflow-y-hidden {
    height: calc(100vh - var(--window-bottom));
    overflow-y: hidden;
  }

  .sites {
    background-color: #fff;
    .u-cell {
      padding-left: 60rpx;
      padding-right: 60rpx;
    }
  }
  .like {
    padding: 0 10rpx;
  }
  .index-content {
    overflow-x: hidden;
    padding-bottom: 200rpx;

    .index-wrap {
      width: 100vw;
      padding: 0 20rpx var(--window-bottom);

      .uni-scroll-view-content {
        display: flex;
        flex-wrap: wrap;
        padding-top: 10rpx;
      }

      .cell {
        box-sizing: border-box;
        width: calc(50vw - 30rpx);
        margin-bottom: 20rpx;
        border: 0.5px solid #3cc51f;
        border-radius: 8rpx;
        overflow: hidden;

        &:nth-child(2n + 1) {
          margin-right: 16rpx;
          margin-left: 2rpx;
        }

        .class-wrap {
          width: calc(50vw - 30rpx);
        }

        .video-info {
          padding: 5rpx;
          .name {
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>

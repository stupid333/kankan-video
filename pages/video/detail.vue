<template>
  <view class="page detail-page">
    <view class="top flex-block justify-between">
      <u-lazy-load
        class="image"
        threshold="750"
        :image="detail.pic ? detail.pic[0] : ''"
        img-mode="widthFix"
      >
      </u-lazy-load>
      <view class="infobox">
        <h4>{{ getVideoName(detail.name ? detail.name[0] : "") }}</h4>
        <scroll-view
          class="infobox-ul show-scroll-bar"
          scroll-y="true"
        >
          <view v-if="detail.actor">
            演员：{{ detail.actor ? detail.actor[0] : "" }}
          </view>
          <view v-if="detail.director">
            导演：{{ detail.director ? detail.director[0] : "" }}
          </view>
          <view v-if="detail.last">
            更新：{{ detail.last ? detail.last[0] : "" }}
          </view>
          <view class="flex-block flex-wrap">
            <view
              class="short-info"
              v-if="detail.type"
            >
              分类：{{ detail.type ? detail.type[0] : "" }}
            </view>
            <view
              class="short-info"
              v-if="detail.area"
            >
              地区：{{ detail.area ? detail.area[0] : "" }}
            </view>
            <view
              class="short-info"
              v-if="detail.lang"
            >
              语言：{{ detail.lang ? detail.lang[0] : "" }}
            </view>
            <view
              class="short-info"
              v-if="detail.year"
            >
              年份：{{ detail.year ? detail.year[0] : "" }}
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    <view
      class="intro"
      v-if="getDesc(detail.des)"
    >剧情简介：</view>
    <scroll-view
      class="desc show-scroll-bar"
      scroll-y="true"
      v-if="getDesc(detail.des)"
    >
      <text>{{ getDesc(detail.des) }}</text>
    </scroll-view>
    <!-- #ifdef APP-PLUS -->
    <!-- #ifdef APP-NVUE -->
    <cell>
      <!-- #endif -->
      <view class="ad-view">
        <ad
          class="ad"
          adpid="1316437350"
          channel="video-detail"
        ></ad>
      </view>
      <!-- #ifdef APP-NVUE -->
    </cell>
    <!-- #endif -->
    <!-- #endif -->
    <view class="warning">
      视频打开时出现的任何广告[包括但不限于：横幅，片头，片中，片尾，启动快应用、下载、启动应用 等]都属于源站，与本APP无关！本APP只需存储权限，不会私自启动下载任何应用。
    </view>
    <view class="list">
      <view
        class="btns"
        v-for="(item, index) in sectionList"
        :key="index + item.name"
      >
        <view class="type-title"> </view>
        <view class="flex-block flex-wrap center-items justify-start">
          <template v-for="(se, idx) in item.series">
            <view
              class="flex-block center-items"
              v-if="item && item.series"
              :key="idx + se.url"
            >
              <u-button
                v-if="se.url"
                @tap="gotoplay(se.url, index, idx, se.name, item.name)"
                :type="playIndex[index] === idx ? 'success' : 'default'"
              >
                {{ se.name }}
              </u-button>
            </view>
          </template>
        </view>
      </view>
    </view>
    <u-gap
      height="50"
      bg-color="transparent"
    > </u-gap>
    <u-divider bg-color="transparent">到 底 啦</u-divider>
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
import { videoTypes, getStorage, setStorage } from "@/common/utils/util.js";
import { trimInnerHtml, toast } from "@/common/utils/util.js";

const { mapState, mapMutations, mapActions } = createNamespacedHelpers("video");

export default {
  data () {
    return {
      scrollTop: 0,
      vid: "",
      title: "",
    };
  },
  computed: {
    ...mapState([
      "detail",
      "playIndex"
    ]),
    sectionList () {
      const dl = _.get(this.detail, "dl", []);
      const list = [].concat((dl[0] || {}).dd || []);
      const mapList = _.map(list, (li) => {
        const item = _.get(li, '_', '')
        const series = _.map(item.split("#"), (l, i) => {
          let arr = (l || '').includes("$") ? l.split("$") : [`第${i + 1}集`, l];
          if (arr[0].match(/^https?\:/)) {
            arr.reverse()
          }

          return {
            name: arr[0],
            url: arr[1],
          };
        });
        return {
          ...li,
          name: li.$.flag.replace("迅雷", "") || "",
          series: series.reverse(),
        };
      });
      return _.filter(mapList, e => !!e.name)
    }
  },

  methods: {
    ...mapMutations(["updatePlayIndex"]),
    ...mapActions(["getDetail"]),
    getVideoName (name) {
      return name.replace(/\&nbsp\;?/g, '').replace(/\{.*?\}/g, '')
    },
    getDesc (desc) {
      const str = desc ? trimInnerHtml(desc[0]) : ""
      return str.trim() || ""
    },
    goDown (url) {
      // #ifdef APP-PLUS
      plus.runtime.openURL(encodeURI(url)); //这里默认使用外部浏览器打开而不是内部web-view组件打开
      // #endif
    },
    gotoplay (url, idx, index, num, type) {
      if (!url) return;
      if (type && type.includes("下载")) {
        this.goDown(url);
        return;
      }
      const _this = this;
      const detail = this.detail;
      const arr = [].concat(this.playIndex);
      const isVideoUrl = url.includes(".m3u8") || url.includes(".mp4");

      if (!isVideoUrl) {
        if (!url.includes("http") && detail.jiexiUrl) url = detail.jiexiUrl + url;
      } else if (detail.needjx) {
        const jxurl = detail.jiexiUrl
        url = jxurl + url;
      }

      const title = encodeURIComponent(`${this.title}-${num}`)
      const link = (detail.needjx || !isVideoUrl) ? `./webview?url=${url}&siteKey=${detail.sourceKey}&title=${title}` : `./play?url=${url}&siteKey=${detail.sourceKey}&title=${title}`;
      arr[idx] = index;
      this.updatePlayIndex(arr);

      url
        ? uni.navigateTo({
          url: link,
          success () {
            uni.report('播放视频', {
              '视频名称': _this.title,
              '当前剧集': num,
              '视频地址': url
            })
          },
          fail (err) {
            console.log(err)
          }
        })
        : toast("数据错误，请稍后重试");
    },
    trimInnerHtml (str) {
      return trimInnerHtml(str);
    },
    setTitle () {
      const name = _.get(this.detail, 'name[0]', '')
      const title = this.getVideoName(name)
      if (title) {
        this.title = title
        uni.setNavigationBarTitle({ title })
      }
    }
  },

  async onLoad (opt) {
    uni.hideLoading();
    // #ifdef APP-PLUS
    plus.screen.lockOrientation("portrait-primary");
    // #endif
    const vid = opt.vid || ''
    this.vid = vid
    await this.getDetail({ vid })
    this.setTitle()
  },
  onPageScroll (e) {
    this.scrollTop = e.scrollTop;
  },
};
</script>

<style lang="scss">
.detail-page {
  width: 100vw;
  min-height: calc(100vh - var(--window-bottom));
  padding: 10rpx 20rpx;
  overflow-x: hidden;

  .btns {
    .u-btn {
      padding: 0 10px;
      margin: 3px;
    }
  }

  .top,
  .intro,
  .desc,
  .list {
    background-color: #fff;
    padding: 10rpx;
  }

  .top {
    .image,
    image {
      margin-right: 20rpx;
      width: 30vw;
      background-color: #fff;
    }

    .infobox {
      flex: 1 1 30vw;

      .infobox-ul {
        width: 100%;
        // overflow-y: auto;
        max-height: 60vw;
      }

      .short-info {
        padding-right: 20rpx;
      }
    }
  }

  .intro {
    font-size: 40rpx;
    padding: 0 10rpx;
  }

  .desc {
    width: auto;
    max-height: 200rpx;

    &.bordered {
      border: 1px solid #7a7e83;
    }
  }

  .list {
    padding-bottom: 40rpx;

    .type-title {
      padding: 20rpx 0;
      font-size: 40rpx;
    }

    button {
      margin: 3px 6px;
    }
  }

  .popup {
    width: 100%;

    .pop-search {
      padding: 20rpx;
    }

    .pop-view {
      width: 100%;
      height: 30vh;
      padding: 20rpx;

      .pop-view-btn {
        margin: 10rpx 0;
      }
    }
  }
  .warning {
    padding: 20rpx;
    color: #1aad19;
  }
}
</style>

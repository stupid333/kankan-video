import xml2js from 'xml2js'
import ajax from '@/common/utils/ajax.js'
import _ from '@/common/utils/lodash.js'
import { toast, showLoading, hideLoading, filterVideo, formatDate, getStorage, setStorage } from '@/common/utils/util.js'
let requestTask = undefined

const api = 'http://cj.leduocaiji.com/inc/api.php'
const jiexiUrl = 'https://www.cainiaoblog.cn/v.html?vid='

export default {
  namespaced: true,
  state: {
    loading: false,
    searchLoading: false,
    config: {},
    videoList: [],
    searchList: [],
    searchIndex: 0,
    cateOptions: [],
    curCate: -1,
    page: 1,
    pageCount: 1,
    sw: '',
    vid: '',
    playIndex: [],
    detail: {},
  },
  mutations: {
    updateLoading (state, payload = false) {
      state.loading = payload
    },
    updateSearchLoading (state, payload = false) {
      state.searchLoading = payload
    },
    updateVideoList (state, payload = []) {
      state.videoList = payload
    },
    clearVideoList (state) {
      state.videoList = []
    },
    updateSearchList (state, payload = []) {
      state.searchList = payload
    },
    clearSearchList (state) {
      state.searchList = []
    },
    updateSearchIndex (state, payload = 0) {
      state.searchIndex = payload
    },
    updateCateOptions (state, payload = []) {
      state.cateOptions = payload
    },
    updateCurCate (state, payload = -1) {
      state.loading = false
      state.curCate = payload
    },
    updatePage (state, payload = 1) {
      state.page = payload
    },
    updatePageCount (state, payload = 1) {
      state.pageCount = payload
    },
    updateDetail (state, payload = {}) {
      state.detail = payload
    },
    updatePlayIndex (state, payload = []) {
      state.playIndex = payload
    }
  },
  actions: {
    // 获取分类
    async getCates ({
      state,
      commit,
    }) {
      try {
        const url = api
        if (!url) return
        const parser = new xml2js.Parser()
        const res = await ajax.get(url)

        parser.parseString(res.data, (err, result) => {
          if (err) {
            hideLoading()
            throw err
          } else {
            const list = _.get(result, 'rss.class[0].ty', [])
            let cates = _.map(list, (c, ci) => ({
              label: c._,
              value: ci,
              id: _.isUndefined(c.$.id) ? 0 : c.$.id
            }))
            commit('updateCateOptions', cates)
          }

        })
      } catch (e) {
        //TODO handle the exception
        console.log('getCates error', e);
        requestTask = undefined
        commit('updateLoading', false)
        commit('updateCateOptions')
        uni.stopPullDownRefresh()
        hideLoading()
      }
    },
    // 获取视频列表
    async getVideoData ({
      state,
      commit,
      dispatch
    }) {
      showLoading('加载中')

      if (state.loading || _.isEmpty(state.cateOptions)) return

      try {
        const page = state.page
        const pageCount = state.pageCount
        if (page > pageCount) {
          uni.stopPullDownRefresh()
          hideLoading()
          return
        }
        commit('updateLoading', true)
        uni.stopPullDownRefresh()
        if (page === 1) {
          commit('updateVideoList')
        }
        const curCate = state.curCate

        let url = `${api}?ac=videolist&pg=${page}&h=72`

        if (curCate !== -1) {
          const cates = state.cateOptions
          const cate = _.find(cates, c => c.value === curCate)
          const cateId = _.get(cate, 'id')
          url = `${api}?ac=videolist&pg=${page}&t=${cateId}`
        }

        requestTask && requestTask.abort()
        requestTask = ajax.get(url).then(res => {
          const parser = new xml2js.Parser()
          parser.parseString(res.data, (err, result) => {
            hideLoading();
            uni.stopPullDownRefresh()
            if (err) {
              throw err
            } else {
              const pageInfo = _.isEmpty(result.rss.list[0].$) ? {} : result.rss.list[0].$
              const stateVideoList = _.isEmpty(state.videoList) ? [] : state.videoList
              let videoList = _.isEmpty(result.rss.list[0].video) ? [] : result.rss.list[0].video

              videoList = filterVideo(videoList, state.cateOptions)
              videoList.sort((a, b) => new Date(formatDate(b.last[0])) - new Date(formatDate(a.last[0])))
              videoList = [].concat(stateVideoList, videoList)

              commit('updateVideoList', videoList)
              commit('updatePageCount', pageInfo.pagecount * 1 || 0)
              commit('updatePage', pageInfo.page * 1 + 1)
              commit('updateLoading', false)
              requestTask = undefined
              uni.stopPullDownRefresh()
              if (videoList.length < 10) {
                dispatch('getVideoData')
              }
              hideLoading()
            }
          })
        })
      } catch (e) {
        console.log('getVideoData error :', e)
        requestTask = undefined
        commit('updateVideoList')
        commit('updatePageCount')
        commit('updatePage')
        commit('updateLoading', false)
        uni.stopPullDownRefresh()
        hideLoading()
      }
    },
    // 获取搜索列表
    async searchVideoData ({
      commit,
      state,
      dispatch
    }, sw) {
      if (!sw) return
      requestTask && requestTask.abort()
      commit('updateSearchLoading', true)
      commit('clearSearchList')

      showLoading('正在搜索', true)

      try {

        dispatch('getCates', api)

        const url = `${api}?wd=${encodeURIComponent(sw)}`
        const res = await ajax.get(url)
        ajax.get(url).then(res => {

          const parser = new xml2js.Parser()
          parser.parseString(res.data, (err, result) => {
            if (err) {
              hideLoading()
              throw err
            } else {
              let videoList = _.get(result, 'rss.list[0].video', [])

              if (!_.isEmpty(videoList)) {
                videoList = _.filter(videoList, li => li.name[0].toLowerCase().includes(sw.toLowerCase()))
                if (_.isEmpty(videoList)) {
                  toast('没搜到该资源\n或不支持搜索')
                  throw '没搜到该资源\n或不支持搜索'
                  return
                }
                const ids = _.map(videoList, vl => vl.id[0]).join(',')
                const detailUrl = `${api}?ac=videolist&ids=${ids}`
                requestTask = ajax.get(detailUrl).then(res => {
                  const parser = new xml2js.Parser()
                  parser.parseString(res.data, async (err, result2) => {

                    let videoList2 = _.isEmpty(result2.rss.list[0].video) ? [] : result2.rss.list[0].video
                    videoList2 = _.filter(videoList2, li => li.name[0].toLowerCase().includes(sw.toLowerCase()))
                    videoList2 = filterVideo(videoList2, state.cateOptions)
                    if (_.isEmpty(videoList2)) {
                      toast('没搜到该资源\n或不支持搜索')
                      throw '没搜到该资源\n或不支持搜索'
                      return
                    }
                    videoList2.forEach(e => e.detail = `${api}?ac=videolist&ids=${e.id}`)
                    videoList2.sort((a, b) => new Date(formatDate(b.last[0])) - new Date(formatDate(a.last[0])))
                    commit('updateSearchList', videoList2)
                    commit('updateSearchLoading', false)
                    hideLoading()
                  })
                })
              } else {
                toast('没搜到该资源\n或不支持搜索')
                throw '没搜到该资源\n或不支持搜索'
                return
              }
            }
          })
        })
      } catch (e) {
        console.log('getSearchData error :', e)
        toast('重试 或 稍后再试')
        requestTask = undefined
        commit('updateSearchList')
        commit('updateSearchLoading', false)
      }
    },
    // 获取详情
    async getDetail ({
      commit,
      state,
      dispatch
    }, {
      vid
    }) {
      uni.stopPullDownRefresh();

      showLoading('加载详情')

      try {

        let url = `${api}?ac=videolist&ids=${vid}`
        
        await ajax.get(url).then(res => {

          const parser = new xml2js.Parser()
          parser.parseString(res.data, (err, result) => {
            hideLoading()

            if (err) {
              throw err
            } else {
              const detail = _.get(result, 'rss.list[0].video[0]', {})
              commit('updateDetail', { ...detail, jiexiUrl })
            }
          })
        })
      } catch (e) {
        console.log('getDetail error', e)
        toast('重试 或 稍后再试')
        commit('updateDetail')
      }
    },
  },
  getters: {
    status (state) {
      return state.page > state.pageCount ? 'nomore' : state.loading ? 'loading' : 'loadmore'
    },

  }
}

import xml2js from 'xml2js'
import dayjs from "dayjs"
import _ from './lodash.js'
import ajax from './ajax.js'

// 虚拟机列表
const vm = ['vmos']

const systemInfo = uni.getSystemInfoSync()
const platform = systemInfo.platform
const isDev = process.env.NODE_ENV !== 'production'
// #ifdef APP-PLUS
const channel = plus.runtime.channel
// #endif

const defaultVipLong = {
  vip: 48,
  svip: 144
}

function removeStorage (key) {
  uni.removeStorageSync(key)
}

function getStorage (key) {
  return uni.getStorageSync(key)
}

function setStorage (key, value) {
  uni.setStorageSync(key, value)
}

function setSplashAd (bool) {
  // #ifdef APP-PLUS
  plus.ad.setSplashAd && plus.ad.setSplashAd(bool)
  // #endif
}

function setOrientation (val) {
  // #ifdef APP-PLUS
  setTimeout(() => {
    plus.screen.lockOrientation(val)
  }, 500)
  // #endif
}

function initApp () {
  const key = getStorage("childModeKey")
  const userSetKey = getStorage("setChildModeKey")
  const vip = !!getStorage("vip")
  const config = getStorage("config") || {}
  const adIsOn = !!config[platform] || config[platform] == null
  const isOn = adIsOn && !vip

  setSplashAd(isOn)

  setStorage("channel", channel)

  setOrientation("portrait-primary")

  if (platform !== "ios") {
    // #ifdef APP-PLUS
    // 不支持 虚拟机
    if (_.includes(vm, systemInfo.brand.toLowerCase())) {
      plus.runtime.quit()
    }
    // #endif
    
    // // #ifdef APP-PLUS
    // // 不支持 安卓8 以下版本，可过滤大部分虚拟机
    // if (plus.os.version < 8) {
    //     uni.showModal({
    //       content: '安卓8以下版本无法正常使用',
    //       showCancel: false,
    //       success() {
    //         plus.runtime.quit()
    //       }
    //     })
    //     return
    // }
    // // #endif

    setStorage("openedFirst", true)
 
  }

  if (!userSetKey && !key) {
    setStorage("childModeKey", "1234")
    setStorage("childMode", true)
  }

}

async function checkVip () {
  const openedFirst = !!getStorage("openedFirst")

  if (openedFirst) {
    let vip = !!getStorage("vip")
    const svip = !!getStorage("svip")
    const config = getStorage("config") || {}
    const vipLong = _.isEmpty(config.vipLong) ? defaultVipLong : config.vipLong
    const adIsOn = !!config[platform] || config[platform] == null
    let nowDate = dayjs()

    await getOnlineTime().then(res => nowDate = res)

    if (svip) {
      const svipStart = getStorage("svipStart")
      const diff = nowDate.diff(svipStart, "hour")

      if (Math.abs(diff) > vipLong.svip) {
        setStorage("svip", false)
      }
    }

    if (vip) {
      const svip = !!getStorage("svip")
      const vipStart = getStorage("vipStart")
      const diff = nowDate.diff(vipStart, "hour")
      const long = svip ? vipLong.svip : vipLong.vip
      const num = long - Math.abs(diff)
      setStorage('vipLong', num)
      uni.$emit('vipLongChange')
      if (Math.abs(diff) > long) {
        setStorage("vip", false)
        setStorage("svip", false)
        adIsOn && uni.$emit('vipChange')
        adIsOn && toast('免广告已过期', 'none', 3000)
      }
    }

    vip = !!getStorage("vip")

    const isOn = adIsOn && !vip

    setSplashAd(isOn)
  }
}

async function checkSource(url) {
  url = `${url}?ac=videolist`
  return new Promise((resolve) => {
    try{
      ajax.get(url).then(res => {
        const parser = new xml2js.Parser()
        parser.parseString(res.data, (err, result) => {
          if (err) {
            resolve(true)
            throw err
          } else {
            resolve(_.isEmpty(result.rss.list[0].video))
          }
        })
      })
    }catch(e){
      //TODO handle the exception
      resolve(true)
    }
  })
  
}

function getOnlineTime () {
    return new Promise(async (resolve, reject) => {
        try{
         resolve(dayjs(Date.now()))
        }catch(e){
          //TODO handle the exception
          console.log('get time error', e)
        }
    })
}

function formatTime (time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }
  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time
  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function formatLocation (longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }
  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)
  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}
var dateUtils = {
  UNITS: {
    '年': 31557600000,
    '月': 2629800000,
    '天': 86400000,
    '小时': 3600000,
    '分钟': 60000,
    '秒': 1000
  },
  humanize: function (milliseconds) {
    var seconds = Date.now() - milliseconds
    var humanize = ''
    for (var key in this.UNITS) {
      if (seconds >= this.UNITS[key]) {
        var differ = seconds / this.UNITS[key]
        if (differ < 1) continue
        humanize += Math.floor(seconds / this.UNITS[key]) + key
        seconds = seconds % this.UNITS[key]
      }
    }
    return humanize ? humanize + '前' : '刚刚'
  },
  format: function (dateStr) {
    var date = this.parse(dateStr)
    var diff = Date.now() - date.getTime()
    if (diff < this.UNITS['天']) {
      return this.humanize(diff)
    }
    var _format = function (number) {
      return (number < 10 ? ('0' + number) : number)
    }
    return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDate()) + '-' +
      _format(date.getHours()) + ':' + _format(date.getMinutes())
  },
  parse: function (str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
    var a = str.split(/[^0-9]/)
    return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5])
  }
}

function isEmpty (obj) {
  let flag = true
  for (key in obj) {
    flag = false
  }
  return flag
}

function tostring (data) {
  if (!data) return ''
  const str = typeof data === 'string' ? data.toString() : JSON.stringify(data)
  return str && str.trim ? str.trim() : str
}

function trimInnerHtml (str) {
  if (!str.replace) return str
  return str.replace(/<script(.|\s|\n|\t)*?<\/script>/g, '').replace(/&nbsp;?/g, ' ').replace(/<!--\s*.*?-->/g, '')
    .replace(/<\/?\w+\s*.*?>/g, '').trim()
}

function trimHref (str) {
  if (!str.replace) return str
  return str.replace('\"', '').replace('\?', '?').trim()
}

function trimScript (str) {
  if (!str.replace) return str
  return str.replace(/&nbsp;?/g, ' ').replace(/<!--\s*.*?-->/g, '').replace(/<\/?\w+\s*.*?>/g, '').trim()
}
const videoTypes = ['m3u8', 'mp4', 'm4v', 'mov', 'mkv', 'wmv', 'asf', 'asx', 'rm', 'rmvb', 'mpg', 'mpeg', 'mpe', '3gp',
  'avi', 'dat', 'flv', 'vob'
]

function getBookId (id) {
  if (typeof id !== 'string' || id.includes('/')) return id
  const len = id.length
  let idHead = id.slice(0, len - 3) || 0
  if (len < 4) idHead = 0
  const newId = `${idHead * 1 + 1}/${id}`
  return newId
}

function clearRubbish () {
  try {
    // #ifdef APP-PLUS
    function clearFiles (fullPath) {
      plus.io.resolveLocalFileSystemURL(fullPath, function (entry) {
        const directoryReader = entry.createReader()
        directoryReader.readEntries(function (entries) {
          _.map(entries, (readEntry) => {
            if (readEntry.isFile) {
              const fileName = readEntry.name
              const filePath = readEntry.fullPath
              plus.io.resolveLocalFileSystemURL(filePath, function (file) {
                file.remove()
              })
            } else if (readEntry.isDirectory) {
              clearFiles(readEntry.fullPath)
            }
          })
        },
          function (e) {
            console.log('error', e)
          }
        )
      },
        function (e) {
          console.log('error', e)
        }
      )
    }
    plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, function (fs) {
      const filesPath = fs.root.fullPath.replace('downloads/', 'files/')
      const cachePath = fs.root.fullPath.replace('downloads/', 'cache/')
      clearFiles(filesPath)
      clearFiles(cachePath)
      try {
        plus.cache && plus.cache.clear()
      } catch (e) {
        console.log('error', e)
      }
    }, function (e) {
      console.log('error', e)
    })
    // #endif
  } catch (e) {
    //TODO handle the exception
    console.log('清理缓存错误', e)
  }
}

function filterVideo (list, cates) {
  const childMode = !!getStorage('childMode')
  const cateFilters = getStorage('cateFilters') || ''
  const nameFilters = getStorage('nameFilters') || ''
  const config = getStorage('config') || {}
  let videoList = [].concat(list)

  if (childMode && cates) {
    const keywords = _.get(config, 'adultWords', [])
    if (!_.isEmpty(keywords)) {
      videoList = _.filter(videoList, vl => {
        const name = vl.name[0]
        const tid = vl.tid[0]
        const cateItem = _.find(cates, c => c.id === tid)
        const cateName = (cateItem || {}).label
        return cateItem && (!keywords.some(kw => name.includes(kw) || cateName.includes(kw)))
      })
    }
  }

  if (cateFilters && cates) {
    const keywords = cateFilters.split('$')
    videoList = _.filter(videoList, vl => {
      const tid = vl.tid[0]
      const cateItem = _.find(cates, c => c.id === tid)
      const cateName = _.get(cateItem, 'label', '')
      return cateItem && !keywords.some(kw => kw && cateName.includes(kw))
    })
  }

  if (nameFilters) {
    const keywords = nameFilters.split('$')
    videoList = _.filter(videoList, vl => {
      const name = vl && vl.name && vl.name[0] ? vl.name[0] : ''
      return !keywords.some(kw => kw && name.includes(kw))
    })
  }

  videoList = videoList.filter((e, i, a) => {
    const idx = a.findIndex(f => `${f.id}` === `${e.id}`)
    return idx === i
  })

  return videoList
}

function formatDate (str) {
  return str.trim().replace(/\s+/, 'T')
}

function toast (title, icon = "none", duration = 1500) {
  uni.hideLoading()
  uni.hideToast()
  title && uni.showToast({
    title,
    icon,
    duration
  })
}

function showLoading (title = '加载...', mask = false) {
  uni.hideLoading()
  uni.hideToast()
  uni.showLoading({
    title,
    mask
  })
}

function hideLoading() {
  uni.hideLoading()
  uni.hideToast()
}

function getQueryString (name, url) {
  const urlStr = _.includes(url, '?') ? url.split('?')[1] : window.location.search.substr(1)
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  let r = urlStr.match(reg)
  if (!r) r = window.location.hash.substr(1).match(reg)

  if (r !== null) return unescape(r[2])

  return null
}

module.exports = {
  ...systemInfo,
  // #ifdef APP-PLUS
  channel,
  // #endif
  isDev,
  getOnlineTime,
  checkSource,
  checkVip,
  initApp,
  getStorage,
  setStorage,
  removeStorage,
  setSplashAd,
  videoTypes,
  formatTime,
  formatLocation,
  dateUtils,
  isEmpty,
  tostring,
  trimInnerHtml,
  trimScript,
  trimHref,
  getBookId,
  filterVideo,
  formatDate,
  clearRubbish,
  toast,
  showLoading,
  hideLoading,
  getQueryString
}

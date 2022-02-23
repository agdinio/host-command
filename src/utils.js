import {isTablet, isMobile, isIPad13} from 'react-device-detect'

export const diffHours = (dt2, dt1) => {
  var difference = dt2.getTime() - dt1.getTime()

  if (difference <= 0) {
    return '0H:00’:00”'
  }

  var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24)
  difference -= daysDifference * 1000 * 60 * 60 * 24

  var hoursDifference = Math.floor(difference / 1000 / 60 / 60)
  difference -= hoursDifference * 1000 * 60 * 60

  var minutesDifference = Math.floor(difference / 1000 / 60)
  difference -= minutesDifference * 1000 * 60

  var secondsDifference = Math.floor(difference / 1000)

  return (
    hoursDifference +
    daysDifference * 24 +
    'H:' +
    (minutesDifference < 10 ? '0' + minutesDifference : minutesDifference) +
    '’:' +
    (secondsDifference < 10 ? '0' + secondsDifference : secondsDifference) +
    '”'
  )
}

export const toPx = length => {
  var unitRe = /^\s*([+-]?[\d\.]*)\s*(.*)\s*$/i
  var match = unitRe.exec(length)
  while (1) {
    if (!match || match.length < 3) break
    var val = Number(match[1])
    if (isNaN(val)) break
    var unit = match[2]
    if (!unit) break
    var valid = true
    val = val || 1
    break
  }
  if (!valid) throw new TypeError('Error parsing length')
  return unit == 'px' ? val : pxPerUnit(unit) * val
}

var con, el
var sample = 100
const pxPerUnit = unit => {
  if (!con) {
    initElements()
  }
  el.style.width = sample + unit
  document.body.appendChild(con)
  var dimension = el.getBoundingClientRect()
  con.parentNode.removeChild(con)
  return dimension.width / sample
}

const initElements = () => {
  con = document.createElement('div')
  con.style.width = 0
  con.style.height = 0
  con.style.visibility = 'hidden'
  con.style.overflow = 'hidden'

  el = document.createElement('div')

  con.appendChild(el)
}

export const numberFormat = (n, decimalPoint, currency) => {
  return (
    currency +
    n.toFixed(decimalPoint).replace(/./g, function(c, i, a) {
      return i > 0 && c !== '.' && (a.length - i) % 3 === 0 ? ',' + c : c
    })
  )
}

export const format = num => {
  var n = String(num),
    p = n.indexOf('.')
  return n.replace(
    /\d(?=(?:\d{3})+(?:\.|$))/g,
    (m, i) => (p < 0 || i < p ? `${m},` : m)
  )
}

export const ordinalSuffixOf = i => {
  var j = i % 10,
    k = i % 100
  if (j === 1 && k !== 11) {
    return i + 'st'
  }
  if (j === 2 && k !== 12) {
    return i + 'nd'
  }
  if (j === 3 && k !== 13) {
    return i + 'rd'
  }
  return i + 'th'
}

export const ordinalSuffix = i => {
  var j = i % 10,
    k = i % 100
  if (j === 1 && k !== 11) {
    return 'st'
  }
  if (j === 2 && k !== 12) {
    return 'nd'
  }
  if (j === 3 && k !== 13) {
    return 'rd'
  }
  return 'th'
}

export const evalImage = img => {
  let imgSrc = ''
  try {
    imgSrc = require(`@/assets/images/${img}`)
  } catch (e) {
    imgSrc = ''
  }
  return imgSrc
}

export const dateDiffInDays = (a, b) => {
  var _MS_PER_DAY = 1000 * 60 * 60 * 24
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.floor((utc1 - utc2) / _MS_PER_DAY)
}

export const hex2rgb = (hex, opacity) => {
  var h = hex.replace('#', '')
  h = h.match(new RegExp('(.{' + h.length / 3 + '})', 'g'))

  for (var i = 0; i < h.length; i++)
    h[i] = parseInt(h[i].length == 1 ? h[i] + h[i] : h[i], 16)

  if (typeof opacity != 'undefined') h.push(opacity)

  return 'rgba(' + h.join(',') + ')'
}

export const validEmail = email => {
  const reg = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/
  return !!email && !!email.match(reg)
}

export const vhToPx = value => {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight

  var result = (y * value) / 100
  return result + 'px'
}

export const vhToPxNum = value => {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight

  var result = (y * value) / 100
  return result
}

export const vwToPx = value => {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight

  var result = (x * value) / 100
  return result + 'px'
}

export const maxWidth =
  window.innerWidth < vhToPx(69).replace('px', '') ? vwToPx(100) : vhToPx(69)
export const mobileWidth = vhToPx(80)
export const maxHeight = vhToPx(100)

export const toFootage = t => {
  var mins = t / 60
  var mods = t % 60

  if (Math.floor(mins) > 0) {
    return Math.floor(mins) + ':' + mods
  } else {
    return '0:' + mods
  }
}
export const toTime = dStr => {
  var now = new Date()
  now.setHours(dStr.substr(0, dStr.indexOf(':')))
  now.setMinutes(dStr.substr(dStr.indexOf(':') + 1))
  now.setSeconds(0)
  return now
}

export const footageToNum = f => {
  f = f || '0:0'

  var m = 0
  var s = 0
  var arr = f.split(':')
  if (arr && arr.length === 2) {
    m = parseInt(arr[0]) * 60
    s = parseInt(arr[1])
    return m + s
  }

  return 0
}

export const clone = obj => {
  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' != typeof obj) return obj

  // Handle Date
  if (obj instanceof Date) {
    var copy = new Date()
    copy.setTime(obj.getTime())
    return copy
  }

  // Handle Array
  if (obj instanceof Array) {
    var copy = []
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i])
    }
    return copy
  }

  // Handle Object
  if (obj instanceof Object) {
    var copy = {}
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr])
    }
    return copy
  }

  throw new Error("Unable to copy obj! Its type isn't supported.")
}

export const isEqual = (value, other) => {
  // Get the value type
  var type = Object.prototype.toString.call(value)

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false

  // If items are not an object or array, return false
  if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false

  // Compare the length of the length of the two items
  var valueLen =
    type === '[object Array]' ? value.length : Object.keys(value).length
  var otherLen =
    type === '[object Array]' ? other.length : Object.keys(other).length
  if (valueLen !== otherLen) return false

  // Compare two items
  var compare = (item1, item2) => {
    // Get the object type
    var itemType = Object.prototype.toString.call(item1)

    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) return false
    }

    // Otherwise, do a simple comparison
    else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) return false
      } else {
        if (item1 !== item2) return false
      }
    }
  }

  // Compare properties
  if (type === '[object Array]') {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false
    }
  } else {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false
      }
    }
  }

  // If nothing failed, return true
  return true
}

export const guid = () => {
  var S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-4' +
    S4().substr(0, 3) +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  ).toLowerCase()
}

export const timestampToDate = toconvert => {
  var unixtimestamp = toconvert.toString().substring(0, 10)
  // Months array
  var months_arr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Convert timestamp to milliseconds
  var date = new Date(unixtimestamp * 1000)

  // Year
  var year = date.getFullYear()

  // Month
  var month = months_arr[date.getMonth()]

  // Day
  var day = date.getDate()

  // Hours
  var hours = date.getHours()

  // Minutes
  var minutes = '0' + date.getMinutes()

  // Seconds
  var seconds = '0' + date.getSeconds()

  // Display date time in MM-dd-yyyy h:m:s format
  var convdataTime =
    month +
    ' ' +
    day +
    ', ' +
    year +
    ' ' +
    hours +
    ':' +
    minutes.substr(-2) +
    ':' +
    seconds.substr(-2)

  return convdataTime
}

export const IsMobile = !isTablet && isMobile

export const IsTablet = isTablet || isIPad13

export const responsiveWidth = (w) => {
  return window.innerWidth*(w/100) + 'px';
}

export const responsiveHeight = (h) => {
  return window.innerHeight*(h/100) + 'px';
}

export const widthOverHeightPct = 58;

export const mobileScale = (val) => {
  return vwToPx((val*100) / widthOverHeightPct);
}

export const responsiveDimension = (val) => {
  return IsMobile ? mobileScale(val) : vhToPx(val);
}

export const isInStandaloneModeXXXX = () => {
  return ["fullscreen", "standalone", "minimal-ui"].some(
    (displayMode) => window.matchMedia('(display-mode: ' + displayMode + ')').matches);
}

// Detects if device is on iOS
export const isIos = () => {
  return window.navigator.userAgent.match(/iPhone|iPad|iPod/i)
}

// Detects if device is in standalone mode
export const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

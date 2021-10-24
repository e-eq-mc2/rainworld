const Common     = require("./lib/common.js")

class Blackboard {
  constructor() {
    this.containerId = 'blackboard' 
    this.speedScale = 1.0
     
    const digit = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ]

    const aiu  = [
      'あ', 'い', 'う', 'え', 'お', 
      'か', 'が', 'き', 'ぎ', 'く', 'ぐ', 'け', 'げ', 'こ', 'ご', 
      'さ', 'ざ', 'し', 'じ', 'す', 'ず', 'せ', 'ぜ', 'そ', 'ぞ', 
      'た', 'だ', 'ち', 'ぢ', 'つ', 'づ', 'て', 'で', 'と', 'ど', 
      'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ば', 'ぱ', 'ひ', 'び', 
      'ぴ', 'ふ', 'ぶ', 'ぷ', 'へ', 'べ', 'ぺ', 'ほ', 'ぼ', 'ぽ', 
      'ま', 'み', 'む', 'め', 'も', 
      'や', 'ゆ', 'よ', 
      'ら', 'り', 'る', 'れ', 'ろ', 
      'わ', 'を', 'ん'
    ]

    this.lotteryBox = aiu
    //this.lotteryBox = digit

    this.sizeList = []
    for (let i = 0; i < 300; i++) { this.sizeList.push(Common.random(4, 20)) }
    this.sizeList.push(200)

    this.maxFontSize = this.sizeList.reduce(function(a, b) { return Math.max(a, b) })
    this.minFontSize = this.sizeList.reduce(function(a, b) { return Math.min(a, b) })
  }

  increaseSpeed(ds = 0.1) {
    this.speedScale += ds
    return this.speedScale
  }

  decreaseSpeed(ds = 0.1) {
    this.speedScale -= ds
    if ( this.speedScale < 0  ) this.speedScale = 0

    return this.speedScale
  }


  style() {
    let str = ''
    str += '<style> body          { cursor: none; } </style>'
    //str += '<style> canvas        { background-color: black;} </style>'
    str += '<style> canvas        { background-color: black; filter: brightness(100%) saturate(200%);} </style>'
    //str += '<style> canvas        { background-color: black; -webkit-font-smoothing: none;} </style>'

    return str
  }

  container() {
    const str = `${this.style()} <canvas id="${this.containerId}"></canvas>`
    return str
  }

  innerHTML() {
    const h = document.getElementById(this.containerId);
    return h
  }

  buildContainer(parent) {
    this.windowWidth  = window.innerWidth
    this.windowHeight = window.innerHeight

    parent.textContent = '' // 空っぽにする
    parent.insertAdjacentHTML('beforeend', this.container())


    const canvas  = this.innerHTML()
    const scale = 1
    canvas.width  = Math.floor(this.windowWidth / scale )
    canvas.height = Math.floor(this.windowHeight / scale)
    canvas.style.width  = `${this.windowWidth }px`
    canvas.style.height = `${this.windowHeight}px`

    // Set actual size in memory (scaled to account for extra pixel density).
    //const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.

    this.container =  canvas.getContext('2d', { alpha: false })
    //this.container =  canvas.getContext('2d')
    this.container.imageSmoothingEnabled = false
    //this.container.scale(scale, scale)
    this.raindrops = []
  }

  append(colormap) {
    const lotteryBox = this.lotteryBox

    const num = Common.random(0, 30) 
    for (let i = 0; i < num; i++) {
      const color = colormap.choose()

      const char = Common.pickup(lotteryBox)
      const x    = Math.round( Common.random(0, this.windowWidth) )
      const y    = Math.round( -this.maxFontSize                  )
      const sz   = Common.pickup(this.sizeList)
      
      this.raindrops.push({'char': char, 'x': x, 'y': y, 't': 0, 'color': color, 'size': sz})
    }
  }

  clear() {
    this.container.clearRect(0, 0, this.windowWidth, this.windowHeight);
  }

  draw(dt) {
    dt *= this.speedScale
    this.clear()

    let remain = []
    for (let i = 0; i < this.raindrops.length; i++) {
      const drop = this.raindrops[i]

      const char  = drop['char' ]
      const color = drop['color']
      const    sz = drop['size' ]
      const prevT = drop['t'    ]
      const prevX = drop['x'    ]
      const prevY = drop['y'    ]

      const t = prevT + dt

      const alpha = - 0.01
      //const beta  = 290.0
      const beta  = 290.0
      const v     = beta * ( 1 - Math.exp( alpha * Math.pow(t, 1.8) ) ) 
      const y     = Math.round( v * dt + prevY )
      const x     = prevX

      drop['x'] = x
      drop['y'] = y
      drop['t'] = t

      this.container.font = `${sz}px '游明朝', 'Yu Mincho', YuMincho, 'Hiragino Mincho ProN'`
      this.container.fillStyle = color
      this.container.fillText(char, x, y);

      if ( y > this.windowHeight + this.maxFontSize ) continue

      remain.push(drop)
    }

    this.raindrops = remain
  }

  getCharSize(parent, classname = "default-text test-text") {
    const id = 'to-get-char-size'

    if ( this.lotteryBox[0].match(/[a-zA-Z0-9]/) ) {
      parent.insertAdjacentHTML('beforeend', `<p id="${id}" class="${classname}">t</p>`)
    } else  {
      parent.insertAdjacentHTML('beforeend', `<p id="${id}" class="${classname}">あ</p>`)
    }
    const elm = document.getElementById(id)

    const height = elm.clientHeight
    const width  = elm.clientWidth

    elm.remove()

    console.log(`Font Size: ${width} ${height}`)
    return [width, height]
  } 
}

module.exports = Blackboard

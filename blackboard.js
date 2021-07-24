const Common     = require("./lib/common.js")

class Blackboard {
  constructor() {
    this.containerId = 'blackboard' 
     
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
  }

  style() {
    const fontSize      = '11px'
    const lineHeight    = '17px'
    const letterSpacing = '3px'
    const fontFamily    = 'Monaco, "Ricty Discord", monospace, 游明朝,"Yu Mincho",YuMincho,"Hiragino Mincho ProN"'

    let str = ''
    str += '<style> *             { grayscale; cursor: none;} </style>'
    str += '<style> body          { cursor: none; } </style>'
    str += '<style> p, span       { display:inline-block; position: absolute; } </style>'
    str += '<style> #blackboard   { background-color: black; } </style>'
    str += `<style> .default-text { font-size: ${fontSize}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}; font-family: ${fontFamily};}</style>`
    str += `<style> .test-text    { position: absolute; visibility: hidden; height: auto; width: auto; white-space: nowrap; } </style>`

    return str
  }

  container() {
    //const str = `${this.style()} <div id="${this.containerId}" class= "default-text"> </div>`
    const str = `${this.style()} <canvas id="${this.containerId}" style="background-color: black;"></canvas>`
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
    canvas.width  = this.windowWidth
    canvas.height = this.windowHeight

    this.container =  canvas.getContext('2d', { alpha: false });
    this.raindrops = []
  }

  append(colormap) {
    const lotteryBox = this.lotteryBox

    const minFontSize = 5
    const maxFontSize = 35
    const num = Common.random(0, 30) 
    for (let i = 0; i < num; i++) {
      const color = colormap.choose()

      const char = Common.pickup(lotteryBox)
      const x    = Math.round( Common.random(0, this.windowWidth) )
      const y    = Math.round( -maxFontSize                       )
      const sz   = Common.random(minFontSize, maxFontSize)
      
      this.raindrops.push({'char': char, 'x': x, 'y': y, 't': 0, 'color': color, 'size': sz})
    }
  }

  clear() {
    this.container.clearRect(0, 0, this.windowWidth, this.windowHeight);
  }

  draw(dt) {
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


      const alpha = - 0.5
      const beta  = 300.0
      const v     = beta * ( 1 - Math.exp( alpha * Math.pow(t, 2.5) ) ) 
      const y     = Math.round( v * dt + prevY )
      const x     = prevX

      drop['x'] = x
      drop['y'] = y
      drop['t'] = t

      this.container.font = `${sz}px '游明朝', 'Yu Mincho', YuMincho, 'Hiragino Mincho ProN'`
      this.container.fillStyle = color
      this.container.fillText(char, x, y);

      if ( y > this.windowHeight ) continue

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

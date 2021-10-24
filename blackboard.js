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
    let str = ''
    //str += '<style> ::-webkit-scrollbar { display: none; } </style>'
    //str += '<style> html          { cursor: none; width: 100%; height: 100%; } </style>'
    //str += '<style> body          { width: 100%; height: 100%; } </style>'
    //str += '<style> div           { width: 100%; height: 100%; } </style>'
    //str += '<style> canvas        { background-color: black; heigth: 100%;} </style>'

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
    //this.windowWidth  = window.innerWidth
    //this.windowHeight = window.innerHeight
    //this.windowWidth  = parent.clientWidth //window.innerWidth
    //this.windowHeight = parent.clientHeight //window.innerHeight

    parent.textContent = '' // 空っぽにする
    parent.insertAdjacentHTML('beforeend', this.container())

    this.canvas  = this.innerHTML()
    //this.canvas.width  = this.windowWidth
    //this.canvas.height = this.windowHeight

   this.canvasResize()

    console.log(this.windowWidth)
    console.log(this.windowHeight)
    console.log(this.canvas.width)
    console.log(this.canvas.height)

    this.container =  this.canvas.getContext('2d', {alpha: false});
    this.raindrops = []
  }

  canvasResize() {
   const w = window.innerWidth
   const h = window.innerHeight
   
   this.windowWidth = w
   this.windowHeight = h
 
   this.canvas.setAttribute('width', w)
   this.canvas.setAttribute('height', h)
  }

  append(colormap) {
    if ( Common.random(0, 100) < 0 ) return
    
    const lotteryBox = this.lotteryBox

    const minFontSize = 3
    const maxFontSize = 40
    const num = Common.random(0, 90) 
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
    this.container.clearRect(0, 0, this.canvas.width, this.canvas.height)
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

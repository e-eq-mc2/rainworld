const Common     = require("./lib/common.js")

class Blackboard {
  constructor() {
    this.containerId = 'blackboard' 
    this.speedScale = 0.8
     
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

    //this.nameBox = ["ちあき","りん","しょうた","ななみ","せい","はなこ","みはな","せな","かいと","ゆいと","さくら","いくみ","えま","かんな","あいり","たいち","ちとせ","ゆいか","つかさ","こう","わたる"]
    this.nameBox = ["〇", "●", "△", "□", "■", "×", "☻", "★", "☆", "♡", "♥" ]

    this.lotteryBox = aiu
    //this.lotteryBox = digit

    this.sizeList = []
    for (let i = 0; i < 300; i++) { this.sizeList.push(Common.random(4, 25)) }
    this.nameSize = 200

    this.maxFontSize = this.sizeList.reduce(function(a, b) { return Math.max(a, b) })
    this.minFontSize = this.sizeList.reduce(function(a, b) { return Math.min(a, b) })
    this.maxRaindrops = 4000
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

  canvasTag() {
    const str = `<canvas id="${this.containerId}"></canvas>`
    return str
  }

  innerHTML() {
    const h = document.getElementById(this.containerId);
    return h
  }

  buildContainer(parent) {
    parent.textContent = '' // 空っぽにする
    parent.insertAdjacentHTML('beforeend', this.canvasTag())

    this.canvas  = this.innerHTML()
    this.canvasResize()

    this.canvasContext =  this.canvas.getContext('2d', {alpha: false});
    this.raindrops = []
  }

  canvasResize() {
    const w = window.innerWidth
    const h = window.innerHeight

    this.canvasWidth  = w
    this.canvasHeight = h

    this.canvas.setAttribute('width', w)
    this.canvas.setAttribute('height', h)
  }

  append(colormap) {
    const rate_y = this.speedScale
    const rate_x = this.speedScale
    if ( rate_y * 0.15 + Common.randomReal() < 0.5 ) return
    //if ( this.raindrops > 5000 ) return
    //if (this.raindrops.length > this.maxRaindrops) return 
    
    const lotteryBox = this.lotteryBox

    const num = Common.random(0, 15 * rate_x) 
    for (let i = 0; i < num; i++) {
      const color = colormap.choose()

      const char = Common.pickup(lotteryBox)
      const sz   = Common.pickup(this.sizeList)
      const x    = Common.random(0, this.canvasWidth - sz)
      const y    = Math.ceil(- sz * 3)
      
      this.raindrops.push({'char': char, 'x': x, 'y': y, 't': 0, 'color': color, 'size': sz})
    }

    if ( Common.randomReal() > 0.008 ) return
    
    const orgBR = colormap.getBlackRate()
    colormap.setBlackRate(0)

    const numName = 1
    for (let i = 0; i < numName; i++) {
      const name         = Common.pickup(this.nameBox)
      const nameToalSize = name.length * this.nameSize
      let prevX = Math.ceil( Common.randomReal(0, this.canvasWidth) )
      let prevY = Math.ceil( - nameToalSize * 1.5 )
      const ang = Common.randomReal(-15, 135)

      for (let j = 0; j < name.length; j++) {
        //const char = name[j]
        const char = name.charAt(j)
        const sz   = this.nameSize

        const rad = Common.randomReal(ang - 15, ang + 15) * 0.0174533
        const r   = this.nameSize * Common.randomReal(1, 1.2)
        const dx  = Math.cos(rad) * r 
        const dy  = Math.sin(rad) * r
        const x   = Math.ceil(prevX + dx)
        const y   = Math.ceil(prevY + dy)

        const color = colormap.choose()
        const obj = {'char': char, 'x': x, 'y': y, 't': 0, 'color': color, 'size': sz}
        this.raindrops.push(obj)

        prevX = x
        prevY = y
      }
    }

    colormap.setBlackRate(orgBR)

  }

  clear() {
    this.canvasContext.fillStyle = '#000000'
    this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  draw(dt = 0.03) {
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

      const alpha = - 0.02
      const beta  = 300.0
      const v     = beta * ( 1 - Math.exp( alpha * Math.pow(t, 1.8) ) ) 
      const y     = Math.ceil( v * dt + prevY )
      //const y     = v * dt + prevY
      const x     = prevX

      drop['x'] = x
      drop['y'] = y
      drop['t'] = t

      this.canvasContext.font = `${sz}px '游明朝', 'Yu Mincho', YuMincho, 'Hiragino Mincho ProN'`
      this.canvasContext.fillStyle = color
      this.canvasContext.fillText(char, x, y);

      if ( y > this.canvasHeight + sz ) continue

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

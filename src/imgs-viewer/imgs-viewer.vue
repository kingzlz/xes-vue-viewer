<template>
  <transition name="fade">
    <div
      v-if="imgList.length && value"
      class="image-viewer__wrapper"
      :style="{ 'z-index': zIndex }"
    >
      <div class="image-viewer__mask" @click="closeOnClickMask && hide()"></div>
      <div class="image-viewer__loading" v-if="loading">
        <svg t="1617243714833" class="image-viewer__loading__lodingSvg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2206" width="100" height="100"><path d="M395.636364 157.533091a157.533091 155.159273 90 1 0 310.318545 0 157.533091 155.159273 90 1 0-310.318545 0Z" p-id="2207" fill="#e6e6e6"></path><path d="M46.545455 551.377455a118.155636 116.363636 90 1 0 232.727272 0 118.155636 116.363636 90 1 0-232.727272 0Z" p-id="2208" fill="#e6e6e6"></path><path d="M802.909091 275.688727a19.688727 19.386182 90 1 0 38.772364 0 19.688727 19.386182 90 1 0-38.772364 0Z" p-id="2209" fill="#e6e6e6"></path><path d="M366.778182 186.088727a121.483636 121.483636 0 0 0-174.778182 0c-48.244364 49.477818-48.244364 129.722182 0 179.2a121.483636 121.483636 0 0 0 174.778182 0c48.244364-49.477818 48.244364-129.722182 0-179.2z" p-id="2210" fill="#e6e6e6"></path><path d="M899.863273 551.377455a39.377455 38.795636 90 1 0 77.591272 0 39.377455 38.795636 90 1 0-77.591272 0Z" p-id="2211" fill="#e6e6e6"></path><path d="M766.557091 829.533091a59.066182 58.181818 90 1 0 116.363636 0 59.066182 58.181818 90 1 0-116.363636 0Z" p-id="2212" fill="#e6e6e6"></path><path d="M473.227636 945.221818a78.778182 77.568 90 1 0 155.136 0 78.778182 77.568 90 1 0-155.136 0Z" p-id="2213" fill="#e6e6e6"></path><path d="M182.295273 827.066182a98.466909 96.977455 90 1 0 193.954909 0 98.466909 96.977455 90 1 0-193.954909 0Z" p-id="2214" fill="#e6e6e6"></path></svg>
      </div>
      <!-- CLOSE -->
      <span class="image-viewer__btn image-viewer__close" @click="hide">
        <!-- <i class="imgs-viewer-icon imgs-viewer-icon-close1"></i> -->
        <i class="icon"  v-bind:style="styleObject.closeIcon"></i>
      </span>
      <!-- ARROW -->
      <template v-if="!isSingle && showPreNextBar">
       <span
          class="image-viewer__btn image-viewer__prev"
          :class="{ 'is-disabled': !infinite && isFirst }"
          v-bind:style="styleObject.arrowLeft"
          @click="prev"
        >
          <i class="imgs-viewer-icon imgs-viewer-icon-arrow-left-bold" />
        </span>
        <span
          class="image-viewer__btn image-viewer__next"
          :class="{ 'is-disabled': !infinite && isLast }"
          v-bind:style="styleObject.arrowRight"
          @click="next"
        >
          <i class="imgs-viewer-icon imgs-viewer-icon-arrow-right-bold" />
        </span>
      </template>
      <!-- TITLE -->
      <div v-if="currentTitle" class="image-viewer__title">
        {{ currentTitle }}
      </div>
      <!-- ACTIONS -->
      <div class="image-viewer__btn image-viewer__actions">
        <div class="image-viewer__actions__inner">
          <!-- class="imgs-viewer-icon imgs-viewer-icon-refresh-left" -->
          <div class="actions-block">
             <i
              class="icon left-rotation"
              v-bind:style="styleObject.left"
              @click="handleActions('anticlocelise')"
            ></i>
            <span class="font-tip">左旋转</span>
          </div>
          <div class="actions-block">
            <!-- class="imgs-viewer-icon imgs-viewer-icon-refresh-right" -->
            <i
              class="icon right-rotation"
              v-bind:style="styleObject.right"
              @click="handleActions('clocelise')"
            ></i>
            <span class="font-tip">右旋转</span>
          </div>


          <!-- <template  v-if="options.initialSizeBar">
            <i class="image-viewer__actions__divider"></i>
            <i
              class="imgs-viewer-icon"
              style="width: 20px;font-size: 18px;text-align: center"
              :class="mode.icon"
              @click="toggleMode"
            ></i>
          </template> -->
          <i class="image-viewer__actions__divider"></i>
           <!-- class="imgs-viewer-icon imgs-viewer-icon-zoom-in" -->
           <div class="actions-block">
              <i
            class="icon zoom-out"
             v-bind:style="styleObject.zoomOut"
            @click="handleActions('zoomIn')"
          ></i>
            <span class="font-tip">放大</span>
          </div>
          <div class="actions-block">
             <i
            class="icon zoom-in"
             v-bind:style="styleObject.zoomIn"
            @click="handleActions('zoomOut')"
          ></i>
            <span class="font-tip">缩小</span>
          </div>

          <!-- class="imgs-viewer-icon imgs-viewer-icon-zoom-out" -->

        </div>
      </div>
      <!-- CANVAS -->
      <div class="image-viewer__canvas">
        <img
          ref="img"
          :key="currentImg"
          class="image-viewer__img"
          :src="currentImg"
          :style="imgStyle"
          @load="handleImgLoad"
          @error="handleImgError"
          @mousedown="handleMouseDown"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import leftRotation from '../assets/images/leftRotation.png'
import rightRotation from '../assets/images/rightRotation.png'
import zoomInPng from '../assets/images/zoomIn.png'
import zoomOutPng from '../assets/images/zoomOut.png'
import closePng from '../assets/images/viewerClose.png'
import leftPng from '../assets/images/left.png'
import rightPng from '../assets/images/right.png'
import { on, off, rafThrottle, isFirefox } from '../utils/index'
let prevOverflow = ''
const Mode = {
  CONTAIN: {
    name: 'contain',
    icon: 'imgs-viewer-icon-full-screen',
  },
  ORIGINAL: {
    name: 'original',
    icon: 'imgs-viewer-icon-scale-to-original',
  },
}
const mousewheelEventName = isFirefox() ? 'DOMMouseScroll' : 'mousewheel'
export default {
  name: 'xesImageViewer',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    imgList: {
      type: Array,
      default: () => [],
    },
    zIndex: {
      type: Number,
      default: 2000,
    },
    closeOnClickMask: {
      type: Boolean,
      default: false,
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },
    onSwitch: {
      type: Function,
      default: () => { },
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    showPreNextBar: {
      type: Boolean,
      default: false,
    },
    spaceAction: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      index: 1,
      isShow: false,
      infinite: true,
      loading: true,
      mode: Mode.CONTAIN,
      transform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false,
      },
      styleObject: {
        left: {
          'background-image': 'url(' + leftRotation + ')'
        },
        right: {
          'background-image': 'url(' + rightRotation + ')'
        },
        zoomIn: {
          'background-image': 'url(' + zoomInPng + ')'
        },
        zoomOut: {
          'background-image': 'url(' + zoomOutPng + ')'
        },
        closeIcon: {
          'background-image': 'url(' + closePng + ')'
        },
        arrowLeft: {
          'background-image': 'url(' + leftPng + ')'
        },
        arrowRight: {
          'background-image': 'url(' + rightPng + ')'
        }

      }
    }
  },
  computed: {
    isSingle() {
      return this.imgList.length <= 1
    },
    isFirst() {
      return this.initialIndex === 0
    },
    isLast() {
      return this.initialIndex === this.imgList.length - 1
    },
    isSimple() {
      return typeof this.imgList[0] === 'string'
    },
    currentImg() {
      if (this.imgList.length) {
        if (this.isSimple) {
          return this.imgList[this.initialIndex]
        } else {
          return this.imgList[this.initialIndex].url
        }
      }
      return null
    },
    currentTitle() {
      if (this.imgList.length && !this.isSimple) {
        return this.imgList[this.initialIndex].title
      }
      return ''
    },
    imgStyle() {
      const { scale, deg, offsetX, offsetY, enableTransition } = this.transform
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? 'transform .3s' : '',
        'margin-left': `${offsetX}px`,
        'margin-top': `${offsetY}px`,
      }
      if (this.mode === Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = '100%'
      }
      return style
    },
  },
  watch: {
    value(val) {
      if (this.imgList.length) {
        if (val) {
          this.deviceSupportInstall()
          document.body.appendChild(this.$el)
          prevOverflow = document.body.style.overflow
          document.body.style.overflow = 'hidden'
        } else {
          this.deviceSupportUninstall()
          document.body.removeChild(this.$el)
          document.body.style.overflow = prevOverflow
          this.reset()
        }
      } else {
        if (val) {
          this.hide()
        }
      }
    },
    initialIndex(i) {
      if (this.imgList.length && i < this.imgList.length) {
        this.initialIndex = i
      }
    },
    index: {
      handler: function (val) {
        this.reset()
        this.onSwitch(val)
      },
    },
    currentImg(val) {
      this.$nextTick((_) => {
        const $img = this.$refs.img
        if ($img && !$img.complete) {
          this.loading = true
        }
      })
    },
  },
  methods: {
    hide() {
      this.$emit('input', false)
    },
    deviceSupportInstall() {
      this._keyDownHandler = rafThrottle((e) => {
        const keyCode = e.keyCode
        switch (keyCode) {
          // ESC
          case 27:
            this.closeOnPressEscape && this.hide()
            break
          // SPACE
          case 32:
            if (this.spaceAction) {
              this.toggleMode()
            }

            break
          // LEFT_ARROW
          case 37:
            if (this.showPreNextBar) {
              this.prev()
            }
            break
          // UP_ARROW
          case 38:
            this.handleActions('zoomIn')
            break
          // RIGHT_ARROW
          case 39:
            if (this.showPreNextBar) {
              this.next()
            }
            break
          // DOWN_ARROW
          case 40:
            this.handleActions('zoomOut')
            break
        }
      })
      this._mouseWheelHandler = rafThrottle((e) => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail
        if (delta > 0) {
          this.handleActions('zoomIn', {
            zoomRate: 0.03,
            enableTransition: false,
          })
        } else {
          this.handleActions('zoomOut', {
            zoomRate: 0.03,
            enableTransition: false,
          })
        }
      })
      on(document, 'keydown', this._keyDownHandler)
      on(document, mousewheelEventName, this._mouseWheelHandler)
    },
    deviceSupportUninstall() {
      off(document, 'keydown', this._keyDownHandler)
      off(document, mousewheelEventName, this._mouseWheelHandler)
      this._keyDownHandler = null
      this._mouseWheelHandler = null
    },
    handleImgLoad(e) {
      this.loading = false
    },
    handleImgError(e) {
      this.loading = false
      e.target.alt = '加载失败'
    },
    handleMouseDown(e) {
      if (this.loading || e.button !== 0) return
      const { offsetX, offsetY } = this.transform
      const startX = e.pageX
      const startY = e.pageY
      this._dragHandler = rafThrottle((ev) => {
        this.transform.offsetX = offsetX + ev.pageX - startX
        this.transform.offsetY = offsetY + ev.pageY - startY
      })
      on(document, 'mousemove', this._dragHandler)
      on(document, 'mouseup', (ev) => {
        off(document, 'mousemove', this._dragHandler)
      })
      e.preventDefault()
    },
    reset() {
      this.transform = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false,
      }
    },
    toggleMode() {
      if (this.loading) return
      const modeNames = Object.keys(Mode)
      const modeValues = Object.values(Mode)
      const index = modeValues.indexOf(this.mode)
      const nextIndex = (index + 1) % modeNames.length
      this.mode = Mode[modeNames[nextIndex]]
      this.reset()
    },
    prev() {
      if (this.isFirst && !this.infinite) return
      const len = this.imgList.length
      this.initialIndex = (this.initialIndex - 1 + len) % len
    },
    next() {
      if (this.isLast && !this.infinite) return
      const len = this.imgList.length
      this.initialIndex = (this.initialIndex + 1) % len
    },
    handleActions(action, options = {}) {
      if (this.loading) return
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options,
      }
      const { transform } = this
      switch (action) {
        case 'zoomOut':
          if (transform.scale > 0.2) {
            transform.scale = parseFloat(
              (transform.scale - zoomRate).toFixed(3)
            )
          }
          break
        case 'zoomIn':
          transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3))
          break
        case 'clocelise':
          transform.deg += rotateDeg
          break
        case 'anticlocelise':
          transform.deg -= rotateDeg
          break
      }
      transform.enableTransition = enableTransition
    },
  },
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.image-viewer {
  &__wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  &__img {
    cursor: move;
  }
  &__mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0.5;
    background: #212831;
  }
  &__loading {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0.5;
    background: rgb(177, 163, 163);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    &__lodingSvg {
      transition: 0.5s;
      animation: rotate 1s linear infinite;
    }
  }
  &__btn {
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: 0.8;
    cursor: pointer;
    box-sizing: border-box;
    user-select: none;
  }
  &__title {
    z-index: 1;
    position: absolute;
    left: 50%;
    top: 30px;
    transform: translateX(-50%);
    height: 44px;
    line-height: 44px;
    padding: 0 23px;
    background-color: #606266;
    border-color: #fff;
    border-radius: 22px;
    color: #fff;
    opacity: 0.8;
    box-sizing: border-box;
  }
  &__close {
    top: 28px;
    right: 28px;
    width: 36px;
    height: 36px;
    i {
      width: 36px;
      height: 36px;
    }
    .imgs-viewer-icon {
      font-size: 32px;
    }
  }
  &__next,
  &__prev {
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    font-size: 24px;
    color: #fff;
    background-color: #606266;
    border-color: #fff;
    .imgs-viewer-icon {
      font-size: 24px;
    }
  }
  &__prev {
    left: 40px;
  }
  &__next {
    right: 40px;
    text-indent: 2px;
  }
  &__actions {
    left: 50%;
    bottom: 30px;
    transform: translateX(-50%);
    width: 330px;
    height: 78px;
    background-color: #000;
    border-color: #fff;
    border-radius: 4px;
    &__inner {
      width: 100%;
      height: 100%;
      text-align: justify;
      cursor: default;
      font-size: 23px;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      .actions-block {
        height: 78px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .imgs-viewer-icon {
        font-size: 21px;
      }
      i.icon {
        cursor: pointer;
        width: 28px;
        height: 28px;
      }
      span.font-tip {
        height: 18px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 18px;
        margin-top: 8px;
      }
    }
    &__divider {
      width: 2px;
      height: 21px;
      background: #e8eaed;
      border-radius: 1px;
      opacity: 0.09;
      cursor: inherit !important;
    }
  }
  &__canvas {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  50% {
    transform: rotate(200deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

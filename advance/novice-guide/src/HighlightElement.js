import { prefix } from './utils.js';

// 高亮元素类
export default class HighlightElement {
  constructor(app) {
    this.app = app
    this.el = null
  }

  // 显示高亮元素
  show(step) {
    if (!this.el) {
      this.createEl()
    }
    let left = 0,
      top = 0,
      width = 0,
      height = 0

    let _scrollLeft = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft
    let _scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop

    if (step.element) {
      const rect = step.element.getBoundingClientRect()
      let { padding } = this.app.options
      left = rect.left + _scrollLeft - padding
      top = rect.top + _scrollTop - padding
      width = rect.width + padding * 2
      height = rect.height + padding * 2
    } else {
      // 当前步骤没有元素则宽高设为0，然后窗口居中显示
      left = window.innerWidth / 2 + _scrollLeft
      top = window.innerHeight / 2 + _scrollTop
      width = 0
      height = 0
    }
    this.el.style.left = left + 'px'
    this.el.style.top = top + 'px'
    this.el.style.width = width + 'px'
    this.el.style.height = height + 'px'
  }

  // 创建高亮元素
  createEl() {
    let { boxShadowColor, transition, borderRadius, highlightElClass, zIndex } =
      this.app.options
    this.el = document.createElement('div')
    this.el.className = prefix + 'highlight-el'
    this.el.style.cssText = `
        box-shadow: 0 0 0 5000px ${boxShadowColor};
        border-radius: ${borderRadius};
        transition: ${transition};
        z-index: ${zIndex};
    `
    if (highlightElClass) {
      this.el.classList.add(highlightElClass)
    }
    document.body.appendChild(this.el)
  }

  // 移除高亮元素
  removeEl() {
    if (this.el) {
        document.body.removeChild(this.el)
        this.el = null
    }
  }
}

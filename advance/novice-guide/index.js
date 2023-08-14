import HighlightElement from './src/HighlightElement.js'
import InfoElement from './src/InfoElement.js'
import { scrollAncestorToElement, elementIsInView } from './src/utils.js'
import { addCss, removeCss } from './src/css.js'
import EventEmitter from './eventemitter3.js'

// 默认配置
const defaultOptions = {
  padding: 10,
  margin: 10,
  boxShadowColor: 'rgba(0, 0, 0, 0.5)',
  transition: 'all 0.3s ease-out',
  borderRadius: '5px',
  highlightElClass: '',
  backgroundColor: '#fff',
  infoElClass: '',
  prevText: '上一步',
  nextText: '下一步',
  completeText: '完成',
  showIndicator: true,
  zIndex: 9999,
  useCustomInfo: false,
  getCustomInfoEl: null,
  steps: []
}

// 入口类
class NoviceGuide extends EventEmitter {
  constructor( options) {
    super()
    // 选项
    this.options = Object.assign(defaultOptions, options)
    // 步骤数据
    this.steps = []
    // 当前所在步骤
    this.currentStepIndex = -1
    // 实例化辅助类
    this.highlightElement = new HighlightElement(this)
    this.infoElement = new InfoElement(this)
    // 初始化步骤数据
    this.initSteps()
  }

  // 初始化步骤数据
  initSteps() {
    this.options.steps.forEach(step => {
      this.steps.push({
        ...step,
        element:
          typeof step.element === 'string'
            ? document.querySelector(step.element)
            : step.element
      })
    })
  }

  // 开始
  start() {
    if (this.steps.length <= 0) return
    // 添加元素的样式到页面
    if (!this.addedCss) {
      addCss()
      this.addedCss = true
    }
    this.next()
  }

  // 下一步
  next() {
    this.emit('before-step-change', this.currentStepIndex)
    if (this.currentStepIndex + 1 >= this.steps.length) {
      return this.done()
    }
    this.currentStepIndex++
    this.to(this.currentStepIndex)
  }

  // 上一步
  prev() {
    this.emit('before-step-change', this.currentStepIndex)
    if (this.currentStepIndex - 1 < 0) {
      return
    }
    this.currentStepIndex--
    this.to(this.currentStepIndex)
  }

  // 跳转到指定步骤
  jump(stepIndex) {
    this.currentStepIndex = stepIndex
    this.to(stepIndex)
  }

  // 达到某一步
  async to(stepIndex) {
    const currentStep = this.steps[stepIndex]
    // 当前步骤没有元素就不用处理滚动
    if (currentStep.element) {
      scrollAncestorToElement(currentStep.element)
      const rect = currentStep.element.getBoundingClientRect()
      const windowHeight = window.innerHeight
      if (!elementIsInView(currentStep.element)) {
        window.scrollBy(0, rect.top - (windowHeight - rect.height) / 2)
      }
    }
    this.highlightElement.show(currentStep)
    await this.infoElement.show(currentStep)
    this.emit('after-step-change', stepIndex)
  }

  // 结束
  done() {
    this.emit('before-step-change', this.currentStepIndex)
    this.highlightElement.removeEl()
    this.infoElement.removeEl()
    removeCss()
    this.addedCss = false
    this.currentStepIndex = -1
    this.emit('after-step-change', this.currentStepIndex)
    this.emit('done')
  }

  // 是否是第一步
  isFirstStep() {
    return this.currentStepIndex <= 0
  }

  // 是否是最后一步
  isLastStep() {
    return this.currentStepIndex >= this.steps.length - 1
  }
}

export default NoviceGuide

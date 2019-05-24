/**
 * sourceType: module(不用严格模式 import)  | script(严格模式)
 * locations 源代码行数
 */
const acorn = require('acorn')
const walk = require('acorn-walk')

// console.log(acorn.parse('1 + 1'))
walk.simple(acorn.parse('let x = 10'), {
  Literal(node) {
    console.log(`found a liternal ${node.value}`)
  }
})
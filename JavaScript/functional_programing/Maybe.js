class Maybe {
  constructor(val) {
    this.val = val
  }
  static of(val) {
    // 生成新的容器
    return new Maybe(val)
  }
  isNothing() {
    return (this.val === null || this.val === undefined)
  }
  map(f) {
    return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.val))
  }
}

console.log(
  Maybe.of(null).map(function (item) {
    return item.toUpperCase();
  })
)
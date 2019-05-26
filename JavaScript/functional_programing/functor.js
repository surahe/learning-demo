class Functor {
  constructor(val) {
    this.val = val
  }
  static of(val) {
    // 生成新的容器
    return new Functor(val)
  }
  map(func) {
    // 将容器里面的每一个值，映射到另一个容器
    return Functor.of(func(this.val))
  }
}

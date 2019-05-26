class Monad {
  constructor(val) {
    this.val = val
  }
  static of(val) {
    // 生成新的容器
    return new Monad(val)
  }
  map(func) {
    // 将容器里面的每一个值，映射到另一个容器
    return Monad.of(func(this.val))
  }
  join() {
    return this.val;
  }
  flatMap(f) {
    return this.map(f).join();
  }
}

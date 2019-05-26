// 使用Eighter函子提供默认值
class Either  {
  constructor(left, right) {
    this.left = left
    this.right = right
  }

  static of(left, right) {
    return new Either(left, right)
  }

  map(f) {
    return this.right ?
      Either.of(this.left, f(this.right)) :
      Either.of(f(this.left), this.right)
  }
}

var addOne = function (x) {
  return x + 1;
};

console.log(Either.of(5, 6).map(addOne))
// Either(5, 7);
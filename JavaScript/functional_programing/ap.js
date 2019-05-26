// class Functor {
//   constructor(val) {
//     this.val = val
//   }
//   static of(val) {
//     // 生成新的容器
//     return new Functor(val)
//   }
//   map(func) {
//     // 将容器里面的每一个值，映射到另一个容器
//     return Functor.of(func(this.val))
//   }
//   ap(other_container) {
//     return other_container.map(this.val);
//   }
// }

// function addTwo(x) {
//   return x + 2;
// }

// console.log(Functor.of(addTwo).ap(Functor.of(2)))

class Ap {
  constructor(val) {
    this.val = val
  }
  static of(val) {
    // 生成新的容器
    return new Ap(val)
  }
  ap(F) {
    return Ap.of(this.val(F.val));
  }
}

function addTwo(x) {
  return x + 2;
}

console.log(Ap.of(addTwo).ap(Ap.of(2)))
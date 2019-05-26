class Left {
  constructor(val) {
    this.val = val
  }
  static of (x) {
    return new Left(x)
  }
  map (f) {
    return this
  }
}

class Right {
  constructor(val) {
    this.val = val
  }
  static of (x) {
    return new Left(x)
  }
  map (f) {
    return Right.of(f(this.val))
  }
}

var getAge = user => user.age ? Right.of(user.age) : Left.of('ERROR!');

console.log(getAge({name: 'stark', age: '21'}).map(age => 'Age is ' + age)) // Left { val: '21' }

console.log(getAge({name: 'stark'}).map(age => 'Age is ' + age)) // Left('ERROR!')
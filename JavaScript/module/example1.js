function buildList(list) {
  var result = [];
  for (var i = 0; i < list.length; i++) {
    result.push(function () { console.log('item' + i + ' ' + list[i]) });
  }
  return result;
}

function buildList1(list) {
  var result = [];
  for (var i = 0; i < list.length; i++) {
    var item = 'item' + i;
    result.push(function () { console.log(item + ' ' + list[i]) });
  }
  return result;
}

function testList(fnList) {
  // 使用j是为了防止搞混---可以使用i
  for (var j = 0; j < fnList.length; j++) {
    fnList[j]();
  }
}

testList(buildList([1, 2, 3]))
// item3 undefined
// item3 undefined
// item3 undefined

testList(buildList1([1, 2, 3]))
// item2 undefined
// item2 undefined
// item2 undefined
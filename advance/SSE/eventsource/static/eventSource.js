var source

function init() { 
  source = new EventSource('http://localhost:3000/api')
  source.onopen = function () { 
    console.log('abc')
    console.log(this.readyState)
  }

  source.addEventListener('server-time', function (e) {
    console.log(e.data)
  })

  source.onmessage = function(event) {
    console.log('def')
    console.log(event.data)
  }
  source.onerror = function () {
    
  }
}

init()
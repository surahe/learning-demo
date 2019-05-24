module.exports = async function (content) {
  function timeout(delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('*** js content ***', content)
        resolve("{};" + content)
      }, delay)
    })
  }
  const data = await timeout(1000)
  console.log('*** result ***', data)
  return data
}
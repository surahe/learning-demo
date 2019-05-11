window.onerror = (msg, url, line, col, err) => {
  console.log(msg);
  console.log(url);
  console.log(line);
  console.log(col);
  console.dir(err);
  return true
}

setTimeout(() => {
  throw new Error("some message");
}, 0);

i < 1
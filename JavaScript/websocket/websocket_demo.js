class ChatWebSocket {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.events = {}; // 存储事件监听器
  }

  // 初始化 WebSocket 连接
  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket 连接已建立");
      this.emit("open");
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("收到消息:", message);
      this.emit("message", message);
    };

    this.socket.onclose = () => {
      console.log("WebSocket 连接已关闭");
      this.emit("close");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket 错误:", error);
      this.emit("error", error);
    };
  }

  // 发送消息
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket 未连接");
    }
  }

  // 添加事件监听器
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 触发事件
  emit(eventName, data) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // 关闭连接
  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

// 使用 ChatWebSocket
const chatSocket = new ChatWebSocket("ws://example.com/chat");

// 连接 WebSocket
chatSocket.connect();

// 监听消息事件
chatSocket.on("message", (message) => {
  console.log("处理消息:", message);
});

// 发送消息
document.getElementById("sendButton").addEventListener("click", () => {
  const input = document.getElementById("messageInput");
  chatSocket.send({ type: "chat", content: input.value });
  input.value = "";
});

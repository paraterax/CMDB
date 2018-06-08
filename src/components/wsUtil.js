var UUID = (function() {
    var self = {};
    var lut = [];
    for (var i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    self.generate = function() {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    }
    return self;
})();

var WS = (function() {
    var self = {};
    self.socket = null;
    self.requests = {};
    self.subscriptions = {};

    // 初始化WebSocket连接
    self.init = function(options) {
        var url = options.url,
            handshake = options.data,
            timeout = options.timeout || null,
            successFun = options.success || null,
            errorFun = options.error || null;

        if (self.socket && self.socket.readyState === self.socket.OPEN && self.socket.url === url) {
            // 已经存在连接
        } else {
            if (self.socket && self.socket.readyState !== self.socket.CLOSED) {
                // 重新初始化连接
                self.socket.close();
            }
            self.socket = new WebSocket(url);
            self.socket.onopen = function(event){
                if (handshake) {
                    // 发送握手请求
                  self.request({
                      body: handshake,
                      timeout: timeout,
                      success: function(){
                        setInterval(function(){
                          self.request({
                            body:{ptl:"push", "ping":"active"}
                          })
                        }, 30000);
                        successFun();
                      },
                      error: errorFun
                  });
                } else {
                    // 成功建立连接
                    console.log("WS: Connected to " + url);
                    if(successFun) successFun()
                }
            };
            self.socket.onerror = function(event){
                // 连接出错
                console.log("WS: Error when connecting to " + url);
            };
            self.socket.onmessage = function(event){
                var data = JSON.parse(event.data);
                // 处理通知
                if (data["t"]) {
                    // t for topic
                    var topic = data["t"];
                    if (topic in self.subscriptions) {
                        // 已订阅的通知
                        console.log("WS: Received push message: ", data)
                        self.subscriptions[topic](data);
                    } else {
                        // 未订阅的通知
                        console.log("WS: Received unsubscribed push message: ", data)
                    }
                } else {
                    // 处理请求
                    var matched = false;
                    // 查找对应rid的请求
                    for (var rid in self.requests) {
                        if (data["rid"] == rid) {
                            matched = true;
                            console.log("WS: Received message: ", data)
                            // 调用回调函数处理数据
                            self.requests[rid]["resolver"](data);
                            // 删除暂存的请求
                            delete self.requests[rid];
                        }
                    }
                    if (!matched) {
                        // 无对应的请求
                        console.log("WS-ERROR: Received unmatched message: ", data)
                    }
                }
            };
            self.socket.onclose = function(event){
                if (event.code == 1000 || event.code == 1001 || event.code == 1005) {
                    // 普通退出
                    console.log("WS: Closing, last connection was " + event.currentTarget.url);
                    //   // 初次连接失败
                    setTimeout(function(){
                        self.init(options)
                    }, 3000)
                } else {
                    // 异常退出，尝试重连
                    console.log("WS: Connection lost. Reconnecting after 3s...");
                    setTimeout(function(){
                        self.init(options);
                    }, 3000)
                }
            };
        }
    }

    // 发送请求
    self.request = function(options ) {
        var ptl = options.ptl || null, 
            u = options.u || null, 
            body = options.body || null, 
            timeout = options.timeout || null,
            successFun = options.success || null,
            errorFun = options.errorFun || null;

        if (self.socket && self.socket.readyState === self.socket.OPEN) {
            // 生成随机rid
            var rid = UUID.generate();
            // 存储请求信息
            self.requests[rid] = {};
            if (body) self.requests[rid]["request"] = body;
            else self.requests[rid]["request"] = {};
            if (ptl) self.requests[rid]["request"]["ptl"] = ptl;
            if (u) self.requests[rid]["request"]["u"] = u;
            self.requests[rid]["request"]["rid"] = rid;
            self.requests[rid]["resolver"] = function(result) {
                if(successFun) successFun(result)
            };
            //设置超时
            if (timeout) {
                setTimeout(function(){
                    if (self.requests[rid]) {
                        delete self.requests[rid];
                        var error = "WS-ERROR: Request timeout";
                        console.log(error);
                        if(errorFun) errorFun(error)
                    }
                }, timeout);
            }
            // 发送WebSocket请求
            console.log("WS: Sending " + JSON.stringify(self.requests[rid]["request"]));
            self.socket.send(JSON.stringify(self.requests[rid]["request"]));
        } else {
            // 连接尚未就绪
            var error = "WS-ERROR: Sending request failed: socket is not ready";
            console.log(error);
            if(errorFun) errorFun(error)
        }
    }

    // 订阅通知
    self.subscribe = function(topic, callback) {
        self.subscriptions[topic] = callback;
        console.log("WS: Subscribed to " + topic);
    }

    // 解除订阅
    self.unsubscribe = function(topic) {
        delete self.subscriptions[topic];
        console.log("WS: Unsubscribed from " + topic);
    }

    // 查询是否订阅
    self.isSubscribed = function(topic) {
        return topic in self.subscriptions;
    }
    return self;
})();
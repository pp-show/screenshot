import axios from "axios";
import { message } from "ant-design-vue";

class screenShot {
  constructor(height, update) {
    // 需要截取的窗口高度
    this.height = height;
    this.windowInfo = {}; // 获取当前浏览的信息
    this.tabId = -1; //
    this.update = update;
    this.tabUrl = "";
    this.maxPost = 3; //试错3次
  }
  // canvas = document.getElementById("canvas")// 需要拼接图片的画布
  canvas = document.createElement("canvas"); // 需要拼接图片的画布
  yPos = 0; //初始化滚动的位置
  async start() {
    //开始截图
    message.info("开始截图");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    this.tabId = tab.id;
    this.tabUrl = tab.url;
    await this.fetchPageSize(tab.id);
  }
  async fetchPageSize(tabId) {
    try {
      chrome.tabs.sendMessage(
        tabId,
        { message: "fetchPageSize" },
        this.onResponseVisibleSize.bind(this)
      );
    } catch (e) {
      console.log(e, "error");
    }
  }
  // 获取屏幕的属性
  onResponseVisibleSize(pageInfo) {
    console.log(pageInfo, "pageInfopageInfo");
    this.windowInfo.scrollHeight = pageInfo.scrollHeight;
    this.windowInfo.clientWidth = pageInfo.clientWidth;
    this.windowInfo.clientHeight = pageInfo.clientHeight;
    this.windowInfo.title = pageInfo.title;
    this.windowInfo.price = pageInfo.price;
    this.canvas.width = pageInfo.clientWidth;
    if (this.height && pageInfo.scrollHeight < this.height) {
      this.height = pageInfo.scrollHeight;
    }
    this.canvas.height = this.height || pageInfo.scrollHeight;
    this.startCapture();
  }

  async startCapture() {
    this.yPos = 0;
    await chrome.scripting.insertCSS({
      target: { tabId: this.tabId },
      css: "body::-webkit-scrollbar { display: none; }",
    });
    this.scrollPage();
  }

  //滚动页面
  scrollPage() {
    try {
      chrome.tabs.sendMessage(
        this.tabId,
        { message: "scrollPage", y: this.yPos },
        this.onScrollDone.bind(this)
      );
    } catch {
      message.error("失败");
    }
  }
  onScrollDone() {
    setTimeout(() => {
      this.captureVisibleBlock();
    }, 500);
  }
  async captureVisibleBlock() {
    var self = this;
    const width = this.windowInfo.clientWidth;
    const height = this.windowInfo.clientHeight;
    const maxHeight = this.height || self.windowInfo.scrollHeight;
    await chrome.tabs.captureVisibleTab(null, async function (img) {
      const blockImg = new Image();
      if (self.yPos + self.windowInfo.clientHeight >= maxHeight) {
        blockImg.onload = async function () {
          const ctx = self.canvas.getContext("2d");
          ctx.globalCompositeOperation = "destination-over";
          const y =
            self.windowInfo.clientHeight -
            (maxHeight % self.windowInfo.clientHeight);

          //最后一页 分 滚动没有满足一页还是滚动满足一页只是不需要全张
          if (
            self.yPos + self.windowInfo.clientHeight >
            self.windowInfo.scrollHeight
          ) {
            ctx.drawImage(blockImg, 0, self.yPos - y, width, height);
          } else {
            ctx.drawImage(blockImg, 0, self.yPos, width, height);
          }

          chrome.tabs.sendMessage(self.tabId, { message: "finish" });
          self.postImg();

          await chrome.scripting.removeCSS({
            target: { tabId: self.tabId },
            css: "body::-webkit-scrollbar { display: none; }",
          });
        };
      } else {
        blockImg.onload = function () {
          const ctx = self.canvas.getContext("2d");
          ctx.globalCompositeOperation = "destination-over";
          ctx.drawImage(blockImg, 0, self.yPos, width, height);
          self.yPos += self.windowInfo.clientHeight;
          self.scrollPage();
        };
      }
      blockImg.src = img;
    });
  }
  postImg() {
    const self = this;
    message.info("开始上传");
    console.log(this.canvas.toDataURL());
    this.canvas.toBlob(
      function (blob) {
        const file = new File([blob], "my-image.png", { type: "image/png" });
        axios({
          method: "post",
          url: "xxxx",
          data: {
            file,
          },
          timeout: 10000,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then(({ data: result }) => {
            if (result.success && result.data[0]) {
              const imgUrl = result.data[0].url;
              self.update({
                imgUrl: imgUrl,
                title: self.windowInfo.title,
                price: self.windowInfo.price,
                url: self.tabUrl,
              });
              message.success("上传成功");
              self.maxPost = 3;
            } else {
              message.error("上传失败");
              if (self.maxPost > 1) {
                message.error("重新上传中...");
                self.postImg();
                self.maxPost--;
              }
            }
          })
          .catch(() => {
            message.error("上传失败");
            console.log("上传失败");

            if (self.maxPost > 1) {
              message.error("重新上传中...");
              self.postImg();
              self.maxPost--;
            }
          });
      },
      "image/jpeg",
      0.8
    );
  }
}

export default screenShot;

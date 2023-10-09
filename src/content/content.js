const domList = [];
/**
 * 获取fixed元素重置位置
 */
const fixedDomResize = () => {
  const elems = document.body.getElementsByTagName("*");
  const len = elems.length
  for (let i = 0; i < len; i++) {
    if (window.getComputedStyle(elems[i], null).getPropertyValue('position') == 'fixed' || window.getComputedStyle(elems[i], null).getPropertyValue('position') == 'sticky') {
      domList.push(elems[i]);
      elems[i].style.opacity = 0;
    }

  }
}

/**
 * 还原fixed元素
 */
const resetFixedDom = () => {
  domList.map((value) => {
    value.style.removeProperty("opacity");
  })
}

/**
 * 获取需要填充的元素
 */
const patchDom = (itemList) => {
  const myButton = document.querySelectorAll('.screenshotBtn');
  const isOld = !(location.href.indexOf('/price-inspection') > -1);
  let status = false;
  itemList.map((item) => {
    for (let node of myButton) {
      if (node.status) {
        continue;
      }
      let brotherNode;
      let parentNode;
      let eventName;
      let baseprice;

      if (isOld) {
        eventName = 'blur';
        brotherNode = node.previousElementSibling;
        parentNode = node.parentElement.parentElement;
        baseprice = parentNode.querySelector('[id^="skuPrices|basePrice|"]');
      } else {
        brotherNode = node.parentElement.parentElement.parentElement;
        parentNode = node.parentElement;
        eventName = 'change';
        baseprice = brotherNode.querySelector('.ant-input-number-handler-wrap-hide')?.querySelector('.ant-input-number-input');
      }
      const imageNode = brotherNode.querySelector('.ant-upload-list-item-name');
      const priceUrl = parentNode.querySelector('.lowerPrice');
      if (!imageNode) {
        const myData = { screenShotUrl: item.imgUrl };
        const myEvent = new CustomEvent('click', { detail: myData, bubbles: true });
        node.dispatchEvent(myEvent);
        if (priceUrl) {
          priceUrl.value = item.url;
          const priceUrlEvent = new CustomEvent(eventName, { bubbles: true });
          priceUrl.dispatchEvent(priceUrlEvent);

        }
        if (baseprice) {
          baseprice.value = item.price;
          const basepriceEvent = new CustomEvent(eventName, { bubbles: true });
          baseprice.dispatchEvent(basepriceEvent);

        }
        status = true;
        node.status = status;//填充过不填，为了兼容新版本巡检页面渲染防抖300ms。拿不到最新的图片
        break;
      }

    }
  })

  return status;
}

/**
 * 获取价格信息 
 */
const getPrice = () => {
  const locationUrl = location.href;
  if (locationUrl.indexOf('.jd.com') > -1) {
    return document.querySelector('.p-price [class^="price J-p-"]')?.innerText || 0;
  }

  if (locationUrl.indexOf('.suning.com') > -1) {
    return document.querySelector('.mainprice')?.innerText?.replace(/[^\d|.]/g, "") || 0;
  }

  if (locationUrl.indexOf('.tmall.com') > -1) {
    return document.querySelector('[class^="Price--priceText--"]')?.innerText || 0;
  }
}

/**
 * 监听来自chrome插件的消息
 */
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.message === 'fetchPageSize') {
    const price = getPrice();
    console.log(price, 'priceprice')
    const pageSize = {
      scrollHeight: document.body.scrollHeight,
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      title: document.title,
      price,
    };
    sendResponse(pageSize);
  } else if (msg.message === 'scrollPage') {

    //第一页需要置顶
    if (msg.y === 0) {
      document.scrollingElement.scrollTop = 0;
    }
    // 向下滚动一页
    else {
      window.scrollBy(0, window.innerHeight);
      setTimeout(() => {
        fixedDomResize();
      }, 20)
    }
  } else if (msg.message === 'finish') {
    document.scrollingElement.scrollTop = 0;
    resetFixedDom();
  } else if (msg.message === 'patch') {
    const status = patchDom(msg.item);
    sendResponse(status);
  }
});










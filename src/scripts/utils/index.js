import { message } from 'ant-design-vue';
export const successFn = (isSuccess) => {
  if (isSuccess)
    message.success({
      content: '填入成功',
      duration: 1
    })
  else
    message.error({
      content: '请先删除',
      duration: 1
    })
}
//修复列表中没有上传的数据入口
export const patchImage = (item) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const tabId = tab.id;
    chrome.tabs.sendMessage(tabId, { message: "patch", item }, successFn);
  });
}

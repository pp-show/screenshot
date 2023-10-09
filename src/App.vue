<template>
  <div class="mainContainer" style="overflow: auto;">
    <div class="screenshotButtonContainer">
      <button class="screenshotButton" @click="shotClick">截图价格</button>
      <button class="screenshotButton" @click="shotClick2">2倍高度截图</button>
      <button class="screenshotButton" @click="patchAll">自动补丁</button>
      <button class="clearButton" @click="clear">一键清空</button>
    </div>
    <div class="viewContainer">
      <template v-for="(item, index) in list">
        <Item :item='item' :delete-fn="() => deleteData(index)" />
      </template>
    </div>
    <!-- <canvas id="canvas"></canvas> -->
  </div>
</template>
  

<script setup>
import { ref, onBeforeMount, toRaw } from 'vue';
import { patchImage } from './scripts/utils/index';
import './style/popup.scss';
import screenshot from './scripts/screenshot';
import Item from './component/item.vue';
import { initDb, addData, getData } from './scripts/db';
const list = ref([]);
const refStore = ref();
refStore.value = initDb();
onBeforeMount(async () => {
  const initList = await getData(refStore.value);
  list.value = initList;
})

const shotClick = async () => {
  new screenshot(1600, update).start();

}
const shotClick2 = async () => {
  new screenshot(3200, update).start();

}

// 自动填充
const patchAll = async () => {
  patchImage(list.value.slice(0, 3))

}

// 更新数据
const update = (value) => {
  const listValue = [...toRaw(list.value)];
  const result = [
    ...listValue,
    value
  ];
  addData(refStore.value, result);
  list.value = result;

}

// 删除数据
const deleteData = (index) => {
  const listValue = [...toRaw(list.value)];
  listValue.splice(index, 1);
  addData(refStore.value, listValue);
  list.value = listValue;

}

//清空数据
const clear = () => {
  list.value = [];
  addData(refStore.value, []);
}



</script>

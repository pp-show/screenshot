<template>
  <div class="item">
    <div class="imgContainer">
      <div class="operateContainer">
        <button class="optButton" @click="() => patchImage([props.item])">填充</button>
        <button class="optButton deleteButton" @click="props.deleteFn">删除</button>
      </div>
      <img :src="props.item.imgUrl" />
    </div>
    <Tooltip :title="props.item.title">
      <span>{{ props.item.title }}</span>
    </Tooltip>

    <Tooltip :title="props.item.url">
      <span>{{ props.item.url }}</span>
    </Tooltip>
    <span>{{ props.item.price }}</span>
  </div>
</template>

<script setup>
import { Tooltip } from 'ant-design-vue';
import { patchImage } from '../scripts/utils/index';
import 'ant-design-vue/es/message/style/css';
import 'ant-design-vue/es/Tooltip/style/css';
const props = defineProps(['item', 'deleteFn'])


</script>

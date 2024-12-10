<template>
  <div style="width: 300px; padding: 0 20px">
    <div class="sub-title">原图</div>
    <img-uploader :url="originImg" @upload="(filrUrl) => (originImg = filrUrl)"></img-uploader>
    <input class="url-input" type="text" v-model.trim="originImg" placeholder="原图链接..." />

    <div class="sub-title">深度图</div>
    <img-uploader :url="depthImg" @upload="(filrUrl) => (depthImg = filrUrl)"></img-uploader>
    <input class="url-input" type="text" v-model.trim="depthImg" placeholder="深度图链接..." />
    <div class="button-wrapper">
      <button class="confirm-button" @click="handleConfirm">应用</button>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import ImgUploader from './img-uploader.vue';

  const emits = defineEmits<{
    (e: 'confirm', url1: string, url2: string): void;
  }>();

  const originImg = ref('');
  const depthImg = ref('');

  const handleConfirm = () => {
    emits('confirm', originImg.value, depthImg.value);
  };

  const setImgUrl = (url1: string, url2: string) => {
    originImg.value = url1;
    depthImg.value = url2;
  };

  defineExpose({
    setImgUrl,
  });
</script>

<style lang="scss" scoped>
  .sub-title {
    margin: 20px 0 8px;
    font-size: 16px;
  }

  .url-input {
    margin-top: 12px;
  }

  .button-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;

    .confirm-button {
      width: 60px;
      height: 30px;
      color: #fff;
      background-color: #939393;
      border-color: #939393;
      cursor: pointer;
    }
  }
</style>

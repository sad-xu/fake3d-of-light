<template>
  <div class="img-uploader">
    <div class="container">
      <img
        class="img"
        crossorigin="anonymous"
        draggable="false"
        v-if="props.url"
        :src="props.url"
        @click="openFile"
      />
      <svg
        v-else
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        @click="openFile"
      >
        <path
          d="M984.615385 196.923077c0-43.323077-35.446154-78.769231-78.769231-78.769231H118.153846c-43.323077 0-78.769231 35.446154-78.769231 78.769231v630.153846c0 43.323077 35.446154 78.769231 78.769231 78.769231h787.692308c43.323077 0 78.769231-35.446154 78.769231-78.769231V196.923077zM779.815385 748.307692h-571.076923c-23.630769 0-37.415385-25.6-25.6-45.292307l173.292307-301.292308c7.876923-13.784615 25.6-13.784615 33.476923 0l104.369231 179.2c7.876923 11.815385 25.6 13.784615 33.476923 1.969231l84.676923-122.092308c7.876923-11.815385 25.6-11.815385 33.476923 0L801.476923 708.923077c11.815385 17.723077 0 39.384615-21.661538 39.384615zM728.615385 393.846154c-43.323077 0-78.769231-35.446154-78.769231-78.769231s35.446154-78.769231 78.769231-78.769231 78.769231 35.446154 78.76923 78.769231-35.446154 78.769231-78.76923 78.769231z"
          fill="#fff"
        ></path>
      </svg>
      <input
        ref="uploadInputRef"
        class="upload-input"
        type="file"
        accept="image/png,image/jpeg"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  const props = defineProps<{
    // 图片地址
    url?: string;
  }>();

  const emits = defineEmits<{
    (e: 'upload', fileUrl: string, file: File): void;
  }>();

  const uploadInputRef = ref();

  const openFile = () => {
    uploadInputRef.value.click();
  };

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files.length) {
      const file = e.target.files[0];
      if (file) {
        const fileUrl = window.URL.createObjectURL(file);
        emits('upload', fileUrl, file);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .img-uploader {
    position: relative;
    width: 40px;
    height: 40px;

    .container {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
      user-select: none;

      &:hover {
        background-color: #333;
      }
    }

    .img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.3s;
    }

    .rotate-icon {
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 2;
      width: 20px;
      height: 20px;
      padding: 2px;
      background-color: #00000080;
      border-radius: 100%;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;
      }
    }

    .upload-input {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 0;
      height: 0;
      visibility: hidden;
    }
  }
</style>

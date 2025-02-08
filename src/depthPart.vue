<template>
  <fake3d-card :img="imgUrl" :depth-img="depthImgUrl"></fake3d-card>
  <div class="dialog">
    <edit-dialog v-show="showDialog" ref="editDialogRef" @confirm="handleConfirm">
      <a target="_blank" :href="fullUrl" v-show="fullUrl" class="full-url">
        {{ fullUrl }}
      </a>
    </edit-dialog>
    <div
      class="button"
      :class="showDialog ? 'button-out' : 'button-in'"
      @click="showDialog = !showDialog"
    >
      {{ showDialog ? '👈' : '👉' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import EditDialog from './components/edit-dialog.vue';
  import Fake3dCard from './components/fake3d-card.vue';

  const showDialog = ref(false);
  const editDialogRef = ref();

  const imgUrl = ref('');
  const depthImgUrl = ref('');

  // 完整链接
  const fullUrl = ref('');

  onMounted(() => {
    const list = window.location.search.slice(1).split('&');
    const searchMap: any = {};
    list.forEach((item) => {
      const [k, v] = item.split('=');
      searchMap[k] = v;
    });

    const img = decodeURIComponent(searchMap['img'] ?? '');
    const depthImg = decodeURIComponent(searchMap['depthImg'] ?? '');
    imgUrl.value = img;
    depthImgUrl.value = depthImg;

    if (checkUrl(img) && checkUrl(depthImg)) {
      editDialogRef.value.setImgUrl(img, depthImg);
    }
    generateFullUrl(img, depthImg);
  });

  /** 应用 */
  const handleConfirm = (url1: string, url2: string) => {
    imgUrl.value = url1;
    depthImgUrl.value = url2;
    generateFullUrl(url1, url2);
  };

  const checkUrl = (url: string) => {
    if (url.indexOf('blob:') == 0 || url.indexOf('/fake3d') == 0) {
      return false;
    }
    return true;
  };

  /** 生成完整链接 */
  const generateFullUrl = (url1: string, url2: string) => {
    console.log(url1, url2);
    if (checkUrl(url1) && checkUrl(url2)) {
      fullUrl.value = `${window.location.origin}${
        window.location.pathname
      }?img=${encodeURIComponent(url1)}&depthImg=${encodeURIComponent(url2)}`;
    } else {
      fullUrl.value = '';
    }
  };
</script>

<style lang="scss" scoped>
  .menu {
    position: fixed;
    top: 0;
    left: 0;
  }

  .dialog {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    padding: 40px 0 20px;
    background-color: #0000004f;
    box-shadow: 0 25px 45px #0000004d;
    backdrop-filter: blur(4px);

    .button {
      position: absolute;
      top: 50%;
      cursor: pointer;
    }

    .button-in {
      left: 0;
    }

    .button-out {
      right: 0;
    }

    .full-url {
      display: inline-block;
      margin-top: 30px;
      color: #ececec;
      word-break: break-all;
    }
  }

  /* transition */
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.3s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>

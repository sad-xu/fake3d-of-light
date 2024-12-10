<template>
  <div class="wrapper">
    <div class="canvas-wrapper">
      <canvas
        ref="canvasEl"
        :style="`width:${imgInfo.width}px;height:${imgInfo.height}px;`"
      ></canvas>
    </div>
  </div>
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
  import { onMounted, onBeforeUnmount, ref, reactive } from 'vue';
  import { isTouchDevice } from '@/utils';
  import fake3d from './utils/fake3d.ts';
  import EditDialog from './components/edit-dialog.vue';

  import img from './img/3.png';
  import depthImg from './img/3_depth.png';

  // import img from './img/ball.jpg';
  // import depthImg from './img/ball-map.jpg';

  // import img from './img/lady.jpg';
  // import depthImg from './img/lady-map.jpg';

  const canvasEl = ref();
  const showDialog = ref(false);
  const editDialogRef = ref();

  const imgInfo = reactive<{
    isFailed: boolean;
    width: number;
    height: number;
    img?: HTMLImageElement;
  }>({
    // 是否加载失败
    isFailed: false,
    width: 0,
    height: 0,
    img: undefined,
  });

  // 完整链接
  const fullUrl = ref('');

  // 3d实例
  let instance: any;

  onMounted(() => {
    const list = window.location.search.slice(1).split('&');
    const searchMap: any = {};
    list.forEach((item) => {
      const [k, v] = item.split('=');
      searchMap[k] = v;
    });

    const url1 = decodeURIComponent(searchMap['img'] ?? '') || img;
    const url2 = decodeURIComponent(searchMap['depthImg'] ?? '') || depthImg;
    if (checkUrl(url1) && checkUrl(url2)) {
      editDialogRef.value.setImgUrl(url1, url2);
    }
    generateFullUrl(url1, url2);

    instance = fake3d(canvasEl.value);
    instance?.setTexture(url1, url2, (img: HTMLImageElement) => {
      imgInfo.img = img;
      resizeCard();
    });

    window.addEventListener('resize', resizeCard);
    if (isTouchDevice) {
      const deviceOrient = window.DeviceOrientationEvent as any;
      console.log(deviceOrient, deviceOrient?.requestPermission);
      if (deviceOrient && deviceOrient.requestPermission) {
        deviceOrient.requestPermission().then((res: any) => {
          console.log(res);
          window.addEventListener('devicemotion', handleDeviceMotion);
        });
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    }
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCard);
    if (isTouchDevice) {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    }
  });

  /** 尺寸变化 */
  const resizeCard = () => {
    // 根据原始尺寸和屏幕尺寸，计算等比缩放后的尺寸
    const maxWidth = window.innerWidth - 120;
    const maxHeight = window.innerHeight - 40;

    const img = imgInfo.img;

    if (img) {
      const wRatio = maxWidth / img.naturalWidth;
      const hRatio = maxHeight / img.naturalHeight;
      const scale = Math.min(wRatio, hRatio);
      imgInfo.width = img.naturalWidth * scale;
      imgInfo.height = img.naturalHeight * scale;
    }
  };

  /** 陀螺仪 速度 TODO:真机测试 */
  const handleDeviceMotion = (e: DeviceMotionEvent) => {
    console.log('rotationRate', e);
    // const now = +new Date();
    // timeId = now;
    // const rotationRate = e.rotationRate;
    // if (rotationRate?.beta === null) return;
    // handleInteract(clamp(rotationRate?.gamma || 50), clamp(rotationRate?.beta || 50));
    // setTimeout(() => {
    //   if (timeId === now) {
    //     resetCard(0);
    //   }
    // }, 500);
  };

  /** 应用 */
  const handleConfirm = (url1: string, url2: string) => {
    instance?.setTexture(url1, url2, (img: HTMLImageElement) => {
      imgInfo.img = img;
      resizeCard();
      generateFullUrl(url1, url2);
      // showDialog.value = false;
    });
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
  .wrapper {
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;

    .canvas-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;

      canvas {
        border-radius: 12px;
        box-shadow: 0 2px 10px 0 #2b2b2b;
        transition: all 0.5s;
      }
    }
  }

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

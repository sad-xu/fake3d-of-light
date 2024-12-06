<template>
  <div class="wrapper">
    <div class="canvas-wrapper">
      <canvas
        ref="canvasEl"
        :style="`width:${imgInfo.width}px;height:${imgInfo.height}px;`"
      ></canvas>
    </div>
    <div class="img-wrapper">
      <img :src="img" />
      <img :src="depthImg" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref, reactive } from 'vue';
  import { isTouchDevice } from '@/utils';
  import fake3d from './utils/fake3d.ts';

  import img from './img/3.png';
  // import depthImg from './img/3_depth.png';
  import depthImg from './img/3_depth_1.jpg';

  // import img from './img/xzz.png';
  // import depthImg from './img/xzz_map.jpg';

  const canvasEl = ref();

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

  // 3d实例
  let instance;

  onMounted(() => {
    instance = fake3d(canvasEl.value);
    instance?.setTexture(img, depthImg, (img: HTMLImageElement) => {
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
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight - 100;

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
</script>

<style lang="scss" scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4vh;
  }

  .canvas-wrapper {
    // width: 1920px;
    // height: 1080px;
    canvas {
      border-radius: 12px;
      transition: all 0.3s;
      box-shadow: 0px 2px 10px 0px #2b2b2b;
    }
  }

  .img-wrapper {
    margin-top: 12px;
    display: flex;
    img {
      width: 400px;
      margin-right: 8px;
    }
  }
</style>

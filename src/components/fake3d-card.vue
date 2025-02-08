<template>
  <div class="wrapper">
    <div class="canvas-wrapper">
      <div class="canvas-inner">
        <canvas
          ref="canvasEl"
          :style="`width:${imgInfo.width}px;height:${imgInfo.height}px;`"
        ></canvas>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref, reactive, watch } from 'vue';
  import { isTouchDevice } from '@/utils';
  import fake3d from '../utils/fake3d.ts';

  import imgA from '../img/4.png';
  import depthImgA from '../img/4_depth.png';

  const props = defineProps<{
    img?: string;
    depthImg?: string;
  }>();

  const canvasEl = ref();

  const imgInfo = reactive<{
    isFailed: boolean;
    width: number;
    height: number;
    img?: HTMLImageElement;
    instance?: any;
  }>({
    // 是否加载失败
    isFailed: false,
    width: 0,
    height: 0,
    img: undefined,
    instance: undefined,
  });

  const init = (img?: string, depthImg?: string) => {
    const url1 = decodeURIComponent(img ?? '') || imgA;
    const url2 = decodeURIComponent(depthImg ?? '') || depthImgA;

    imgInfo.instance?.setTexture(url1, url2, (img: HTMLImageElement) => {
      imgInfo.img = img;
      resizeCard();
    });
  };

  watch([() => props.img, () => props.depthImg], ([img, depthImg], [pimg, pdepthImg]) => {
    init(img, depthImg);
  });

  onMounted(() => {
    imgInfo.instance = fake3d(canvasEl.value);

    init(props.img, props.depthImg);

    window.addEventListener('resize', resizeCard);
    if (isTouchDevice) {
      const deviceOrient = window.DeviceOrientationEvent as any;
      console.log(deviceOrient, deviceOrient?.requestPermission);
      if (deviceOrient && deviceOrient.requestPermission) {
        deviceOrient.requestPermission().then((res: any) => {
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

      .canvas-inner {
        position: relative;
        font-size: 0;

        canvas {
          border-radius: 12px;
          box-shadow: 0 2px 10px 0 #2b2b2b;
          transition: all 0.5s;
        }
      }
    }
  }
</style>

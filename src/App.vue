<template>
  <div class="wrapper">
    <div class="canvas-wrapper">
      <canvas ref="canvasEl" style="width: 100%; height: 100%"></canvas>
    </div>
    <div class="img-wrapper">
      <img :src="img" />
      <img :src="depthImg" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import fake3d from './utils/fake3d.ts';

  import img from './img/3.png';
  import depthImg from './img/3_depth.png';

  // import img from './img/xzz.png';
  // import depthImg from './img/xzz_map.jpg';

  const canvasEl = ref();
  let instance;

  onMounted(() => {
    instance = fake3d(canvasEl.value);
    instance.setTexture(img, depthImg);
  });
</script>

<style lang="scss" scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4vh;
  }

  .canvas-wrapper {
    width: 800px;
    height: 400px;
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

<template>
  <div>
    <div
      class="canvas-wrapper"
      :style="`width:${width}px;height:${height}px;`"
      @mousemove="onMouseMove"
    >
      <canvas id="RasterCanvas"></canvas>
      <canvas id="GratingPlateCanvas" :style="`left:${offsetX}px;`"></canvas>
    </div>
  </div>
</template>

<script lang="js" setup>
  import { onMounted, ref } from 'vue';
  import imgAPath from './img/3.png';
  import imgBPath from './img/4.png';

  const space = 2;
  const width = ref(800);
  const height = ref(600);
  const offsetX = ref(0);


  onMounted(() => {
    initImg()
  })

  /** 初始化合成图片 */
  function initImg() {
    const canvas = document.getElementById('RasterCanvas');
    const ctx = canvas.getContext('2d');

    const imgA = new Image();
    const imgB = new Image();
    imgA.src = imgAPath;
    imgB.src = imgBPath;

    Promise.all([
      new Promise((resolve) => { imgA.onload = resolve; }),
      new Promise((resolve) => { imgB.onload = resolve; }),
    ]).then(() => {
      width.value = imgA.width;
      height.value = imgA.height;
      canvas.width =  imgA.width;
      canvas.height = imgA.height;
      drawRasterEffect();
      initgratingPlate(canvas.width, canvas.height)
    });

    function drawRasterEffect() {
      for (let x = 0; x < canvas.width; x += space) {
        const img = (x / space) % 2 === 0 ? imgA : imgB;
        ctx.drawImage(
          img,
          x, 0, space, canvas.height,
          x, 0, space, canvas.height
        );
      }
    }
  }

  /** 初始化光栅卡 */
  function initgratingPlate() {
    const canvas = document.getElementById('GratingPlateCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width.value;
    canvas.height = height.value;
    ctx.fillStyle = "#000";
    for (let x = 0; x < canvas.width; x += space) {
      if ((x / space) % 2 === 0) {
        ctx.fillRect(x, 0, space, canvas.height)
      }
    }
  }

  const onMouseMove = (e) => {
    const r = e.offsetX / width.value;
    offsetX.value = r * space * 4 // e.offsetX - width.value / 2;
    console.log(r * space)

  }
</script>

<style lang="scss" scoped>
  // #rasterCanvas {
  //   width: 800px;
  //   height: 600px;
  // }

  .canvas-wrapper {
    position: relative;
    overflow: hidden;

    #GratingPlateCanvas {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }
  }
</style>

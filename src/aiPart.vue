<template>
  <div>
    <div class="header">
      <img-uploader :url="imgUrl" @upload="onUpload"></img-uploader>
      <div class="log-box">
        <div v-for="(log, i) in logList" :key="i">
          {{ log[0] }}...
          <span style="color: #00bcd4; font-size: 12px">{{ log[1] }}ms</span>
        </div>
      </div>
      <img :src="depthImgUrl" class="depth-img" />
    </div>

    <fake3d-card :img="imgUrl" :depth-img="depthImgUrl">
      <div v-if="isLoading" class="loading">深度图生成中...</div>
    </fake3d-card>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import Fake3dCard from './components/fake3d-card.vue';
  import ImgUploader from './components/img-uploader.vue';
  import { pipeline, env } from '@huggingface/transformers';

  // import * as ort from 'onnxruntime-web/wasm';
  // import depthModelOnnx from './models/depth_model_uint8.onnx';

  // ort.env.wasm.wasmPaths = '/node_modules/onnxruntime-web/dist/';

  env.localModelPath = '/fake3d/src/';
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.backends.onnx.wasm.wasmPaths = '/fake3d/node_modules/@huggingface/transformers/dist/';

  const imgUrl = ref('');
  const depthImgUrl = ref('');

  const logList = ref<any>([]);
  const isLoading = ref(false);

  // 强制使用gpu
  // https://www.bilibili.com/opus/541307102119871750
  // chrome://flags/#ignore-gpu-blocklist

  onMounted(async () => {
    // pixel_values float32[batch_size,3,height,width]
    // predicted_depth float32[floor(1.0*batch_size),14*floor(height/14),14*floor(width/14)]
    // depthModule = await ort.InferenceSession.create(depthModelOnnx, {
    //   executionProviders: ['wasm'],
    //   graphOptimizationLevel: 'all', // 启用图优化
    //   // enableProfiling: true,
    // });
  });

  const onUpload = async (fileUrl: string, file: File) => {
    let t = +new Date();
    imgUrl.value = fileUrl;
    isLoading.value = true;
    const depth_estimator = await pipeline('depth-estimation', 'models', {
      model_file_name: 'model',
      dtype: 'uint8',
      device: 'auto',
    });

    logList.value = [];
    logList.value.push(['加载模型...', +new Date() - t]);
    t = +new Date();

    const { depth } = await depth_estimator(fileUrl);

    logList.value.push(['计算深度...', +new Date() - t]);
    t = +new Date();

    const width = depth.width;
    const height = depth.height;
    const output = depth.data;

    const normalizedData = new Uint8ClampedArray(height * width * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const rgbaIndex = index * 4;
        normalizedData[rgbaIndex] = output[index];
        normalizedData[rgbaIndex + 1] = output[index];
        normalizedData[rgbaIndex + 2] = output[index];
        normalizedData[rgbaIndex + 3] = 255;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(normalizedData, width, height);
    ctx!.putImageData(imageData, 0, 0, 0, 0, width, height);
    const url = canvas.toDataURL();
    depthImgUrl.value = url;
    // document.body.appendChild(canvas);
    logList.value.push(['输出处理...', +new Date() - t]);
    console.log(depth);
    isLoading.value = false;

    // depth.save('depth.png');
  };
</script>

<style lang="scss" scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9;
    display: flex;
    padding: 12px;

    .depth-img {
      height: 60px;
    }
  }

  .log-box {
    margin-right: 8px;
    margin-left: 8px;
    padding: 4px 8px;
    font-size: 14px;
    background-color: #13131345;
    border-radius: 4px;
  }

  .loading {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: #9e9e9e52;
    border-radius: 12px;
    inset: 0;
    pointer-events: none;
  }
</style>

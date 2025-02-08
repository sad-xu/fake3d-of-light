<template>
  <div>
    <!-- <button @click="flag = !flag">click</button> -->
    <ai-part v-if="flag"></ai-part>
    <depth-part v-else></depth-part>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import AiPart from './aiPart.vue';
  import depthPart from './depthPart.vue';

  const flag = ref(true);
</script>

<style lang="scss" scoped>
  .wrapper {
  }
</style>

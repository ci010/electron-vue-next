<template >
  <div class="app">
    <navigator />
    <router-view> </router-view>
  </div>
</template>

<script lang=ts>
import { defineComponent } from 'vue'
import directive from '/@/directives/sample'
import Navigator from '/@/components/HomeNavigator.vue'

export default defineComponent({
  components: {
    Navigator
  },
  directives: {
    directive
  }
})
</script>

<style>
</style>

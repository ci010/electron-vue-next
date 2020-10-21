<template>
  <div> count: {{ count }} </div>
  <div class="rounded" @click="increment"> increment </div>
</template>

<script lang=ts>
import { defineComponent } from 'vue'
import { useCount } from '../hooks'

export default defineComponent({
  setup() {
    return useCount()
  }
})
</script>

<style>

</style>

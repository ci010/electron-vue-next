<template>
  <div style="margin: 10px">
    <span class="card clickable" @click="one++">{{ one }}</span>
    +
    <span class="card clickable" @click="two++">{{ two }}</span>
    =
    <span class="card clickable" @click="one = 0; two = 0">{{ sum }}</span>
  </div>
</template>

<script lang=ts>
import { defineComponent, ref } from 'vue'
import { useSum } from '../composables'

export default defineComponent({
  setup() {
    const one = ref(0)
    const two = ref(0)
    const sum = useSum(one, two)
    return {
      one,
      two,
      sum
    }
  }
})
</script>

<style>
</style>

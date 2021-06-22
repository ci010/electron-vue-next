<template>
  <div class="container">
    <div class="card" >
      <h2>Electron Clipboard API</h2>
      <p>{{ contentToCopy }}</p>
      <div class="card clickable" @click="copyToClipboard">Click To Copy</div>
    </div>
    <div class="card" >
      <h2>Electron Shell & Dialog API</h2>
      <p v-if="filePath"> {{ filePath }} </p>
      <p v-else style="color: grey"> File path will display here! </p>
      <div class="flex">
        <div class="card clickable" @click="pickItem">Click To Pick File</div>
        <div class="card clickable" @click="showItem">Click To Show File in Directory</div>
      </div>
    </div>
    <div class="card">
      <h2>Vue reactivity</h2>
      <p>Click below button to checkout vue reactivity</p>
      <sum-equation />
    </div>
    <div class="card" >
      <h2>Vuex Store</h2>
      <p> count: {{ count }} </p>
      <div class="flex">
        <div class="card clickable" @click="increment">Click To Increment by Commit</div>
      </div>
    </div>
  </div>
</template>

<script lang=ts>
import { defineComponent, reactive, toRefs } from 'vue'
import { useClipboard, useShell, useDialog, useCount } from '../composables'
import SumEquation from './SumEquation.vue'

export default defineComponent({
  components: {
    SumEquation
  },
  setup(props, context) {
    const data = reactive({
      contentToCopy: 'hello, you will copy/paste this piece of text!',
      filePath: ''
    })
    const { showItemInFolder } = useShell()
    const { write } = useClipboard()
    const { showOpenDialog } = useDialog()
    const name = 'abc'
    function copyToClipboard() {
      write({ text: data.contentToCopy })
    }
    async function pickItem() {
      const { filePaths } = await showOpenDialog({
        title: 'Pick the file to show',
        properties: ['openFile']
      })
      data.filePath = filePaths[0] ?? ''
    }
    function showItem() {
      showItemInFolder(data.filePath)
    }
    return {
      ...toRefs(data),
      ...useCount(),
      name,
      copyToClipboard,
      showItem,
      pickItem
    }
  }
})
</script>

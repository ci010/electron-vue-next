import { computed, defineComponent, h, mergeProps, onMounted, ref } from 'vue'

const AComponent = defineComponent({
  setup () {
    return () => h('div', { class: 'a' }, 'good')
  }
})

export default defineComponent({
  setup (props, context) {
    const el = ref(null)
    onMounted(() => {
      console.log(el.value)
    })
    const clicked = ref(false)
    const fontSize = computed(() => clicked.value ? '100px' : '50px')
    console.log(context.attrs)
    return () => h(AComponent, mergeProps({
      ref: el,
      style: {
        'font-size': fontSize.value
      },
      class: 'b',
      onClick () {
        clicked.value = !clicked.value
      }
    }, { class: 'c' }, context.attrs), ['a'])
  }
})

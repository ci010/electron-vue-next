import { ObjectDirective } from 'vue'

const directive: ObjectDirective = {
  mounted(el, binding, vNode) {
    console.log('directive!')
    console.log(el)
    console.log(binding)
    console.log(vNode)
  }
}

export default directive

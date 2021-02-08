import { useIpc } from './electron'
import type { Services } from '/@main/services'

const { invoke } = useIpc()

function createProxy(service: string) {
  return new Proxy({} as any, {
    get(_, functionName) {
      return (...payloads: any[]) => {
        return invoke('service:call', service, functionName as string, ...payloads)
      }
    }
  })
}
const servicesProxy: Services = new Proxy({} as any, {
  get(_, serviceName) { return createProxy(serviceName as string) }
})

export function useService<T extends keyof Services>(name: T): Services[T] {
  return servicesProxy[name]
}

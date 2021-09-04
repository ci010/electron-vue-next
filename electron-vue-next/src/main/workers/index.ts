import { parentPort, workerData } from 'worker_threads'
import { add } from '/@shared/sharedLib'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', () => {
  port.postMessage(`hello ${workerData} add ${add(1, 2)}`)
})

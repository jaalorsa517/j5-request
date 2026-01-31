import { parentPort } from 'node:worker_threads';

console.log('Worker iniciado');

if (parentPort) {
    parentPort.on('message', (message) => {
        console.log('Mensaje recibido en worker:', message);
        parentPort?.postMessage({ type: 'pong', original: message });
    });
}

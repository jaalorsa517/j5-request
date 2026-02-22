import { mergeSSLConfigs } from './src/main/services/ProjectConfigService.js';
const projectSSL = { ca: ['.j5certs/ca.crt'] };
const requestSSL = { rejectUnauthorized: true };
console.log(mergeSSLConfigs(projectSSL, requestSSL));

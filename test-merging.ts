import { mergeSSLConfigs } from './src/main/services/ProjectConfigService';
console.log(mergeSSLConfigs({ ca: ['.j5certs/ca.crt'], rejectUnauthorized: true }, { rejectUnauthorized: true }));

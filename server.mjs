import http from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {AIError,assess} from './ai-core.mjs';

const DEFAULT_WEB_DIR=fileURLToPath(new URL('./www/',import.meta.url));
const ASSETS=new Map([
  ['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/content.js','content.js'],['/self-guidance.js','self-guidance.js'],['/app.js','app.js'],['/ai-ui.js','ai-ui.js'],['/guided.js','guided.js'],['/quick.js','quick.js'],['/runtime-config.js','runtime-config.js'],['/sw.js','sw.js'],['/manifest.webmanifest','manifest.webmanifest'],['/icon.svg','icon.svg'],['/icon-192.png','icon-192.png'],['/icon-512.png','icon-512.png']
]);
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
const PUBLIC_METHODS = new Map([['/api/status', 'GET'], ['/api/assess', 'POST']]);

function json(res,status,value) {res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
function error(res,status,code,message) {json(res,status,{error:{code,message}});}
function safeHost(header) {
  if(typeof header!=='string'||!/^127\.0\.0\.1(?::\d{1,5})?$/.test(header)) return false;
  const port=header.split(':')[1];return !port||(Number(port)>0&&Number(port)<=65535);
}

function httpsOrigin(value, name) {
  if (typeof value === 'string' && URL.canParse(value)) {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.origin === value) return url;
  }
  throw new Error(`${name} must be an exact HTTPS origin without a path or trailing slash.`);
}

function configurePublicAccess(origin, apiOrigin, token, bindHost) {
  if (bindHost !== '127.0.0.1' && bindHost !== '0.0.0.0') {
    throw new Error('BIND_HOST must be 127.0.0.1 or 0.0.0.0.');
  }
  if (origin === undefined && apiOrigin === undefined && token === undefined) {
    if (bindHost === '0.0.0.0') {
      throw new Error('BIND_HOST=0.0.0.0 requires the public origin, API origin and access token.');
    }
    return null;
  }
  const frontend = httpsOrigin(origin, 'PUBLIC_ORIGIN');
  const api = httpsOrigin(apiOrigin, 'PUBLIC_API_ORIGIN');
  if (typeof token !== 'string' || token.length < 32 || token.length > 256 || /[^A-Za-z0-9_-]/.test(token)) {
    throw new Error('PUBLIC_ACCESS_TOKEN must contain 32 to 256 letters, digits, hyphens or underscores.');
  }
  return {origin: frontend.origin, host: api.host, authorization: Buffer.from(`Bearer ${token}`)};
}

function authorizePublicRequest(req, res, publicAccess) {
  const method = PUBLIC_METHODS.get(req.url);
  if (!method) {
    error(res, 404, 'not_found', 'This service is not available.');
    return false;
  }
  if (req.method === 'OPTIONS') {
    const allowedHeaders = method === 'POST' ? ['authorization', 'content-type'] : ['authorization'];
    const requestedHeaders = (req.headers['access-control-request-headers'] || '').toLowerCase().split(',')
      .map(header => header.trim()).filter(Boolean);
    if (req.headers['access-control-request-method'] !== method || requestedHeaders.some(header => !allowedHeaders.includes(header))) {
      error(res, 403, 'origin_not_allowed', 'This request is not allowed for the hosted Common Ground app.');
      return false;
    }
    res.writeHead(204, {
      'Access-Control-Allow-Origin': publicAccess.origin,
      'Access-Control-Allow-Methods': method,
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
      'Cache-Control': 'no-store'
    });
    res.end();
    return false;
  }
  if (req.method !== method) {
    error(res, 405, 'method_not_allowed', `Use ${method} for this service.`);
    return false;
  }
  res.setHeader('Access-Control-Allow-Origin', publicAccess.origin);
  res.setHeader('Vary', 'Origin');
  const authorization = Buffer.from(req.headers.authorization || '');
  if (authorization.length !== publicAccess.authorization.length || !timingSafeEqual(authorization, publicAccess.authorization)) {
    res.setHeader('WWW-Authenticate', 'Bearer');
    error(res, 401, 'access_required', 'Enter the access code for this private preview.');
    return false;
  }
  return true;
}

function readJson(req,limit=48*1024) {
  return new Promise((resolve,reject)=>{
    const chunks=[];let length=0;let failed=false;
    req.on('data',chunk=>{if(failed)return;length+=chunk.length;if(length>limit){failed=true;reject(new AIError('request_too_large','This reflection is too long to send. Shorten it and try again.',413));return;}chunks.push(chunk);});
    req.on('end',()=>{if(failed)return;try {resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));} catch {reject(new AIError('invalid_json','The reflection could not be read. Please try again.',400));}});
    req.on('error',()=>reject(new AIError('request_interrupted','The request was interrupted. Please try again.',400)));
    req.on('aborted',()=>reject(new AIError('request_interrupted','The request was interrupted. Please try again.',400)));
  });
}

export function createAppServer({
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL || 'gpt-6-astra',
  fetchImpl = globalThis.fetch,
  webDir = DEFAULT_WEB_DIR,
  timeoutMs = 60000,
  rateLimit = 8,
  rateWindowMs = 60000,
  publicOrigin = process.env.PUBLIC_ORIGIN,
  publicApiOrigin = process.env.PUBLIC_API_ORIGIN,
  publicAccessToken = process.env.PUBLIC_ACCESS_TOKEN,
  bindHost = process.env.BIND_HOST ?? '127.0.0.1'
} = {}) {
  const publicAccess = configurePublicAccess(publicOrigin, publicApiOrigin, publicAccessToken, bindHost);
  const requests=[];
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy','same-origin');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
    res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    if (publicAccess) {
      if (req.headers.host !== publicAccess.host) {
        error(res, 403, 'host_not_allowed', 'Use the configured HTTPS address for this service.');
        return;
      }
      if (req.headers.origin !== publicAccess.origin) {
        error(res, 403, 'origin_not_allowed', 'This request must come from the configured Common Ground preview.');
        return;
      }
      if (!authorizePublicRequest(req, res, publicAccess)) return;
    } else {
      if(!safeHost(req.headers.host)){error(res,403,'host_not_allowed','This app is available only through its local address.');return;}
      const origin=req.headers.origin;
      if(origin!==undefined&&origin!==`http://${req.headers.host}`){error(res,403,'origin_not_allowed','This request must come from the local Common Ground app.');return;}
      if(req.headers['sec-fetch-site']==='cross-site'){error(res,403,'origin_not_allowed','This request must come from the local Common Ground app.');return;}
    }
    const rawPath=(req.url||'/').split('?')[0];
    let url;
    try {url=new URL(req.url,`http://${req.headers.host}`);} catch {error(res,400,'invalid_url','This address could not be read.');return;}
    if(rawPath.includes('..')||/%2e|%2f|%5c/i.test(rawPath)||rawPath.includes('\\')){error(res,404,'not_found','This page is not available.');return;}
    if(url.pathname==='/api/status') {
      if(req.method!=='GET'){error(res,405,'method_not_allowed','Use GET for connection status.');return;}
      const configured=typeof apiKey==='string'&&Boolean(apiKey.trim());json(res,200,{configured,provider:'OpenAI',...(configured?{model}:{})});return;
    }
    if(url.pathname==='/api/assess') {
      if(req.method!=='POST'){error(res,405,'method_not_allowed','Use POST to request guidance.');return;}
      if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')){error(res,415,'content_type_required','Send the reflection as JSON.');return;}
      const declaredLength=req.headers['content-length'];
      if(declaredLength&&Number(declaredLength)>48*1024){req.resume();error(res,413,'request_too_large','This reflection is too long to send. Shorten it and try again.');return;}
      const now=Date.now();while(requests.length&&requests[0]<=now-rateWindowMs)requests.shift();
      if(requests.length>=rateLimit){req.resume();res.setHeader('Retry-After',String(Math.ceil(rateWindowMs/1000)));error(res,429,'rate_limited','Please pause a moment before requesting more guidance.');return;}
      requests.push(now);
      try {const payload=await readJson(req);const assessment=await assess(payload,{apiKey,model,fetchImpl,timeoutMs});json(res,200,{assessment});}
      catch(err) {if(res.destroyed)return;if(err instanceof AIError)error(res,err.status,err.code,err.message);else error(res,500,'server_error','The request could not be completed. Please try again.');}
      return;
    }
    if(url.pathname.startsWith('/api/')){error(res,404,'not_found','This service is not available.');return;}
    if(req.method!=='GET'&&req.method!=='HEAD'){error(res,405,'method_not_allowed','This page supports GET requests.');return;}
    const filename=ASSETS.get(url.pathname);
    if(!filename){error(res,404,'not_found','This page is not available.');return;}
    try {
      const data=await readFile(path.join(webDir,filename));
      res.writeHead(200,{'Content-Type':TYPES[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
      res.end(req.method==='HEAD'?undefined:data);
    } catch {error(res,404,'not_found','This page is not available.');}
  });
}

if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  const requested=process.env.PORT||'4191';
  const bindHost = process.env.BIND_HOST ?? '127.0.0.1';
  if(!/^\d+$/.test(requested)||Number(requested)<1||Number(requested)>65535){console.error('Choose a valid local PORT from 1 to 65535.');process.exitCode=1;}
  else {
    try {
      const server = createAppServer({bindHost});
      server.requestTimeout = 75000;
      server.headersTimeout = 15000;
      server.on('error', () => {
        console.error('Common Ground could not start. Check the listening address and port.');
        process.exitCode = 1;
      });
      server.listen(Number(requested), bindHost, () => {
        console.log(process.env.PUBLIC_ORIGIN
          ? 'Common Ground AI is listening for requests from its HTTPS proxy.'
          : `Common Ground is ready at http://127.0.0.1:${requested}`);
      });
    } catch (err) {
      console.error(err.message);
      process.exitCode = 1;
    }
  }
}

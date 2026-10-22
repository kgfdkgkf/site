const list = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } });
const sleep = ms => new Promise(r => setTimeout(r, ms));
await new Promise(r => ws.addEventListener('open', r));
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:5500/?v=220' }); await sleep(1600);
const r = await send('Runtime.evaluate', { expression: `(async()=>{
  const c=document.querySelector('.hero-card'); const hs=[];
  const dots=document.querySelectorAll('.hero-dots button');
  for(let i=0;i<5;i++){ dots[i].click(); await new Promise(r=>setTimeout(r,700)); hs.push(Math.round(c.getBoundingClientRect().height)+'/'+Math.round(document.body.scrollHeight)); }
  return hs.join(' ');
})()`, awaitPromise: true, returnByValue: true });
console.log(r.result.value);
ws.close();


const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=n=>n==null||n===''?'—':Number(n).toLocaleString('en-US')+' EGP';
const WA_SVG='<svg viewBox="0 0 32 32" width="15" height="15"><path fill="#25D366" d="M16.001 3C9.383 3 4 8.383 4 15c0 2.386.703 4.605 1.918 6.464L4 29l7.75-1.868A11.94 11.94 0 0016 27c6.617 0 12-5.383 12-12S22.618 3 16.001 3zm.001 21.818c-1.94 0-3.76-.51-5.34-1.4l-.383-.219-4.598 1.107 1.127-4.482-.245-.397A9.77 9.77 0 015.818 15c0-5.615 4.567-10.182 10.183-10.182 5.615 0 10.182 4.567 10.182 10.182s-4.567 10.182-10.182 10.182zm5.579-7.62c-.306-.153-1.809-.892-2.089-.994-.28-.102-.484-.153-.688.153-.204.306-.789.994-.967 1.198-.178.204-.357.229-.663.076-.306-.153-1.293-.477-2.463-1.522-.911-.812-1.527-1.815-1.705-2.121-.178-.306-.019-.472.134-.624.138-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.382-.026-.535-.076-.153-.688-1.658-.943-2.27-.248-.596-.5-.516-.688-.526l-.586-.01c-.204 0-.535.076-.815.382-.28.306-1.068 1.044-1.068 2.546 0 1.502 1.093 2.955 1.245 3.159.153.204 2.15 3.283 5.209 4.603.728.314 1.296.502 1.739.642.731.232 1.396.199 1.922.121.586-.087 1.809-.74 2.064-1.454.255-.714.255-1.325.178-1.454-.076-.128-.28-.204-.586-.357z"/></svg>';
function waHref(phone){let d=String(phone||'').replace(/[٠-٩]/g,x=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(x))).replace(/\D/g,'');if(!d)return'';if(d.startsWith('0'))d='2'+d;else if(!d.startsWith('20'))d='20'+d;return'https://wa.me/'+d}
function waBtn(phone){return phone?` <a class="wa-btn" href="${waHref(phone)}" target="_blank" rel="noopener" title="مراسلة واتساب">${WA_SVG}</a>`:''}
const KEY='dream_house_static_v1', AUTH='dream_house_auth_v1';
let props=[],clients=[];
let selectedPropertyIds=new Set();
const EMPTY_DB=()=>({properties:[],clients:[],seq:1});
function db(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return EMPTY_DB();
    const d=JSON.parse(raw);
    return {
      properties:Array.isArray(d.properties)?d.properties:[],
      clients:Array.isArray(d.clients)?d.clients:[],
      seq:Number(d.seq)||1
    };
  }catch{return EMPTY_DB();}
}
function saveDB(d){
  try{localStorage.setItem(KEY,JSON.stringify(d));return true}
  catch(err){toast('مساحة التخزين ممتلئة. احذف صورًا قديمة أو استخدم النسخة الاحتياطية.');return false}
}
function showLogin(){$('#app').classList.add('hidden');$('#login').classList.remove('hidden')}
function showApp(){$('#login').classList.add('hidden');$('#app').classList.remove('hidden');loadAll()}
function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),2400)}
function auth(){return sessionStorage.getItem(AUTH)==='1'}
function boot(){if(auth()){showApp()}else showLogin()}
boot();
const togglePassword=$('#togglePassword');
if(togglePassword) togglePassword.onclick=()=>{const p=$('#password');const show=p.type==='password';p.type=show?'text':'password';togglePassword.textContent=show?'◌':'◉';};
$('#loginForm').onsubmit=e=>{e.preventDefault();$('#loginError').textContent='';const btn=document.querySelector('.login-submit');if(btn){btn.disabled=true;btn.classList.add('is-loading');setTimeout(()=>btn.classList.remove('is-loading'),500)}if($('#username').value.trim()==='admin'&&$('#password').value==='112203'){sessionStorage.setItem(AUTH,'1');$('#who').textContent='Engineer Ahmed Galal';showApp()}else{if(btn)btn.disabled=false;$('#loginError').textContent='Incorrect username or password'}};
$('#logout').onclick=()=>{sessionStorage.removeItem(AUTH);showLogin()};
const titles={dashboard:'لوحة المكتب',properties:'إدارة العقارات',clients:'إدارة العملاء',reports:'البيانات و PDF'};
$$('.nav button').forEach(b=>b.onclick=()=>{$$('.section').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.page).classList.add('active');$$('.nav button').forEach(x=>x.classList.toggle('active',x===b));$('#pageTitle').textContent=titles[b.dataset.page];if(b.dataset.page==='dashboard')renderDash();if(b.dataset.page==='properties')loadProps();if(b.dataset.page==='clients')loadClients()});
function loadAll(){renderDash();loadProps();loadClients()}
function renderDash(){const d=db();props=d.properties;clients=d.clients;$('#sp').textContent=props.length;$('#sa').textContent=props.filter(x=>x.status==='متاح').length;$('#sc').textContent=clients.length;$('#sf').textContent=clients.filter(x=>x.status==='متابعة').length;$('#dashProps').innerHTML=props.slice(-6).reverse().map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.area)}</td><td>${x.size||'—'} م²</td><td>${money(x.price)}</td><td><span class="badge ${x.status!=='متاح'?'red':''}">${esc(x.status)}</span></td></tr>`).join('')||'<tr><td colspan="5">لا توجد بيانات</td></tr>';$('#dashClients').innerHTML=clients.slice(-6).reverse().map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.phone)}</td><td>${esc(x.need||'—')}</td></tr>`).join('')||'<tr><td colspan="3">لا توجد بيانات</td></tr>'}
let timer;function scheduleProps(){clearTimeout(timer);timer=setTimeout(loadProps,120)}['q','area','minPrice','maxPrice','minSize','maxSize','rooms','status'].forEach(id=>{const e=$('#'+id);if(e)e.addEventListener(e.tagName==='SELECT'?'change':'input',scheduleProps)});
function quickArea(v){$('#area').value=v;loadProps()}function quickPrice(v){$('#maxPrice').value=v;loadProps()}function clearFilters(){['q','area','minPrice','maxPrice','minSize','maxSize','rooms','status'].forEach(id=>$('#'+id).value='');loadProps()}
function updateSelectedCount(){const el=$('#selectedCount');if(el)el.textContent=`${selectedPropertyIds.size} عقار محدد`;}
function togglePropertySelection(id){id=Number(id);if(selectedPropertyIds.has(id))selectedPropertyIds.delete(id);else selectedPropertyIds.add(id);loadProps();}
function clearPropertySelection(){selectedPropertyIds.clear();loadProps();toast('تم إلغاء اختيار العقارات');}
function selectVisibleProperties(){props.forEach(x=>selectedPropertyIds.add(Number(x.id)));loadProps();toast(`تم اختيار ${props.length} عقار`);}
function reportSelectedProperties(mode='pdf'){if(!selectedPropertyIds.size){toast('اختار عقارًا واحدًا على الأقل أولاً');return}report('properties',mode,Array.from(selectedPropertyIds));}
function loadProps(){const d=db();let p=d.properties;const q=$('#q').value.trim().toLowerCase(),area=$('#area').value.trim().toLowerCase(),minP=Number($('#minPrice').value)||0,maxP=Number($('#maxPrice').value)||Infinity,minS=Number($('#minSize').value)||0,maxS=Number($('#maxSize').value)||Infinity,rooms=Number($('#rooms').value)||0,status=$('#status').value;p=p.filter(x=>(!q||[x.name,x.code,x.area,x.type,x.notes].join(' ').toLowerCase().includes(q))&&(!area||String(x.area).toLowerCase().includes(area))&&Number(x.price||0)>=minP&&Number(x.price||0)<=maxP&&Number(x.size||0)>=minS&&Number(x.size||0)<=maxS&&(!rooms||Number(x.rooms||0)===rooms)&&(!status||x.status===status));props=p;$('#propertyGrid').innerHTML=p.map(x=>`<article class="card property selectable ${selectedPropertyIds.has(Number(x.id))?'selected':''}"><button type="button" class="property-select" onclick="event.stopPropagation();togglePropertySelection(${x.id})" title="اختيار للتقرير"><svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5"/></svg></button>${x.image_url?`<img src="${x.image_url}" alt="${esc(x.name)}">`:'<div class="ph">DREAM HOUSE</div>'}<div class="body"><div class="code">${esc(x.code||'PROPERTY')}</div><h4>${esc(x.name)}</h4><div class="muted">${esc(x.area)} • ${x.size||'—'} م² • الدور ${esc(x.floor||'—')}</div><div class="muted">${x.rooms||'—'} غرف • ${x.baths||'—'} حمام • ${esc(x.finish||'—')}</div><div class="price">${money(x.price)}</div><span class="badge ${x.status!=='متاح'?'red':''}">${esc(x.status)}</span><div class="actions"><button class="btn dark" onclick="event.stopPropagation();editProperty(${x.id})">تعديل</button><button class="btn danger" onclick="event.stopPropagation();deleteProperty(${x.id})">حذف</button></div></div></article>`).join('')||'<div class="panel empty" style="grid-column:1/-1">لا توجد عقارات مطابقة للبحث</div>';updateSelectedCount();}
$('#cq').addEventListener('input',loadClients);function loadClients(){const q=$('#cq').value.trim().toLowerCase();clients=db().clients.filter(x=>[x.name,x.phone,x.area,x.need].join(' ').toLowerCase().includes(q));$('#clientBody').innerHTML=clients.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td><div class="phone-cell">${esc(x.phone)}${waBtn(x.phone)}</div></td><td>${esc(x.need||'—')}</td><td>${esc(x.area||'—')}</td><td>${money(x.budget)}</td><td><span class="badge gold">${esc(x.status)}</span></td><td><button class="btn soft" onclick="matchClient(${x.id})">مطابقة</button> <button class="btn dark" onclick="editClient(${x.id})">تعديل</button> <button class="btn danger" onclick="deleteClient(${x.id})">حذف</button></td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center">لا توجد بيانات</td></tr>';const cm=$('#clientCards');if(cm)cm.innerHTML=clients.map(x=>`<article class="client-mobile-card"><div class="client-mobile-top"><div><div class="client-mobile-name">${esc(x.name)}</div><div class="client-mobile-phone">${esc(x.phone||'—')}</div></div><span class="badge gold">${esc(x.status||'جديد')}</span></div><div class="client-mobile-grid"><div><span>الطلب</span><b>${esc(x.need||'—')}</b></div><div><span>المنطقة</span><b>${esc(x.area||'—')}</b></div><div><span>الميزانية</span><b>${money(x.budget)}</b></div></div><div class="client-mobile-actions">${x.phone?`<a class="wa-mobile" href="${waHref(x.phone)}" target="_blank" rel="noopener">${WA_SVG} واتساب</a>`:''}<button class="btn dark" onclick="matchClient(${x.id})">مطابقة عقار</button><button class="btn soft" onclick="editClient(${x.id})">تعديل</button><button class="btn danger" onclick="deleteClient(${x.id})">حذف</button></div></article>`).join('')||'<div class="empty">لا توجد بيانات عملاء</div>'}
function openProperty(x=null){$('#pmTitle').textContent=x?'تعديل العقار':'إضافة عقار';$('#pf').reset();$('#pf [name=id]').value=x?.id||'';if(x)Object.keys(x).forEach(k=>{const e=$(`#pf [name="${k}"]`);if(e&&k!=='image_url')e.value=x[k]??''});$('#propertyModal').classList.add('show')}
function openClient(x=null){$('#cmTitle').textContent=x?'تعديل العميل':'إضافة عميل';$('#cf').reset();$('#cf [name=id]').value=x?.id||'';if(x)Object.keys(x).forEach(k=>{const e=$(`#cf [name="${k}"]`);if(e)e.value=x[k]??''});$('#clientModal').classList.add('show')}
function closeModal(id){$('#'+id).classList.remove('show')}
function editProperty(id){const x=db().properties.find(p=>p.id===id);if(x)openProperty(x)}function editClient(id){const x=db().clients.find(p=>p.id===id);if(x)openClient(x)}
function readImage(file){
  return new Promise((resolve,reject)=>{
    if(!file||!file.size)return resolve('');
    if(file.size>12*1024*1024)return reject(new Error('الصورة كبيرة جدًا — اختار صورة أقل من 12MB'));
    const r=new FileReader();
    r.onerror=()=>reject(new Error('تعذر قراءة الصورة'));
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=1400, scale=Math.min(1,max/Math.max(img.width,img.height));
        const c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(img.width*scale));
        c.height=Math.max(1,Math.round(img.height*scale));
        const ctx=c.getContext('2d',{alpha:false});
        ctx.drawImage(img,0,0,c.width,c.height);
        const out=c.toDataURL('image/jpeg',0.78);
        resolve(out);
      };
      img.onerror=()=>reject(new Error('الصورة غير صالحة'));
      img.src=r.result;
    };
    r.readAsDataURL(file);
  });
}
$('#pf').onsubmit=async e=>{e.preventDefault();try{const f=e.target,fd=new FormData(f),d=db(),id=fd.get('id');let image='';const file=f.querySelector('[name=image]').files[0];if(file)image=await readImage(file);let x=Object.fromEntries(fd.entries());delete x.id;delete x.image;x.size=Number(x.size)||0;x.price=Number(x.price)||0;x.rooms=Number(x.rooms)||0;x.baths=Number(x.baths)||0;if(image)x.image_url=image;let item;if(id){const i=d.properties.findIndex(p=>p.id===Number(id));item={...d.properties[i],...x};d.properties[i]=item}else{item={...x,id:Date.now(),code:x.code||'DH-'+String(d.seq++).padStart(4,'0'),createdAt:new Date().toISOString()};d.properties.push(item)}if(!saveDB(d))return;closeModal('propertyModal');toast('تم حفظ العقار بنجاح');loadAll()}catch(err){toast(err.message)}};
$('#cf').onsubmit=e=>{e.preventDefault();const f=e.target,d=db(),id=f.id.value,x=Object.fromEntries(new FormData(f).entries());delete x.id;x.budget=Number(x.budget)||0;x.min_size=Number(x.min_size)||0;x.max_size=Number(x.max_size)||0;x.rooms=Number(x.rooms)||0;if(id){const i=d.clients.findIndex(p=>p.id===Number(id));d.clients[i]={...d.clients[i],...x}}else d.clients.push({...x,id:Date.now(),createdAt:new Date().toISOString()});if(!saveDB(d))return;closeModal('clientModal');toast('تم حفظ العميل بنجاح');loadAll()};
function deleteProperty(id){if(!confirm('حذف هذا العقار نهائياً؟'))return;selectedPropertyIds.delete(Number(id));const d=db();d.properties=d.properties.filter(x=>x.id!==id);if(!saveDB(d))return;toast('تم حذف العقار');loadAll()}
function deleteClient(id){if(!confirm('حذف هذا العميل نهائياً؟'))return;const d=db();d.clients=d.clients.filter(x=>x.id!==id);if(!saveDB(d))return;toast('تم حذف العميل');loadAll()}
function matchClient(id){const c=db().clients.find(x=>x.id===id);if(!c)return;$$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='properties'));$$('.section').forEach(x=>x.classList.remove('active'));$('#properties').classList.add('active');$('#pageTitle').textContent='العقارات المطابقة';$('#area').value=c.area||'';$('#maxPrice').value=c.budget||'';$('#minSize').value=c.min_size||'';$('#maxSize').value=c.max_size||'';$('#rooms').value=c.rooms||'';loadProps();toast('تم تطبيق شروط العميل على البحث')}
async function report(type, mode='pdf', selectedIds=null){
  const d=db(), allProperties=Array.isArray(d.properties)?d.properties:[], clients=Array.isArray(d.clients)?d.clients:[], now=new Date();
  const selectedSet=Array.isArray(selectedIds)?new Set(selectedIds.map(Number)):null;
  const properties=selectedSet?allProperties.filter(p=>selectedSet.has(Number(p.id))):allProperties;
  if(type==='properties'&&!properties.length){toast('لا توجد عقارات محددة للتقرير');return}
  if(type==='clients'&&!clients.length){toast('لا توجد بيانات عملاء للتقرير');return}
  const reportNo='DH-'+now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0')+'-'+String(Date.now()).slice(-5);
  const stamp=now.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  const W=1240,H=1754,MM=58;
  const pages=[];
  const makePage=(label,sub)=>{
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const x=c.getContext('2d');x.direction='ltr';x.textBaseline='top';
    x.fillStyle='#f4f7fb';x.fillRect(0,0,W,H);
    const bg=x.createRadialGradient(180,420,10,180,420,720);bg.addColorStop(0,'rgba(111,135,255,.15)');bg.addColorStop(1,'rgba(111,135,255,0)');x.fillStyle=bg;x.fillRect(0,260,W,H-260);
    const top=x.createLinearGradient(0,0,W,0);top.addColorStop(0,'#061225');top.addColorStop(.45,'#102544');top.addColorStop(.78,'#45579d');top.addColorStop(1,'#8069d7');x.fillStyle=top;x.fillRect(0,0,W,275);
    x.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<7;i++){x.beginPath();x.arc(900+i*70,52+i*18,92+i*18,0,Math.PI*2);x.fill()}
    x.fillStyle='rgba(255,255,255,.14)';x.beginPath();x.roundRect(MM,48,62,62,18);x.fill();x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=2;x.stroke();
    x.fillStyle='#fff';x.font='900 25px Arial';x.textAlign='center';x.fillText('DH',MM+31,67);
    x.fillStyle='#fff';x.font='900 52px Arial';x.textAlign='left';x.fillText('DREAM HOUSE',MM+82,54);
    x.fillStyle='#b9c7df';x.font='600 21px Arial';x.fillText('REAL ESTATE MANAGEMENT',MM,119);
    x.fillStyle='#e8c97d';x.font='800 24px Arial';x.fillText('Engineer Ahmed Galal  •  01035032020',MM,166);
    x.fillStyle='rgba(255,255,255,.72)';x.font='600 15px Arial';x.fillText(`REPORT ${reportNo}  •  ${stamp}`,MM,215);
    x.textAlign='right';x.fillText('PRIVATE OFFICE REPORT',W-MM,215);
    x.textAlign='left';x.fillStyle='#172238';x.font='900 28px Arial';x.fillText(label,MM,312);
    x.fillStyle='#77859a';x.font='500 15px Arial';x.fillText(sub,MM,350);
    return {c,x,y:390};
  };
  const round=(ctx,x,y,w,h,r,fill,stroke)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}};
  const fit=(ctx,str,max,font)=>{ctx.font=font;let s=String(str??'—');while(s.length>3&&ctx.measureText(s).width>max)s=s.slice(0,-2)+'…';return s};
  const drawProperty=(page,p,index,total)=>{
    const {c,x:ctx}=page;const gap=22,cw=(W-MM*2-gap)/2,ch=292;const col=index%2,row=Math.floor(index/2),x=MM+col*(cw+gap),y=page.y+row*(ch+22);
    round(ctx,x,y,cw,ch,24,'#ffffff','#e2e8f1');
    round(ctx,x+18,y+18,cw-36,58,15,'#f1f4ff');
    ctx.textAlign='left';ctx.fillStyle='#6074d3';ctx.font='800 15px Arial';ctx.fillText(fit(ctx,p.code||'PROPERTY',cw-70,'800 15px Arial'),x+34,y+34);
    const statusMap={'متاح':'AVAILABLE','محجوز':'RESERVED','مباع':'SOLD'};const ps=statusMap[p.status]||p.status||'AVAILABLE';ctx.textAlign='right';ctx.fillStyle=ps==='AVAILABLE'?'#26926d':ps==='RESERVED'?'#9a731d':'#c65468';ctx.fillText(ps,x+cw-34,y+34);
    ctx.textAlign='left';ctx.fillStyle='#172238';ctx.font='900 23px Arial';ctx.fillText(fit(ctx,p.name||'Property',cw-48,'900 23px Arial'),x+24,y+99);
    ctx.fillStyle='#36529c';ctx.font='900 22px Arial';ctx.fillText(money(p.price),x+24,y+135);
    const details=[['SIZE',`${p.size||'—'} m²`],['ROOMS',p.rooms||'—'],['BATHS',p.baths||'—'],['FLOOR',p.floor||'—']];
    details.forEach((d,j)=>{const bw=(cw-62)/4,bx=x+18+j*(bw+9);round(ctx,bx,y+181,bw,58,13,'#f5f7fa');ctx.fillStyle='#8994a5';ctx.font='600 10px Arial';ctx.fillText(d[0],bx+12,y+193);ctx.fillStyle='#2d3b52';ctx.font='800 14px Arial';ctx.fillText(fit(ctx,d[1],bw-24,'800 14px Arial'),bx+12,y+213)});
    ctx.fillStyle='#6f7d91';ctx.font='600 13px Arial';ctx.fillText(fit(ctx,`${p.area||'—'}  •  ${p.finish||'—'}`,cw-48,'600 13px Arial'),x+24,y+256);
    if(p.owner){ctx.fillStyle='#9aa5b4';ctx.font='500 11px Arial';ctx.fillText(fit(ctx,`Owner: ${p.owner}`,cw-48,'500 11px Arial'),x+24,y+275)}
  };
  const drawClient=(page,c,index)=>{
    const {c:canvas,x:ctx}=page;const gap=22,cw=(W-MM*2-gap)/2,ch=270;const col=index%2,row=Math.floor(index/2),x=MM+col*(cw+gap),y=page.y+row*(ch+22);
    round(ctx,x,y,cw,ch,24,'#ffffff','#e2e8f1');ctx.textAlign='left';ctx.fillStyle='#6074d3';ctx.font='800 12px Arial';ctx.fillText('CLIENT',x+24,y+24);ctx.fillStyle='#172238';ctx.font='900 26px Arial';ctx.fillText(fit(ctx,c.name||'Client',cw-48,'900 26px Arial'),x+24,y+57);ctx.fillStyle='#4564b9';ctx.font='800 18px Arial';ctx.fillText(c.phone||'—',x+24,y+100);
    const rows=[['REQUEST',c.need||'—'],['AREA',c.area||'—'],['BUDGET',money(c.budget)]];rows.forEach((r,j)=>{const bw=(cw-62)/3,bx=x+18+j*(bw+9);round(ctx,bx,y+138,bw,67,13,'#f5f7fa');ctx.fillStyle='#8a95a5';ctx.font='600 9px Arial';ctx.fillText(r[0],bx+12,y+151);ctx.fillStyle='#2d3b52';ctx.font='800 13px Arial';ctx.fillText(fit(ctx,r[1],bw-24,'800 13px Arial'),bx+12,y+174)});
    ctx.fillStyle='#748197';ctx.font='600 12px Arial';ctx.fillText(fit(ctx,c.notes||'',cw-48,'600 12px Arial'),x+24,y+226);
  };
  const buildPages=(items,label,sub,draw)=>{
    const chunkSize=4;
    if(!items.length){const page=makePage(label,sub);page.x.fillStyle='#7a8799';page.x.font='600 18px Arial';page.x.fillText('No data available.',MM,page.y);pages.push(page.c);return}
    for(let start=0;start<items.length;start+=chunkSize){const chunk=items.slice(start,start+chunkSize);const page=makePage(label,`${sub}  •  ${start+1}–${start+chunk.length} of ${items.length}`);chunk.forEach((item,i)=>draw(page,item,i,items.length));pages.push(page.c)}
  };
  if(type!=='clients'){
    const sub=selectedSet?`Selected properties • ${properties.length} included`:`Curated property inventory • ${properties.length} total`;
    buildPages(properties,'PROPERTY PORTFOLIO',sub,drawProperty);
  }
  if(type!=='properties'){
    buildPages(clients,'CLIENT DIRECTORY',`Client requests, budgets and follow-up information • ${clients.length} total`,drawClient);
  }
  pages.forEach((canvas,i)=>{const ctx=canvas.getContext('2d');ctx.direction='ltr';ctx.textAlign='center';ctx.fillStyle='#7c899c';ctx.font='600 14px Arial';ctx.fillText(`DREAM HOUSE  •  Engineer Ahmed Galal  •  01035032020  •  ${i+1} / ${pages.length}`,W/2,H-29)});
  const canvases=pages.map(c=>c.toDataURL('image/jpeg',.93));
  if(mode==='images'){
    const files=[];for(let i=0;i<canvases.length;i++){const blob=await (await fetch(canvases[i])).blob();files.push(new File([blob],`DREAM-HOUSE-${reportNo}-${i+1}.jpg`,{type:'image/jpeg'}))}
    try{if(navigator.share&&navigator.canShare&&navigator.canShare({files})){await navigator.share({title:'DREAM HOUSE — Executive Report',text:`${reportNo} • ${pages.length} pages • Engineer Ahmed Galal • 01035032020`,files});toast(`تم تجهيز ${pages.length} صفحات للمشاركة`);return}}catch(err){if(err?.name==='AbortError'){toast('تم إلغاء المشاركة');return}}
    canvases.forEach((data,i)=>{const a=document.createElement('a');a.href=data;a.download=`DREAM-HOUSE-${reportNo}-${i+1}.jpg`;document.body.appendChild(a);a.click();a.remove()});toast(`تم تنزيل ${pages.length} صفحات التقرير كصور JPG`);return;
  }
  const objects=['<< /Type /Catalog /Pages 2 0 R >>',''];const binaries=[];let objNum=3,pageRefs=[];
  canvases.forEach(()=>{pageRefs.push({page:objNum,content:objNum+1,image:objNum+2});objNum+=3});
  objects[1]=`<< /Type /Pages /Kids [${pageRefs.map(r=>r.page+' 0 R').join(' ')}] /Count ${pageRefs.length} >>`;
  canvases.forEach((data,idx)=>{const b=atob(data.split(',')[1]),arr=new Uint8Array(b.length);for(let i=0;i<b.length;i++)arr[i]=b.charCodeAt(i);const r=pageRefs[idx];objects[r.page-1]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 ${r.image} 0 R >> >> /Contents ${r.content} 0 R >>`;const stream='q 595 0 0 842 0 0 cm /Im1 Do Q';objects[r.content-1]=`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;binaries[r.image-1]={header:`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${arr.length} >>`,bytes:arr}});
  const enc=new TextEncoder();const header=enc.encode('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');let total=header.length;const parts=[header],offs=[0],maxObj=objNum-1;
  for(let n=1;n<=maxObj;n++){offs[n]=total;const head=enc.encode(`${n} 0 obj\n`);parts.push(head);total+=head.length;const bi=binaries[n-1];if(bi){const h=enc.encode(bi.header+'\nstream\n');parts.push(h);total+=h.length;parts.push(bi.bytes);total+=bi.bytes.length;const tail=enc.encode('\nendstream\nendobj\n');parts.push(tail);total+=tail.length}else{const q=enc.encode((objects[n-1]||'')+'\nendobj\n');parts.push(q);total+=q.length}}
  const xref=total;let x=`xref\n0 ${maxObj+1}\n0000000000 65535 f \n`;for(let n=1;n<=maxObj;n++)x+=String(offs[n]).padStart(10,'0')+' 00000 n \n';x+=`trailer\n<< /Size ${maxObj+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;parts.push(enc.encode(x));
  const blob=new Blob(parts,{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`DREAM-HOUSE-${reportNo}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast(`تم تنزيل PDF كامل — ${properties.length||clients.length} سجل • ${pages.length} صفحات`);
}

// Quality-of-life safeguards
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));
});
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')});
});
window.addEventListener('storage',e=>{
  if(e.key===KEY){try{loadAll()}catch{}}
});

function backupData(){
  const blob=new Blob([JSON.stringify(db(),null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='DREAM_HOUSE_Backup_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('تم تنزيل النسخة الاحتياطية');
}
function restoreData(input){
  const file=input.files?.[0]; if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!Array.isArray(d.properties)||!Array.isArray(d.clients))throw new Error();
      d.seq=Number(d.seq)||1;
      if(confirm('سيتم استبدال البيانات الحالية بهذه النسخة. هل تريد المتابعة؟')){
        if(!saveDB(d))return;
        loadAll();toast('تم استرجاع البيانات بنجاح');
      }
    }catch{toast('ملف النسخة الاحتياطية غير صالح')}
    input.value='';
  };
  r.onerror=()=>{toast('تعذر قراءة ملف النسخة الاحتياطية');input.value=''};
  r.readAsText(file);
}


// Ultra 3D micro-interactions: subtle, desktop-only, touch-safe.
(function(){
  const fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const selectors = '.stat,.premium-panel,.property,.report-card,.client-mobile-card';
  function bind(root=document){
    root.querySelectorAll?.(selectors).forEach(el=>{
      if(el.dataset.tiltBound) return; el.dataset.tiltBound='1';
      el.addEventListener('pointermove', e=>{
        const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        const rx=Math.max(-4,Math.min(4,-y*6)), ry=Math.max(-5,Math.min(5,x*7));
        el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      });
      el.addEventListener('pointerleave', ()=>{el.style.transform='';});
    });
  }
  bind();
  const mo=new MutationObserver(()=>bind()); mo.observe(document.body,{childList:true,subtree:true});
})();

// DREAM HOUSE MASTER 3D micro-interactions — desktop only, never blocks touch.
(function(){
  const fine = matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const hero = document.querySelector('.hero3d');
  const cards = [...document.querySelectorAll('.stat, .property, .report-card')];
  const tilt = (el, strength=7) => {
    if(!el) return;
    el.addEventListener('pointermove', e=>{
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(1200px) rotateX(${(-y*strength).toFixed(2)}deg) rotateY(${(x*strength).toFixed(2)}deg) translateZ(7px)`;
    });
    el.addEventListener('pointerleave',()=>{el.style.transform=''});
  };
  tilt(hero,2.4);
  cards.forEach(c=>tilt(c,3.2));
})();

// SIGNATURE 3D — restrained pointer depth for desktop, disabled on touch.
(function(){
  const fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const shell=document.querySelector('.login-shell');
  const visual=document.querySelector('.showcase-visual');
  if(shell){
    shell.addEventListener('pointermove',e=>{
      const r=shell.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      shell.style.transform=`perspective(1600px) rotateX(${(-y*1.15).toFixed(2)}deg) rotateY(${(x*1.4).toFixed(2)}deg)`;
    });
    shell.addEventListener('pointerleave',()=>shell.style.transform='');
  }
  if(visual){
    visual.addEventListener('pointermove',e=>{
      const r=visual.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      visual.style.transform=`translateX(50%) rotateX(${(-y*1.2).toFixed(2)}deg) rotateY(${(x*1.6).toFixed(2)}deg)`;
    });
    visual.addEventListener('pointerleave',()=>visual.style.transform='translateX(50%)');
  }
})();


// SIGNATURE ULTIMATE — iOS-inspired SVG navigation icons.
(function(){
 const icons={
  dashboard:'<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M10 19v-5h4v5"/>',
  properties:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 19v-6h8v6M8 9h.01M12 9h.01M16 9h.01"/>',
  clients:'<circle cx="12" cy="8" r="3"/><path d="M5 19c.8-3.2 3.1-5 7-5s6.2 1.8 7 5"/>',
  reports:'<path d="M6 19V9M12 19V5M18 19v-7"/><path d="M4 19h16"/>',
  logout:'<path d="M9 5H5v14h4"/><path d="M13 8l4 4-4 4M9 12h8"/>'
 };
 document.querySelectorAll('.nav button').forEach(btn=>{
   const key=btn.dataset.page;
   if(!icons[key]||btn.querySelector('.nav-icon'))return;
   const label=btn.textContent.trim();
   btn.innerHTML='<span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+icons[key]+'</svg></span><span>'+label+'</span>';
 });
 const out=document.querySelector('#logout');
 if(out&&!out.querySelector('.logout-icon')){const label=out.textContent.trim();out.innerHTML='<span class="logout-icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+icons.logout+'</svg></span><span>'+label+'</span>'}
})();

// APEX polish: keep the authentication surface English-only and icon-first.
(function(){
  const t=document.querySelector('#togglePassword');
  if(t){
    t.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
    t.onclick=()=>{const p=document.querySelector('#password');const show=p.type==='password';p.type=show?'text':'password';t.classList.toggle('is-open',show)};
  }
})();

// BLACK LABEL ambient intelligence: a single, ultra-light pointer light across the workspace.
(function(){
  const fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  let raf=0,px=50,py=50;
  window.addEventListener('pointermove',e=>{
    px=(e.clientX/innerWidth*100).toFixed(2)+'%';
    py=(e.clientY/innerHeight*100).toFixed(2)+'%';
    if(raf)return;
    raf=requestAnimationFrame(()=>{document.body.style.setProperty('--mx',px);document.body.style.setProperty('--my',py);raf=0});
  },{passive:true});
})();

// App-like navigation: the dock behaves like a native surface, while preserving existing handlers.
(function(){
  const nav=document.querySelector('.nav'); if(!nav)return;
  nav.addEventListener('click',e=>{
    const b=e.target.closest('button[data-page]'); if(!b)return;
    document.body.classList.remove('page-pulse');
    void document.body.offsetWidth;
    document.body.classList.add('page-pulse');
  });
})();

// Give the mobile dock a tiny tactile lift without adding any dependency.
(function(){
  const fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  if(fine)return;
  document.querySelectorAll('.nav button').forEach(btn=>{
    btn.addEventListener('touchstart',()=>btn.classList.add('touching'),{passive:true});
    btn.addEventListener('touchend',()=>setTimeout(()=>btn.classList.remove('touching'),140),{passive:true});
  });
})();

// MOBILE BLACK LABEL — subtle gyroscope/tilt depth, touch-safe and performance-aware.
(function(){
  if(!window.matchMedia || !window.matchMedia('(max-width:720px)').matches) return;
  const cards=[...document.querySelectorAll('.hero3d,.stat,.property,.report-card')];
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  let ticking=false, tx=0, ty=0;
  function paint(){
    ticking=false;
    const x=Math.max(-1,Math.min(1,tx)), y=Math.max(-1,Math.min(1,ty));
    cards.forEach((el,i)=>{
      if(i===0) el.style.transform=`perspective(1100px) rotateX(${(-y*1.25).toFixed(2)}deg) rotateY(${(x*1.5).toFixed(2)}deg)`;
    });
  }
  window.addEventListener('deviceorientation',e=>{
    if(typeof e.gamma!=='number'||typeof e.beta!=='number') return;
    tx=e.gamma/45; ty=(e.beta-45)/45;
    if(!ticking){ticking=true;requestAnimationFrame(paint)}
  },{passive:true});
  document.addEventListener('touchend',()=>{
    const h=document.querySelector('.hero3d'); if(h) h.style.transform='';
  },{passive:true});
})();

/* BLACK LABEL V4 — restrained 3D pointer depth; disabled for touch devices */
(()=>{
  const fine=window.matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const targets=['.login-shell','.hero3d','.property','.stat','.report-card'];
  targets.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{
    let raf=0;
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{el.style.setProperty('--rx',(-y*2.2).toFixed(2)+'deg');el.style.setProperty('--ry',(x*2.8).toFixed(2)+'deg');});
    });
    el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')});
  }));
  const s=document.createElement('style');s.textContent='.login-shell,.hero3d,.property,.stat,.report-card{transform:perspective(1800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)}';document.head.appendChild(s);
})();

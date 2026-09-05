const DB=window.__STAGE_DATA__;


const rows=Object.fromEntries(DB.rows.map(r=>[r.structure_id,r]));
const MATERIALS={
 pcc_volume_m3:{label:'PCC Volume',unit:'m³',digits:4},
 cement_bags:{label:'Cement',unit:'bags',digits:4},
 sand_m3:{label:'Sand',unit:'m³',digits:5},
 aggregate_m3:{label:'Aggregate',unit:'m³',digits:5}
};
function fmt(v,n=3){return Number(v).toLocaleString(undefined,{minimumFractionDigits:n,maximumFractionDigits:n})}
function showPage(id,btn){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('page-'+id).classList.add('active');document.querySelectorAll('.tabbtn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');closePop();window.scrollTo({top:0,behavior:'smooth'})}
function closePop(){document.getElementById('pop').classList.remove('open');document.querySelectorAll('.pcc').forEach(e=>e.classList.remove('sel'))}
function openInfo(ev,el){ev.stopPropagation();document.querySelectorAll('.pcc').forEach(e=>e.classList.remove('sel'));el.classList.add('sel');const r=rows[el.dataset.id];document.getElementById('pc').innerHTML=`<h3>${r.structure_type} PCC · ${r.grid_ref}</h3><div class="metrics"><div class="m"><b>${fmt(r.pcc_volume_m3,4)} m³</b><span>PCC volume — this structure</span></div><div class="m"><b>${fmt(r.cement_bags,4)} bags</b><span>Cement — this structure</span></div><div class="m"><b>${fmt(r.sand_m3,5)} m³</b><span>Sand — this structure</span></div><div class="m"><b>${fmt(r.aggregate_m3,5)} m³</b><span>Aggregate — this structure</span></div></div><div class="prov"><b>Database row:</b> ${r.structure_id}<br><b>Derivation:</b> ${r.derivation_method}.<br>The UI reads the database row; it does not redo the engineering calculation.</div>`;const p=document.getElementById('pop');p.classList.add('open');p.style.left=Math.max(12,Math.min(ev.clientX+12,window.innerWidth-430))+'px';p.style.top=Math.max(70,Math.min(ev.clientY+12,window.innerHeight-390))+'px'}

function syncSelectorMap(sids){
 const chosen=new Set(sids);
 const panel=document.getElementById('selectorMapPanel');
 if(panel) panel.classList.toggle('has-selection',sids.length>0);
 document.querySelectorAll('#selectorMapPanel .pcc').forEach(el=>el.classList.toggle('selector-selected',chosen.has(el.dataset.id)));
 const st=document.getElementById('selectorPlanStatus');
 if(st) st.textContent=sids.length ? `${sids.length} selected • spatial highlight active` : '0 selected';
}
function toggleSelectorMap(ev,el){
 ev.stopPropagation();
 const cb=document.querySelector(`.structureCheck[value="${el.dataset.id}"]`);
 if(!cb) return;
 cb.checked=!cb.checked;
 refreshSelector();
}

function getSelectedStructures(){return [...document.querySelectorAll('.structureCheck:checked')].map(x=>x.value)}
function getSelectedMaterials(){return [...document.querySelectorAll('.materialCheck:checked')].map(x=>x.value)}
function setStructures(mode){document.querySelectorAll('.structureCheck').forEach(cb=>{const r=rows[cb.value];cb.checked=mode==='ALL'||(mode!=='NONE'&&r.structure_type===mode)});refreshSelector()}
function setMaterials(on){document.querySelectorAll('.materialCheck').forEach(cb=>cb.checked=on);refreshSelector()}
function filterStructures(){const q=document.getElementById('structureSearch').value.trim().toLowerCase();document.querySelectorAll('#structureList .checkrow').forEach(row=>row.style.display=row.dataset.search.includes(q)?'flex':'none')}
function refreshSelector(){
 const sids=getSelectedStructures(), mats=getSelectedMaterials();
 syncSelectorMap(sids);
 document.getElementById('structureSummary').textContent=`Structures — ${sids.length} selected`;
 document.getElementById('materialSummary').textContent=`Materials — ${mats.length} selected`;
 document.getElementById('selectedCount').textContent=sids.length;
 const types=[...new Set(sids.map(id=>rows[id].structure_type))];
 document.getElementById('selectedTypes').textContent=types.length?types.join(', '):'—';
 document.getElementById('selectedChips').innerHTML=sids.slice(0,12).map(id=>`<span class="chip">${rows[id].structure_type} · ${rows[id].grid_ref}</span>`).join('')+(sids.length>12?`<span class="chip">+${sids.length-12} more</span>`:'');
 const has=sids.length&&mats.length;document.getElementById('summaryEmpty').style.display=has?'none':'block';document.getElementById('summaryArea').style.display=has?'block':'none';
 if(!has) return;
 const totals={};mats.forEach(k=>totals[k]=sids.reduce((a,id)=>a+Number(rows[id][k]||0),0));
 document.getElementById('sumBody').innerHTML=mats.map(k=>`<tr><td>${MATERIALS[k].label}</td><td>${MATERIALS[k].unit}</td><td class="num"><b>${fmt(totals[k],MATERIALS[k].digits)}</b></td></tr>`).join('');
 document.getElementById('breakHead').innerHTML='<tr><th>Structure</th><th>Grid</th>'+mats.map(k=>`<th class="num">${MATERIALS[k].label}<br><small>${MATERIALS[k].unit}</small></th>`).join('')+'</tr>';
 document.getElementById('breakBody').innerHTML=sids.map(id=>{const r=rows[id];return `<tr><td>${r.structure_type}</td><td>${r.grid_ref}</td>${mats.map(k=>`<td class="num">${fmt(r[k],MATERIALS[k].digits)}</td>`).join('')}</tr>`}).join('');
}
document.addEventListener('click',e=>{if(!e.target.closest('#pop')&&!e.target.closest('.pcc'))closePop()});
refreshSelector();


function getSelectedOrder(){return [...document.querySelectorAll('.orderCheck:checked')].map(x=>x.value)}
function setOrder(mode){document.querySelectorAll('.orderCheck').forEach(cb=>{const r=rows[cb.value];cb.checked=mode==='ALL'||(mode!=='NONE'&&r.structure_type===mode)});refreshOrder()}
function filterOrder(){const q=document.getElementById('orderSearch').value.trim().toLowerCase();document.querySelectorAll('#orderList .checkrow').forEach(row=>row.style.display=row.dataset.search.includes(q)?'flex':'none')}
function syncOrderMap(ids){const chosen=new Set(ids);const panel=document.getElementById('orderMapPanel');if(panel)panel.classList.toggle('has-selection',ids.length>0);document.querySelectorAll('#orderMapPanel .pcc').forEach(el=>el.classList.toggle('selector-selected',chosen.has(el.dataset.id)));const st=document.getElementById('orderStatus');if(st)st.textContent=ids.length?`${ids.length} selected • spatial highlight active`:'0 selected'}
function toggleOrderMap(ev,el){ev.stopPropagation();const cb=document.querySelector(`.orderCheck[value="${el.dataset.id}"]`);if(cb){cb.checked=!cb.checked;refreshOrder()}}
function refreshOrder(){const ids=getSelectedOrder();syncOrderMap(ids);document.getElementById('orderCount').textContent=ids.length;document.getElementById('orderChips').innerHTML=ids.slice(0,12).map(id=>`<span class="chip">${rows[id].structure_type} · ${rows[id].grid_ref}</span>`).join('')+(ids.length>12?`<span class="chip">+${ids.length-12} more</span>`:'');const has=ids.length>0;document.getElementById('orderEmpty').style.display=has?'none':'block';document.getElementById('orderArea').style.display=has?'block':'none';if(!has){document.getElementById('orderPcc').textContent='0.000';return}const sum=k=>ids.reduce((a,id)=>a+Number(rows[id][k]),0),pcc=sum('pcc_volume_m3'),cem=sum('cement_bags'),sand=sum('sand_m3'),agg=sum('aggregate_m3');document.getElementById('orderPcc').textContent=fmt(pcc,3);document.getElementById('orderBody').innerHTML=`<tr><td>PCC 1:3:6</td><td>m³</td><td class="num">${fmt(pcc,4)}</td></tr><tr><td>Cement</td><td>bags</td><td class="num">${fmt(cem,4)}</td></tr><tr><td>Sand</td><td>m³</td><td class="num">${fmt(sand,5)}</td></tr><tr><td>Aggregate</td><td>m³</td><td class="num">${fmt(agg,5)}</td></tr>`;document.getElementById('orderBreak').innerHTML=ids.map(id=>{const r=rows[id];return `<tr><td>${r.structure_type}</td><td>${r.grid_ref}</td><td class="num">${fmt(r.pcc_volume_m3,4)}</td><td class="num">${fmt(r.cement_bags,4)}</td><td class="num">${fmt(r.sand_m3,5)}</td><td class="num">${fmt(r.aggregate_m3,5)}</td></tr>`}).join('')}
refreshOrder();

const PCC_DIMS={IF1:[1.5,1.5],IF2:[1.8,1.8],IF3:[2.1,2.1],IF4:[2.4,2.4],CF1:[4.0,1.5]};
function escD(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function detailIds(){return [...document.querySelectorAll('.structureCheck:checked')].map(x=>x.value)}
function syncDetail(){let ids=detailIds();document.querySelectorAll('.detailCheck').forEach(c=>c.checked=ids.includes(c.value));}
function detailPick(c){let t=document.querySelector('.structureCheck[value="'+c.value+'"]');if(t)t.checked=c.checked;refreshSelector();}
function detailSet(on){document.querySelectorAll('.structureCheck').forEach(c=>c.checked=on);refreshSelector();}
function pccThick(r){let m=String(r.pcc_spec).match(/(\d+)\s*mm/i);return m?Number(m[1]):null}
function pccPlan(r){let [L,W]=PCC_DIMS[r.structure_type],sx=240/Math.max(L,W),rw=L*sx,rh=W*sx,x=(300-rw)/2,y=(280-rh)/2;return `<svg viewBox="0 0 300 320"><rect width="300" height="320" fill="white"/><text class="dtitle" x="10" y="18">Plan footprint · ${r.structure_type}</text><rect x="${x}" y="${y+18}" width="${rw}" height="${rh}" class="pccDetail"/><text class="dlabel" x="150" y="${y+18+rh/2}" text-anchor="middle">${r.pcc_spec}</text><text class="dsmall" x="10" y="292">${L.toFixed(2)} m × ${W.toFixed(2)} m footprint</text><text class="dsmall" x="10" y="307">PCC volume ${r.pcc_volume_m3.toFixed(4)} m³</text></svg>`}
function pccSection(r,trans){let [L,W]=PCC_DIMS[r.structure_type],span=trans?W:L,tm=pccThick(r)||0;let rw=245,th=Math.max(18,tm/4),x=28,y=145;return `<svg viewBox="0 0 300 250"><rect width="300" height="250" fill="white"/><text class="dtitle" x="10" y="18">${trans?'Transverse':'Longitudinal'} section</text><rect x="${x}" y="${y}" width="${rw}" height="${th}" class="pccDetail"/><rect x="55" y="70" width="190" height="75" fill="#e2e8f0" stroke="#94a3b8" stroke-dasharray="5 4"/><text class="dsmall" x="60" y="91">Future footing context only</text><line x1="28" y1="190" x2="273" y2="190" class="dim"/><text class="dsmall" x="150" y="205" text-anchor="middle">${span.toFixed(2)} m plan span</text><line x1="282" y1="145" x2="282" y2="${145+th}" class="dim"/><text class="dsmall" x="285" y="${150+th/2}">${tm} mm</text><text class="dsmall" x="10" y="232">${r.pcc_spec}; footing context is schematic.</text></svg>`}
function pccIso(r){let [L,W]=PCC_DIMS[r.structure_type],ratio=W/L,dx=55*ratio,tm=pccThick(r)||0,t=tm/1000;return `<svg viewBox="0 0 300 250"><rect width="300" height="250" fill="white"/><text class="dtitle" x="10" y="18">Mini isometric · PCC plate</text><polygon points="45,105 225,105 ${225+dx},70 ${45+dx},70" fill="#cffafe" stroke="#0891b2" stroke-width="2"/><polygon points="45,105 225,105 225,132 45,132" fill="#a5f3fc" stroke="#0891b2"/><polygon points="225,105 ${225+dx},70 ${225+dx},97 225,132" fill="#67e8f9" stroke="#0891b2"/><text class="dsmall" x="10" y="185">${L.toFixed(2)} × ${W.toFixed(2)} × ${t.toFixed(3)} m</text><text class="dsmall" x="10" y="202">${r.pcc_spec}; exact volume comes from frozen DB.</text></svg>`}
function pccCard(r){return `<article class="detailCard"><div class="detailHead"><div><h3>${r.grid_ref} · ${r.structure_type}</h3><div style="font-size:12px;color:#64748b">${r.pcc_spec} · source ${r.source_id}</div></div><div><span class="badge">${pccThick(r)} mm</span><span class="badge">${r.pcc_volume_m3.toFixed(4)} m³</span></div></div><div class="detailViews"><div class="detailBox"><h4>A · Plan</h4>${pccPlan(r)}</div><div class="detailBox"><h4>B · Long section</h4>${pccSection(r,false)}</div><div class="detailBox"><h4>C · 2.5D</h4>${pccIso(r)}</div></div><div class="detailTable"><table class="matTable"><thead><tr><th>Item</th><th>Unit</th><th>Quantity</th></tr></thead><tbody><tr><td>PCC 1:3:6</td><td>m³</td><td>${r.pcc_volume_m3.toFixed(4)}</td></tr><tr><td>Cement</td><td>bags</td><td>${r.cement_bags.toFixed(4)}</td></tr><tr><td>Sand</td><td>m³</td><td>${r.sand_m3.toFixed(5)}</td></tr><tr><td>Aggregate</td><td>m³</td><td>${r.aggregate_m3.toFixed(5)}</td></tr></tbody></table></div><div class="detailNote"><b>Authority:</b> canonical PCC database row + frozen upstream PCC authority. Isolated and CF1 PCC specifications differ and are preserved per row. No BBS/rebar is introduced in V02.</div></article>`}
function renderDetail(){syncDetail();let root=document.getElementById('detailCards');if(!root)return;let ids=detailIds();root.innerHTML=ids.length?ids.map(id=>pccCard(rows[id])).join(''):'<div class="panel">Select one or more PCC locations. Each selected location will receive its own source-backed detail card.</div>';}
const _pccRefreshSelector=refreshSelector;refreshSelector=function(){_pccRefreshSelector();renderDetail();};
renderDetail();


const CTX_GRID_LETTER_MM={A:0,B:2985,C:4900,D:5485,E:8748,F:9723,G:14688,H:19500,I:21000};
const CTX_GRID_NUMBER_MM={1:0,2:3600,3:6425,4:7080,5:10045,6:10700,7:12550};
const CTX_LEVELS=[{n:'Plinth',z:0},{n:'First floor',z:3048},{n:'Second floor',z:6096},{n:'Roof / total',z:9144}];
function ctxGridPoint(ref){
 ref=String(ref||'').trim().toUpperCase();
 let m=ref.match(/^([A-I])(\d)$/);if(m)return {x:CTX_GRID_LETTER_MM[m[1]],y:CTX_GRID_NUMBER_MM[Number(m[2])],letter:m[1],number:Number(m[2])};
 m=ref.match(/^([A-I])-([A-I])\/(\d)$/);if(m)return {x:(CTX_GRID_LETTER_MM[m[1]]+CTX_GRID_LETTER_MM[m[2]])/2,y:CTX_GRID_NUMBER_MM[Number(m[3])],letter:m[1]+'-'+m[2],number:Number(m[3])};
 return null;
}
function ctxAxisX(v,min,max){return 58+(v-min)/(max-min)*684}
function ctxY(z){const min=-2300,max=9500;return 452-(z-min)/(max-min)*392}
function ctxSafe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function ctxStageMarkup(r,x,stage){
 let cf=String(r.structure_type||r.support_class||'').includes('CF1')||String(r.support_class||'').toLowerCase()==='cf1';
 let base=cf?-2015:-1990, top=base+500, out='';
 if(stage==='PCC'){
   let t=cf?75:90;out+=`<rect x="${x-16}" y="${ctxY(base)-3}" width="32" height="${Math.max(4,ctxY(base-t)-ctxY(base))}" fill="#0891b2" opacity=".88"/><text x="${x+20}" y="${ctxY(base-t)+10}" font-size="9" fill="#0e7490">PCC</text>`;
 }else if(stage==='V03'){
   out+=`<path d="M ${x-25} ${ctxY(base)} L ${x-25} ${ctxY(top-300)} L ${x-12} ${ctxY(top)} L ${x+12} ${ctxY(top)} L ${x+25} ${ctxY(top-300)} L ${x+25} ${ctxY(base)} Z" fill="#e2e8f0" stroke="#94a3b8"/>`;
   out+=`<line x1="${x-23}" y1="${ctxY(base+58)}" x2="${x+23}" y2="${ctxY(base+58)}" stroke="#2563eb" stroke-width="4"/><line x1="${x-17}" y1="${ctxY(top-58)}" x2="${x+17}" y2="${ctxY(top-58)}" stroke="#dc2626" stroke-width="4"/>`;
 }else if(stage==='M40'){
   out+=`<path d="M ${x-27} ${ctxY(base)} L ${x-27} ${ctxY(top-300)} L ${x-13} ${ctxY(top)} L ${x+13} ${ctxY(top)} L ${x+27} ${ctxY(top-300)} L ${x+27} ${ctxY(base)} Z" fill="#94a3b8" stroke="#475569" stroke-width="2"/>`;
   out+=`<rect x="${x-17}" y="${ctxY(base)-2}" width="34" height="4" fill="#0891b2" opacity=".55"/>`;
 }else if(stage==='M50'){
   out+=`<path d="M ${x-27} ${ctxY(base)} L ${x-27} ${ctxY(top-300)} L ${x-13} ${ctxY(top)} L ${x+13} ${ctxY(top)} L ${x+27} ${ctxY(top-300)} L ${x+27} ${ctxY(base)} Z" fill="#e2e8f0" stroke="#94a3b8"/>`;
   let dias=(r.longitudinal_pieces||[]).map(p=>Number(p.dia_mm)||0),dia=Math.max(12,...dias),lap=60*dia;
   let a=(Number(r.group_A_center_above_plinth_mm)||1321.5)+lap/2,b=(Number(r.group_B_center_above_plinth_mm)||4369.5)+lap/2;
   out+=`<line x1="${x-7}" y1="${ctxY(base)}" x2="${x-7}" y2="${ctxY(a)}" stroke="#2563eb" stroke-width="5"/><line x1="${x+7}" y1="${ctxY(base)}" x2="${x+7}" y2="${ctxY(b)}" stroke="#7c3aed" stroke-width="5"/>`;
   out+=`<rect x="${x-17}" y="${ctxY((Number(r.group_A_center_above_plinth_mm)||1321.5)+lap/2)}" width="34" height="${Math.max(5,ctxY((Number(r.group_A_center_above_plinth_mm)||1321.5)-lap/2)-ctxY((Number(r.group_A_center_above_plinth_mm)||1321.5)+lap/2))}" fill="#f59e0b" opacity=".16"/>`;
   out+=`<rect x="${x-17}" y="${ctxY((Number(r.group_B_center_above_plinth_mm)||4369.5)+lap/2)}" width="34" height="${Math.max(5,ctxY((Number(r.group_B_center_above_plinth_mm)||4369.5)-lap/2)-ctxY((Number(r.group_B_center_above_plinth_mm)||4369.5)+lap/2))}" fill="#f59e0b" opacity=".16"/>`;
 }
 return out;
}
function ctxElevationSvg(ids,axis,stage){
 let map=axis==='LETTER'?CTX_GRID_LETTER_MM:CTX_GRID_NUMBER_MM,vals=Object.values(map),min=Math.min(...vals),max=Math.max(...vals),keys=Object.keys(map),W=800,H=490;
 let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${axis==='LETTER'?'A to I':'1 to 7'} grid-linked project elevation"><rect width="${W}" height="${H}" fill="white"/><text x="15" y="22" font-size="14" font-weight="700" fill="#0f172a">${axis==='LETTER'?'A-I':'1-7'} grid-linked structural elevation</text><text x="15" y="40" font-size="10" fill="#64748b">Grid spacings are proportional to the Narayani structural plan; background datums are context, not a claim that every grid line carries a column.</text>`;
 CTX_LEVELS.forEach(l=>{let y=ctxY(l.z);s+=`<line x1="48" y1="${y}" x2="758" y2="${y}" stroke="#64748b" stroke-width="1.2"/><text x="8" y="${y+4}" font-size="9" fill="#475569">${l.n}</text><text x="762" y="${y+4}" font-size="9" fill="#64748b">${l.z} mm</text>`;});
 keys.forEach(k=>{let x=ctxAxisX(map[k],min,max);s+=`<line x1="${x}" y1="${ctxY(-2200)}" x2="${x}" y2="${ctxY(9300)}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="5 5"/><circle cx="${x}" cy="472" r="10" fill="white" stroke="#94a3b8"/><text x="${x}" y="475" text-anchor="middle" font-size="9" font-weight="700" fill="#475569">${k}</text>`;});
 let seen={};ids.forEach(id=>{let r=rows[id],p=ctxGridPoint(r&&r.grid_ref);if(!p)return;let v=axis==='LETTER'?p.x:p.y,x=ctxAxisX(v,min,max);let n=(seen[Math.round(x)]||0);seen[Math.round(x)]=n+1;x+=Math.min(n,4)*6-9;s+=ctxStageMarkup(r,x,stage);s+=`<text x="${x+10}" y="${ctxY(-2180)-n*11}" font-size="9" font-weight="700" fill="#0f172a">${ctxSafe(r.grid_ref)}</text>`;});
 s+=`<line x1="48" y1="${ctxY(-540)}" x2="758" y2="${ctxY(-540)}" stroke="#16a34a" stroke-dasharray="8 5"/><text x="52" y="${ctxY(-540)-5}" font-size="9" fill="#15803d">Ground/context datum (schematic)</text>`;
 s+=`</svg>`;return s;
}

function mountBackfillSpatialMaps(){
 const src=document.querySelector('#selectorMapPanel svg');if(!src)return;
 [['detailMapMount','detail-map-clone'],['contextMapMount','context-map-clone']].forEach(([mid,rid])=>{let m=document.getElementById(mid);if(!m||m.querySelector('svg'))return;let c=src.cloneNode(true);c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));c.setAttribute('id',rid);m.appendChild(c);});
}
function syncBackfillSpatialMaps(){
 let ids=detailIds(),set=new Set(ids);
 ['detailSpatialMapPanel','contextSpatialMapPanel'].forEach(pid=>{let p=document.getElementById(pid);if(p)p.classList.toggle('has-selection',ids.length>0);});
 ['detailMapMount','contextMapMount'].forEach(mid=>{let m=document.getElementById(mid);if(!m)return;m.querySelectorAll('.pcc').forEach(e=>e.classList.toggle('selector-selected',set.has(e.dataset.id)));});
 let ds=document.getElementById('detailMapStatus'),cs=document.getElementById('contextMapStatus');if(ds)ds.textContent=ids.length?ids.length+' selected · click map or list to change':'0 selected';if(cs)cs.textContent=ids.length?ids.length+' selected · projected below':'0 selected';
}
function renderProjectContext(){let ids=detailIds();let a=document.getElementById('ctxElevLetters'),b=document.getElementById('ctxElevNumbers');if(a)a.innerHTML=ctxElevationSvg(ids,'LETTER','PCC');if(b)b.innerHTML=ctxElevationSvg(ids,'NUMBER','PCC');let n=document.getElementById('contextStageNote');if(n)n.innerHTML="<b>V02 stage:</b> selected cyan markers are the PCC/blinding immediately below the footing. Isolated footings use the frozen 90 mm PCC 1:3:6 case; CF1 uses 75 mm M10 PCC. Vertical placement in this building-context view is schematic; per-location plan geometry/material quantities remain authoritative.";}
mountBackfillSpatialMaps();
const _ctxRefresh=refreshSelector;refreshSelector=function(){_ctxRefresh();syncBackfillSpatialMaps();renderProjectContext();};
syncBackfillSpatialMaps();renderProjectContext();


const DB=window.__STAGE_DATA__.DB;
const PROCUREMENT=window.__STAGE_DATA__.PROCUREMENT;


const rows=Object.fromEntries(DB.rows.map(r=>[r.structure_id,r]));
const Q={
 installed_weight_kg:{label:'Installed steel',unit:'kg',digits:3},
 fabrication_length_m:{label:'Fabrication length',unit:'m',digits:3},
 total_pieces:{label:'Total pieces',unit:'pcs',digits:0},
 top_pieces:{label:'Top-layer pieces',unit:'pcs',digits:0},
 bottom_pieces:{label:'Bottom-layer pieces',unit:'pcs',digits:0},
 t12_weight_kg:{label:'T12 steel',unit:'kg',digits:3},
 t16_weight_kg:{label:'T16 steel',unit:'kg',digits:3}
};
function setRebarLayer(mode,btn){
 document.querySelectorAll('.bottomLine').forEach(e=>e.style.display=(mode==='TOP'?'none':''));
 document.querySelectorAll('.topLine').forEach(e=>e.style.display=(mode==='BOTTOM'?'none':''));
}
function fmt(v,n=3){return Number(v).toLocaleString(undefined,{minimumFractionDigits:n,maximumFractionDigits:n})}
function showPage(id,btn){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('page-'+id).classList.add('active');document.querySelectorAll('.tabbtn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');closePop();window.scrollTo({top:0,behavior:'smooth'})}
function closePop(){document.getElementById('pop').classList.remove('open');document.querySelectorAll('.rebarFoot').forEach(e=>e.classList.remove('sel'))}
function openInfo(ev,el){ev.stopPropagation();document.querySelectorAll('.rebarFoot').forEach(e=>e.classList.remove('sel'));el.classList.add('sel');const r=rows[el.dataset.id];let family=r.structure_type==='CF1'?`<br>Longitudinal: ${r.longitudinal_bars_per_layer} bars/layer × 2 layers @ ${fmt(r.longitudinal_piece_length_m,3)}m<br>Transverse: ${r.transverse_bars_per_layer} bars/layer × 2 layers @ ${fmt(r.transverse_piece_length_m,3)}m`:`<br>${r.bars_per_direction_per_layer} bars/direction/layer × 2 directions × 2 layers<br>Cut length each: ${fmt(r.piece_length_m,3)}m`;document.getElementById('pc').innerHTML=`<h3>${r.structure_type} reinforcement · ${r.grid_ref}</h3><div class="prov"><b>${r.bar_spec}</b><br>Cover: ${r.cover_mm} mm${family}</div><div class="metrics"><div class="m"><b>${fmt(r.installed_weight_kg,3)} kg</b><span>Installed steel — this footing</span></div><div class="m"><b>${fmt(r.fabrication_length_m,3)} m</b><span>Fabrication length — this footing</span></div><div class="m"><b>${r.top_pieces} pcs</b><span>Top-layer pieces</span></div><div class="m"><b>${r.bottom_pieces} pcs</b><span>Bottom-layer pieces</span></div></div><div class="prov"><b>Database row:</b> ${r.structure_id}<br>${r.derivation_method}<br><br><b>Stock rods:</b> ${r.stock_rod_allocation}</div>`;const p=document.getElementById('pop');p.classList.add('open');p.style.left=Math.max(12,Math.min(ev.clientX+12,window.innerWidth-470))+'px';p.style.top=Math.max(70,Math.min(ev.clientY+12,window.innerHeight-470))+'px'}
function getSelectedStructures(){return [...document.querySelectorAll('.structureCheck:checked')].map(x=>x.value)}function getSelectedQuantities(){return [...document.querySelectorAll('.quantityCheck:checked')].map(x=>x.value)}
function setStructures(mode){document.querySelectorAll('.structureCheck').forEach(cb=>{const r=rows[cb.value];cb.checked=mode==='ALL'||(mode!=='NONE'&&r.structure_type===mode)});refreshSelector()}function setQuantities(on){document.querySelectorAll('.quantityCheck').forEach(cb=>cb.checked=on);refreshSelector()}
function filterStructures(){const q=document.getElementById('structureSearch').value.trim().toLowerCase();document.querySelectorAll('#structureList .checkrow').forEach(row=>row.style.display=row.dataset.search.includes(q)?'flex':'none')}
function syncMap(sids){const set=new Set(sids),panel=document.getElementById('selectorMapPanel');panel.classList.toggle('has-selection',sids.length>0);document.querySelectorAll('#selectorMapPanel .rebarFoot').forEach(el=>el.classList.toggle('selector-selected',set.has(el.dataset.id)));document.getElementById('selectorPlanStatus').textContent=sids.length?`${sids.length} selected • spatial highlight active`:'0 selected'}
function toggleSelectorMap(ev,el){ev.stopPropagation();const cb=document.querySelector(`.structureCheck[value="${el.dataset.id}"]`);if(cb){cb.checked=!cb.checked;refreshSelector()}}
function refreshSelector(){const sids=getSelectedStructures(),qs=getSelectedQuantities();syncMap(sids);document.getElementById('structureSummary').textContent=`Structures — ${sids.length} selected`;document.getElementById('quantitySummary').textContent=`Fields — ${qs.length} selected`;document.getElementById('selectedCount').textContent=sids.length;const types=[...new Set(sids.map(id=>rows[id].structure_type))];document.getElementById('selectedTypes').textContent=types.length?types.join(', '):'—';document.getElementById('selectedChips').innerHTML=sids.slice(0,12).map(id=>`<span class="chip">${rows[id].structure_type} · ${rows[id].grid_ref}</span>`).join('')+(sids.length>12?`<span class="chip">+${sids.length-12} more</span>`:'');const has=sids.length&&qs.length;document.getElementById('summaryEmpty').style.display=has?'none':'block';document.getElementById('summaryArea').style.display=has?'block':'none';if(!has)return;const totals={};qs.forEach(k=>totals[k]=sids.reduce((a,id)=>a+Number(rows[id][k]||0),0));document.getElementById('sumBody').innerHTML=qs.map(k=>`<tr><td>${Q[k].label}</td><td>${Q[k].unit}</td><td class="num"><b>${fmt(totals[k],Q[k].digits)}</b></td></tr>`).join('');document.getElementById('breakHead').innerHTML='<tr><th>Structure</th><th>Grid</th><th>Bar</th>'+qs.map(k=>`<th class="num">${Q[k].label}<br><small>${Q[k].unit}</small></th>`).join('')+'</tr>';document.getElementById('breakBody').innerHTML=sids.map(id=>{const r=rows[id];return `<tr><td>${r.structure_type}</td><td>${r.grid_ref}</td><td>T${r.bar_diameter_mm}</td>${qs.map(k=>`<td class="num">${fmt(r[k],Q[k].digits)}</td>`).join('')}</tr>`}).join('')}


const PENT=Object.fromEntries(PROCUREMENT.entities.map(e=>[e.entity_id,e]));
function vendorShortType(e){
 const s=e.structure_type||'';
 if(s.includes('IF1'))return 'IF1'; if(s.includes('IF2'))return 'IF2'; if(s.includes('IF3'))return 'IF3'; if(s.includes('IF4'))return 'IF4'; if(s.includes('CF1'))return 'CF1'; return s;
}
function vendorSelectedIds(){return [...document.querySelectorAll('.vendorStructureCheck:checked')].map(x=>x.value)}
function filterVendorStructures(){
 const q=document.getElementById('vendorSearch').value.trim().toLowerCase();
 document.querySelectorAll('#vendorPicker .checkrow').forEach(r=>r.style.display=r.dataset.vsearch.includes(q)?'flex':'none');
}
function setVendorStructures(mode){
 document.querySelectorAll('.vendorStructureCheck').forEach(cb=>{
   const e=PENT[cb.value], t=vendorShortType(e);
   cb.checked=(mode==='ALL'||(mode!=='NONE'&&t===mode));
 });
 refreshVendor();
}
function toggleVendorMap(ev,el){
 ev.stopPropagation();
 const cb=document.querySelector(`.vendorStructureCheck[value="${el.dataset.id}"]`);
 if(cb){cb.checked=!cb.checked;refreshVendor();}
}
function syncVendorMap(ids){
 const chosen=new Set(ids), panel=document.getElementById('vendorMapPanel');
 panel.classList.toggle('has-selection',ids.length>0);
 document.querySelectorAll('#vendorMapPanel .rebarFoot').forEach(el=>el.classList.toggle('vendor-selected',chosen.has(el.dataset.id)));
 document.getElementById('vendorMapStatus').textContent=ids.length?`${ids.length} selected • spatial highlight active`:'0 selected';
}
function muuthaText(dia,rods){
 const candidates=PROCUREMENT.entities.filter(e=>Number(e.diameter_mm)===Number(dia));
 const per=candidates.length?Number(candidates[0].rods_per_muutha||0):0;
 if(!per)return '—';
 const full=Math.floor(rods/per), loose=rods%per;
 if(full&&loose)return `${full} muutha + ${loose} loose`;
 if(full)return `${full} muutha`;
 return `${loose} loose`;
}
function refreshVendor(){
 const ids=vendorSelectedIds(); syncVendorMap(ids);
 const list=ids.map(id=>PENT[id]);
 document.getElementById('vendorSelectedCount').textContent=list.length;
 document.getElementById('vendorChips').innerHTML=list.slice(0,14).map(e=>`<span class="chip">${vendorShortType(e)} · ${e.location}</span>`).join('')+(list.length>14?`<span class="chip">+${list.length-14} more</span>`:'');
 const sums={};
 for(const e of list){
   const d=Number(e.diameter_mm);
   if(!sums[d])sums[d]={rods:0,kg:0};
   sums[d].rods+=Number(e.rods_12m||0);
   sums[d].kg+=Number(e.purchase_kg||0);
 }
 const dias=Object.keys(sums).map(Number).sort((a,b)=>a-b);
 const totalRods=dias.reduce((a,d)=>a+sums[d].rods,0);
 const totalKg=dias.reduce((a,d)=>a+sums[d].kg,0);
 document.getElementById('vendorTotalRods').textContent=totalRods;
 document.getElementById('vendorTotalKg').textContent=totalKg.toFixed(2);
 const has=list.length>0; document.getElementById('vendorEmpty').style.display=has?'none':'block'; document.getElementById('vendorResult').style.display=has?'block':'none';
 if(!has)return;
 document.getElementById('vendorOrderBody').innerHTML=dias.map(d=>`<tr><td><b>T${d}</b></td><td>12 m</td><td class="num">${sums[d].rods}</td><td>${muuthaText(d,sums[d].rods)}</td><td class="num">${sums[d].kg.toFixed(2)}</td></tr>`).join('');
 document.getElementById('vendorOrderFoot').innerHTML=`<tr><th colspan="2">TOTAL</th><th class="num">${totalRods}</th><th></th><th class="num">${totalKg.toFixed(2)}</th></tr>`;
 document.getElementById('vendorBreakBody').innerHTML=list.map(e=>`<tr><td>${vendorShortType(e)}</td><td>${e.location}</td><td>T${e.diameter_mm}</td><td class="num">${e.rods_12m}</td><td>${e.muutha_display}</td><td class="num">${Number(e.purchase_kg).toFixed(2)}</td></tr>`).join('');
 document.getElementById('vendorCutDetails').innerHTML=list.map(e=>`<div class="prov" style="margin:7px 0"><b>${vendorShortType(e)} · ${e.location} · T${e.diameter_mm}</b><br>${e.cut_schedule_text}<br>Independent order: ${e.rods_12m} × 12m = ${e.muutha_display} · ${Number(e.purchase_kg).toFixed(2)} kg</div>`).join('');
}

document.addEventListener('click',e=>{if(!e.target.closest('#pop')&&!e.target.closest('.rebarFoot'))closePop()});refreshSelector();refreshVendor();

const V03_GEOM_BY_ID={"FDN-IF2-A1":{"L":1.8,"W":1.8,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF2-C1":{"L":1.8,"W":1.8,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF2-F1":{"L":1.8,"W":1.8,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF3-G1":{"L":2.1,"W":2.1,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF1-H1":{"L":1.5,"W":1.5,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF1-A2":{"L":1.5,"W":1.5,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF2-C2":{"L":1.8,"W":1.8,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF3-E2":{"L":2.1,"W":2.1,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-CF1-01":{"L":4.0,"W":1.5,"D":0.5,"E":0.15,"U":2.1775,"UW":0.7},"FDN-IF1-B4":{"L":1.5,"W":1.5,"D":0.5,"E":0.2,"U":0.71,"UW":0.71},"FDN-IF2-C4":{"L":1.8,"W":1.8,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF3-E4":{"L":2.1,"W":2.1,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF4-G4":{"L":2.4,"W":2.4,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-CF1-02":{"L":4.0,"W":1.5,"D":0.5,"E":0.15,"U":2.1775,"UW":0.7},"FDN-IF1-B5":{"L":1.5,"W":1.5,"D":0.5,"E":0.2,"U":0.71,"UW":0.71},"FDN-IF1-C6":{"L":1.5,"W":1.5,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF2-F6":{"L":1.8,"W":1.8,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF3-G6":{"L":2.1,"W":2.1,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF2-H6":{"L":1.8,"W":1.8,"D":0.5,"E":0.2,"U":0.76,"UW":0.76},"FDN-IF1-D7":{"L":1.5,"W":1.5,"D":0.5,"E":0.2,"U":0.71,"UW":0.71},"FDN-IF1-E7":{"L":1.5,"W":1.5,"D":0.5,"E":0.2,"U":0.71,"UW":0.71}};
function dIds(){return [...document.querySelectorAll('.structureCheck:checked')].map(x=>x.value)}
function dSync(){let ids=dIds();document.querySelectorAll('.detailCheck').forEach(c=>c.checked=ids.includes(c.value));}
function detailPick(c){let t=document.querySelector('.structureCheck[value="'+c.value+'"]');if(t)t.checked=c.checked;refreshSelector();}
function detailSet(on){document.querySelectorAll('.structureCheck').forEach(c=>c.checked=on);refreshSelector();}
function rebarCounts(r){if(r.structure_type==='CF1')return {nx:r.longitudinal_bars_per_layer,ny:r.transverse_bars_per_layer,lx:r.longitudinal_piece_length_m,ly:r.transverse_piece_length_m};return {nx:r.bars_per_direction_per_layer,ny:r.bars_per_direction_per_layer,lx:r.piece_length_m,ly:r.piece_length_m};}
function rebarPlan(r){let g=V03_GEOM_BY_ID[r.structure_id],c=rebarCounts(r),max=Math.max(g.L,g.W),sx=235/max,w=g.L*sx,h=g.W*sx,x=(300-w)/2,y=(285-h)/2+10;let lines='';for(let i=0;i<c.nx;i++){let xx=x+(i+1)*w/(c.nx+1);lines+=`<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y+h}" class="rebarBot" stroke-width="1.3"/>`;}for(let i=0;i<c.ny;i++){let yy=y+(i+1)*h/(c.ny+1);lines+=`<line x1="${x}" y1="${yy}" x2="${x+w}" y2="${yy}" class="rebarTop" stroke-width="1.1"/>`;}return `<svg viewBox="0 0 300 330"><rect width="300" height="330" fill="white"/><text class="dtitle" x="10" y="18">Plan reinforcement · ${r.bar_spec}</text><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#334155" stroke-width="2"/>${lines}<text class="dsmall" x="10" y="298">Blue/Red distinguish the two orthogonal families for readability, not top/bottom.</text><text class="dsmall" x="10" y="314">Exact family counts shown: ${c.nx} × ${c.ny} per layer; top and bottom layers both apply. Pixel locations are schematic; @150 c/c schedule is authoritative.</text></svg>`}
function footingSectionShape(r){let g=V03_GEOM_BY_ID[r.structure_id],x0=28,x1=272,yb=220,yt=75,edgeY=yb-g.E/g.D*(yb-yt),plateRatio=Math.min(.82,(g.U||.76)/g.L),px0=150-(x1-x0)*plateRatio/2,px1=150+(x1-x0)*plateRatio/2;return {g,x0,x1,yb,yt,edgeY,px0,px1};}
function rebarSection(r){let s=footingSectionShape(r),d=r.bar_diameter_mm,scale=(s.yb-s.yt)/(s.g.D*1000),xscale=(s.x1-s.x0)/(s.g.L*1000),topY=s.yt+(r.cover_mm+d/2)*scale,botY=s.yb-(r.cover_mm+d/2)*scale,xL=s.x0+r.cover_mm*xscale,xR=s.x1-r.cover_mm*xscale,legMm=r.structure_type==='CF1'?50:100,leg=legMm*scale;let shape=`M ${s.x0} ${s.yb} L ${s.x0} ${s.edgeY} L ${s.px0} ${s.yt} L ${s.px1} ${s.yt} L ${s.x1} ${s.edgeY} L ${s.x1} ${s.yb} Z`;let topPath=`M ${xL} ${topY+leg} L ${xL} ${topY} L ${xR} ${topY} L ${xR} ${topY+leg}`,botPath=`M ${xL} ${botY-leg} L ${xL} ${botY} L ${xR} ${botY} L ${xR} ${botY-leg}`;return `<svg viewBox="0 0 300 300"><rect width="300" height="300" fill="white"/><text class="dtitle" x="10" y="18">Footing section · frozen working fabrication case</text><path d="${shape}" class="concreteDetail"/><path d="${topPath}" fill="none" class="rebarTop" stroke-width="4"/><path d="${botPath}" fill="none" class="rebarBot" stroke-width="4"/><text class="dsmall" x="12" y="244">Top + bottom T${d}; working cover ${r.cover_mm} mm; two 90° edge bends per bar.</text><text class="dsmall" x="12" y="259">Frozen/user-designated bend leg: ${legMm} mm (${r.structure_type==='CF1'?'Q10A CF1':'Q8C IF1–IF4'} working BBS).</text><text class="dsmall" x="12" y="274">STR-01 schedule says top & bottom; STR-02 typical section is visually simplified/conflicting.</text><text class="dsmall" x="12" y="289">Current UI follows the governed working BBS; quantities/cut lengths remain unchanged.</text></svg>`}
function rebarIso(r){let c=rebarCounts(r),n=Math.min(9,c.nx),m=Math.min(9,c.ny),lines='';for(let i=0;i<n;i++){let x=55+i*20;lines+=`<line x1="${x}" y1="190" x2="${x+55}" y2="145" class="rebarBot" stroke-width="2"/><line x1="${x}" y1="105" x2="${x+55}" y2="60" class="rebarTop" stroke-width="2"/>`;}for(let j=0;j<m;j++){let y=105+j*10;lines+=`<line x1="55" y1="${y}" x2="215" y2="${y+55}" class="rebarBot" stroke-width="1.4"/>`;}return `<svg viewBox="0 0 300 260"><rect width="300" height="260" fill="white"/><text class="dtitle" x="10" y="18">Mini isometric · top/bottom mats</text><polygon points="45,100 205,100 260,55 100,55" fill="#f8fafc" stroke="#94a3b8"/>${lines}<text class="dsmall" x="10" y="226">Simplified mat visualization; dense families are capped visually.</text><text class="dsmall" x="10" y="242">Exact counts, lengths and kg are listed in the table below.</text></svg>`}
function pieceRows(r){let c=rebarCounts(r),out=[];for(let layer of ['TOP','BOTTOM']){for(let i=1;i<=c.nx;i++)out.push([layer,'X/longitudinal',i,c.lx]);for(let i=1;i<=c.ny;i++)out.push([layer,'Y/transverse',i,c.ly]);}return out;}
function rebarCard(r){let c=rebarCounts(r),ps=pieceRows(r);return `<article class="detailCard"><div class="detailHead"><div><h3>${r.grid_ref} · ${r.structure_type}</h3><div style="font-size:12px;color:#64748b">${r.bar_spec} · source ${r.source_id}</div></div><div><span class="badge">${r.cover_mm} mm cover</span><span class="badge">${r.total_pieces} pieces</span><span class="badge">${r.installed_weight_kg.toFixed(3)} kg</span></div></div><div class="detailViews"><div class="detailBox"><h4>A · Plan</h4>${rebarPlan(r)}</div><div class="detailBox"><h4>B · Section</h4>${rebarSection(r)}</div><div class="detailBox"><h4>C · 2.5D</h4>${rebarIso(r)}</div></div><div class="detailTable"><table><thead><tr><th>Family</th><th>Per layer</th><th>Piece length</th><th>Total pieces</th></tr></thead><tbody><tr><td>X / longitudinal</td><td>${c.nx}</td><td>${c.lx.toFixed(3)} m</td><td>${c.nx*2}</td></tr><tr><td>Y / transverse</td><td>${c.ny}</td><td>${c.ly.toFixed(3)} m</td><td>${c.ny*2}</td></tr></tbody></table><details><summary>Individual-piece register (${ps.length} rows)</summary><div class="tablewrap"><table><thead><tr><th>Layer</th><th>Family</th><th>No.</th><th>Frozen cut length</th><th>Shape status</th></tr></thead><tbody>${ps.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3].toFixed(3)} m</td><td>Two 90° edge bends; frozen working bend geometry</td></tr>`).join('')}</tbody></table></div></details></div><div class="detailNote"><b>Boundary:</b> no per-selected-footing 12 m stock allocation. The 500 mm tapered body is context from the frozen RCC geometry source. The section now shows the frozen Q8C/Q10A edge-bend rule; reinforcement quantities stay governed by the V03 database.</div></article>`}
function renderDetail(){dSync();let root=document.getElementById('detailCards');if(!root)return;let ids=dIds();root.innerHTML=ids.length?ids.map(id=>rebarCard(rows[id])).join(''):'<div class="panel">Select one or more footings to inspect the top/bottom reinforcement in plan, section and 2.5D.</div>';}
const _v03RefreshSelector=refreshSelector;refreshSelector=function(){_v03RefreshSelector();renderDetail();};
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
 let ids=dIds(),set=new Set(ids);
 ['detailSpatialMapPanel','contextSpatialMapPanel'].forEach(pid=>{let p=document.getElementById(pid);if(p)p.classList.toggle('has-selection',ids.length>0);});
 ['detailMapMount','contextMapMount'].forEach(mid=>{let m=document.getElementById(mid);if(!m)return;m.querySelectorAll('.rebarFoot').forEach(e=>e.classList.toggle('selector-selected',set.has(e.dataset.id)));});
 let ds=document.getElementById('detailMapStatus'),cs=document.getElementById('contextMapStatus');if(ds)ds.textContent=ids.length?ids.length+' selected · click map or list to change':'0 selected';if(cs)cs.textContent=ids.length?ids.length+' selected · projected below':'0 selected';
}
function renderProjectContext(){let ids=dIds();let a=document.getElementById('ctxElevLetters'),b=document.getElementById('ctxElevNumbers');if(a)a.innerHTML=ctxElevationSvg(ids,'LETTER','V03');if(b)b.innerHTML=ctxElevationSvg(ids,'NUMBER','V03');let n=document.getElementById('contextStageNote');if(n)n.innerHTML="<b>V03 stage:</b> blue = bottom mat and red = top mat inside the footing. The current working project authority is IF1\u2013IF4 T12 @150 top & bottom both ways with Q8C bent ends, and CF1 T16 @150 top & bottom both ways with Q10A bent ends. This is a governed project working case, not a silent resolution of the STR-01/STR-02 source inconsistency.";}
mountBackfillSpatialMaps();
const _ctxRefresh=refreshSelector;refreshSelector=function(){_ctxRefresh();syncBackfillSpatialMaps();renderProjectContext();};
syncBackfillSpatialMaps();renderProjectContext();


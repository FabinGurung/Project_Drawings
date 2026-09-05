const rows=window.__STAGE_DATA__;

 const DB_SHA='0aac3c0d67d84ec9d6aa8805e8a40534145cf9d9dc6bd2181c96abeffe00ab08';
function showPage(id,btn){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById('page-'+id).classList.add('active');document.querySelectorAll('.tabbtn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});refresh();}
function selectedIds(){return [...document.querySelectorAll('.selcheck:checked')].map(x=>x.value)}
function setAll(v){document.querySelectorAll('.selcheck').forEach(x=>x.checked=v);refresh()}function setType(t){document.querySelectorAll('.selcheck').forEach(x=>x.checked=rows[x.value].column_type===t);refresh()}
function toggleFromMap(el){let id=el.dataset.id;let cb=document.querySelector('.selcheck[value="'+id+'"]');if(cb){cb.checked=!cb.checked;refresh();}let r=rows[id];document.getElementById('detail').innerHTML='<b>'+r.column_type+' / '+r.grid_ref+'</b> · '+r.support_class+' · '+r.section+' · '+r.reinforcement+'<br><br>'+r.longitudinal_pieces.map(p=>'Group '+p.group+': T'+p.dia_mm+' × '+p.pieces+' @ '+p.cut_mm+' mm').join('<br>')+'<br>T8 lap-zone sets: '+r.lap_zone_t8.sets+' ('+r.lap_zone_t8.set_detail+')<br><b>Total installed steel: '+r.total_installed_kg.toFixed(3)+' kg</b>';}
function refreshMaps(ids){document.querySelectorAll('.mapwrap').forEach(w=>w.classList.toggle('has-selection',ids.length>0));document.querySelectorAll('.m50node').forEach(n=>n.classList.toggle('selectedMap',ids.includes(n.dataset.id)));}
function refresh(){let ids=selectedIds();refreshMaps(ids);let agg={};let cuts={};let kg=0;ids.forEach(id=>{let r=rows[id];kg+=r.total_installed_kg;Object.entries(r.dia_summary).forEach(([d,v])=>{agg[d]??={pieces:0,m:0,kg:0};agg[d].pieces+=v.pieces;agg[d].m+=v.fabrication_m;agg[d].kg+=v.installed_kg});r.longitudinal_pieces.forEach(p=>{let k='T'+p.dia_mm+'|'+p.cut_mm+' mm';cuts[k]??={dia:p.dia_mm,label:p.cut_mm+' mm',count:0,m:0};cuts[k].count+=p.pieces;cuts[k].m+=p.fabrication_m});let t=r.lap_zone_t8;let k='T8|'+t.set_detail;cuts[k]??={dia:8,label:t.set_detail,count:0,m:0,sets:true};cuts[k].count+=t.sets;cuts[k].m+=t.fabrication_m;});let stats=document.getElementById('selStats');if(stats)stats.innerHTML='<div class="stat"><b>'+ids.length+'</b><span>supports</span></div><div class="stat"><b>'+kg.toFixed(3)+'</b><span>installed kg</span></div>';let body=document.getElementById('selBody');if(body)body.innerHTML=Object.keys(agg).sort((a,b)=>a-b).map(d=>'<tr><td>T'+d+'</td><td>'+agg[d].pieces+'</td><td>'+agg[d].m.toFixed(3)+'</td><td>'+agg[d].kg.toFixed(3)+'</td></tr>').join('');let chips=document.getElementById('chips');if(chips)chips.innerHTML=ids.length?ids.map(id=>'<span style="display:inline-block;padding:5px 8px;margin:3px;border-radius:999px;background:#dbeafe;font-size:11px">'+rows[id].grid_ref+' '+rows[id].column_type+'</span>').join(''):'<span style="color:#64748b;font-size:12px">No supports selected.</span>';let ob=document.getElementById('orderBody');if(ob)ob.innerHTML=Object.values(cuts).sort((a,b)=>a.dia-b.dia||String(a.label).localeCompare(String(b.label))).map(x=>'<tr><td>T'+x.dia+'</td><td>'+x.label+'</td><td>'+x.count+(x.sets?' sets':' pcs')+'</td><td>'+x.m.toFixed(3)+'</td></tr>').join('');let ok=document.getElementById('orderKg');if(ok)ok.innerHTML='<b>Selected installed steel:</b> '+kg.toFixed(3)+' kg · DB SHA-256 '+DB_SHA.slice(0,12)+'…';renderDetailExplorer(ids);}

function setSupportSelected(id,v){let cb=document.querySelector('.selcheck[value="'+id+'"]');if(cb)cb.checked=v;refresh();}
function syncDetailChecks(ids){document.querySelectorAll('.detailcheck').forEach(c=>c.checked=ids.includes(c.value));}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function lapMm(d){return 60*Number(d)}
function footingRun(r){return r.support_class==='CF1'?2015:1990}
function barPieces(r){
  let out=[];
  r.longitudinal_pieces.forEach(p=>{
    let posClass=r.column_type==='C2'?(p.dia_mm===20?'CORNER_SET (NE/NW/SW/SE)':'MID_FACE_SET (N/W/S/E)'):'PERIMETER';
    for(let n=1;n<=p.pieces;n++) out.push({
      mark:p.group+'-T'+p.dia_mm+'-'+String(n).padStart(2,'0'),
      kind:'Longitudinal starter',group:p.group,dia:p.dia_mm,cut:p.cut_mm,
      shape:'90° footing-base L-bar',zone:'Group '+p.group+' lap',
      position:posClass,
      note:r.column_type==='C2'?'Diameter position class code-backed; exact Group A/B-to-specific perimeter point not project-frozen.':'60Ø lap'
    });
  });
  let t=r.lap_zone_t8;let half=Math.floor(t.sets/2);
  if(t.mode==='rectangular'){
    for(let z=0;z<2;z++){let g=z===0?'A':'B';
      for(let n=1;n<=half;n++){
        out.push({mark:'T8-'+g+'-OH-'+String(n).padStart(2,'0'),kind:'Lap-zone outer hoop',group:g,dia:8,cut:1425,shape:'Rectangular hoop',zone:'Lap '+g,position:'COLUMN CAGE',note:'≤100 mm c/c'});
        out.push({mark:'T8-'+g+'-CT-'+String(n).padStart(2,'0'),kind:'Lap-zone crosstie',group:g,dia:8,cut:475,shape:'Crosstie',zone:'Lap '+g,position:'COLUMN CAGE',note:'≤100 mm c/c'});
      }
    }
  } else {
    for(let z=0;z<2;z++){let g=z===0?'A':'B';for(let n=1;n<=half;n++)out.push({mark:'T8-'+g+'-C-'+String(n).padStart(2,'0'),kind:'Circular lap tie',group:g,dia:8,cut:1000,shape:'Circular tie',zone:'Lap '+g,position:'COLUMN CAGE',note:'≤100 mm c/c'});}
  }
  return out;
}
function longitudinalSVG(r){
  const W=380,H=580, top=28,bottom=542; const zmin=-footingRun(r)-260,zmax=5550; const sy=z=>bottom-(z-zmin)/(zmax-zmin)*(bottom-top);
  const pl=sy(0), fb=sy(-footingRun(r)); const cx=190,colW=r.section.includes('350')?56:64; const xL=cx-colW/2,xR=cx+colW/2;
  let bars=''; let locs=[xL+7,xL+19,cx-6,cx+6,xR-19,xR-7,cx-18,cx+18];
  let pieces=[];r.longitudinal_pieces.forEach(p=>{for(let n=0;n<p.pieces;n++){let lap=lapMm(p.dia_mm),center=p.group==='A'?r.group_A_center_above_plinth_mm:r.group_B_center_above_plinth_mm;pieces.push({group:p.group,dia:p.dia_mm,cut:p.cut_mm,center,lap,lapBottom:center-lap/2,lapTop:center+lap/2});}});
  pieces.forEach((p,idx)=>{let x=locs[idx%locs.length], yEnd=sy(p.lapTop), yCont=sy(p.lapBottom), leg=Math.max(60*p.dia,500), legpx=Math.min(60,leg/25);let cls=p.group==='A'?'pieceA':'pieceB';let dash=p.group==='B'?' dbarB':'';
    bars+=`<path class="dbar ${cls}${dash}" d="M ${x-legpx} ${fb} L ${x} ${fb} L ${x} ${yEnd}"/><circle class="${cls}" cx="${x}" cy="${yEnd}" r="3"/><line x1="${x}" y1="${yCont}" x2="${x}" y2="${sy(5450)}" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="5 4" opacity=".72"/><text class="dsmall" x="${x+4}" y="${yEnd-3}">${p.group} T${p.dia} · end +${Math.round(p.lapTop)}</text>`;
  });
  let dias=[...new Set(r.longitudinal_pieces.map(p=>p.dia_mm))], maxLap=Math.max(...dias.map(lapMm));
  function ties(center,group){let lap=maxLap,n=Math.ceil(lap/100)+1,y1=sy(center+lap/2),y2=sy(center-lap/2),out=`<rect x="${xL-5}" y="${y1}" width="${colW+10}" height="${Math.max(2,y2-y1)}" class="${group==='A'?'lapbandA':'lapbandB'}"/>`;for(let q=0;q<n;q++){let yy=y1+(y2-y1)*(n===1?0:q/(n-1));out+=`<line class="tie8" stroke-width="1.6" x1="${xL-3}" x2="${xR+3}" y1="${yy}" y2="${yy}"/>`;}out+=`<text class="dsmall" x="${xR+12}" y="${(y1+y2)/2}">Lap ${group}: ${n} T8 levels / ${lap} mm controlling zone</text>`;return out;}
  let mixNote=r.column_type==='C2'?'<text class="dsmall" x="15" y="567">C2: T20 corners + T16 mid-faces (NBC 205:2024 code-backed); A/B-to-specific perimeter point remains project-unspecified.</text>':'';
  return `<svg viewBox="0 0 ${W} ${H}" aria-label="Longitudinal section ${r.grid_ref}"><rect width="100%" height="100%" fill="white"/><text class="dtitle" x="14" y="18">Longitudinal section · ${r.grid_ref} / ${r.column_type}</text><rect class="pccctx" x="80" y="${fb+42}" width="220" height="18"/><text class="dsmall" x="304" y="${fb+55}">PCC context</text><rect class="concrete" x="58" y="${fb-18}" width="264" height="60"/><text class="dsmall" x="62" y="${fb-25}">Footing body context (stage context; section shape schematic)</text><rect x="${xL}" y="${sy(5450)}" width="${colW}" height="${pl-sy(5450)}" fill="#f8fafc" stroke="#94a3b8"/><line class="dimline" x1="42" x2="338" y1="${pl}" y2="${pl}"/><text class="dlabel" x="14" y="${pl-4}">PLINTH 0</text><line class="dimline" x1="42" x2="338" y1="${fb}" y2="${fb}"/><text class="dlabel" x="14" y="${fb-4}">FOOTING BASE −${footingRun(r)} mm</text>${ties(r.group_A_center_above_plinth_mm,'A')}${ties(r.group_B_center_above_plinth_mm,'B')}${bars}<text class="dsmall" x="14" y="36">Blue = Group A first-lift bars · Red dashed = Group B · gray dashed = future continuation context (NOT in M50 order).</text><text class="dsmall" x="14" y="51">Each first-lift bar terminates at the TOP of its own 60Ø lap interval. Bottom leg = max(60Ø, 500 mm); bend deduction 2d already in frozen cut length.</text><text class="dsmall" x="14" y="66">Bar x-offsets are separated for readability only; they do not assign A/B to compass/perimeter positions.</text>${mixNote}</svg>`;
}
function sectionGeometry(r){
  const cx=180,cy=160;
  if(r.section.includes('Ø')){
    const D=350, Rpx=115, scale=Rpx/(D/2), tieR=(D/2-40-4)*scale, barDia=12, barR=(D/2-40-8-barDia/2)*scale;
    let pts=[];for(let k=0;k<8;k++){let a=-Math.PI/2+k*Math.PI/4;pts.push([cx+barR*Math.cos(a),cy+barR*Math.sin(a)]);}return {circ:true,pts,outerR:Rpx,tieR,scale};
  }
  const x0=50,y0=30,side=260,scale=side/400;
  const uniform=r.column_type!=='C2', ud=uniform?r.longitudinal_pieces[0].dia_mm:null;
  function off(d){return (40+8+d/2)*scale;}
  const c20=off(20),c16=off(16),u=off(ud||16),x1=x0+side,y1=y0+side;
  let pts;
  if(r.column_type==='C2') pts=[[x0+c20,y0+c20],[cx,y0+c16],[x1-c20,y0+c20],[x1-c16,cy],[x1-c20,y1-c20],[cx,y1-c16],[x0+c20,y1-c20],[x0+c16,cy]];
  else pts=[[x0+u,y0+u],[cx,y0+u],[x1-u,y0+u],[x1-u,cy],[x1-u,y1-u],[cx,y1-u],[x0+u,y1-u],[x0+u,cy]];
  return {circ:false,pts,x0,y0,side,scale,tieInset:(40+4)*scale};
}
function crossSVG(r){
  let sp=sectionGeometry(r), marks='';
  let uniform=r.column_type!=='C2'; let dia=uniform?r.longitudinal_pieces[0].dia_mm:null;
  const c2Labels=['T20','T16','T20','T16','T20','T16','T20','T16'];
  sp.pts.forEach((p,k)=>{let lab=uniform?'T'+dia:c2Labels[k];let is20=!uniform&&lab==='T20';let fill=uniform?'#2563eb':(is20?'#b45309':'#2563eb');let rr=uniform?8:(is20?9:7);marks+=`<circle cx="${p[0]}" cy="${p[1]}" r="${rr}" fill="${fill}" stroke="white" stroke-width="2"/><text x="${p[0]}" y="${p[1]+3}" text-anchor="middle" style="font:700 7px Arial;fill:white">${lab}</text>`;});
  let shape,noteTie;
  if(sp.circ){shape=`<circle cx="180" cy="160" r="${sp.outerR}" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><circle cx="180" cy="160" r="${sp.tieR}" class="tie8" stroke-width="3"/>`;noteTie='C4: circular closed T8 tie; longitudinal bar centres are inside the tie line using 40 mm clear cover.';}
  else {let ti=sp.tieInset,tx=sp.x0+ti,ty=sp.y0+ti,ts=sp.side-2*ti;shape=`<rect x="${sp.x0}" y="${sp.y0}" width="${sp.side}" height="${sp.side}" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><rect x="${tx}" y="${ty}" width="${ts}" height="${ts}" class="tie8" stroke-width="3"/><line x1="${tx}" y1="160" x2="${tx+ts}" y2="160" class="tie8" stroke-width="3"/><path d="M ${tx+4} 160 l 10 -8 M ${tx+ts-4} 160 l -10 8" class="tie8" stroke-width="2"/>`;noteTie='C1–C3: frozen 4-legged T8 set = perimeter hoop + one 475 mm crosstie. Crosstie compass orientation is schematic because the project source does not freeze that orientation.';}
  let note=r.column_type==='C2'?'C2 diameter placement: T20 at four corners; T16 at four intermediate face positions (NBC 205:2024 Table 8.1 pattern).':`All 8 longitudinal positions = T${dia}.`;
  let note2=r.column_type==='C2'?'Project schedule freezes 4T20+4T16; NBC supplies the diameter-position pattern. Exact A/B stagger assignment remains unassigned.':'Bar-centre offsets use 40 mm clear cover + T8 tie + half longitudinal-bar diameter.';
  return `<svg viewBox="0 0 360 370" aria-label="Cross section ${r.grid_ref}"><rect width="100%" height="100%" fill="white"/><text class="dtitle" x="14" y="18">Cross section · ${r.section} · ${r.reinforcement}</text>${shape}${marks}<text class="dsmall" x="14" y="308">40 mm clear cover · T8 confinement · geometry scaled from the frozen section size.</text><text class="dsmall" x="14" y="324">${esc(note)}</text><text class="dsmall" x="14" y="340">${esc(note2)}</text><text class="dsmall" x="14" y="356">${esc(noteTie)}</text></svg>`;
}
function isoSVG(r){
  let sp=sectionGeometry(r), topPts=sp.pts.map(([x,y])=>[x+45,y-35]), lines='';
  const c2Dias=[20,16,20,16,20,16,20,16];
  sp.pts.forEach((p,k)=>{let q=topPts[k];if(r.column_type==='C2'){let d=c2Dias[k],col=d===20?'#b45309':'#2563eb',sw=d===20?4.2:3;lines+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]-95}" stroke="${col}" stroke-width="${sw}"/><text class="dsmall" x="${q[0]+3}" y="${q[1]-97}">T${d}</text>`;}else{let cls=k%2===0?'pieceA':'pieceB';lines+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]-95}" class="${cls}" stroke-width="3" ${k%2?'stroke-dasharray="7 4"':''}/>`;}});
  let base;
  if(sp.circ) base=`<ellipse cx="180" cy="210" rx="110" ry="52" fill="#f8fafc" stroke="#64748b"/><ellipse cx="225" cy="80" rx="92" ry="43" fill="none" class="tie8" stroke-width="2.5"/>`;
  else base=`<polygon points="65,105 270,105 315,70 110,70" fill="#f8fafc" stroke="#64748b"/><polygon points="65,105 65,260 270,260 270,105" fill="#f8fafc" stroke="#64748b" opacity=".28"/><polyline points="80,120 255,120 300,85 125,85 80,120" fill="none" class="tie8" stroke-width="2.5"/><polyline points="80,170 255,170 300,135 125,135 80,170" fill="none" class="tie8" stroke-width="2"/><line x1="80" y1="145" x2="255" y2="145" class="tie8" stroke-width="2"/><line x1="125" y1="110" x2="300" y2="110" class="tie8" stroke-width="2"/>`;
  let note=r.column_type==='C2'?'C2: ochre T20 corners; blue T16 mid-faces. Diameter placement code-backed; A/B stagger not assigned here.':'8 longitudinal bars; rectangular cages include the frozen perimeter-hoop + crosstie set.';
  return `<svg viewBox="0 0 360 330" aria-label="Mini isometric ${r.grid_ref}"><rect width="100%" height="100%" fill="white"/><text class="dtitle" x="14" y="18">Mini isometric / 2.5D cage</text>${base}${lines}<text class="dsmall" x="14" y="304">${esc(note)}</text><text class="dsmall" x="14" y="319">Visual comprehension aid; dimensions/cut lengths remain controlled by the frozen BBS table.</text></svg>`;
}
function summaryRows(r){let out=r.longitudinal_pieces.map(p=>`<tr><td>${p.group}</td><td>Longitudinal starter</td><td>T${p.dia_mm}</td><td>${p.pieces}</td><td class="num">${p.cut_mm}</td><td class="num">${p.fabrication_m.toFixed(3)}</td><td class="num">${p.installed_kg.toFixed(3)}</td></tr>`).join('');let t=r.lap_zone_t8;out+=`<tr><td>A+B</td><td>Lap-zone T8 sets</td><td>T8</td><td>${t.sets} sets</td><td>${esc(t.set_detail)}</td><td class="num">${t.fabrication_m.toFixed(3)}</td><td class="num">${t.installed_kg.toFixed(3)}</td></tr>`;return out;}
function granularRows(r){return barPieces(r).map(p=>`<tr><td>${p.mark}</td><td>${p.kind}</td><td>${p.group}</td><td>T${p.dia}</td><td class="num">${p.cut}</td><td>${p.shape}</td><td>${p.position||''}</td><td>${p.zone}</td><td>${p.note}</td></tr>`).join('');}
function detailCard(r,mode){let showLong=mode==='combined'||mode==='long',showCross=mode==='combined'||mode==='cross',showIso=mode==='combined'||mode==='iso';let views=`<div class="detailViews">${showLong?`<div class="viewBox"><h4>A · Longitudinal section</h4>${longitudinalSVG(r)}</div>`:''}${showCross?`<div class="viewBox"><h4>B · Cross section</h4>${crossSVG(r)}</div>`:''}${showIso?`<div class="viewBox isoBox"><h4>C · Mini isometric</h4>${isoSVG(r)}</div>`:''}</div>`;let c2=r.column_type==='C2'?'<div class="detailNote"><b>C2 mixed-bar placement validated as code-backed detail:</b> project authority freezes 400×400 and 4T20+4T16; NBC 205:2024 mixed eight-bar detailing pattern places the larger bars at the four corners and smaller bars at the four intermediate face positions. Therefore this view shows T20 corners + T16 mid-faces with provenance <b>CODE_BACKED_DETAILING_PATTERN</b>. Exact Group A/B stagger-to-specific corner/face remains intentionally unassigned because the project source does not freeze it.</div>':'';return `<article class="detailCard"><div class="detailHead"><div><h3>${r.grid_ref} · ${r.column_type}</h3><div style="font-size:12px;color:#64748b">${r.support_class} support · ${r.section} · ${r.reinforcement}</div></div><div class="badges"><span class="badge">${r.qa_column_mapping}</span><span class="badge">60Ø lap</span><span class="badge">T8 ≤100 mm in lap zone</span><span class="badge">${r.total_installed_kg.toFixed(3)} kg</span></div></div>${views}${c2}<div class="detailTable"><h4 style="margin:12px 0 6px">Granular BBS / cut-length summary</h4><div class="tablewrap"><table><thead><tr><th>Group</th><th>Bar item</th><th>Dia</th><th>Qty</th><th>Cut / detail mm</th><th class="num">Fab. m</th><th class="num">kg</th></tr></thead><tbody>${summaryRows(r)}</tbody></table></div><details class="granular"><summary>Show every individual fabricated piece (${barPieces(r).length} rows)</summary><div class="tablewrap"><table><thead><tr><th>Piece mark</th><th>Item</th><th>Group</th><th>Dia</th><th class="num">Cut mm</th><th>Shape</th><th>Position class</th><th>Zone</th><th>Note</th></tr></thead><tbody>${granularRows(r)}</tbody></table></div></details></div><div class="dbnote"><b>Source chain:</b> frozen first-lift BBS v0.3 + QA-COLTYPE-001 + M50 spatial DB ${DB_SHA.slice(0,12)}… · support label ${r.source_label_handle}. This detail page does not perform engineering redesign or selection-specific stock optimization. C2 diameter placement uses the registered code-backed detailing provenance record.</div></article>`;}
function renderDetailExplorer(ids){syncDetailChecks(ids);let c=document.getElementById('detailCount');if(c)c.textContent=ids.length+' selected support'+(ids.length===1?'':'s');let root=document.getElementById('detailCards');if(!root)return;let mode=(document.getElementById('detailMode')||{}).value||'combined';if(!ids.length){root.innerHTML='<div class="panel empty">Select one or more structures from the left list (or Page 2). Each selected structure will receive its own longitudinal section, cross section, mini-isometric and granular piece register.</div>';return;}root.innerHTML=ids.map(id=>detailCard(rows[id],mode)).join('');}

refresh();


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
 const src=document.querySelector('#map-selector');if(!src)return;
 [['detailMapMount','detail-map-clone'],['contextMapMount','context-map-clone']].forEach(([mid,rid])=>{let m=document.getElementById(mid);if(!m||m.querySelector('svg'))return;let c=src.cloneNode(true);c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));c.setAttribute('id',rid);m.appendChild(c);});
}
function syncBackfillSpatialMaps(){
 let ids=selectedIds(),set=new Set(ids);
 ['detailSpatialMapPanel','contextSpatialMapPanel'].forEach(pid=>{let p=document.getElementById(pid);if(p)p.classList.toggle('has-selection',ids.length>0);});
 ['detailMapMount','contextMapMount'].forEach(mid=>{let m=document.getElementById(mid);if(!m)return;m.querySelectorAll('.m50node').forEach(e=>e.classList.toggle('selectedMap',set.has(e.dataset.id)));});
 let ds=document.getElementById('detailMapStatus'),cs=document.getElementById('contextMapStatus');if(ds)ds.textContent=ids.length?ids.length+' selected · click map or list to change':'0 selected';if(cs)cs.textContent=ids.length?ids.length+' selected · projected below':'0 selected';
}
function renderProjectContext(){let ids=selectedIds();let a=document.getElementById('ctxElevLetters'),b=document.getElementById('ctxElevNumbers');if(a)a.innerHTML=ctxElevationSvg(ids,'LETTER','M50');if(b)b.innerHTML=ctxElevationSvg(ids,'NUMBER','M50');let n=document.getElementById('contextStageNote');if(n)n.innerHTML="<b>M50 stage:</b> the elevation makes the transition role explicit: bars begin with the footing-base anchorage, pass through plinth level, and terminate at the tops of their two staggered 60\u00d8 lap zones. Blue represents Group A and purple Group B. The full local section/BBS in Page 4 remains the fabrication-oriented authority; this page is the project-location/elevation explanation.";}
mountBackfillSpatialMaps();
const _ctxRefresh=refresh;refresh=function(){_ctxRefresh();syncBackfillSpatialMaps();renderProjectContext();};
syncBackfillSpatialMaps();renderProjectContext();


(async()=>{
  const b=document.body;
  const dataUrl=b.dataset.stageData||'stage-data.json';
  const scriptUrl=b.dataset.stageScript||'stage.js';
  const embedId=b.dataset.stageEmbedId||'';
  const state=document.getElementById('module-load-state');
  try{
    const r=await fetch(dataUrl,{cache:'no-store'});
    if(!r.ok) throw new Error(`data HTTP ${r.status}`);
    const data=await r.json();
    window.__STAGE_DATA__=data;
    if(embedId){const s=document.createElement('script');s.type='application/json';s.id=embedId;s.textContent=JSON.stringify(data);document.body.appendChild(s);}
    const js=document.createElement('script');js.src=scriptUrl;js.defer=false;js.onload=()=>{if(state)state.textContent='Module loaded';};js.onerror=()=>{throw new Error('stage.js load failed');};document.body.appendChild(js);
  }catch(err){console.error(err);if(state){state.textContent='Module load failed: '+err.message;state.classList.add('error');}}
})();

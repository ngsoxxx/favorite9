const $=s=>document.querySelector(s);let mode,state,current;
const LOVE_K=1.8,BOTH_BASE=5,BOTH_LOVE=12;
const show=id=>{document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');scrollTo(0,0)};
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
function start(m){mode=m;state={idols:IDOLS.map(x=>({...x,score:1500,games:0})),history:[],n:0,target:m==='quick'?100:200};show('#sort');next()}
function key(a,b){return[a.id,b.id].sort().join('|')}
function elo(a,b,out,strength=1){const k=(mode==='quick'?28:20)*strength,e=1/(1+10**((b.score-a.score)/400));a.score+=k*(out-e);b.score+=k*((1-out)-(1-e));a.games++;b.games++}
function pick(){
  let recent=new Set(state.history.slice(-18).map(h=>key(h.a,h.b)));
  // 出演回数が少ない人を優先してプールを作る（一部だけ全く出ない偏りを防止）
  let minGames=Math.min(...state.idols.map(x=>x.games));
  let pool=state.idols.filter(x=>x.games<=minGames+1);
  if(pool.length<2)pool=state.idols;
  let c=[];
  for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++){
    let a=pool[i],b=pool[j];
    if(recent.has(key(a,b)))continue;
    c.push({a,b,d:Math.abs(a.score-b.score)+Math.random()*120});
  }
  c.sort((x,y)=>x.d-y.d);
  return c[0]||(()=>{let s=shuffle(pool.length>=2?pool:state.idols);return{a:s[0],b:s[1]}})();
}
function next(){if(state.n>=state.target)return finish();current=pick();render()}
function render(){let a=current.a,b=current.b;$('#li').src=a.image;$('#ri').src=b.image;$('#lg').textContent=a.group;$('#rg').textContent=b.group;$('#ln').textContent=a.name;$('#rn').textContent=b.name;$('#mode').textContent=mode==='quick'?'QUICK SORT':'STANDARD SORT';$('#count').textContent=`${state.n} / ${state.target}`;$('#bar').style.width=`${state.n/state.target*100}%`;$('#back').disabled=!state.history.length}
function choose(t){let a=current.a,b=current.b;snapshot=state.idols.map(x=>({id:x.id,score:x.score,games:x.games}));state.history.push({a:a.id,b:b.id,t,snapshot});if(t==='l')elo(a,b,1,1);else if(t==='lv')elo(a,b,1,LOVE_K);else if(t==='r')elo(a,b,0,1);else if(t==='rv')elo(a,b,0,LOVE_K);else if(t==='b'){a.score+=BOTH_BASE;b.score+=BOTH_BASE;a.games++;b.games++}else if(t==='bl'){a.score+=BOTH_LOVE;b.score+=BOTH_LOVE;a.games++;b.games++}state.n++;next()}
function undo(){let h=state.history.pop();if(!h)return;state.idols.forEach(x=>{let s=h.snapshot.find(y=>y.id===x.id);x.score=s.score;x.games=s.games});state.n--;current={a:state.idols.find(x=>x.id===h.a),b:state.idols.find(x=>x.id===h.b)};render()}
function finish(){let top=[...state.idols].sort((a,b)=>b.score-a.score).slice(0,9);$('#resultMode').textContent=`${mode==='quick'?'QUICK SORT':'STANDARD SORT'}  /  ${state.n} COMPARISONS`;$('#grid').innerHTML=top.map((x,i)=>`<article class="card"><div class="rank">${String(i+1).padStart(2,'0')}</div><img src="${x.image}" alt=""><div class="meta"><small>${esc(x.group)}</small><strong>${esc(x.name)}</strong></div></article>`).join('');show('#result')}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function save(){let top=[...state.idols].sort((a,b)=>b.score-a.score).slice(0,9),c=$('#canvas'),ctx=c.getContext('2d'),W=1200,H=1500;c.width=W;c.height=H;ctx.fillStyle='#09090b';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f4f4f5';ctx.font='800 74px Arial';ctx.fillText('FAVORITE 9',70,110);ctx.fillStyle='#77777e';ctx.font='700 18px Arial';ctx.fillText(mode==='quick'?'QUICK SORT':'STANDARD SORT',72,145);let loaded=0,gap=24,cw=(W-gap*4)/3;top.forEach((x,i)=>{let im=new Image();im.onload=()=>{let col=i%3,row=Math.floor(i/3),x0=gap+col*(cw+gap),y0=200+row*430;ctx.drawImage(im,x0,y0,cw,300);ctx.fillStyle='#77777e';ctx.font='14px Arial';ctx.fillText(String(i+1).padStart(2,'0'),x0+14,y0+325);ctx.fillText(x.group,x0+50,y0+325);ctx.fillStyle='#f4f4f5';ctx.font='700 20px Arial';ctx.fillText(x.name,x0+14,y0+357);if(++loaded===top.length){let a=document.createElement('a');a.download='favorite9-result.png';a.href=c.toDataURL('image/png');a.click()}};im.src=x.image})}
document.querySelectorAll('.mode').forEach(x=>x.onclick=()=>start(x.dataset.mode));$('#left').onclick=$('#ll').onclick=()=>choose('l');$('#right').onclick=$('#rl').onclick=()=>choose('r');$('#lv').onclick=()=>choose('lv');$('#rv').onclick=()=>choose('rv');$('#both').onclick=()=>choose('b');$('#bothlove').onclick=()=>choose('bl');$('#skip').onclick=()=>choose('s');$('#back').onclick=undo;$('#restart').onclick=()=>{if(confirm('最初からやり直しますか？'))start(mode)};$('#again').onclick=()=>show('#home');$('#save').onclick=save;document.onkeydown=e=>{if(!$('#sort').classList.contains('active'))return;if(e.key==='ArrowLeft')choose(e.shiftKey?'lv':'l');if(e.key==='ArrowRight')choose(e.shiftKey?'rv':'r');if(e.key==='ArrowDown')choose(e.shiftKey?'bl':'b');if(e.key==='Escape')choose('s');if(e.key==='Backspace')undo()};

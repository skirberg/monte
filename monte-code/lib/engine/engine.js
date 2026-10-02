// @ts-nocheck
/* eslint-disable */
// Study engine carried verbatim from the Sigma Sandbox artifact: math, generators, labs, solvers.
// Wrapped as boot(DATA) so the Next.js page can mount it once after the markup is in the DOM.
export function boot(DATA){

'use strict';

var TOPICS = DATA.topics, K = DATA.K, PERSONAL = DATA.personal;
var byId = {}; TOPICS.forEach(function(t){ byId[t.id] = t; });
var $ = function(id){ return document.getElementById(id); };
var NS = 'http://www.w3.org/2000/svg';

// ---------- math helpers
function erf(x){var s=x<0?-1:1;x=Math.abs(x);var t=1/(1+.3275911*x);var y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return s*y;}
function Phi(z){return .5*(1+erf(z/Math.SQRT2));}
function PhiInv(p){var lo=-6,hi=6;for(var i=0;i<60;i++){var m=(lo+hi)/2;if(Phi(m)<p)lo=m;else hi=m;}return (lo+hi)/2;}
function fact(n){var r=1;for(var i=2;i<=n;i++)r*=i;return r;}
function choose(n,k){if(k<0||k>n)return 0;var r=1;for(var i=1;i<=k;i++)r=r*(n-k+i)/i;return r;}
function binom(k,n,p){return choose(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);}
function pois(k,l){return Math.exp(-l)*Math.pow(l,k)/fact(k);}
var T={1:{90:6.314,95:12.706,99:63.657},2:{90:2.920,95:4.303,99:9.925},3:{90:2.353,95:3.182,99:5.841},4:{90:2.132,95:2.776,99:4.604},5:{90:2.015,95:2.571,99:4.032},6:{90:1.943,95:2.447,99:3.707},7:{90:1.895,95:2.365,99:3.499},8:{90:1.860,95:2.306,99:3.355},9:{90:1.833,95:2.262,99:3.250},10:{90:1.812,95:2.228,99:3.169},11:{90:1.796,95:2.201,99:3.106},12:{90:1.782,95:2.179,99:3.055},13:{90:1.771,95:2.160,99:3.012},14:{90:1.761,95:2.145,99:2.977},15:{90:1.753,95:2.131,99:2.947},16:{90:1.746,95:2.120,99:2.921},17:{90:1.740,95:2.110,99:2.898},18:{90:1.734,95:2.101,99:2.878},19:{90:1.729,95:2.093,99:2.861},20:{90:1.725,95:2.086,99:2.845},24:{90:1.711,95:2.064,99:2.797},29:{90:1.699,95:2.045,99:2.756},30:{90:1.697,95:2.042,99:2.750},40:{90:1.684,95:2.021,99:2.704},60:{90:1.671,95:2.000,99:2.660},120:{90:1.658,95:1.980,99:2.617}};
function tcrit(df,conf){if(df>120)return {90:1.645,95:1.96,99:2.576}[conf];var keys=Object.keys(T).map(Number).sort(function(a,b){return a-b;});var best=keys[0];keys.forEach(function(k){if(k<=df)best=k;});return T[best][conf];}
var Z={90:1.645,95:1.96,99:2.576};
function mean(a){return a.reduce(function(s,x){return s+x;},0)/a.length;}
function sd(a){var m=mean(a);return Math.sqrt(a.reduce(function(s,x){return s+(x-m)*(x-m);},0)/(a.length-1));}
function median(a){var b=a.slice().sort(function(x,y){return x-y;});var n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;}
function r2(x){return Math.round(x*100)/100;} function r3(x){return Math.round(x*1000)/1000;} function r4(x){return Math.round(x*10000)/10000;}
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function fmt(x){return (Math.round(x*10000)/10000).toString();}
function gauss(){var u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function strip(s){return String(s).replace(/<[^>]+>/g,' ');}
function pct(x){return Math.round(x*100)+'%';}
function plural(n,w){return n+' '+(n===1?w:(/(ch|sh|s|x)$/.test(w)?w+'es':w+'s'));}
function icon(id){return '<svg aria-hidden="true"><use href="#'+id+'"/></svg>';}
function mt(s){return String(s).replace(/(^|[\s(,=\[])-(?=\d)/g,'$1\u2212');}

// ---------- storage
var S={drill:{},due:[],streak:{last:null,count:0},mock:0,hw:{},math:{}};
try{var raw=localStorage.getItem('sigma');if(raw)S=Object.assign(S,JSON.parse(raw));}catch(e){}
S.drill=S.drill||{};S.due=S.due||[];S.streak=S.streak||{last:null,count:0};S.math=S.math||{};
function save(){try{localStorage.setItem('sigma',JSON.stringify(S));}catch(e){}}
function store(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function recall(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function touchStreak(){var today=new Date().toISOString().slice(0,10);if(S.streak.last===today)return;var y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.streak.count=(S.streak.last===y)?S.streak.count+1:1;S.streak.last=today;save();}
function stats(id){return S.drill[id]||{asked:0,correct:0,best:0};}
function isWon(id){var d=stats(id);return d.best>=0.8&&d.asked>=8;}
function wonCount(){return TOPICS.filter(function(t){return isWon(t.id);}).length;}

// ---------- svg helpers
function el(svg,t,a,txt){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;svg.appendChild(e);return e;}
function frame(svg,ratio,minH,maxH){var W=Math.round(svg.getBoundingClientRect().width)||600;var H=Math.round(Math.max(minH,Math.min(maxH,W*ratio)));svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.textContent='';return {W:W,H:H};}
function bell(svg,opts){
  var f=frame(svg,.34,160,220),W=f.W,H=f.H,base=H-28,top=12,x0=12,x1=W-12;
  function X(z){return x0+(z+3.3)/6.6*(x1-x0);} function Y(z){return base-(base-top)*Math.exp(-z*z/2);}
  function area(a,b){var d='M'+X(a)+' '+base;for(var z=a;z<=b+1e-9;z+=.05)d+=' L'+X(z).toFixed(1)+' '+Y(z).toFixed(1);return d+' L'+X(b)+' '+base+' Z';}
  var zc=Math.max(-3.3,Math.min(3.3,opts.z));
  el(svg,'path',{d:area(-3.3,3.3),fill:'var(--accent-tint)'});
  el(svg,'path',{d:opts.left?area(-3.3,zc):area(zc,3.3),fill:'var(--accent)','fill-opacity':'0.35'});
  var line='';for(var z=-3.3;z<=3.3;z+=.05)line+=(line?' L':'M')+X(z).toFixed(1)+' '+Y(z).toFixed(1);
  el(svg,'path',{d:line,fill:'none',stroke:'var(--accent)','stroke-width':'2'});
  el(svg,'line',{x1:x0,y1:base,x2:x1,y2:base,stroke:'var(--border-control)','stroke-width':'1'});
  [-3,-2,-1,0,1,2,3].forEach(function(k){el(svg,'text',{x:X(k),y:base+20,'text-anchor':'middle'},opts.m+k*opts.s);});
  el(svg,'line',{x1:X(zc),y1:top-4,x2:X(zc),y2:base,stroke:'var(--fg)','stroke-width':'1.5'});
}
function barrow(label,p,target){return '<div class="barrow"><span>'+label+'</span><span class="track"><span class="fill" style="width:'+Math.min(100,p*100).toFixed(1)+'%"></span>'+(target!=null?'<span class="target" style="left:'+target+'%"></span>':'')+'</span><span>'+(p*100).toFixed(1)+'%</span></div>';}

// Redraw charts when their container changes width
var redraws=[];
var ro=new ResizeObserver(function(entries){entries.forEach(function(en){var fn=en.target.__redraw;var w=Math.round(en.contentRect.width);if(fn&&w&&w!==en.target.__w){en.target.__w=w;fn();}});});
function watch(svg,fn){svg.__redraw=fn;svg.__w=Math.round(svg.getBoundingClientRect().width);ro.observe(svg);}

// ---------- labs
var LABS=DATA.labs;
var labHTML={
 bell:function(){var c=LABS.bell;return '<section class="box lab" aria-label="Bell curve lab"><h2>'+c.title+'</h2>'+(c.sub?'<p class="small muted">'+c.sub+'</p>':'')+'<svg class="viz" data-lab="bell" role="img" aria-label="Bell curve with the share above the cutoff shaded"></svg><div class="field"><label for="bellX">Cutoff: <b id="bellXv">'+c.init+'</b>'+c.unit+'</label><input id="bellX" type="range" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+c.init+'"></div><p class="note" id="bellNote" aria-live="polite"></p><div class="bands" id="bands"></div></section>';},
 cc:function(){var c=LABS.cc;return '<section class="box lab" aria-label="Control chart lab"><h2>'+c.title+'</h2>'+(c.sub?'<p class="small muted">'+c.sub+'</p>':'')+'<svg class="viz" data-lab="cc" role="img" aria-label="Control chart"></svg><div class="field"><label for="ccSd">Process SD: <b id="ccSdv">'+c.init+'</b>'+c.unit+'</label><input id="ccSd" type="range" min="'+c.min+'" max="'+c.max+'" step="1" value="'+c.init+'"></div><div class="btns"><button class="btn" type="button" id="ccNew">New data</button></div><p class="note" id="ccNote" aria-live="polite"></p></section>';},
 coin:function(){return '<section class="box lab" aria-label="Coin lab"><h2>Coin: P(heads) = 1/2</h2><div class="stage"><div class="coin" id="coin" aria-hidden="true">H</div><p class="small muted">Flips <b id="cN">0</b></p></div><div class="btns"><button class="btn" type="button" data-coin="1">Flip</button><button class="btn" type="button" data-coin="100">Flip 100</button><button class="btn" type="button" data-coin="1000">Flip 1,000</button><button class="btn" type="button" id="cReset">Reset</button></div><div class="bars" id="cBars"></div><p class="note" id="cNote" aria-live="polite"></p><p class="note"><b>Two heads in a row (and means multiply):</b> <span id="hh">0 of 0 pairs</span>. True odds 0.5 × 0.5 = 25%.</p></section>';},
 dice:function(){return '<section class="box lab" aria-label="Die lab"><h2>Die: each face 1/6 (16.7%)</h2><div class="stage"><div class="die" id="die" aria-hidden="true"></div><p class="small muted">Rolls <b id="dN">0</b></p></div><div class="btns"><button class="btn" type="button" data-die="1">Roll</button><button class="btn" type="button" data-die="100">Roll 100</button><button class="btn" type="button" data-die="1000">Roll 1,000</button><button class="btn" type="button" id="dReset">Reset</button></div><div class="bars" id="dBars"></div><label class="check"><input type="checkbox" id="evenOnly"> '+LABS.diceGiven+'</label><p class="note" id="gNote" aria-live="polite"></p><p class="note" id="dNote"></p></section>';},
 port:function(){var c=LABS.port;return '<section class="box lab" aria-label="Portfolio lab"><h2>Two-asset portfolio: drag the weight and the correlation</h2><div class="field"><label for="pw">Weight in '+c.name1+': <b id="pwv">'+c.w+'%</b></label><input id="pw" type="range" min="0" max="100" step="5" value="'+c.w+'"></div><div class="field"><label for="pr">Correlation ρ: <b id="prv">'+(c.rho/100).toFixed(2)+'</b></label><input id="pr" type="range" min="-100" max="100" step="1" value="'+c.rho+'"></div><svg class="viz" data-lab="port" role="img" aria-label="Portfolio risk against the weight in the first asset"></svg><p class="note" id="pNote" aria-live="polite"></p></section>';},
 binom:function(){var c=LABS.binom;return '<section class="box lab" aria-label="Binomial lab"><h2>Binomial: drag n and p</h2><div class="field"><label for="bn">n = <b id="bnv">'+c.n+'</b></label><input id="bn" type="range" min="1" max="30" step="1" value="'+c.n+'"></div><div class="field"><label for="bp">p = <b id="bpv">'+(c.p/100).toFixed(2)+'</b></label><input id="bp" type="range" min="1" max="99" step="1" value="'+c.p+'"></div><div class="bars" id="bBars"></div><p class="note" id="bNote" aria-live="polite"></p></section>';},
 pois:function(){var c=LABS.pois;return '<section class="box lab" aria-label="Poisson lab"><h2>Poisson: drag λ</h2><div class="field"><label for="pl">λ = <b id="plv">'+c.l+'</b></label><input id="pl" type="range" min="0.5" max="15" step="0.5" value="'+c.l+'"></div><div class="bars" id="poBars"></div><p class="note" id="poNote" aria-live="polite"></p></section>';},
 z:function(){var c=LABS.z;return '<section class="box lab" aria-label="Normal curve lab"><h2>Any normal: set μ, σ, and a cutoff</h2><div class="field"><label for="zm">μ = <b id="zmv">'+c.m+'</b></label><input id="zm" type="range" min="0" max="'+c.mMax+'" step="1" value="'+c.m+'"></div><div class="field"><label for="zs">σ = <b id="zsv">'+c.s+'</b></label><input id="zs" type="range" min="1" max="'+c.sMax+'" step="1" value="'+c.s+'"></div><div class="field"><label for="zx">Cutoff y = <b id="zxv">'+c.x+'</b></label><input id="zx" type="range" min="0" max="'+c.xMax+'" step="1" value="'+c.x+'"></div><svg class="viz" data-lab="z" role="img" aria-label="Normal curve with the area below the cutoff shaded"></svg><p class="note" id="zNote" aria-live="polite"></p></section>';},
 clt:function(){return '<section class="box lab" aria-label="Central Limit Theorem lab"><h2>CLT: sample means turn into a bell</h2><div class="field"><label for="cpop">Population shape</label><select id="cpop"><option value="skew">Skewed, like incomes</option><option value="uni">Flat, uniform</option><option value="die">Die rolls</option></select></div><div class="field"><label for="cn">Sample size n = <b id="cnv">5</b></label><input id="cn" type="range" min="1" max="60" step="1" value="5"></div><div class="btns"><button class="btn" type="button" data-clt="1">Draw 1 sample</button><button class="btn" type="button" data-clt="200">Draw 200</button><button class="btn" type="button" data-clt="2000">Draw 2,000</button><button class="btn" type="button" id="cltReset">Reset</button></div><svg class="viz" data-lab="clt" role="img" aria-label="Histogram of sample means"></svg><p class="note" id="cltNote" aria-live="polite"></p></section>';},
 ci:function(){return '<section class="box lab" aria-label="Confidence interval lab"><h2>100 confidence intervals: how many catch μ = 50?</h2><div class="field"><label for="cin">n = <b id="cinv">25</b></label><input id="cin" type="range" min="5" max="100" step="5" value="25"></div><div class="field"><label for="cic">Confidence: <b id="cicv">95%</b></label><input id="cic" type="range" min="0" max="2" step="1" value="1"></div><div class="btns"><button class="btn" type="button" id="ciDraw">Draw 100 samples</button></div><svg class="viz" data-lab="ci" role="img" aria-label="One hundred confidence intervals, with misses marked"></svg><p class="note" id="ciNote" aria-live="polite"></p></section>';},
 reg:function(){var c=LABS.reg;return '<section class="box lab" aria-label="Regression lab"><h2>'+c.title+'</h2><div class="field"><label for="rx">Your point x = <b id="rxv">'+c.x+'</b></label><input id="rx" type="range" min="0" max="12" step="0.5" value="'+c.x+'"></div><div class="field"><label for="ry">Your point y = <b id="ryv">'+c.y+'</b></label><input id="ry" type="range" min="0" max="16" step="0.2" value="'+c.y+'"></div><label class="check"><input type="checkbox" id="rOn"> Include my point</label><svg class="viz" data-lab="reg" role="img" aria-label="Scatter plot with the fitted line"></svg><p class="note" id="rNote" aria-live="polite"></p></section>';}
};
var labInit={
 bell:function(root){var c=LABS.bell,svg=root.querySelector('[data-lab="bell"]'),inp=$('bellX');
  var bands=[['2.5%','below '+(c.m-2*c.s)],['13.5%',(c.m-2*c.s)+' to '+(c.m-c.s)],['34%',(c.m-c.s)+' to '+c.m],['34%',c.m+' to '+(c.m+c.s)],['13.5%',(c.m+c.s)+' to '+(c.m+2*c.s)],['2.5%','above '+(c.m+2*c.s)]];
  $('bands').innerHTML=bands.map(function(b,i){return '<div class="'+(i===2||i===3?'mid':'')+'"><b>'+b[0]+'</b>'+b[1]+'</div>';}).join('');
  function draw(){var x=+inp.value,z=(x-c.m)/c.s;$('bellXv').textContent=x;bell(svg,{m:c.m,s:c.s,z:z});var above=1-Phi(z);$('bellNote').innerHTML=x+' is <b>'+Math.abs(r2(z)).toFixed(1)+' SD</b> '+(z>=0?'above':'below')+' the average. Share above it: <b>'+(above*100).toFixed(1)+'%</b>. Share below: <b>'+((1-above)*100).toFixed(1)+'%</b>.';}
  inp.addEventListener('input',draw);watch(svg,draw);draw();},
 cc:function(root){var c=LABS.cc,svg=root.querySelector('[data-lab="cc"]'),sdIn=$('ccSd'),pts=[];
  function newPts(){pts=[];for(var i=0;i<40;i++)pts.push(gauss());draw();}
  function draw(){var s=+sdIn.value;$('ccSdv').textContent=s;var f=frame(svg,.45,200,270),W=f.W,H=f.H;var lo=c.center-5.5*c.sdLimit,hi=c.center+5.5*c.sdLimit,UL=c.center+3*c.sdLimit,LL=c.center-3*c.sdLimit;
   var x0=36,x1=W-8,X=function(i){return x0+i*((x1-x0)/39);},Y=function(v){return (H-16)-(v-lo)/(hi-lo)*(H-28);};
   [[UL,'UL'],[c.center,'CL'],[LL,'LL']].forEach(function(l){el(svg,'line',{x1:x0-4,x2:x1,y1:Y(l[0]),y2:Y(l[0]),stroke:l[1]==='CL'?'var(--border-control)':'var(--fg-muted)','stroke-width':'1.5','stroke-dasharray':l[1]==='CL'?'0':'6 5'});el(svg,'text',{x:2,y:Y(l[0])+4},l[1]);});
   var out=0,path='';pts.forEach(function(z,i){var v=c.center+z*s,vc=Math.max(lo,Math.min(hi,v));if(v>UL||v<LL)out++;path+=(i?' L':'M')+X(i).toFixed(1)+' '+Y(vc).toFixed(1);});
   el(svg,'path',{d:path,fill:'none',stroke:'var(--border)','stroke-width':'1.5'});
   pts.forEach(function(z,i){var v=c.center+z*s,vc=Math.max(lo,Math.min(hi,v)),o=v>UL||v<LL;el(svg,'circle',{cx:X(i).toFixed(1),cy:Y(vc).toFixed(1),r:o?5:3.5,fill:o?'var(--danger)':'var(--accent)'});});
   $('ccNote').innerHTML=(s<=c.sdLimit?'<b>In control.</b> ':'<b>Out of control.</b> ')+'Limits were set for an SD of '+c.sdLimit+c.unit+' ('+c.center+' ± '+3*c.sdLimit+'). At SD '+s+', <b>'+out+' of 40</b> points broke a limit.';}
  sdIn.addEventListener('input',draw);$('ccNew').addEventListener('click',newPts);watch(svg,draw);newPts();},
 coin:function(){var coin=$('coin'),cH=0,cT=0,pairs=0,hhN=0,last=null;
  function render(){var n=cH+cT;$('cN').textContent=n.toLocaleString();$('cBars').innerHTML=barrow('Heads',n?cH/n:0,50)+barrow('Tails',n?cT/n:0,50);$('cNote').innerHTML=n===0?'Flip it. The dark line marks the true 50%.':n<30?'Small sample: the split can be way off 50%. That is normal.':'<b>'+n.toLocaleString()+' flips:</b> heads at '+(cH/n*100).toFixed(1)+'%. More flips, closer to 50%.';$('hh').textContent=hhN+' of '+pairs+' pairs'+(pairs?' ('+(hhN/pairs*100).toFixed(1)+'%)':'');}
  function flip(n){var h;for(var i=0;i<n;i++){h=Math.random()<.5;if(h)cH++;else cT++;if(last!==null){pairs++;if(h&&last)hhN++;last=null;}else last=h;}coin.textContent=h?'H':'T';coin.classList.remove('spin');void coin.offsetWidth;coin.classList.add('spin');render();}
  document.querySelectorAll('[data-coin]').forEach(function(b){b.addEventListener('click',function(){flip(+b.dataset.coin);});});$('cReset').addEventListener('click',function(){cH=cT=pairs=hhN=0;last=null;coin.textContent='H';render();});render();},
 dice:function(){var dc=[0,0,0,0,0,0,0],die=$('die'),faces={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};for(var k=0;k<9;k++){var pp=document.createElement('span');pp.className='pip';die.appendChild(pp);}
  function show(f){var on=faces[f];[].forEach.call(die.children,function(p,i){p.classList.toggle('on',on.indexOf(i)>-1);});}
  function render(){var n=dc.slice(1).reduce(function(a,b){return a+b;},0);$('dN').textContent=n.toLocaleString();var html='';for(var f=1;f<=6;f++)html+=barrow('Face '+f,n?dc[f]/n:0,100/6);$('dBars').innerHTML=html;var ev=dc[2]+dc[4]+dc[6],g=$('evenOnly').checked;$('gNote').innerHTML=g?(ev?'<b>Even rolls only: '+ev.toLocaleString()+'.</b> Twos among them: '+dc[2].toLocaleString()+', which is <b>'+(dc[2]/ev*100).toFixed(1)+'%</b>. True answer 33.3%.':'Roll first.'):'Turn this on to watch P(2 | even) head toward 1/3.';$('dNote').innerHTML=n?'P(not a 6): <b>'+((n-dc[6])/n*100).toFixed(1)+'%</b> (true 83.3%). P(1 or 2): <b>'+((dc[1]+dc[2])/n*100).toFixed(1)+'%</b> (true 33.3%).':'';}
  function roll(n){var f=1;for(var i=0;i<n;i++){f=1+Math.floor(Math.random()*6);dc[f]++;}show(f);die.classList.remove('spin');void die.offsetWidth;die.classList.add('spin');render();}
  document.querySelectorAll('[data-die]').forEach(function(b){b.addEventListener('click',function(){roll(+b.dataset.die);});});$('dReset').addEventListener('click',function(){dc=[0,0,0,0,0,0,0];show(1);render();});$('evenOnly').addEventListener('change',render);show(1);render();},
 port:function(root){var c=LABS.port,pw=$('pw'),pr=$('pr'),svg=root.querySelector('[data-lab="port"]');
  function draw(){var w=+pw.value/100,rho=+pr.value/100;$('pwv').textContent=Math.round(w*100)+'%';$('prv').textContent=rho.toFixed(2);var f=frame(svg,.45,220,280),W=f.W,H=f.H;var x0=44,x1=W-12,y0=H-40,y1=16;var X=function(t){return x0+t*(x1-x0);},Y=function(v){return y0-(v/c.ymax)*(y0-y1);};
   el(svg,'line',{x1:x0,y1:y0,x2:x1,y2:y0,stroke:'var(--border-control)'});el(svg,'line',{x1:x0,y1:y1,x2:x0,y2:y0,stroke:'var(--border-control)'});
   [0,c.ymax/2,c.ymax].forEach(function(v){el(svg,'text',{x:x0-6,y:Y(v)+4,'text-anchor':'end'},v);});
   el(svg,'text',{x:(x0+x1)/2,y:H-8,'text-anchor':'middle'},'Weight in '+c.name1+', 0% to 100%');el(svg,'text',{x:x0+6,y:y1+4},'σ in %');
   var d='';for(var t=0;t<=1.0001;t+=.02){var v=Math.sqrt(t*t*c.s1*c.s1+(1-t)*(1-t)*c.s2*c.s2+2*t*(1-t)*rho*c.s1*c.s2);d+=(d?' L':'M')+X(t).toFixed(1)+' '+Y(v).toFixed(1);}
   el(svg,'path',{d:d,fill:'none',stroke:'var(--accent)','stroke-width':'2.5'});
   var vv=Math.sqrt(w*w*c.s1*c.s1+(1-w)*(1-w)*c.s2*c.s2+2*w*(1-w)*rho*c.s1*c.s2),ee=w*c.e1+(1-w)*c.e2;
   el(svg,'circle',{cx:X(w),cy:Y(vv),r:6,fill:'var(--bg)',stroke:'var(--accent)','stroke-width':'2.5'});
   $('pNote').innerHTML=c.name1+': E '+c.e1+'%, σ '+c.s1+'%. '+c.name2+': E '+c.e2+'%, σ '+c.s2+'%. Your mix: <b>E = '+ee.toFixed(2)+'%</b>, <b>σ = '+vv.toFixed(2)+'%</b>. '+(rho<1?'Because ρ is below 1, the curve dips below both assets. That dip is diversification.':'At ρ = 1 there is no dip; the mix is a straight line between the two.');}
  pw.addEventListener('input',draw);pr.addEventListener('input',draw);watch(svg,draw);draw();},
 binom:function(){var bn=$('bn'),bp=$('bp');
  function draw(){var n=+bn.value,p=+bp.value/100;$('bnv').textContent=n;$('bpv').textContent=p.toFixed(2);var html='',maxk=Math.min(n,14);for(var k=0;k<=maxk;k++)html+=barrow('y = '+k,binom(k,n,p));$('bBars').innerHTML=html;$('bNote').innerHTML='Mean np = <b>'+fmt(n*p)+'</b>. Variance np(1 − p) = <b>'+fmt(n*p*(1-p))+'</b>. P(at least 1) = 1 − (1 − p)ⁿ = <b>'+fmt(1-Math.pow(1-p,n))+'</b>.'+(maxk<n?' Showing y up to 14.':'');}
  bn.addEventListener('input',draw);bp.addEventListener('input',draw);draw();},
 pois:function(){var pl=$('pl');
  function draw(){var l=+pl.value;$('plv').textContent=l;var html='';for(var k=0;k<=Math.min(20,Math.ceil(l+4*Math.sqrt(l)));k++)html+=barrow('y = '+k,pois(k,l));$('poBars').innerHTML=html;$('poNote').innerHTML='Mean = variance = <b>'+l+'</b>. P(0) = e<sup>−λ</sup> = <b>'+fmt(pois(0,l))+'</b>. P(at least 2) = <b>'+fmt(1-pois(0,l)-pois(1,l))+'</b>.';}
  pl.addEventListener('input',draw);draw();},
 z:function(root){var zm=$('zm'),zs=$('zs'),zx=$('zx'),svg=root.querySelector('[data-lab="z"]');
  function draw(){var m=+zm.value,s=+zs.value,x=+zx.value;$('zmv').textContent=m;$('zsv').textContent=s;$('zxv').textContent=x;var z=(x-m)/s;bell(svg,{m:m,s:s,z:z,left:true});$('zNote').innerHTML='z = ('+x+' − '+m+') / '+s+' = <b>'+fmt(r2(z))+'</b>. P(Y &lt; '+x+') = <b>'+fmt(Phi(z))+'</b> (shaded). P(Y &gt; '+x+') = <b>'+fmt(1-Phi(z))+'</b>.';}
  [zm,zs,zx].forEach(function(i){i.addEventListener('input',draw);});watch(svg,draw);draw();},
 clt:function(root){var cn=$('cn'),pop=$('cpop'),svg=root.querySelector('[data-lab="clt"]'),means=[];
  function one(){var t=pop.value;if(t==='die')return 1+Math.floor(Math.random()*6);if(t==='uni')return Math.random()*6;return -Math.log(1-Math.random())*2;}
  function sample(){var n=+cn.value,s=0;for(var i=0;i<n;i++)s+=one();return s/n;}
  function draw(){$('cnv').textContent=cn.value;var f=frame(svg,.36,180,230),W=f.W,H=f.H;var x0=24,x1=W-12,base=H-24,bins=30,h=new Array(bins).fill(0);means.forEach(function(m){var b=Math.floor(m/6*bins);if(b>=0&&b<bins)h[b]++;});var mx=Math.max.apply(null,h)||1,bw=(x1-x0)/bins;
   h.forEach(function(cnt,i){el(svg,'rect',{x:(x0+i*bw+1).toFixed(1),y:(base-cnt/mx*(base-12)).toFixed(1),width:Math.max(1,bw-2).toFixed(1),height:(cnt/mx*(base-12)).toFixed(1),fill:'var(--accent)'});});
   el(svg,'line',{x1:x0,y1:base,x2:x1,y2:base,stroke:'var(--border-control)'});[0,1,2,3,4,5,6].forEach(function(v){el(svg,'text',{x:x0+v/6*(x1-x0),y:base+18,'text-anchor':'middle'},v);});
   var truth={die:3.5,uni:3,skew:2}[pop.value],tx=x0+truth/6*(x1-x0);el(svg,'line',{x1:tx,y1:8,x2:tx,y2:base,stroke:'var(--fg)','stroke-width':'1.5','stroke-dasharray':'5 4'});
   $('cltNote').innerHTML=means.length?'<b>'+means.length.toLocaleString()+' sample means</b>, n = '+cn.value+' each. Their average: <b>'+fmt(r2(mean(means)))+'</b> (true μ = '+truth+'). Their SD: <b>'+fmt(r3(means.length>1?sd(means):0))+'</b>. Raise n and watch the pile narrow into a bell, even when the population is skewed.':'Pick a population, set n, and draw. The dashed line is the true mean.';}
  root.querySelectorAll('[data-clt]').forEach(function(b){b.addEventListener('click',function(){for(var i=0;i<+b.dataset.clt;i++)means.push(sample());draw();});});
  $('cltReset').addEventListener('click',function(){means=[];draw();});cn.addEventListener('input',function(){means=[];draw();});pop.addEventListener('change',function(){means=[];draw();});watch(svg,draw);draw();},
 ci:function(root){var cin=$('cin'),cic=$('cic'),svg=root.querySelector('[data-lab="ci"]'),confs=[90,95,99],cache=null;
  function sampleSet(){var n=+cin.value,c=confs[+cic.value],mu=50,sg=10,rows=[];for(var i=0;i<100;i++){var s=0;for(var j=0;j<n;j++)s+=mu+sg*gauss();var xb=s/n,m=Z[c]*sg/Math.sqrt(n);rows.push([xb-m,xb+m]);}cache={rows:rows,c:c,n:n};}
  function draw(){if(!cache)sampleSet();var n=cache.n,c=cache.c;$('cinv').textContent=cin.value;$('cicv').textContent=confs[+cic.value]+'%';var f=frame(svg,.5,240,300),W=f.W,H=f.H;var x0=16,x1=W-16,X=function(v){return x0+(v-30)/40*(x1-x0);},hit=0,step=(H-36)/100;
   el(svg,'line',{x1:X(50),y1:4,x2:X(50),y2:H-24,stroke:'var(--fg)','stroke-width':'1.5'});
   cache.rows.forEach(function(r,i){var ok=r[0]<=50&&r[1]>=50;if(ok)hit++;var y=8+i*step;el(svg,'line',{x1:X(Math.max(30,r[0])).toFixed(1),y1:y.toFixed(1),x2:X(Math.min(70,r[1])).toFixed(1),y2:y.toFixed(1),stroke:ok?'var(--accent)':'var(--danger)','stroke-width':ok?'1.2':'2'});});
   [30,40,50,60,70].forEach(function(v){el(svg,'text',{x:X(v),y:H-6,'text-anchor':'middle'},v);});
   $('ciNote').innerHTML='<b>'+hit+' of 100</b> intervals caught μ = 50, with n = '+n+' at '+c+'% (expect about '+c+'). Misses are red. Bigger n makes the intervals shorter; higher confidence makes them longer.';}
  $('ciDraw').addEventListener('click',function(){sampleSet();draw();});cin.addEventListener('input',function(){sampleSet();draw();});cic.addEventListener('input',function(){sampleSet();draw();});watch(svg,draw);draw();},
 reg:function(root){var c=LABS.reg,rx=$('rx'),ry=$('ry'),rOn=$('rOn'),svg=root.querySelector('[data-lab="reg"]');
  function fit(pts){var n=pts.length,sx=0,sy=0,sxy=0,sxx=0;pts.forEach(function(p){sx+=p[0];sy+=p[1];sxy+=p[0]*p[1];sxx+=p[0]*p[0];});var b1=(n*sxy-sx*sy)/(n*sxx-sx*sx),b0=sy/n-b1*sx/n,ybar=sy/n,sst=0,sse=0;pts.forEach(function(p){sst+=(p[1]-ybar)*(p[1]-ybar);var e=p[1]-(b0+b1*p[0]);sse+=e*e;});return {b0:b0,b1:b1,r2:1-sse/sst};}
  function draw(){var x=+rx.value,y=+ry.value;$('rxv').textContent=x;$('ryv').textContent=y;var pts=c.pts.slice();if(rOn.checked)pts.push([x,y]);var F=fit(pts),F0=fit(c.pts);var f=frame(svg,.5,240,300),W=f.W,H=f.H;var x0=32,x1=W-12,y0=H-36,y1=12;var X=function(v){return x0+v/12*(x1-x0);},Y=function(v){return y0-v/16*(y0-y1);};
   el(svg,'line',{x1:x0,y1:y0,x2:x1,y2:y0,stroke:'var(--border-control)'});el(svg,'line',{x1:x0,y1:y1,x2:x0,y2:y0,stroke:'var(--border-control)'});
   [0,3,6,9,12].forEach(function(v){el(svg,'text',{x:X(v),y:y0+16,'text-anchor':'middle'},v);});[0,8,16].forEach(function(v){el(svg,'text',{x:x0-6,y:Y(v)+4,'text-anchor':'end'},v);});
   el(svg,'text',{x:(x0+x1)/2,y:H-4,'text-anchor':'middle'},'Advertising (x)');
   el(svg,'line',{x1:X(0),y1:Y(F0.b0),x2:X(12),y2:Y(F0.b0+12*F0.b1),stroke:'var(--border-control)','stroke-width':'1.5','stroke-dasharray':'5 4'});
   el(svg,'line',{x1:X(0),y1:Y(F.b0),x2:X(12),y2:Y(F.b0+12*F.b1),stroke:'var(--accent)','stroke-width':'2.5'});
   c.pts.forEach(function(p){el(svg,'circle',{cx:X(p[0]),cy:Y(p[1]),r:5,fill:'var(--accent)'});});
   if(rOn.checked)el(svg,'circle',{cx:X(x),cy:Y(y),r:7,fill:'var(--bg)',stroke:'var(--fg)','stroke-width':'2'});
   $('rNote').innerHTML=c.prefix+': Sales = '+F0.b0.toFixed(2)+' + '+F0.b1.toFixed(2)+' Adv, R² = '+(F0.r2*100).toFixed(1)+'%. '+(rOn.checked?'With your point: <b>y = '+F.b0.toFixed(2)+' + '+F.b1.toFixed(2)+' x</b>, R² = <b>'+(F.r2*100).toFixed(1)+'%</b>. Drag x far right and see how much one high-leverage point swings the line.':'Tick the box to add a point you control.');}
  [rx,ry].forEach(function(i){i.addEventListener('input',draw);});rOn.addEventListener('change',draw);watch(svg,draw);draw();}
};

// ---------- drill generators (same code in every build; K holds the numbers)
function tmpl(s,o){return s.replace(/\{(\w+)\}/g,function(_,k){return o[k];});}
var G={
 data:function(){var q=pick(K.dataQs);return {q:q[0],a:q[1],why:q[2],text:true};},
 center:function(){var n=pick([5,6,7,8]),a=[];for(var i=0;i<n;i++)a.push(ri(2,30));var kind=pick(['mean','median']);var v=kind==='mean'?mean(a):median(a);return {q:'Find the '+kind+' of '+a.join(', '),a:v,why:kind==='mean'?'Sum '+a.reduce(function(s,x){return s+x;},0)+' ÷ '+n:'Sorted: '+a.slice().sort(function(x,y){return x-y;}).join(', ')+(n%2?', the middle value':', the average of the two middle values')};},
 spread:function(){var t=pick(['range','var','sd','emp','emp2','z']);
  if(t==='range'){var a=[];for(var i=0;i<6;i++)a.push(ri(-40,120));return {q:'Range of '+a.join(', '),a:Math.max.apply(null,a)-Math.min.apply(null,a),why:Math.max.apply(null,a)+' minus '+Math.min.apply(null,a)};}
  if(t==='var'||t==='sd'){var b=[],base=ri(5,40);for(var j=0;j<4;j++)b.push(base+ri(-6,6));var s2=sd(b)*sd(b);return {q:(t==='var'?'Sample variance':'Sample standard deviation')+' of '+b.join(', '),a:t==='var'?s2:Math.sqrt(s2),why:'Mean '+fmt(mean(b))+', add the squared gaps, divide by n − 1 = 3'+(t==='sd'?', then take the square root':'')};}
  if(t==='emp'){var m=pick([100,150,200,500]),s=pick([10,20,25,50]),k=pick([1,2,3]),p={1:'68',2:'95',3:'99.7'}[k],side=pick(['lower','upper']);return {q:'Hill-shaped data, mean '+m+', SD '+s+'. What is the '+side+' end of the band that holds '+p+'% of the data?',a:side==='lower'?m-k*s:m+k*s,why:p+'% is ± '+k+' SD'};}
  if(t==='emp2'){var m2=pick([100,150,200]),s3=pick([10,20]),c=pick([1,2]);return {q:'Mean '+m2+', SD '+s3+', bell shaped. What percent of values are above '+(m2+c*s3)+'? Type the percent, like 16.',a:{1:16,2:2.5}[c],why:c===1?'32% sit outside 1 SD, half on top':'5% sit outside 2 SD, half on top'};}
  var m4=pick([100,150,200]),s4=pick([10,20,25]),x=m4+pick([-3,-2,-1.5,-1,1,1.5,2,3])*s4;return {q:'Mean '+m4+', SD '+s4+'. How many SDs from the mean is '+x+'? The sign matters.',a:(x-m4)/s4,why:'('+x+' − '+m4+') / '+s4};},
 prob:function(){var t=pick(['or','given','and','tree','comp','indep']),TR=K.tree;
  if(t==='or'){var pa=pick([.3,.4,.5]),pb=pick([.2,.3,.4]),pab=pick([.1,.15]);return {q:'P(A) = '+pa+', P(B) = '+pb+', P(A and B) = '+pab+'. P(A or B)?',a:pa+pb-pab,why:pa+' + '+pb+' − '+pab};}
  if(t==='given'){var A=ri(40,80),both=ri(10,A-10);return {q:'Of 100 customers, '+A+' have a credit card and '+both+' have a credit card and a loan. P(loan | credit card)? Answer as a decimal.',a:both/A,why:both+' ÷ '+A+'; the given is the denominator'};}
  if(t==='and'){var h=pick([13,26,4]),lbl={13:'hearts',26:'red cards',4:'aces'}[h];return {q:'Draw two cards from a pack of 52 without replacement. P(both are '+lbl+')?',a:h/52*(h-1)/51,why:h+'/52 × '+(h-1)+'/51'};}
  if(t==='tree'){var pt=pick([.6,.7,.75,.8]),pm=pick([.8,.9]),pl=pick([.5,.6]),w=pick(['both','overall','rev']),b2=pt*pm,all=pt*pm+(1-pt)*pl;
   if(w==='both')return {q:'P('+TR.a+') = '+pt+'. P('+TR.b+' | '+TR.a+') = '+pm+'. P('+TR.a+' and '+TR.b+')?',a:b2,why:pt+' × '+pm};
   if(w==='overall')return {q:'P('+TR.a+') = '+pt+', P('+TR.bShort+' | '+TR.a+') = '+pm+', P('+TR.bShort+' | '+TR.na+') = '+pl+'. P('+TR.b+')?',a:all,why:pt+' × '+pm+' + '+(1-pt).toFixed(2)+' × '+pl};
   return {q:'P('+TR.a+') = '+pt+', P('+TR.bShort+' | '+TR.a+') = '+pm+', P('+TR.bShort+' | '+TR.na+') = '+pl+'. Given '+TR.given+', P('+TR.a+')?',a:b2/all,why:fmt(b2)+' ÷ '+fmt(all)};}
  if(t==='comp'){var p=pick([.1,.2,.3]),n=pick([3,4,5]);return {q:Math.round(p*100)+'% '+K.comp.what+'. Pick '+n+' at random. P(at least one '+K.comp.one+')?',a:1-Math.pow(1-p,n),why:'1 − '+(1-p).toFixed(1)+'^'+n};}
  var pA=pick([.3,.4,.5]),pB=pick([.2,.4,.6]),ind=pick([true,false]),pAB=ind?pA*pB:r2(pA*pB+pick([.05,.1]));return {q:'P(A) = '+pA+', P(B) = '+pB+', P(A and B) = '+fmt(pAB)+'. Independent? Type yes or no.',a:ind?'yes':'no',why:'Independent only if P(A and B) = P(A)P(B) = '+fmt(pA*pB),text:true};},
 rv:function(){var xs=[ri(-20,0),ri(5,15),ri(20,30),ri(35,50)],ps=pick([[.1,.4,.3,.2],[.2,.3,.3,.2],[.15,.35,.35,.15],[.25,.25,.25,.25]]),mu=0,v=0,i;for(i=0;i<4;i++)mu+=xs[i]*ps[i];for(i=0;i<4;i++)v+=(xs[i]-mu)*(xs[i]-mu)*ps[i];var t=pick(['mean','sd','shift']),tbl=xs.map(function(x,j){return x+' ('+ps[j]+')';}).join(', ');
  if(t==='mean')return {q:'Return Y takes values (probability): '+tbl+'. E(Y)?',a:mu,why:'Σ y P(y)'};
  if(t==='sd')return {q:'Return Y takes values (probability): '+tbl+'. SD(Y)?',a:Math.sqrt(v),why:'μ = '+fmt(mu)+', variance '+fmt(v)+', then the square root'};
  var c=pick([5,10,20]);return {q:'E(Y) = '+fmt(mu)+' and SD(Y) = '+fmt(Math.sqrt(v))+'. SD of (Y + '+c+')?',a:Math.sqrt(v),why:'Adding a constant shifts the mean, not the spread'};},
 two:function(){var t=pick(['rho','pm','pv']),s1=pick([8,10,12]),s2=pick([12,15,20]),cov=pick([20,40,60,-30]);
  if(t==='rho')return {q:'σx = '+s1+', σy = '+s2+', Cov = '+cov+'. Correlation?',a:cov/(s1*s2),why:cov+' / ('+s1+' × '+s2+')'};
  var w=pick([.3,.4,.5,.6]),e1=pick([6,8,10]),e2=pick([12,14,16]);
  if(t==='pm')return {q:'E(X) = '+e1+'%, E(Y) = '+e2+'%. Expected return of '+w+'X + '+(1-w).toFixed(1)+'Y?',a:w*e1+(1-w)*e2,why:w+' × '+e1+' + '+(1-w).toFixed(1)+' × '+e2};
  var vv=w*w*s1*s1+(1-w)*(1-w)*s2*s2+2*w*(1-w)*cov;return {q:'σx = '+s1+', σy = '+s2+', Cov = '+cov+'. SD of '+w+'X + '+(1-w).toFixed(1)+'Y?',a:Math.sqrt(vv),why:'b²V(X) + c²V(Y) + 2bc · Cov = '+fmt(vv)+', then the square root'};},
 count:function(){var t=pick(['exact','atmost','atleast','mean','comb']),n=pick([4,5,6,8,10]),p=pick([.1,.2,.25,.3,.5]);
  if(t==='comb'){var nn=pick([5,6,7,8]),k=pick([2,3]);return {q:'How many ways to choose '+k+' from '+nn+', order not mattering?',a:choose(nn,k),why:nn+'C'+k};}
  if(t==='mean')return {q:'Binomial with n = '+n+', p = '+p+'. Expected number of successes?',a:n*p,why:'np'};
  var k2=ri(0,Math.min(3,n));
  if(t==='exact')return {q:'n = '+n+', p = '+p+'. P(exactly '+k2+' successes)?',a:binom(k2,n,p),why:n+'C'+k2+' × '+p+'^'+k2+' × '+(1-p)+'^'+(n-k2)};
  if(t==='atmost'){var s=0;for(var i=0;i<=k2;i++)s+=binom(i,n,p);return {q:'n = '+n+', p = '+p+'. P(at most '+k2+')?',a:s,why:'Add P(0) through P('+k2+')'};}
  return {q:'n = '+n+', p = '+p+'. P(at least 1)?',a:1-Math.pow(1-p,n),why:'1 − '+(1-p)+'^'+n};},
 poisson:function(){var rate=pick([1,2,3,4,6]),win=pick([1,2,3]),unit=pick(['minute','minute','hour']),lam=rate*win,t=pick(['exact','atmost','zero','atleast']),k=ri(0,4),pre='Arrivals average '+rate+' per '+unit+'. Over '+win+' '+unit+(win>1?'s':'')+', ';
  if(t==='zero')return {q:pre+'P(no arrivals)?',a:pois(0,lam),why:'λ = '+lam+', e^−'+lam};
  if(t==='exact')return {q:pre+'P(exactly '+k+')?',a:pois(k,lam),why:'λ = '+lam+': e^−λ λ^'+k+' / '+k+'!'};
  if(t==='atmost'){var s=0;for(var i=0;i<=k;i++)s+=pois(i,lam);return {q:pre+'P(at most '+k+')?',a:s,why:'λ = '+lam+', add P(0) through P('+k+')'};}
  return {q:pre+'P(at least 2)?',a:1-pois(0,lam)-pois(1,lam),why:'λ = '+lam+': 1 − P(0) − P(1)'};},
 normal:function(){var mu=pick(K.normalMu),s=pick(K.normalSd),t=pick(['less','more','between','inv','z']),x=mu+pick([-2,-1.5,-1,-.5,.25,.5,1,1.5,2])*s;
  if(t==='z')return {q:'Y ~ N('+mu+', '+s+'). z score for y = '+x+'?',a:(x-mu)/s,why:'('+x+' − '+mu+') / '+s};
  if(t==='less')return {q:'Y ~ N('+mu+', '+s+'). P(Y < '+x+')?',a:Phi((x-mu)/s),why:'z = '+fmt((x-mu)/s)+', the area to the left'};
  if(t==='more')return {q:'Y ~ N('+mu+', '+s+'). P(Y > '+x+')?',a:1-Phi((x-mu)/s),why:'z = '+fmt((x-mu)/s)+', 1 minus the area to the left'};
  if(t==='between'){var x2=x+pick([1,1.5,2])*s;return {q:'Y ~ N('+mu+', '+s+'). P('+x+' < Y < '+x2+')?',a:Phi((x2-mu)/s)-Phi((x-mu)/s),why:'Φ('+fmt((x2-mu)/s)+') − Φ('+fmt((x-mu)/s)+')'};}
  var pp=pick([.9,.95,.99,.1,.05]),lab=pp>.5?'Only '+Math.round((1-pp)*100)+'% of values exceed what number?':'What value is exceeded by '+Math.round((1-pp)*100)+'% of values?';return {q:'Y ~ N('+mu+', '+s+'). '+lab,a:mu+PhiInv(pp)*s,why:'z = '+fmt(PhiInv(pp))+', y = μ + zσ'};},
 clt:function(){var mu=pick(K.cltMu),s=pick(K.cltSd),n=pick([25,36,49,64,100]),se=s/Math.sqrt(n),t=pick(['se','prob','probp','sum']);
  if(t==='se')return {q:'Population σ = '+s+', sample n = '+n+'. Standard error of x̄?',a:se,why:s+' / √'+n};
  if(t==='prob'){var x=mu+pick([-2,-1,1,2])*se,side=pick(['<','>']);return {q:'μ = '+mu+', σ = '+s+', n = '+n+'. P(x̄ '+side+' '+fmt(x)+')?',a:side==='<'?Phi((x-mu)/se):1-Phi((x-mu)/se),why:'SE = '+fmt(se)+', z = '+fmt((x-mu)/se)};}
  if(t==='probp'){var p=pick([.3,.4,.5,.6]),nn=pick([100,200,400]),sep=Math.sqrt(p*(1-p)/nn),ph=r2(p+pick([.03,.05]));return {q:'True p = '+p+', n = '+nn+'. P(p̂ > '+ph+')?',a:1-Phi((ph-p)/sep),why:'SE = '+fmt(sep)+', z = '+fmt((ph-p)/sep)};}
  var nn2=pick([25,50]);return {q:'Each of '+nn2+' '+K.cltItem+' has mean '+mu+' and SD '+s+'. SD of the total of all '+nn2+'?',a:s*Math.sqrt(nn2),why:'σ√n'};},
 ci:function(){var t=pick(['z','t','p','nmu','np','np2']);
  if(t==='z'){var xb=pick(K.ciZ.xb),s=pick(K.ciZ.s),n=pick([16,25,36,64]),c=pick([90,95,99]),side=pick(['lower','upper']),m=Z[c]*s/Math.sqrt(n);return {q:'x̄ = '+xb+', σ = '+s+' (known), n = '+n+'. The '+side+' limit of a '+c+'% CI for μ?',a:side==='lower'?xb-m:xb+m,why:'z = '+Z[c]+', margin '+fmt(m)};}
  if(t==='t'){var xb2=pick(K.ciT.xb),s2=pick(K.ciT.s),n2=pick([16,20,25]),c2=pick([90,95,99]),tc=tcrit(n2-1,c2),m2=tc*s2/Math.sqrt(n2),side2=pick(['lower','upper']);return {q:'x̄ = '+xb2+', s = '+s2+' (sample), n = '+n2+'. The '+side2+' limit of a '+c2+'% CI? Use t.',a:side2==='lower'?xb2-m2:xb2+m2,why:'t with '+(n2-1)+' df = '+tc+', margin '+fmt(m2)};}
  if(t==='p'){var nn=pick(K.ciP.nn),y=ri(Math.round(nn*.3),Math.round(nn*.7)),c3=pick([90,95,99]),ph=y/nn,m3=Z[c3]*Math.sqrt(ph*(1-ph)/nn),side3=pick(['lower','upper']);return {q:y+' of '+nn+' '+K.ciP.verb+'. The '+side3+' limit of a '+c3+'% CI for p?',a:side3==='lower'?ph-m3:ph+m3,why:'p̂ = '+fmt(ph)+', margin '+fmt(m3)};}
  if(t==='nmu'){var sig=pick(K.ciN.sig),E=pick(K.ciN.E),c4=pick([90,95,99]),nn3=Math.ceil(Math.pow(Z[c4]*sig/E,2));return {q:'σ is about '+sig+'. Sample size to estimate μ within ± '+E+' at '+c4+'%? Round up.',a:nn3,why:'('+Z[c4]+' × '+sig+' / '+E+')²',exact:true};}
  if(t==='np'){var E2=pick([.02,.03,.05]),c5=pick([90,95]),nn4=Math.ceil(Math.pow(Z[c5]/E2,2)*.25);return {q:'Sample size for a '+c5+'% CI on a proportion with margin ± '+E2+', no prior estimate?',a:nn4,why:'z² × 0.25 / E², worst case p = 0.5',exact:true};}
  var E3=pick([.02,.05]),pr=pick(K.ciNp2),c6=pick([90,95]),nn5=Math.ceil(Math.pow(Z[c6]/E3,2)*pr*(1-pr));return {q:'Prior estimate p ≈ '+pr+'. Sample size for a '+c6+'% CI with margin ± '+E3+'?',a:nn5,why:'z² p(1 − p) / E²',exact:true};},
 reg:function(){var t=pick(['slope','pred','r2','t','r']);
  if(t==='slope'||t==='pred'){var b0=pick(K.regB0),b1=pick(K.regB1);if(t==='slope')return {q:'Fitted line: y = '+b0+' + '+b1+'x. If x rises by 3, predicted y changes by?',a:3*b1,why:'3 × slope'};var x=pick([4,7,10]);return {q:'Fitted line: y = '+b0+' + '+b1+'x. Predict y at x = '+x+'.',a:b0+b1*x,why:b0+' + '+b1+' × '+x};}
  if(t==='r2'){var ssr=pick(K.regSsr),sse=pick(K.regSse);return {q:'SSR = '+ssr+', SSE = '+sse+'. R²?',a:ssr/(ssr+sse),why:'SSR / SST, with SST = '+fmt(ssr+sse)};}
  if(t==='t'){var b=pick(K.regTb),se=pick(K.regTse);return {q:'Slope b₁ = '+b+', SE = '+se+'. t statistic?',a:b/se,why:'b₁ / SE'};}
  var r2v=pick([.64,.81,.49]),sgn=pick([1,-1]);return {q:'R² = '+r2v+' and the slope is '+(sgn>0?'positive':'negative')+'. Correlation r?',a:sgn*Math.sqrt(r2v),why:'±√R², with the sign of the slope'};},
 mreg:function(){var t=pick(['vif','f','dum','adj']);
  if(t==='vif'){var rj=pick(K.mregVif);return {q:'Regressing x₁ on the other x\'s gives R² = '+rj+'. VIF for x₁?',a:1/(1-rj),why:'1 / (1 − '+rj+')'};}
  if(t==='f'){var msr=pick(K.mregMsr),mse=pick(K.mregMse);return {q:'MSR = '+msr+', MSE = '+mse+'. F statistic?',a:msr/mse,why:'MSR / MSE'};}
  if(t==='dum'){var k=pick([2,3,4,5]);return {q:'A qualitative variable has '+k+' categories. How many dummy variables?',a:k-1,why:'k − 1',exact:true};}
  var sse=pick(K.mregSse),sst=pick(K.mregSst),n=pick(K.mregN),k2=pick([2,3]);return {q:'SSE = '+sse+', SST = '+sst+', n = '+n+', k = '+k2+'. Adjusted R²?',a:1-(sse/(n-k2-1))/(sst/(n-1)),why:'1 − [SSE / (n − k − 1)] / [SST / (n − 1)]'};}
};
function gen(id){var q=G[id]();q.mod=id;return q;}
function showAnswer(q){return q.text?(Array.isArray(q.a)?q.a[0]:q.a):fmt(q.a);}

// ---------- router
var PAGES=['home','learn','practice','solve','tools','sources'];
var current={page:null,view:null,item:null};
var firstRender=true;
function parts(){return location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);}
function setHash(h,replace){if(replace){try{history.replaceState(null,'',h);}catch(e){location.hash=h;}}else location.hash=h;}
function selectTabs(listSel,route){document.querySelectorAll(listSel+' [role="tab"]').forEach(function(b){var on=b.dataset.route===route;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;var p=b.getAttribute('aria-controls');if(p&&$(p))$(p).hidden=!on;});}
function render(){
  var p=parts(),page=p[0]||'home';if(PAGES.indexOf(page)<0)page='home';
  var prev=current.page+'/'+current.view+'/'+current.item;
  document.querySelectorAll('[data-page-view]').forEach(function(m){m.hidden=m.dataset.pageView!==page;});
  document.querySelectorAll('.primary a').forEach(function(a){if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  var view=null,item=null;
  if(page==='home')renderHome();
  if(page==='learn'){view=p[1]||'topics';if(['topics','formulas','frameworks'].indexOf(view)<0)view='topics';selectTabs('#page-learn','#learn/'+view);
    if(view==='topics'){item=byId[p[2]]?p[2]:(recall('sigmaTopic')&&byId[recall('sigmaTopic')]?recall('sigmaTopic'):'data');renderTopic(item);}
    if(view==='formulas')renderSheet();
    if(view==='frameworks')renderFrameworks();
    updateSearchPlaceholder(view);applySearch();}
  if(page==='practice'){view=p[1]||'drill';if(['drill','math'].indexOf(view)<0)view='drill';selectTabs('#page-practice','#practice/'+view);$('drill-actions').hidden=view!=='drill';
    if(view==='drill'){renderMeters();var act=p[2];if(act){setHash('#practice/drill',true);if(act==='start')startDrill(allIds(),10,600,false);else if(act==='mock')startDrill(allIds(),20,1800,true);else if(act==='topic'&&byId[p[3]])startTopic(p[3]);}}
    if(view==='math')renderMath();
    }
  if(page==='solve'){renderSolve();var sid=p[1]&&$('sv-'+p[1])?p[1]:'tree';view=sid;document.querySelectorAll('#solve-body .solver').forEach(function(sec){sec.hidden=sec.id!=='sv-'+sid;});document.querySelectorAll('.solve-nav a.chip').forEach(function(a){if(a.getAttribute('href')==='#solve/'+sid){a.setAttribute('aria-current','page');var nav=a.parentNode;nav.scrollLeft=a.offsetLeft-(nav.clientWidth-a.offsetWidth)/2;}else a.removeAttribute('aria-current');});}
  if(page==='tools'){view=TOOLS_BY[p[1]]?p[1]:'excel';renderTools(view);}
  if(page==='sources')renderSources('source',null);
  
  current={page:page,view:view,item:item};
  var key=page+'/'+view+'/'+item;
  if(!firstRender&&key!==prev){var keep=false;if(!keep)window.scrollTo(0,0);}
  store('sigmaRoute','#'+[page,view,item].filter(Boolean).join('/'));
  firstRender=false;
}
function allIds(){return TOPICS.map(function(t){return t.id;});}
window.addEventListener('hashchange',render);
document.addEventListener('keydown',function(e){var tab=e.target.closest&&e.target.closest('[role="tab"]');if(!tab)return;var list=[].slice.call(tab.parentNode.querySelectorAll('[role="tab"]')),i=list.indexOf(tab),n=null;if(e.key==='ArrowRight')n=list[(i+1)%list.length];if(e.key==='ArrowLeft')n=list[(i-1+list.length)%list.length];if(e.key==='Home')n=list[0];if(e.key==='End')n=list[list.length-1];if(n){e.preventDefault();n.focus();n.click();}});
document.addEventListener('click',function(e){var b=e.target.closest('[data-route]');if(b){setHash(b.dataset.route);return;}});
document.addEventListener('click',function(e){var b=e.target.closest('[data-jump]');if(!b)return;var t=$(b.dataset.jump);if(t){t.scrollIntoView({block:'start'});}});

// ---------- home
function progressRow(t,href){var d=stats(t.id),won=isWon(t.id),v=Math.round((d.best||0)*100);return '<li'+(won?' class="won"':'')+'><a href="'+href+'"><span class="n">'+t.n+'</span><span>'+esc(t.short)+'</span><span class="bar" aria-hidden="true"><i style="width:'+v+'%"></i></span><span class="pct">'+(won?'Won':d.asked?v+'%':'0%')+'</span></a></li>';}
function renderHome(){
  $('hero-sub').textContent=DATA.copy.heroSub;
  var due=(S.due||[]).length;$('home-due').textContent=due;$('home-due-note').textContent=due?'Questions you missed, back for another try.':'Nothing due. Misses from any drill show up here.';
  var won=wonCount();$('home-won').textContent=won+' of 13 won';
  $('home-topics').innerHTML=TOPICS.map(function(t){return progressRow(t,'#learn/topics/'+t.id);}).join('');
  $('home-tools').innerHTML='<li><a href="#solve"><b>Solve</b><span>Type in the numbers from any problem and get every answer with the work.</span></a></li>'+DATA.tools.map(function(t){return '<li><a href="#tools/'+t.id+'"><b>'+t.name+'</b><span>'+esc(t.blurb)+'</span></a></li>';}).join('');
  renderSources('home-source',6);
}

// ---------- sources
var sourceFilter={source:'All','home-source':'All'};
function renderSources(prefix,limit){
  var src=DATA.sources,cats=['All'].concat(src.cats),f=sourceFilter[prefix];
  var chips=$(prefix==='source'?'source-chips':'home-source-chips');
  chips.innerHTML=cats.map(function(c){return '<button class="chip" type="button" data-cat="'+c+'" aria-pressed="'+(c===f)+'">'+c+'</button>';}).join('');
  chips.onclick=function(e){var b=e.target.closest('[data-cat]');if(!b)return;sourceFilter[prefix]=b.dataset.cat;renderSources(prefix,limit);};
  var rows=src.list.filter(function(s){return f==='All'||s[0]===f;});var shown=limit?rows.slice(0,limit):rows;
  $(prefix==='source'?'source-list':'home-sources').innerHTML=shown.map(function(s){return '<li><a href="'+esc(s[3])+'" target="_blank" rel="noopener noreferrer"><b>'+esc(s[1])+'</b><span class="why">'+esc(s[2])+'</span><span class="caption"><span>'+esc(s[0])+'</span><span>Checked '+esc(s[4])+'</span></span></a></li>';}).join('');
  if(limit){var more=$('home-sources-more');more.hidden=rows.length<=limit;more.textContent='See all '+rows.length+' '+(f==='All'?'sources':f+' sources');}
  if(prefix==='source')$('source-note').textContent='Note: '+src.note;
}

// ---------- learn: topics
var QUIZ=recall('sigmaQuiz')!=='0';
var mqWide=matchMedia('(min-width:64em)');
function syncDetails(){var d=$('topic-details');if(mqWide.matches)d.open=true;}
mqWide.addEventListener('change',function(){var d=$('topic-details');d.open=mqWide.matches;});
function topicStatus(id){var d=stats(id);if(isWon(id))return '<span class="st won">'+icon('i-check')+'Won</span>';if(d.asked)return '<span class="st">'+Math.round(d.best*100)+'%</span>';return '<span class="st"></span>';}
function topicText(t){return (t.name+' '+strip(t.line)+' '+t.ex.text+' '+t.qa.map(function(q){return q.join(' ');}).join(' ')+' '+strip(t.trap)+' '+t.hook+' '+t.formulas.map(function(f){return f.join(' ');}).join(' ')).toLowerCase();}
var TEXT={};TOPICS.forEach(function(t){TEXT[t.id]=norm(topicText(t));});
function norm(s){return String(s).toLowerCase().replace(/x̄|x-bar|xbar/g,'x bar').replace(/μ/g,'mu').replace(/σ/g,'sigma').replace(/\s+/g,' ');}
function renderTopicList(activeId){
  $('topic-list').innerHTML=TOPICS.map(function(t){return '<li data-topic="'+t.id+'"><a href="#learn/topics/'+t.id+'"'+(t.id===activeId?' aria-current="true"':'')+'><span class="n">'+t.n+'</span><span>'+esc(t.short)+'</span>'+topicStatus(t.id)+'</a></li>';}).join('');
}
function qaHTML(t){return t.qa.map(function(q,i){var ans='<div class="ans" id="ans-'+t.id+'-'+i+'"'+(QUIZ?' hidden':'')+'><span class="val">'+q[1]+'</span>'+(q[2]?'<span class="why">'+q[2]+'</span>':'')+'</div>';return '<li><p class="q">'+q[0]+'</p>'+(QUIZ?'<button class="btn" type="button" data-reveal="ans-'+t.id+'-'+i+'" aria-expanded="false">Show answer</button>':'')+ans+'</li>';}).join('');}
function renderTopic(id){
  var t=byId[id],i=TOPICS.indexOf(t),prev=TOPICS[i-1],next=TOPICS[i+1];
  store('sigmaTopic',id);
  renderTopicList(id);syncDetails();
  $('topic-summary').textContent='Topic '+t.n+' of 13';
  if(current.page==='learn'&&current.view==='topics'&&current.item===id&&$('topic-article').dataset.id===id)return;
  var eyebrow='Topic '+t.n+' of 13'+(t.ref?', '+t.ref:'');
  var labs=(t.labs||[]).map(function(l){return labHTML[l]();}).join('');
  var html='<div><p class="eyebrow">'+eyebrow+'</p><h1 tabindex="-1" id="topic-h1">'+esc(t.name)+'</h1><p class="lead">'+t.line+'</p></div>'+
   '<div class="box subtle"><p class="label">'+esc(t.ex.tag)+' example</p><p>'+t.ex.text+'</p></div>'+labs+
   '<section aria-labelledby="qa-t"><div class="section-head"><h2 id="qa-t">Check yourself</h2><button class="switch" type="button" role="switch" aria-checked="'+QUIZ+'" id="quiz-switch"><span class="track" aria-hidden="true"></span>Quiz mode</button></div><ol class="qa" id="qa-list">'+qaHTML(t)+'</ol></section>'+
   '<div class="box subtle"><p class="label">'+icon('i-warn')+'Trap</p><p>'+t.trap+'</p></div>'+
   '<section aria-labelledby="f-t"><h2 id="f-t" class="block-title">Formulas</h2><dl class="formulas">'+t.formulas.map(function(f){return '<div><dt>'+esc(f[0])+'</dt><dd>'+esc(f[1])+'</dd></div>';}).join('')+'<div><dt>Remember it</dt><dd>'+esc(t.hook)+'</dd></div></dl></section>'+
   '<section aria-labelledby="g-t"><h2 id="g-t" class="block-title">Go deeper</h2><ul class="links">'+t.links.map(function(l){return '<li><a href="'+esc(l[1])+'" target="_blank" rel="noopener noreferrer"><b>'+esc(l[0])+'</b><span>'+esc(l[2])+'</span></a></li>';}).join('')+'</ul></section>'+
   '<div class="end"><a class="btn primary-btn" href="#practice/drill/topic/'+t.id+'">Drill this topic</a><nav class="pager" aria-label="Previous and next topic">'+(prev?'<a class="pg" href="#learn/topics/'+prev.id+'"><span>Previous</span>'+esc(prev.short)+'</a>':'<span class="pg ghost"></span>')+(next?'<a class="pg next" href="#learn/topics/'+next.id+'"><span>Next</span>'+esc(next.short)+'</a>':'<span class="pg ghost"></span>')+'</nav></div>';
  var art=$('topic-article');art.innerHTML=html;art.dataset.id=id;
  (t.labs||[]).forEach(function(l){labInit[l](art);});
  if(!mqWide.matches)$('topic-details').open=false;
  if(!firstRender){var h=$('topic-h1');if(h)h.focus({preventScroll:true});}
}
document.addEventListener('click',function(e){
  var r=e.target.closest('[data-reveal]');if(r){var a=$(r.dataset.reveal);var open=a.hidden;a.hidden=!open;r.textContent=open?'Hide answer':'Show answer';r.setAttribute('aria-expanded',open?'true':'false');return;}
  var sw=e.target.closest('#quiz-switch');if(sw){QUIZ=!QUIZ;store('sigmaQuiz',QUIZ?'1':'0');sw.setAttribute('aria-checked',QUIZ);var t=byId[$('topic-article').dataset.id];$('qa-list').innerHTML=qaHTML(t);return;}
  var tl=e.target.closest('#topic-list a');if(tl&&!mqWide.matches){$('topic-details').open=false;}
});

// ---------- learn: search
var find=$('find');
function updateSearchPlaceholder(view){find.placeholder=view==='topics'?DATA.copy.search:view==='formulas'?'Search the formula sheet':'Search the frameworks';}
function applySearch(){
  var term=norm(find.value.trim()),view=current.view||parts()[1]||'topics';
  if(view==='topics'){var any=false,rng=null,hw=null;
    
    document.querySelectorAll('#topic-list li[data-topic]').forEach(function(li){var t=byId[li.dataset.topic],ok=true;if(term){if(rng&&t.span){var n=+rng[1];ok=n>=t.span[0]&&n<=t.span[1];}else ok=TEXT[t.id].indexOf(term)>-1;}li.hidden=!ok;if(ok)any=true;});
    
    $('topic-empty').hidden=any||!term;if(term&&!mqWide.matches)$('topic-details').open=true;}
  if(view==='formulas'){var anyS=false;document.querySelectorAll('#sheet-body [data-sheet]').forEach(function(sec){var shown=0;sec.querySelectorAll('.sheet-rows>div').forEach(function(r){var ok=!term||norm(r.textContent).indexOf(term)>-1||norm(sec.dataset.title).indexOf(term)>-1;r.hidden=!ok;if(ok)shown++;});sec.hidden=shown===0;if(shown)anyS=true;});$('sheet-empty').hidden=anyS||!term;}
  if(view==='frameworks'){document.querySelectorAll('#fw-body [data-s]').forEach(function(r){r.hidden=!!term&&norm(r.textContent).indexOf(term)<0;});}
}
find.addEventListener('input',applySearch);

// ---------- learn: formula sheet
function renderSheet(){
  if($('sheet-body').dataset.done)return;$('sheet-body').dataset.done='1';
  $('sheet-intro').textContent=DATA.copy.sheetIntro;
  var hooks='<section data-sheet data-title="Memory hooks" aria-labelledby="sh-hooks"><h2 id="sh-hooks" class="block-title">Memory hooks</h2><div class="divided sheet-rows">'+DATA.hooks.map(function(r){return '<div><span class="t">'+esc(r[0])+', '+esc(r[1])+'</span><span class="f"><span class="val">'+esc(r[2])+'</span></span><span class="x">'+esc(r[3])+'</span></div>';}).join('')+'</div></section>';
  var topics=TOPICS.map(function(t){var rows=DATA.sheet[t.id]||[];return '<section data-sheet data-title="'+esc(t.name)+'" aria-labelledby="sh-'+t.id+'"><h2 id="sh-'+t.id+'" class="block-title">'+t.n+'. '+esc(t.name)+'</h2>'+(t.ref?'<p class="caption">'+esc(t.ref.charAt(0).toUpperCase()+t.ref.slice(1))+'</p>':'')+'<div class="divided sheet-rows">'+rows.map(function(r){return '<div><span class="t">'+esc(r[0])+(r[3]?', '+esc(r[3]):'')+'</span><span class="f"><span class="val">'+esc(r[1])+'</span></span><span class="x">'+esc(r[2])+'</span></div>';}).join('')+'</div></section>';}).join('');
  var traps='<section data-sheet data-title="Traps" aria-labelledby="sh-traps"><h2 id="sh-traps" class="block-title">Traps</h2><div class="divided sheet-rows">'+TOPICS.map(function(t){var s=strip(t.trap),dot=s.indexOf('. ');return '<div><span class="t">'+t.n+'. '+esc(t.short)+'</span><span class="f"><span class="val">'+esc(dot>0?s.slice(0,dot+1):s)+'</span></span><span class="x">'+esc(dot>0?s.slice(dot+2):'')+'</span></div>';}).join('')+'</div></section>';
  $('sheet-body').innerHTML=hooks+topics+traps;
  // Jump bar: buttons, not #anchors, because every hash is a route in this app.
  var jump=document.createElement('nav');jump.className='sheet-jump no-print';jump.setAttribute('aria-label','Jump to a section of the formula sheet');
  jump.innerHTML='<button type="button" class="chip" data-jump="sh-hooks">Hooks</button>'+TOPICS.map(function(t){return '<button type="button" class="chip" data-jump="sh-'+t.id+'"><span class="n">'+t.n+'</span> '+esc(t.short||t.name)+'</button>';}).join('')+'<button type="button" class="chip" data-jump="sh-traps">Traps</button>';
  $('sheet-body').parentNode.insertBefore(jump,$('sheet-body'));
}
$('print-sheet').addEventListener('click',function(){try{window.print();}catch(e){}});

// ---------- learn: frameworks
var CH={
 start:{q:'What is the question about?',opts:[['Describing a list of numbers','desc'],['The chance of something happening','prob'],['Guessing about a big group from a sample','inf'],['How one thing relates to another','rel']]},
 desc:{q:'Which part?',opts:[['Where the middle is','r_center'],['How spread out it is','r_spread'],['A random variable with a probability table','r_rv']]},
 prob:{q:'What shape is it?',opts:[['A few events, maybe overlapping, like cards or a two-way table','r_rules'],['n repeats, each a success or failure, count the successes','r_binom'],['Arrivals or occurrences per time window','r_pois'],['A measurement with a mean and SD, like heights, speeds, or demand','r_norm']]},
 inf:{q:'What do you have?',opts:[['A true μ and σ, and a question about a sample average','r_clt'],['A sample mean, and you want a range for the true mean','ci_mean'],['A sample proportion, and you want a range for the true p','r_cip'],['A margin of error, and you want to know how many to sample','r_n']]},
 ci_mean:{q:'Do you know the population σ?',opts:[['Yes, σ is given','r_ciz'],['No, only s from the sample','r_cit']]},
 rel:{q:'How many predictors?',opts:[['One x predicting y','r_reg'],['Several x\'s','r_mreg'],['Two random variables: do they move together?','r_cov']]}
};
var RES={
 r_center:['Mean, median, mode','x̄ = Σx/n. Median: sort, take the middle. Mode: most frequent. With outliers, use the median.','center'],
 r_spread:['Variance and SD','s² = Σ(x − x̄)²/(n − 1), s = √s². Empirical rule for hill-shaped data: 68, 95, 99.7.','spread'],
 r_rv:['Expected value and variance of a random variable','μ = Σ y·P(y). σ² = Σ y²P(y) − μ². Constants: E(a + bY) = a + bμ, Var = b²σ².','rv'],
 r_rules:['The three moves','Or: add, subtract the overlap. And: multiply, updating counts without replacement. Given: shrink to the given, count inside. Independent if P(A given B) = P(A).','prob'],
 r_binom:['Binomial','P(y) = nCy pʸ(1 − p)ⁿ⁻ʸ. Mean np, variance np(1 − p). At least one = 1 − P(0).','count'],
 r_pois:['Poisson','Rescale λ = rate × window. P(y) = e^−λ λʸ/y!. Mean = variance = λ.','poisson'],
 r_norm:['Normal and z','z = (y − μ)/σ. Less than: Φ(z). More than: 1 − Φ(z). Reverse: y = μ + zσ.','normal'],
 r_clt:['Sampling distribution of the mean','x̄ is normal with mean μ and SE = σ/√n. z = (x̄ − μ)/(σ/√n). Totals: mean nμ, SD σ√n.','clt'],
 r_ciz:['CI for μ, σ known','x̄ ± z·σ/√n. z = 1.645, 1.96, 2.576.','ci'],
 r_cit:['CI for μ, σ unknown','x̄ ± t(n − 1)·s/√n. Look up t in the 0.025 or 0.005 column.','ci'],
 r_cip:['CI for a proportion','p̂ ± z√[p̂(1 − p̂)/n]. Check np̂ ≥ 10 and n(1 − p̂) ≥ 10.','ci'],
 r_n:['Sample size','For μ: n = (zσ/E)². For p: n = z²p(1 − p)/E², with p = 0.5 if unknown. E is half the interval length. Round up.','ci'],
 r_reg:['Simple regression','b₁ = [nΣxy − ΣxΣy]/[nΣx² − (Σx)²], b₀ = ȳ − b₁x̄. R² = SSR/SST. t = b₁/SE, df = n − 2.','reg'],
 r_mreg:['Multiple regression','F = MSR/MSE for the whole model. t = bⱼ/SE for each x. VIF above 10 means two x\'s overlap. k categories need k − 1 dummies.','mreg'],
 r_cov:['Covariance and correlation','Cov = ΣΣxyP(x,y) − μxμy. ρ = Cov/(σxσy). Var(bX + cY) = b²V(X) + c²V(Y) + 2bc·Cov.','two']
};
var chPath=[];
function renderChooser(node){var box=$('chooser');if(!box)return;var n=CH[node];
  if(!n){var r=RES[node];box.innerHTML='<p class="small muted">'+esc(chPath.join(', then '))+'</p><div class="result"><p class="ttl">'+r[0]+'</p><p>'+r[1]+'</p><div class="row"><a class="btn primary-btn" href="#learn/topics/'+r[2]+'">Open the topic</a><button class="btn" type="button" data-ch="reset">Start over</button></div></div>';return;}
  box.innerHTML=(chPath.length?'<p class="small muted">'+esc(chPath.join(', then '))+'</p>':'')+'<p class="qq">'+n.q+'</p><div class="opts">'+n.opts.map(function(o){return '<button class="opt" type="button" data-ch="'+o[1]+'">'+esc(o[0])+'</button>';}).join('')+'</div>'+(chPath.length?'<div class="row"><button class="btn" type="button" data-ch="reset">Start over</button></div>':'');}
document.addEventListener('click',function(e){var b=e.target.closest('[data-ch]');if(!b)return;if(b.dataset.ch==='reset'){chPath=[];renderChooser('start');return;}chPath.push(b.textContent);renderChooser(b.dataset.ch);});
function renderFrameworks(){
  if($('fw-body').dataset.done)return;$('fw-body').dataset.done='1';
  var fw=DATA.fw;
  var reading=[['at least one','1 − P(none)','Probability, binomial'],['given, of those, among','Conditional: shrink the world','Probability'],['average of n, sample mean, total of n','Standard error σ/√n, or σ√n for a total','CLT'],['per minute, per hour, arrivals, occurrences','Poisson; rescale λ to the window','Poisson'],['n trials, each a success or failure, how many','Binomial','Binomial'],['within ± E, margin, how many to sample','Sample size, round up','Confidence intervals'],['length of the interval','E is half the length','Confidence intervals'],['s instead of σ, small n','t, not z','Confidence intervals'],['holding the others fixed','A multiple regression coefficient','Multiple regression']];
  var science=[['Plain sentence, then example, then formula','Concrete before abstract','Cognitive load research (Sweller)'],['A picture next to every idea','Dual coding','Paivio; Mayer\'s multimedia principles'],['Solved problems with the answer highlighted','Worked examples','Sweller\'s worked-example effect'],['Quiz mode and drills','Retrieval practice','Roediger and Karpicke; rated high utility in Dunlosky et al. (2013)'],['Missed questions come back later','Spaced practice','Cepeda et al.; Dunlosky et al. (2013)'],['Drills mix topics','Interleaving','Rohrer and Taylor'],['Desk and court analogies','Elaborative encoding','Dunlosky et al. (2013)'],['Timed sets pitched just above your level','Flow','Csikszentmihalyi; self-determination theory (Deci and Ryan)']];
  $('fw-body').innerHTML='<div class="page-head"><h1>Frameworks</h1><p class="lead muted">'+esc(fw.intro)+'</p></div>'+
   '<section aria-labelledby="fw1"><h2 id="fw1" class="block-title">1. Which formula? Answer the questions</h2><div class="box chooser" id="chooser"></div></section>'+
   '<section aria-labelledby="fw2"><h2 id="fw2" class="block-title">2. The three moves in every probability question</h2><ul class="moves divided"><li data-s><b>Or</b><span class="small muted">Add them, then subtract the overlap. '+esc(fw.orEx)+'</span></li><li data-s><b>And</b><span class="small muted">Multiply. Update the second count if there is no replacement.</span></li><li data-s><b>Given</b><span class="small muted">Shrink the list to what you were told, then count inside it. The given goes on the bottom.</span></li></ul></section>'+
   '<section aria-labelledby="fw3"><h2 id="fw3" class="block-title">3. Four S for any exam problem</h2><ol class="numbered divided"><li data-s><div><b>Sketch</b><span>Draw it: a bell with the cutoff, a tree, a two-way table. Ten seconds, and half the mistakes disappear.</span></div></li><li data-s><div><b>Set up</b><span>Write the formula with symbols before numbers. Name μ, σ, n, p. Decide sample or population.</span></div></li><li data-s><div><b>Solve</b><span>Plug in. Say the ballpark out loud first, then use the calculator.</span></div></li><li data-s><div><b>Sanity check</b><span>Is it between 0 and 1? Is the SD smaller than the range? Is the average less noisy than one value? Put units on the answer.</span></div></li></ol></section>'+
   '<section aria-labelledby="fw4"><h2 id="fw4" class="block-title">4. The study loop</h2><ol class="numbered divided"><li data-s><div><b>Learn</b><span>One line and an example.</span></div></li><li data-s><div><b>Lab</b><span>Drag the control until the number makes sense.</span></div></li><li data-s><div><b>Quiz</b><span>Answer before you reveal.</span></div></li><li data-s><div><b>Drill</b><span>Fresh numbers, on a clock.</span></div></li><li data-s><div><b>Due today</b><span>The misses come back.</span></div></li></ol><p class="note">'+esc(fw.loop)+'</p></section>'+
   '<section aria-labelledby="fw5"><h2 id="fw5" class="block-title">5. Reading a question: the words that decide everything</h2><div class="divided sheet-rows">'+reading.map(function(r){return '<div data-s><span class="t">If it says: '+esc(r[0])+'</span><span class="f"><span class="val">'+esc(r[1])+'</span></span><span class="x">Go to '+esc(r[2])+'</span></div>';}).join('')+'</div></section>'+
   '<section aria-labelledby="fw6"><h2 id="fw6" class="block-title">6. Why the page is built this way</h2><div class="divided sheet-rows">'+science.map(function(r){return '<div data-s><span class="t">'+esc(r[0])+'</span><span class="f">'+esc(r[1])+'</span><span class="x">'+esc(r[2])+'</span></div>';}).join('')+'</div></section>';
  chPath=[];renderChooser('start');
}

// ---------- practice: meters and the draw
function renderMeters(){
  var won=wonCount(),ready=Math.round((S.mock||0)*100),due=(S.due||[]).length;
  $('m-won').textContent=won+' of 13';$('m-won-bar').style.width=Math.round(won/13*100)+'%';
  $('m-ready').textContent=ready+'%';$('m-ready-bar').style.width=ready+'%';
  $('m-streak').textContent=plural(S.streak.count||0,'day');$('m-due').textContent=due;
  document.querySelectorAll('.due-n').forEach(function(n){n.textContent=due;});
  $('draw-list').innerHTML=TOPICS.map(function(t){var d=stats(t.id),won=isWon(t.id),v=Math.round((d.best||0)*100),st=won?'Won, best '+v+'%':d.asked?'Best '+v+'%':'Not played';return '<li'+(won?' class="won"':'')+'><a href="#practice/drill/topic/'+t.id+'"><span class="n">'+t.n+'</span><span>'+esc(t.short)+'<span class="st">'+st+'</span></span><span class="bar" aria-hidden="true"><i style="width:'+v+'%"></i></span></a></li>';}).join('');
  var chips=$('drill-chips');if(!chips.dataset.done){chips.dataset.done='1';chips.innerHTML=TOPICS.map(function(t){return '<button class="chip" type="button" data-m="'+t.id+'" aria-pressed="true">'+t.n+'. '+esc(t.short)+'</button>';}).join('');chips.addEventListener('click',function(e){var b=e.target.closest('.chip');if(b)b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true');});}
  $('drill-intro').textContent=DATA.copy.drillIntro;
}
function selMods(){return [].map.call(document.querySelectorAll('#drill-chips .chip[aria-pressed="true"]'),function(b){return b.dataset.m;});}

// ---------- practice: drill engine
var D={qs:[],i:0,correct:0,missed:[],timer:null,end:0,mock:false,answered:false};
function show(id,on){$(id).hidden=!on;}
function startTopic(id){startDrill([id],8,480,false);}
function startDrill(mods,count,seconds,mock,fixed){
  touchStreak();renderMeters();$('drill-msg').textContent='';
  D.mock=mock;D.qs=[];D.i=0;D.correct=0;D.missed=[];
  if(fixed)D.qs=fixed;else{for(var i=0;i<count;i++)D.qs.push(gen(mods[i%mods.length]));D.qs.sort(function(){return Math.random()-.5;});}
  D.end=Date.now()+seconds*1000;
  if(parts()[0]!=='practice'||parts()[1]!=='drill')setHash('#practice/drill');
  show('drill-setup',false);show('drill-result',false);show('drill-card',true);
  clearInterval(D.timer);D.timer=setInterval(tick,500);tick();showQ();
  $('drill-card').scrollIntoView({block:'nearest'});
}
function tick(){var left=Math.max(0,Math.round((D.end-Date.now())/1000)),t=$('d-timer');t.textContent=Math.floor(left/60)+':'+('0'+left%60).slice(-2);t.classList.toggle('low',left<30);if(left<=0){clearInterval(D.timer);finish();}}
function showQ(){var q=D.qs[D.i],done=D.correct+D.missed.length;$('d-prog').textContent='Question '+(D.i+1)+' of '+D.qs.length+(done?', score '+D.correct+' of '+done:'');$('d-topic').textContent=byId[q.mod].short;$('d-q').innerHTML=mt(q.q);var inp=$('d-in');inp.value='';inp.placeholder=q.text?'Type a word':'Your answer';inp.disabled=false;$('d-fb').hidden=true;$('d-fb').innerHTML='';show('d-check',true);show('d-next',false);D.answered=false;inp.focus({preventScroll:true});}
function checkQ(){if(D.answered)return;var q=D.qs[D.i],raw=$('d-in').value.trim();if(!raw)return;var ok;
  if(q.text){var got=raw.toLowerCase().replace(/[^a-z]/g,''),acc=(Array.isArray(q.a)?q.a:[q.a]).map(function(x){return String(x).toLowerCase().replace(/[^a-z]/g,'');});ok=acc.indexOf(got)>-1;}
  else{var v=parseFloat(raw.replace(/[%,$\s]/g,''));if(raw.indexOf('/')>-1){var pr=raw.split('/');v=parseFloat(pr[0])/parseFloat(pr[1]);}if(isNaN(v))ok=false;else if(q.exact)ok=Math.round(v)===Math.round(q.a);else{var tol=Math.max(Math.abs(q.a)*.02,.01);ok=Math.abs(v-q.a)<=tol;}}
  D.answered=true;if(ok)D.correct++;else D.missed.push(q);
  var fb=$('d-fb');fb.innerHTML='<p class="status '+(ok?'ok':'no')+'">'+icon(ok?'i-check':'i-x')+(ok?'Correct':'Not quite')+'</p><p class="small muted">Answer <span class="val">'+esc(mt(showAnswer(q)))+'</span></p><p class="small muted">'+mt(q.why)+'</p>'+(ok?'':'<p class="small muted">This one comes back in Due today.</p>');fb.hidden=false;
  $('d-in').disabled=true;show('d-check',false);show('d-next',true);$('d-next').textContent=D.i+1>=D.qs.length?'See my score':'Next question';$('d-next').focus({preventScroll:true});
  var done=D.correct+D.missed.length;$('d-prog').textContent='Question '+(D.i+1)+' of '+D.qs.length+', score '+D.correct+' of '+done;
}
function nextQ(){D.i++;if(D.i>=D.qs.length)finish();else showQ();}
function finish(){clearInterval(D.timer);if(!D.qs.length)return;var n=D.qs.length,answered=D.correct+D.missed.length,pc=n?D.correct/n:0,per={};
  D.qs.forEach(function(q){per[q.mod]=per[q.mod]||{a:0,c:0};});D.qs.slice(0,answered).forEach(function(q){per[q.mod].a++;if(D.missed.indexOf(q)<0)per[q.mod].c++;});
  Object.keys(per).forEach(function(id){var d=S.drill[id]||{asked:0,correct:0,best:0};d.asked+=per[id].a;d.correct+=per[id].c;if(per[id].a>=4)d.best=Math.max(d.best,per[id].c/per[id].a);S.drill[id]=d;});
  if(D.mock)S.mock=Math.max(S.mock||0,pc);
  S.due=(S.due||[]).concat(D.missed.map(function(q){return q.mod;})).slice(-40);save();renderMeters();
  show('drill-card',false);show('drill-result',true);
  $('r-score').textContent=Math.round(pc*100)+'%';
  var msg=pc>=.8?'Match won. That topic counts toward readiness.':pc>=.6?'Close. One more set and you have it.':'Warm-up set. Read the misses below, then go again.';if(D.mock)msg+=' '+DATA.copy.mockSaved;
  $('r-text').textContent=D.correct+' of '+n+' correct'+(answered<n?' ('+(n-answered)+' unanswered when time ran out)':'')+'. '+msg;
  $('r-missed').innerHTML=D.missed.length?'<h2 class="small muted block-title">Missed questions, back in Due today</h2><ol class="missed">'+D.missed.map(function(q){return '<li><p>'+mt(q.q)+'</p><span class="val">'+esc(mt(showAnswer(q)))+'</span><span class="why">'+mt(q.why)+'</span></li>';}).join('')+'</ol>':'';
  D.qs=[];
  $('drill-result').scrollIntoView({block:'nearest'});
}
$('d-check').addEventListener('click',checkQ);$('d-next').addEventListener('click',nextQ);
$('d-in').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();if(!D.answered)checkQ();else nextQ();}});
$('d-quit').addEventListener('click',function(){finish();});
$('r-again').addEventListener('click',function(){show('drill-result',false);show('drill-setup',true);});
document.addEventListener('click',function(e){var b=e.target.closest('[data-start]');if(!b)return;var k=b.dataset.start;
  if(k==='ten'){var m=selMods();if(!m.length)m=allIds();startDrill(m,10,600,false);}
  if(k==='mock')startDrill(allIds(),20,1800,true);
  if(k==='full')startDrill(allIds(),20,7200,true);
  if(k==='due'){var due=S.due||[];if(!due.length){setHash('#practice/drill');show('drill-card',false);show('drill-result',false);show('drill-setup',true);$('drill-msg').textContent='Nothing is due yet. Run a drill first; any question you miss comes back here.';return;}var qs=due.slice(0,10).map(gen);S.due=due.slice(10);save();startDrill(allIds(),qs.length,600,false,qs);}
});

// ---------- practice: quick math
var MATH=DATA.math,LV=1;
function lv(a,b,c){return LV===1?a:LV===2?b:c;}
var TR=[
 {id:'pctswap',name:'Swap the percent',how:'a% of b equals b% of a. Pick whichever is easier.',ex:'8% of 25 = 25% of 8 = 2',cat:'pct',g:function(){var a=pick(lv([4,5,8,10],[12,15,16,25],[14,18,35,45])),b=pick(lv([25,50,100,200],[75,80,120,250],[64,140,350,480]));return {q:a+'% of '+b,a:a*b/100,h:'Swap it: '+b+'% of '+a+', which is '+(b/100)+' × '+a};}},
 {id:'ladder',name:'Percent ladder',how:'Find 10% by moving the decimal, halve it for 5%, take a tenth of it for 1%, then add the pieces.',ex:'17% of 340: 34 + 17 + 6.8 = 57.8',cat:'pct',g:function(){var p=pick(lv([5,10,15,20],[15,17,22,35],[13,23,37,47])),n=pick(lv([60,120,240,400],[340,260,180,480],[730,910,1240,660]));return {q:p+'% of '+n,a:p*n/100,h:'10% = '+n/10+', 5% = '+n/20+', 1% = '+n/100+'. Build '+p+'% from those.'};}},
 {id:'x5',name:'Times 5, 25, 50',how:'× 5 is half of × 10. × 25 is a quarter of × 100. × 50 is half of × 100.',ex:'48 × 25 = 4,800 ÷ 4 = 1,200',cat:'mul',g:function(){var m=pick([5,25,50]),a=pick(lv([12,14,16,18,22,24],[28,36,44,48,64,72],[76,84,96,124,132,148]));return {q:a+' × '+m,a:a*m,h:m===5?'Half of '+a*10:m===25?'A quarter of '+a*100:'Half of '+a*100};}},
 {id:'d5',name:'Divide by 5',how:'Double it, then divide by 10.',ex:'135 ÷ 5 = 270 ÷ 10 = 27',cat:'mul',g:function(){var c=pick(lv([45,65,85,115],[135,175,245,315],[485,635,715,895]));return {q:c+' ÷ 5',a:c/5,h:'Double: '+c*2+'. Then ÷ 10.'};}},
 {id:'round',name:'Round, multiply, adjust',how:'Round one number to the nearest 10, multiply, then add or subtract the difference.',ex:'19 × 21 = 20 × 21 − 21 = 399',cat:'mul',g:function(){var e=pick(lv([9,11,19,21],[29,31,39,41],[49,51,59,61,99,101])),f=ri(lv(3,11,13),lv(12,30,60)),r=Math.round(e/10)*10;return {q:e+' × '+f,a:e*f,h:r+' × '+f+' = '+r*f+', then '+(e<r?'subtract ':'add ')+Math.abs(e-r)*f};}},
 {id:'sq',name:'Squares near a round number',how:'(a + b)² = a² + 2ab + b². Use a = 10, 20, 50, or 100.',ex:'23² = 400 + 120 + 9 = 529',cat:'sq',g:function(){var a=pick(lv([11,12,13,15,21,25],[14,16,18,22,24,31,32],[41,45,52,48,61,99,102])),base=Math.round(a/10)*10,b=a-base;return {q:a+'²',a:a*a,h:'('+base+(b<0?' − ':' + ')+Math.abs(b)+')² = '+base*base+(b<0?' − ':' + ')+Math.abs(2*base*b)+' + '+b*b};}},
 {id:'sqrt',name:'Square roots by squeezing',how:'Find the two perfect squares around it, then interpolate. Memorize √n for common sample sizes.',ex:'√50: between 7² = 49 and 8² = 64, so about 7.07',cat:'sq',g:function(){var n=pick(lv([16,25,36,49,64,100],[20,30,50,80,200,150],[45,70,90,120,130,300])),lo=Math.floor(Math.sqrt(n));return {q:'√'+n+', one decimal is fine',a:Math.sqrt(n),h:lo+'² = '+lo*lo+' and '+(lo+1)+'² = '+(lo+1)*(lo+1)+'. '+n+' sits '+Math.round((n-lo*lo)/(2*lo+1)*100)+'% of the way up.',loose:true};}},
 {id:'meangap',name:'Mean by gaps from a base',how:'Pick a round base, add up the gaps from it, divide by n, and add back to the base.',ex:MATH.meangapEx,cat:'stats',g:function(){var n=lv(4,5,6),base=pick([50,70,100]),arr=[];for(var i=0;i<n;i++)arr.push(base+ri(-12,12));var gaps=arr.map(function(x){return x-base;});return {q:'Mean of '+arr.join(', '),a:mean(arr),h:'Base '+base+'. Gaps: '+gaps.map(function(g){return (g>=0?'+':'')+g;}).join(', ')+' = '+gaps.reduce(function(a,b){return a+b;},0)+'. Divide by '+n+', add to '+base+'.'};}},
 {id:'median',name:'Median in two moves',how:'Sort, then take the middle. With an even count, average the two middles.',ex:'82, 74, 65, 80, 58 → 58, 65, 74, 80, 82 → 74',cat:'stats',g:function(){var n=lv(5,6,7),arr=[];for(var i=0;i<n;i++)arr.push(ri(40,99));var so=arr.slice().sort(function(a,b){return a-b;});return {q:'Median of '+arr.join(', '),a:median(arr),h:'Sorted: '+so.join(', ')+(n%2?'. The middle is position '+((n+1)/2):'. Average positions '+(n/2)+' and '+(n/2+1))};}},
 {id:'zdist',name:'How many SDs away',how:'(value − mean) ÷ SD. The sign matters. Then the anchors: 1 SD above is about 84% below it, 2 SD above is about 97.7%.',ex:MATH.zdistEx,cat:'stats',g:function(){var mu=pick(MATH.zdistMu),s=pick(lv([10,20],[15,16,25],[12,18,35])),k=pick(lv([-2,-1,1,2],[-1.5,-0.5,0.5,1.5,2.5],[-1.25,0.75,1.75,-2.25])),x=mu+k*s;return {q:'Mean '+mu+', SD '+s+'. How many SDs is '+x+'?',a:k,h:'('+x+' − '+mu+') ÷ '+s+' = '+(x-mu)+' ÷ '+s};}},
 {id:'frac',name:'Probability fractions',how:'The fractions that show up constantly. Learn them as percents.',ex:'1/6 = 16.7%, 13/52 = 25%, 12/51 = 23.5%, 1/36 = 2.8%',cat:'frac',g:function(){var f=pick(lv([[1,4],[1,2],[3,4],[1,5],[13,52],[1,6]],[[1,8],[1,12],[12,51],[4,52],[5,6],[2,3]],[[1,36],[3,8],[26,51],[5,36],[11,12],[3,52]]));return {q:f[0]+'/'+f[1]+' as a decimal, 2 places',a:f[0]/f[1],h:f[1]===52?'Think cards: '+f[0]+' of 52. 13/52 is a quarter.':f[1]===51?'One card gone: '+f[0]+' of 51, just above '+f[0]+'/52.':'1/'+f[1]+' is '+fmt(r3(1/f[1]))+'; multiply by '+f[0]};}},
 {id:'pow',name:'Powers of 0.8 and 0.9',how:'None-of-n questions. Each step drops by 20% or 10%.',ex:MATH.powEx,cat:'frac',g:function(){var b=pick(lv([.5,.8,.9],[.7,.8,.9,.95],[.75,.85,.95,.98])),k=pick(lv([2,3],[3,4,5],[5,8,10]));return {q:b+'^'+k+', 2 places',a:Math.pow(b,k),h:b+' × '+b+' = '+fmt(r3(b*b))+', then keep going '+plural(k-2,'more time')+'. Each step cuts '+Math.round((1-b)*100)+'%.'};}},
 {id:'e',name:'e to a negative power',how:'Poisson P(0) and the empty-window question. Each step divides by about 2.7.',ex:'e⁻¹ = .37, e⁻² = .135, e⁻³ = .05, e⁻⁴ = .018',cat:'frac',g:function(){var l=pick(lv([1,2],[1,2,3,4],[3,4,5,6]));return {q:'e^−'+l+', 3 places',a:Math.exp(-l),h:'Start at 1 and divide by 2.7 '+plural(l,'time')+'. e^−1 = .37, e^−2 = .135, e^−3 = .05, e^−4 = .018.'};}},
 {id:'z',name:'z anchors',how:'The area to the left of z. Everything else is subtracting from these.',ex:'z = 1 → 84%, 1.645 → 95%, 1.96 → 97.5%, 2 → 97.7%',cat:'z',g:function(){var zs=lv([1,2,1.96],[0.5,1,1.28,1.5,1.645,1.96,2],[0.5,1,1.28,1.5,1.645,1.96,2,2.5,3]),z=pick(zs),t=pick(lv(['left','right'],['left','right','between'],['left','right','between'])),anchor='Anchor: the area left of '+z+' is '+fmt(r3(Phi(z)))+'.';if(t==='left')return {q:'Area to the left of z = '+z+', 2 places',a:Phi(z),h:anchor};if(t==='right')return {q:'Area to the right of z = '+z+', 2 places',a:1-Phi(z),h:anchor+' Right is 1 minus that.'};return {q:'Area between z = −'+z+' and +'+z+', 2 places',a:2*Phi(z)-1,h:anchor+' Between is 2 × left − 1.'};}},
 {id:'se',name:'Standard error by √n',how:'σ ÷ √n. Use the √n table: √16 = 4, √25 = 5, √36 = 6, √49 = 7, √64 = 8, √100 = 10.',ex:MATH.seEx,cat:'est',g:function(){var sg=pick(lv(MATH.seSg[0],MATH.seSg[1],MATH.seSg[2])),n=pick(lv([16,25,36,49,100],[20,36,49,64,81],[30,50,75,120,200]));return {q:'Standard error: σ = '+sg+', n = '+n,a:sg/Math.sqrt(n),h:'√'+n+' ≈ '+fmt(r2(Math.sqrt(n)))+'. Then '+sg+' ÷ '+fmt(r2(Math.sqrt(n))),loose:true};}},
 {id:'ball',name:'Ballpark it',how:'Round both numbers to one digit, multiply or divide, then nudge. Anything within 15% counts.',ex:'47 × 62 ≈ 50 × 60 = 3,000 (exactly 2,914)',cat:'est',g:function(){var t=pick(['prod','div']);if(t==='prod'){var a=ri(lv(11,17,23),lv(49,89,199)),b=ri(lv(11,13,17),lv(29,67,99));return {q:'About '+a+' × '+b+'?',a:a*b,h:'≈ '+Math.round(a/10)*10+' × '+Math.round(b/10)*10+' = '+Math.round(a/10)*10*Math.round(b/10)*10,loose:true};}var c=ri(lv(100,300,900),lv(900,2400,9900)),d=pick(lv([3,4,6,8],[7,9,11,13],[17,23,37,53]));return {q:'About '+c+' ÷ '+d+'?',a:c/d,h:d+' × '+Math.round(c/d/10)*10+' ≈ '+d*Math.round(c/d/10)*10+', close to '+c,loose:true};}}
];
var CATN={pct:'Percents',mul:'Multiply and divide',sq:'Squares and roots',stats:'Stats speed',frac:'Fractions and powers',z:'z anchors',est:'Estimation'};
var HABITS=[['Say the trick out loud, then the answer','Saying 25 × 48 is a quarter of 4,800 builds the pathway. Saying 1,200 alone doesn\'t.'],['Estimate before every calculator step on an exam','Each problem becomes a free rep, and it catches typos. If the calculator disagrees with your ballpark by 10×, you typed it wrong.'],['Two 60-second sprints a day','Speed comes from many short retrievals spread over days, not one long session.'],['One trick per day in Learn mode','Pick a trick, press Practice, do ten with hints on. Tomorrow, do it in a sprint.'],['Level up only above 80%','Accuracy first. Speed follows once the method is automatic.']];
var MS={pool:[],q:null,n:0,c:0,missed:[],timer:null,end:0,secs:60,learn:false,label:''};
function renderMath(){
  var chips=$('math-chips');if(chips.dataset.done)return;chips.dataset.done='1';
  chips.innerHTML=Object.keys(CATN).map(function(k){return '<button class="chip" type="button" data-c="'+k+'" aria-pressed="true">'+CATN[k]+'</button>';}).join('');
  chips.addEventListener('click',function(e){var b=e.target.closest('.chip');if(b)b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true');});
  $('math-lvl').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;LV=+b.dataset.l;document.querySelectorAll('#math-lvl button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});});
  $('trick-list').innerHTML=TR.map(function(t,i){return '<li><details'+(i===0?' open':'')+'><summary><span class="name">'+t.name+'</span><svg aria-hidden="true"><use href="#i-down"/></svg></summary><div class="trick-body"><p class="small">'+esc(t.how)+'</p><p class="exm">'+esc(t.ex)+'</p><button class="btn" type="button" data-trick="'+t.id+'">Practice this trick</button></div></details></li>';}).join('');
  $('habits').innerHTML=HABITS.map(function(h){return '<li><div><b>'+esc(h[0])+'</b><span>'+esc(h[1])+'</span></div></li>';}).join('');
  mathBests();
}
function mathBests(){var keys=Object.keys(S.math||{});$('math-bests').innerHTML=keys.length?'Best 60-second sprints: '+keys.map(function(k){return '<b>'+(CATN[k]||'Mixed')+' '+S.math[k]+'</b>';}).join(', '):'No sprints yet. Your best score per category shows here.';}
function mNew(){var t=pick(MS.pool),q=t.g();q.t=t;MS.q=q;$('m-cat').textContent=t.name;$('m-q').textContent=mt(q.q);$('m-hint').textContent=MS.learn?'Trick: '+q.h:'';$('m-prog').textContent='Answered '+MS.n+', correct '+MS.c;var i=$('m-in');i.value='';i.focus({preventScroll:true});$('m-acc').style.width=(MS.n?MS.c/MS.n*100:0)+'%';}
function mFeedback(ok,q){var fb=$('m-fb');fb.hidden=false;fb.innerHTML='<p class="status '+(ok?'ok':'no')+'">'+icon(ok?'i-check':'i-x')+esc(q.q)+' = '+fmt(r3(q.a))+'</p>'+(ok?'':'<p class="small muted">'+esc(q.h)+'</p>');}
function mCheck(){var raw=$('m-in').value.trim();if(!raw)return;var v=parseFloat(raw.replace(/[%,$\s]/g,''));if(raw.indexOf('/')>-1){var pr=raw.split('/');v=parseFloat(pr[0])/parseFloat(pr[1]);}var q=MS.q,tol=q.loose?Math.abs(q.a)*.15:Math.max(Math.abs(q.a)*.02,.006),ok=!isNaN(v)&&Math.abs(v-q.a)<=tol;MS.n++;if(ok)MS.c++;else MS.missed.push(q);mFeedback(ok,q);mNew();}
function mTick(){var left=Math.max(0,Math.round((MS.end-Date.now())/1000)),t=$('m-timer');t.textContent=Math.floor(left/60)+':'+('0'+left%60).slice(-2);t.classList.toggle('low',left<10);if(left<=0)mFinish();}
function mStart(secs,pool,learn,label){touchStreak();MS.pool=pool;MS.learn=learn;MS.label=label;MS.n=0;MS.c=0;MS.missed=[];MS.secs=secs;show('math-setup',false);show('math-result',false);show('math-card',true);$('m-fb').hidden=true;clearInterval(MS.timer);if(learn){$('m-timer').textContent='No clock';$('m-timer').classList.remove('low');}else{MS.end=Date.now()+secs*1000;MS.timer=setInterval(mTick,250);mTick();}mNew();$('math-card').scrollIntoView({block:'nearest'});}
function selPool(){var cats=[].map.call(document.querySelectorAll('#math-chips .chip[aria-pressed="true"]'),function(b){return b.dataset.c;}),pool=TR.filter(function(t){return cats.indexOf(t.cat)>-1;});return {pool:pool.length?pool:TR,cats:cats};}
function mFinish(){clearInterval(MS.timer);show('math-card',false);show('math-result',true);$('ms-score').textContent=plural(MS.c,'correct answer');var rate=MS.n?Math.round(MS.c/MS.n*100):0;$('ms-text').textContent=MS.n+' answered'+(MS.learn?'':' in '+MS.secs+' seconds')+', '+rate+'% accuracy, level '+LV+'. '+(rate<70?'Accuracy first: drop a level or use Learn mode on the missed tricks.':rate>=85&&LV<3?'Clean. Move up a level.':'Good set. Same again tomorrow.');if(!MS.learn&&MS.secs===60){var k=MS.label||'mixed';S.math[k]=Math.max(S.math[k]||0,MS.c);save();}mathBests();$('ms-missed').innerHTML=MS.missed.length?'<h2 class="small muted block-title">Missed, with the trick</h2><ol class="missed">'+MS.missed.map(function(q){return '<li><p>'+esc(q.q)+'</p><span class="val">'+fmt(r3(q.a))+'</span><span class="why">'+esc(q.h)+'</span></li>';}).join('')+'</ol>':'';$('math-result').scrollIntoView({block:'nearest'});}
$('math-sprint').addEventListener('click',function(){var s=selPool();mStart(60,s.pool,false,s.cats.length===1?s.cats[0]:'mixed');});
$('math-sprint3').addEventListener('click',function(){mStart(180,selPool().pool,false,'');});
$('math-learn').addEventListener('click',function(){mStart(0,selPool().pool,true,'');});
document.addEventListener('click',function(e){var b=e.target.closest('[data-trick]');if(!b)return;mStart(0,TR.filter(function(x){return x.id===b.dataset.trick;}),true,'');});
$('m-in').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();mCheck();}});$('m-go').addEventListener('click',mCheck);
$('m-skip').addEventListener('click',function(){MS.n++;MS.missed.push(MS.q);mFeedback(false,MS.q);mNew();});
$('m-stop').addEventListener('click',mFinish);
$('ms-again').addEventListener('click',function(){show('math-result',false);show('math-setup',true);});

// ---------- tools
var TOOLS_BY={};DATA.tools.forEach(function(t){TOOLS_BY[t.id]=t;});
function renderTools(id){
  var tabs=$('tools-tabs');if(!tabs.dataset.done){tabs.dataset.done='1';tabs.innerHTML=DATA.tools.map(function(t){return '<button type="button" role="tab" data-route="#tools/'+t.id+'" aria-controls="tools-body">'+t.name+'</button>';}).join('');}
  document.querySelectorAll('#tools-tabs [role="tab"]').forEach(function(b){var on=b.dataset.route==='#tools/'+id;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;});
  var t=TOOLS_BY[id];
  $('tools-body').innerHTML='<div class="stack-24"><div class="page-head"><h1>'+t.name+'</h1><p class="lead muted">'+esc(t.intro)+'</p></div><div class="divided code-rows">'+t.rows.map(function(r){return '<div><span class="t">'+esc(r[0])+'</span><code>'+esc(r[1])+'</code>'+(r[2]?'<span class="x">'+esc(r[2])+'</span>':'')+'</div>';}).join('')+'</div></div>';
}



// ---------- solve
var SOLVERS=null;
function sNum(v){v=String(v).trim().replace(/,/g,'');if(!v)return NaN;var pc=/%$/.test(v);if(pc)v=v.slice(0,-1);var m=v.match(/^(-?\d*\.?\d+)\s*\/\s*(\d*\.?\d+)$/);var x=m?(+m[1])/(+m[2]):+v;if(pc)x=x/100;return x;}
function sF(x){if(!isFinite(x))return 'n/a';return fmt(x);}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
function frac(a,b){var g=gcd(a,b);return (a/g)+'/'+(b/g);}

function pick(a){return a[Math.floor(Math.random()*a.length)];}
function rint(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function row(q,a,w,hl){return {q:q,a:a,w:w||'',hl:!!hl};}
function isProb(x){return isFinite(x)&&x>=0&&x<=1;}
function jt(head,rows,foot){return '<table class="jt"><thead><tr>'+head.map(function(h){return '<th scope="col">'+esc(h)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c,i){return i?'<td>'+esc(c)+'</td>':'<th scope="row">'+esc(c)+'</th>';}).join('')+'</tr>';}).join('')+'</tbody>'+(foot?'<tfoot><tr>'+foot.map(function(c){return '<td>'+esc(c)+'</td>';}).join('')+'</tr></tfoot>':'')+'</table>';}

function lgam(x){var c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5],y=x,t=x+5.5;t-=(x+.5)*Math.log(t);var s=1.000000000190015;for(var i=0;i<6;i++)s+=c[i]/++y;return -t+Math.log(2.5066282746310005*s/x);}
function betacf(a,b,x){var qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<1e-30)d=1e-30;d=1/d;var h=d;for(var m=1;m<=200;m++){var m2=2*m,aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c;aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;var del=d*c;h*=del;if(Math.abs(del-1)<3e-12)break;}return h;}
function ibeta(a,b,x){if(x<=0)return 0;if(x>=1)return 1;var bt=Math.exp(lgam(a+b)-lgam(a)-lgam(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;}
function tcdf(t,df){var p=.5*ibeta(df/2,.5,df/(df+t*t));return t>0?1-p:p;}
function tinv(p,df){var lo=-200,hi=200;for(var i=0;i<200;i++){var m=(lo+hi)/2;if(tcdf(m,df)<p)lo=m;else hi=m;}return (lo+hi)/2;}
function solverDefs(){return [
 {id:'tree',title:'Tree and Bayes',sub:'Two or three starting branches, then an outcome that either happens or not. Leave branch 3 blank for a two-branch tree. A blank P(branch) fills in as whatever is left.',
  fields:[{k:'a',l:'Branch 1 name',v:'Online',t:1},{k:'pa',l:'P(branch 1)',v:'0.6'},{k:'ha',l:'P(outcome | branch 1)',v:'0.3'},
   {k:'b',l:'Branch 2 name',v:'In store',t:1},{k:'pb',l:'P(branch 2)',v:''},{k:'hb',l:'P(outcome | branch 2)',v:'0.1'},
   {k:'c',l:'Branch 3 name (optional)',v:'',t:1},{k:'pc',l:'P(branch 3)',v:''},{k:'hc',l:'P(outcome | branch 3)',v:''},
   {k:'h',l:'Outcome name',v:'Return',t:1}],
  presets:[['Online vs store returns',{a:'Online',pa:'0.6',ha:'0.3',b:'In store',pb:'',hb:'0.1',c:'',pc:'',hc:'',h:'Return'}],['Interns and offers',{a:'Intern',pa:'0.4',ha:'0.7',b:'Non-intern',pb:'',hb:'0.25',c:'',pc:'',hc:'',h:'Offer'}],['Three suppliers',{a:'Supplier A',pa:'0.5',ha:'0.02',b:'Supplier B',pb:'0.3',hb:'0.03',c:'Supplier C',pc:'',hc:'0.05',h:'Defect'}],['Medical test',{a:'Sick',pa:'0.01',ha:'0.95',b:'Healthy',pb:'',hb:'0.05',c:'',pc:'',hc:'',h:'Positive'}]],
  rand:function(){var three=Math.random()<.4,pa=three?pick([.2,.3,.4,.5]):pick([.3,.4,.6,.65,.7,.75,.8]),pb=three?pick([.2,.3]):'',o={a:'A',b:'B',c:three?'C':'',pa:String(pa),pb:three?String(pb):'',pc:'',ha:String(rint(1,9)/10),hb:String(rint(1,9)/10),hc:three?String(rint(1,9)/10):'',h:'H'};return o;},
  run:function(v){var H=v.h||'H',nH='not '+H,raw=[[v.a||'A',v.pa,v.ha],[v.b||'B',v.pb,v.hb]];
   if(String(v.c).trim()||String(v.pc).trim()||String(v.hc).trim())raw.push([v.c||'C',v.pc,v.hc]);
   var blanks=raw.filter(function(r){return !String(r[1]).trim();}).length;if(blanks>1)return {err:'Give every branch probability except at most one; the blank one fills in as what is left.'};
   var known=raw.reduce(function(s,r){return s+(String(r[1]).trim()?sNum(r[1]):0);},0);
   var br=raw.map(function(r){return {n:r[0],p:String(r[1]).trim()?sNum(r[1]):1-known,h:sNum(r[2])};});
   if(br.some(function(b){return !isProb(b.p)||!isProb(b.h);}))return {err:'Each probability has to be between 0 and 1. You can type 0.7, 70%, or 7/10.'};
   var tot=br.reduce(function(s,b){return s+b.p;},0);if(Math.abs(tot-1)>0.001)return {err:'The branch probabilities add to '+sF(tot)+'. They have to add to 1.'};
   br.forEach(function(b){b.j=b.p*b.h;b.jn=b.p*(1-b.h);});
   var pH=br.reduce(function(s,b){return s+b.j;},0),pN=1-pH,A=br[0],fill=blanks?' ('+br.filter(function(b,i){return !String(raw[i][1]).trim();})[0].n+' = 1 minus the others)':'';
   var cells=[];br.forEach(function(b){cells.push([b.n+' and '+H,b.j]);cells.push([b.n+' and '+nH,b.jn]);});var top=cells.sort(function(x,y){return y[1]-x[1];})[0];
   var t=jt(['',H,nH,'Total'],br.map(function(b){return [b.n,sF(b.j),sF(b.jn),sF(b.p)];}),['Total',sF(pH),sF(pN),'1']);
   var ind=Math.abs(A.h-pH)<1e-9,rows=[];
   rows.push(row('P('+H+')','<b>'+sF(pH)+'</b>',br.map(function(b){return sF(b.p)+' × '+sF(b.h);}).join(' + ')+' = '+br.map(function(b){return sF(b.j);}).join(' + ')+'. Add every '+H+' branch'+fill+'.',1));
   rows.push(row('P('+nH+')',sF(pN),'1 − '+sF(pH)));
   br.forEach(function(b){rows.push(row('P('+H+' | '+b.n+')',sF(b.h),'Given, so read it straight off the branch.'));});
   rows.push(row('P('+A.n+' and '+H+')',sF(A.j),'And means multiply along the branch: '+sF(A.p)+' × '+sF(A.h)));
   br.forEach(function(b,i){rows.push(row('P('+b.n+' | '+H+')',pH?sF(b.j/pH):'n/a','Bayes: '+sF(b.j)+' ÷ '+sF(pH)+(i===0?'. The given ('+H+') is the new total.':''),1));});
   br.forEach(function(b){rows.push(row('P('+b.n+' | '+nH+')',pN?sF(b.jn/pN):'n/a',sF(b.jn)+' ÷ '+sF(pN)));});
   rows.push(row('P('+A.n+' or '+H+')',sF(A.p+pH-A.j),sF(A.p)+' + '+sF(pH)+' − '+sF(A.j)+'. Or means add, minus the overlap.'));
   rows.push(row('Are '+A.n+' and '+H+' independent?',ind?'Yes':'No','P('+H+' | '+A.n+') = '+sF(A.h)+(ind?' equals ':' is not ')+'P('+H+') = '+sF(pH)+'.'));
   rows.push(row('Trap: is P('+A.n+' | '+H+') the same as P('+H+' | '+A.n+')?','No: '+(pH?sF(A.j/pH):'n/a')+' vs '+sF(A.h),'Flipping the given changes the denominator.'));
   rows.push(row('Most likely single outcome',top[0],sF(top[1])+', the biggest branch.'));
   rows.push(row('Two independent times: '+H+' both',sF(pH*pH),sF(pH)+'²'));
   rows.push(row('Two independent times: at least one '+H,sF(1-pN*pN),'1 − '+sF(pN)+'²'));
   return {table:t,rows:rows};}},
 {id:'draws',title:'Draws from a box',sub:'Balls, cards, or defective cameras. Two draws, with or without putting the first one back.',
  fields:[{k:'r',l:'Count of kind 1',v:'4'},{k:'b',l:'Count of kind 2',v:'8'},{k:'rn',l:'Kind 1 name',v:'Green',t:1},{k:'bn',l:'Kind 2 name',v:'White',t:1},{k:'m',l:'Replacement',v:'without',opts:[['without','Without (default)'],['with','With']]}],
  presets:[['4 green, 8 white',{r:'4',b:'8',rn:'Green',bn:'White',m:'without'}],['Parts: 3 bad of 20',{r:'3',b:'17',rn:'Defective',bn:'Good',m:'without'}],['Aces in a deck',{r:'4',b:'48',rn:'Ace',bn:'Other',m:'without'}]],
  rand:function(){return {r:String(rint(3,8)),b:String(rint(4,12)),m:pick(['without','without','with'])};},
  run:function(v){var r=Math.round(sNum(v.r)),b=Math.round(sNum(v.b)),R=v.rn||'Kind 1',Bn=v.bn||'Kind 2',w=v.m==='with';if(!(r>=1&&b>=1&&r+b<=100000))return {err:'Both counts need to be whole numbers of at least 1.'};
   var N=r+b,D=w?N*N:N*(N-1),r2=w?r:r-1,b2=w?b:b-1,rr=r*r2,rb=r*b,bb=b*b2;
   function F(n){return frac(n,D)+' = '+sF(n/D);}
   var s2=w?N:N-1,t=jt(['First, then second','Work','Probability'],[[R+', '+R,r+'/'+N+' × '+r2+'/'+s2,sF(rr/D)],[R+', '+Bn,r+'/'+N+' × '+b+'/'+s2,sF(rb/D)],[Bn+', '+R,b+'/'+N+' × '+r+'/'+s2,sF(rb/D)],[Bn+', '+Bn,b+'/'+N+' × '+b2+'/'+s2,sF(bb/D)]],['Total','',"1"]);
   var pr2=r/N,prr2=rr/D/pr2,dep=Math.abs(r2/s2-pr2)>1e-12;
   return {table:t,rows:[
    row('P('+R+' first)',frac(r,N)+' = '+sF(r/N),r+' of '+N),
    row('P('+R+' then '+R+')',F(rr),r+'/'+N+' × '+r2+'/'+s2+(w?'. Put back, so nothing changes.':'. One '+R+' is gone, so both counts drop by 1.'),1),
    row('P('+R+' then '+Bn+')',F(rb),r+'/'+N+' × '+b+'/'+s2,1),
    row('P('+Bn+' then '+R+')',F(rb),b+'/'+N+' × '+r+'/'+s2),
    row('P('+Bn+' then '+Bn+')',F(bb),b+'/'+N+' × '+b2+'/'+s2),
    row('One of each, either order',F(2*rb),'Both orders: '+frac(rb,D)+' + '+frac(rb,D)+'. Trap: order matters in the line above, not here.'),
    row('At least one '+R,F(D-bb),'1 − P('+Bn+', '+Bn+')'),
    row('At least one '+Bn,F(D-rr),'1 − P('+R+', '+R+')'),
    row('P('+Bn+' second | '+R+' first)',frac(b,s2)+' = '+sF(b/s2),'Given, so shrink the box: '+b+' '+Bn+' left of '+s2+'.'),
    row('P('+R+' second | '+R+' first)',frac(r2,s2)+' = '+sF(r2/s2),r2+' left of '+s2),
    row('P('+R+' on second), first unknown',frac(r,N)+' = '+sF(pr2),'Same as the first draw. Trap question.'),
    row('P('+R+' first | '+R+' second)',sF(prr2),'Bayes: P('+R+','+R+') ÷ P('+R+' second) = '+sF(rr/D)+' ÷ '+sF(pr2),1),
    row('Are the draws independent?',dep?'No':'Yes',dep?'P('+R+' second | '+R+' first) = '+sF(r2/s2)+', not '+sF(pr2)+'. Without replacement, the first draw changes the box.':'With replacement, the box resets every time.')]};}},
 {id:'events',title:'Two events',sub:'Give P(A), P(B), and P(A and B). Venn questions, given, independent, mutually exclusive.',
  fields:[{k:'pa',l:'P(A)',v:'0.6'},{k:'pb',l:'P(B)',v:'0.5'},{k:'pab',l:'P(A and B)',v:'0.3'}],
  presets:[['Die: 6 given over 3',{pa:'1/6',pb:'1/2',pab:'1/6'}],['Independent',{pa:'0.6',pb:'0.5',pab:'0.3'}],['Mutually exclusive',{pa:'0.25',pb:'0.45',pab:'0'}]],
  rand:function(){var pa=rint(2,7)/10,pb=rint(2,7)/10,pab=pick([Math.round(pa*pb*100)/100,Math.round(Math.min(pa,pb)*rint(1,9)/10*100)/100,0]);if(pa+pb-pab>1)pab=Math.round((pa+pb-1)*100)/100+0.05;return {pa:String(pa),pb:String(pb),pab:String(Math.round(pab*100)/100)};},
  run:function(v){var a=sNum(v.pa),b=sNum(v.pb),ab=sNum(v.pab);if(!isProb(a)||!isProb(b)||!isProb(ab))return {err:'Each probability has to be between 0 and 1.'};if(ab>Math.min(a,b)+1e-12||a+b-ab>1+1e-12)return {err:'Those numbers are impossible: P(A and B) cannot be bigger than P(A) or P(B), and P(A or B) cannot pass 1.'};
   var u=a+b-ab,ind=Math.abs(ab-a*b)<1e-9,me=ab<1e-12;
   var t=jt(['','B','not B','Total'],[['A',sF(ab),sF(a-ab),sF(a)],['not A',sF(b-ab),sF(1-u),sF(1-a)]],['Total',sF(b),sF(1-b),'1']);
   return {table:t,rows:[
    row('P(A or B)',sF(u),sF(a)+' + '+sF(b)+' − '+sF(ab)+'. Subtract the overlap once.',1),
    row('P(A | B)',b?sF(ab/b):'n/a',sF(ab)+' ÷ '+sF(b)+'. B is the new total.',1),
    row('P(B | A)',a?sF(ab/a):'n/a',sF(ab)+' ÷ '+sF(a),1),
    row('P(not A)',sF(1-a),'1 − '+sF(a)),
    row('P(neither)',sF(1-u),'1 − P(A or B)'),
    row('P(A only)',sF(a-ab),sF(a)+' − '+sF(ab)),
    row('P(exactly one)',sF(u-ab),'P(A or B) − P(A and B)'),
    row('Independent?',ind?'Yes':'No','P(A) × P(B) = '+sF(a*b)+(ind?' equals ':' is not ')+'P(A and B) = '+sF(ab)+'.'),
    row('Mutually exclusive?',me?'Yes':'No',me?'P(A and B) = 0. So they are dependent (if both can happen): knowing A tells you B did not.':'They overlap, P(A and B) = '+sF(ab)+'.')]};}},
 {id:'trials',title:'Repeated trials',sub:'Same chance every time, independent: free throws, coin flips, dice. None, at least one, exactly k.',
  fields:[{k:'p',l:'P(success) each time',v:'0.7'},{k:'n',l:'Number of trials n',v:'5'},{k:'k',l:'Exactly k',v:'4'}],
  presets:[['Free throws: 70%, 5 shots',{p:'0.7',n:'5',k:'4'}],['Coin: 3 flips',{p:'0.5',n:'3',k:'2'}],['Die: a six in 4 rolls',{p:'1/6',n:'4',k:'1'}]],
  rand:function(){var n=rint(2,6);return {p:String(pick([.1,.2,.25,.3,.4,.5,.6,.7])),n:String(n),k:String(rint(1,n))};},
  run:function(v){var p=sNum(v.p),n=Math.round(sNum(v.n)),k=Math.round(sNum(v.k));if(!isProb(p))return {err:'P(success) has to be between 0 and 1.'};if(!(n>=1&&n<=200))return {err:'n has to be a whole number from 1 to 200.'};if(!(k>=0&&k<=n))return {err:'k has to be between 0 and n.'};
   var q=1-p,none=Math.pow(q,n),ex=choose(n,k)*Math.pow(p,k)*Math.pow(q,n-k),le=0,i;for(i=0;i<=k;i++)le+=choose(n,i)*Math.pow(p,i)*Math.pow(q,n-i);var ge=1-le+ex;
   var t=n<=10?jt(['Successes','Probability'],Array.apply(null,{length:n+1}).map(function(_,y){return [String(y),sF(choose(n,y)*Math.pow(p,y)*Math.pow(q,n-y))];})):'';
   return {table:t,rows:[
    row('P(none)',sF(none),sF(q)+'^'+n+'. And means multiply.',1),
    row('P(at least one)',sF(1-none),'1 − '+sF(q)+'^'+n+'. Always use the complement.',1),
    row('P(all '+n+')',sF(Math.pow(p,n)),sF(p)+'^'+n),
    row('P(exactly '+k+')',sF(ex),choose(n,k)+' × '+sF(p)+'^'+k+' × '+sF(q)+'^'+(n-k)+'. The '+choose(n,k)+' counts the orders.',1),
    row('P(at most '+k+')',sF(le),'Add exactly 0 through '+k),
    row('P(at least '+k+')',sF(ge),'1 − P(at most '+(k-1)+')'),
    row('P(exactly '+k+' | at least one)',k>=1?sF(ex/(1-none)):'n/a',k>=1?sF(ex)+' ÷ '+sF(1-none)+'. Given at least one, so that is the new total.':'k = 0 cannot happen given at least one.'),
    row('Expected number np',sF(n*p),n+' × '+sF(p)),
    row('SD √(npq)',sF(Math.sqrt(n*p*q)),'√('+n+' × '+sF(p)+' × '+sF(q)+')')]};}},
 {id:'poisson',title:'Poisson counts',sub:'Arrivals, calls, defects: a rate per unit of time or space. Scale the rate to the window first.',
  fields:[{k:'r',l:'Rate per unit',v:'4'},{k:'u',l:'Unit name',v:'hour',t:1},{k:'t',l:'Window, in units',v:'1'},{k:'k',l:'Count k',v:'3'}],
  presets:[['Calls: 4 an hour, exactly 3',{r:'4',u:'hour',t:'1',k:'3'}],['Calls: 1 or fewer in 30 minutes',{r:'4',u:'hour',t:'0.5',k:'1'}],['Typos: 1.5 a page, 2 pages',{r:'1.5',u:'page',t:'2',k:'2'}]],
  rand:function(){return {r:String(pick([1,1.5,2,3,4,5])),t:String(pick([.5,1,2,3])),k:String(rint(0,6))};},
  run:function(v){var r=sNum(v.r),t=sNum(v.t),k=Math.round(sNum(v.k)),U=v.u||'unit';if(!(r>0)||!(t>0))return {err:'Rate and window both have to be above 0.'};if(!(k>=0&&k<=500))return {err:'k has to be a whole number of 0 or more.'};
   var L=r*t;function pf(y){var lp=-L+y*Math.log(L);for(var i=2;i<=y;i++)lp-=Math.log(i);return Math.exp(lp);}
   var le=0,i;for(i=0;i<=k;i++)le+=pf(i);var lt=le-pf(k),top=Math.min(40,Math.max(k,Math.ceil(L+3*Math.sqrt(L)))),cum=0,tr=[];for(i=0;i<=top;i++){cum+=pf(i);tr.push([String(i),sF(pf(i)),sF(cum)]);}
   return {table:jt(['Count','P(exactly)','P(this many or fewer)'],tr),rows:[
    row('λ for this window','<b>'+sF(L)+'</b>',sF(r)+' per '+U+' × '+sF(t)+' '+U+(t===1?'':'s')+'. Scale the rate first; this is the step people miss.',1),
    row('P(exactly '+k+')',sF(pf(k)),'e^−'+sF(L)+' × '+sF(L)+'^'+k+' / '+k+'!',1),
    row('P('+k+' or fewer)',sF(le),'Add P(0) through P('+k+')',1),
    row('P(fewer than '+k+')',sF(lt),'Add P(0) through P('+(k-1)+')'),
    row('P(at least '+k+')',sF(1-lt),'1 − P('+(k-1)+' or fewer)'),
    row('P(more than '+k+')',sF(1-le),'1 − P('+k+' or fewer)'),
    row('P(none)',sF(Math.exp(-L)),'e^−'+sF(L)),
    row('P(at least one)',sF(1-Math.exp(-L)),'1 − e^−'+sF(L)),
    row('Mean and variance',sF(L),'Both equal λ for a Poisson. SD = √λ = '+sF(Math.sqrt(L)))]};}},
 {id:'normal',title:'Normal curve',sub:'Mean and SD, then any value. More than, less than, between, the top or bottom cutoff, several in a row, and averages of n.',
  fields:[{k:'mu',l:'Mean μ',v:'500'},{k:'sd',l:'SD σ',v:'40'},{k:'a',l:'Value x',v:'540'},{k:'b',l:'Second value (for between)',v:''},{k:'pct',l:'Top or bottom %',v:'5'},{k:'m',l:'How many in a row (all below x)',v:'3'},{k:'n',l:'Sample size n (for the average)',v:'16'}],
  presets:[['Battery: over 540 hours',{mu:'500',sd:'40',a:'540',b:'',pct:'5',m:'1',n:'1'}],['Between 450 and 560',{mu:'500',sd:'40',a:'450',b:'560',pct:'5',m:'1',n:'1'}],['Three all under 480',{mu:'500',sd:'40',a:'480',b:'',pct:'5',m:'3',n:'1'}],['Average of 16 under 510',{mu:'500',sd:'40',a:'510',b:'',pct:'5',m:'1',n:'16'}]],
  rand:function(){var mu=pick([50,100,266,500,72]),sd=pick([5,8,10,15,16,40]),a=mu+sd*pick([-2,-1.5,-1,-.5,.5,1,1.25,2]);return {mu:String(mu),sd:String(sd),a:String(a),b:Math.random()<.5?String(mu+sd*pick([1,1.5,2])):'',pct:String(pick([5,10,20,25])),m:String(pick([1,2,3])),n:String(pick([1,16,25,36,49]))};},
  run:function(v){var mu=sNum(v.mu),sd=sNum(v.sd),a=sNum(v.a),b=String(v.b).trim()?sNum(v.b):null,pc=sNum(v.pct),m=Math.round(sNum(v.m)||1),n=Math.round(sNum(v.n)||1);if(!isFinite(mu)||!(sd>0)||!isFinite(a))return {err:'Type a mean, an SD above 0, and a value.'};
   function zt(z){var zr=Math.round(z*100)/100;return Math.abs(zr-z)>1e-9&&Math.abs(Phi(zr)-Phi(z))>=0.0005?' (z-table with z rounded to '+zr.toFixed(2)+': '+sF(Phi(zr))+')':'';}
   var z=(a-mu)/sd,lo=Phi(z),rows=[];
   rows.push(row('z for x = '+sF(a),'<b>'+sF(z)+'</b>','(x − μ) / σ = ('+sF(a)+' − '+sF(mu)+') / '+sF(sd)+'. How many SDs from the mean.',1));
   rows.push(row('P(X < '+sF(a)+')',sF(lo),'Φ('+sF(z)+')'+zt(z),1));
   rows.push(row('P(X > '+sF(a)+')',sF(1-lo),'1 − Φ('+sF(z)+')',1));
   if(b!==null&&isFinite(b)){var lo2=Math.min(a,b),hi2=Math.max(a,b),z1=(lo2-mu)/sd,z2=(hi2-mu)/sd;rows.push(row('P('+sF(lo2)+' < X < '+sF(hi2)+')',sF(Phi(z2)-Phi(z1)),'Φ('+sF(z2)+') − Φ('+sF(z1)+') = '+sF(Phi(z2))+' − '+sF(Phi(z1)),1));}
   if(pc>0&&pc<100){var p=pc/100,zc=PhiInv(1-p);rows.push(row('Top '+sF(pc)+'% starts at',sF(mu+zc*sd),'μ + zσ with z = '+zc.toFixed(2)+': '+sF(mu)+' + '+zc.toFixed(2)+' × '+sF(sd)+'. Work backwards: area first, then z, then x.',1));rows.push(row('Bottom '+sF(pc)+'% ends at',sF(mu-zc*sd),sF(mu)+' − '+zc.toFixed(2)+' × '+sF(sd)));}
   if(m>=2){rows.push(row('All '+m+' below '+sF(a),sF(Math.pow(lo,m)),sF(lo)+'^'+m+'. Independent, so multiply.',1));rows.push(row('All '+m+' above '+sF(a),sF(Math.pow(1-lo,m)),sF(1-lo)+'^'+m));rows.push(row('At least one of '+m+' above '+sF(a),sF(1-Math.pow(lo,m)),'1 − '+sF(lo)+'^'+m));}
   if(n>=2){var se=sd/Math.sqrt(n),zm=(a-mu)/se;rows.push(row('Standard error of the average',sF(se),'σ / √n = '+sF(sd)+' / √'+n+'. Averages wobble less than single values.'));rows.push(row('z for an average of '+sF(a),sF(zm),'('+sF(a)+' − '+sF(mu)+') / '+sF(se)));rows.push(row('P(average of '+n+' < '+sF(a)+')',sF(Phi(zm)),'Φ('+sF(zm)+')'+zt(zm),1));rows.push(row('P(average of '+n+' > '+sF(a)+')',sF(1-Phi(zm)),'1 − Φ('+sF(zm)+')'));}
   rows.push(row('Empirical rule check','68% within '+sF(mu-sd)+' to '+sF(mu+sd)+'; 95% within '+sF(mu-2*sd)+' to '+sF(mu+2*sd)+'; 99.7% within '+sF(mu-3*sd)+' to '+sF(mu+3*sd),'Plus or minus 1, 2, and 3 SDs.'));
   return {table:'',rows:rows};}},
 {id:'ci',title:'Confidence intervals and sample size',sub:'Mean with s (t), mean with σ known (z), or a proportion. Then the sample size for a target margin.',
  fields:[{k:'kind',l:'Type',v:'t',opts:[['t','Mean, s from the sample (t)'],['z','Mean, σ known (z)'],['p','Proportion']]},{k:'cl',l:'Confidence',v:'0.95',opts:[['0.90','90%'],['0.95','95%'],['0.99','99%']]},{k:'n',l:'Sample size n',v:'25'},{k:'xbar',l:'Mean x̄ (mean types)',v:'42.5'},{k:'s',l:'SD s or σ (mean types)',v:'6.2'},{k:'x',l:'Count with the trait (proportion)',v:''},{k:'e',l:'Target E (for sample size)',v:'2'},{k:'em',l:'E is',v:'m',opts:[['m','The margin (±)'],['l','The full length']]}],
  presets:[['Delivery times: 95%, n 25',{kind:'t',cl:'0.95',n:'25',xbar:'42.5',s:'6.2',x:'',e:'2',em:'m'}],['Survey: 240 of 400 say yes',{kind:'p',cl:'0.95',n:'400',xbar:'',s:'',x:'240',e:'0.06',em:'l'}]],
  rand:function(){var k=pick(['t','z','p']),n=pick([16,25,36,49,100,400]);if(k==='p'){var x=Math.round(n*pick([.2,.35,.5,.6,.72]));return {kind:k,cl:pick(['0.90','0.95','0.99']),n:String(n),xbar:'',s:'',x:String(x),e:String(pick([.03,.05,.06,.1])),em:pick(['m','l'])};}return {kind:k,cl:pick(['0.90','0.95','0.99']),n:String(n),xbar:String(pick([42.5,71.2,80,120])),s:String(pick([6.2,10.5,12,15])),x:'',e:String(pick([1,2,3,5])),em:'m'};},
  run:function(v){var kind=v.kind,cl=+v.cl,n=Math.round(sNum(v.n)),a=1-cl,zc=+PhiInv(1-a/2).toFixed(3),E=sNum(v.e),E1=isFinite(E)&&E>0?(v.em==='l'?E/2:E):NaN,rows=[],lvl=Math.round(cl*100)+'%';
   if(!(n>=2))return {err:'n has to be a whole number of at least 2.'};
   if(kind==='p'){var x=sNum(v.x);if(!(x>=0&&x<=n))return {err:'Type the count with the trait, between 0 and n.'};var ph=x/n,q=1-ph,se=Math.sqrt(ph*q/n),me=zc*se;
    rows.push(row('p̂',sF(ph),sF(x)+' / '+n));
    rows.push(row(lvl+' interval for p','<b>'+sF(ph-me)+' to '+sF(ph+me)+'</b>','p̂ ± z√[p̂(1 − p̂)/n] = '+sF(ph)+' ± '+zc+' × '+sF(se)+' = '+sF(ph)+' ± '+sF(me),1));
    rows.push(row('Margin of error',sF(me),zc+' × '+sF(se)));
    rows.push(row('Interval for the complement (1 − p)',sF(q-me)+' to '+sF(q+me),sF(q)+' ± '+sF(me)+'. Trap: read whether the question asks about those with the trait or without.'));
    rows.push(row('Normal check',(n*ph>=10&&n*q>=10)?'OK':'Too small','np̂ = '+sF(n*ph)+' and n(1 − p̂) = '+sF(n*q)+'; both need to be at least 10.'));
    if(isFinite(E1)){rows.push(row('Sample size, no prior guess (p = 0.5)',String(Math.ceil(zc*zc*.25/(E1*E1)-1e-9)),'z²(0.5)(0.5) / E² = '+zc+'² × 0.25 / '+sF(E1)+'² = '+sF(zc*zc*.25/(E1*E1))+'. Round up.'+(v.em==='l'?' Length '+sF(E)+' means E = '+sF(E1)+'.':''),1));
     rows.push(row('Sample size using p̂ = '+sF(ph),String(Math.ceil(zc*zc*ph*q/(E1*E1)-1e-9)),'z² p̂(1 − p̂) / E² = '+sF(zc*zc*ph*q/(E1*E1))+'. Round up.',1));}
   }else{var xb=sNum(v.xbar),s=sNum(v.s);if(!isFinite(xb)||!(s>0))return {err:'Type the mean and an SD above 0.'};var se2=s/Math.sqrt(n),crit=kind==='t'?+tinv(1-a/2,n-1).toFixed(3):zc,me2=crit*se2;
    rows.push(row('Critical value',(kind==='t'?'t = ':'z = ')+crit,kind==='t'?'t with n − 1 = '+(n-1)+' df, '+lvl+' two-sided. σ unknown, so t.':'σ known, so z.'));
    rows.push(row('Standard error',sF(se2),'s / √n = '+sF(s)+' / √'+n));
    rows.push(row(lvl+' interval for μ','<b>'+sF(xb-me2)+' to '+sF(xb+me2)+'</b>','x̄ ± '+crit+' × '+sF(se2)+' = '+sF(xb)+' ± '+sF(me2),1));
    rows.push(row('Margin of error',sF(me2),crit+' × '+sF(se2)));
    if(isFinite(E1)){rows.push(row('Sample size for ± '+sF(E1)+' (z)',String(Math.ceil(Math.pow(zc*s/E1,2)-1e-9)),'(zσ/E)² = ('+zc+' × '+sF(s)+' / '+sF(E1)+')² = '+sF(Math.pow(zc*s/E1,2))+'. Round up. The usual textbook answer.',1));
     if(kind==='t')rows.push(row('Same, if you keep t = '+crit,String(Math.ceil(Math.pow(crit*s/E1,2)-1e-9)),'('+crit+' × '+sF(s)+' / '+sF(E1)+')² = '+sF(Math.pow(crit*s/E1,2))+'. Check which one the course uses.'));}
   }
   rows.push(row('What it means','We are '+lvl+' confident the true value is in this range','Not a '+lvl+' chance for this one interval; '+lvl+' of intervals built this way catch the truth.'));
   return {table:'',rows:rows};}},
 {id:'bday',title:'Birthday problem',sub:'Chance that at least two people in a room share a birthday. Type the head count.',
  fields:[{k:'n',l:'People in the room',v:'40'},{k:'d',l:'Days in a year',v:'365'}],
  presets:[['A room of 40',{n:'40',d:'365'}],['22 people',{n:'22',d:'365'}],['23 people',{n:'23',d:'365'}]],
  rand:function(){return {n:String(rint(5,70)),d:'365'};},
  run:function(v){var n=Math.round(sNum(v.n)),d=Math.round(sNum(v.d));if(!(d>=2&&d<=10000))return {err:'Days has to be a whole number, normally 365.'};if(!(n>=1&&n<=5000))return {err:'People has to be a whole number of at least 1.'};
   function diff(k){if(k>d)return 0;var p=1;for(var i=0;i<k;i++)p*=(d-i)/d;return p;}
   function first(t){for(var k=1;k<=d+1;k++)if(1-diff(k)>=t)return k;return d+1;}
   var pd=diff(n),pairs=n*(n-1)/2,you=1-Math.pow((d-1)/d,n-1),n50=first(.5),n99=first(.99);
   var ks=[2,10,20,22,23,30,40,50,57,n].filter(function(k,i,a){return a.indexOf(k)===i;}).sort(function(a,b){return a-b;});
   var t=jt(['People','P(shared birthday)'],ks.map(function(k){return [String(k)+(k===n?' (yours)':''),sF(1-diff(k))];}));
   return {table:t,rows:[
    row('P(at least two share a birthday), n = '+n,'<b>'+sF(1-pd)+'</b>','1 − P(all different). Complement, the same move as at least one.',1),
    row('P(all different birthdays)',sF(pd),d+'/'+d+' × '+(d-1)+'/'+d+' × '+(d-2)+'/'+d+' × ... × '+Math.max(d-n+1,0)+'/'+d+' ('+n+' fractions)'),
    row('P(someone shares YOUR birthday)',sF(you),'1 − ('+(d-1)+'/'+d+')^'+(n-1)+'. Different question: only pairs that include you count.',1),
    row('Number of pairs',sF(pairs),n+' × '+(n-1)+' / 2. Why it climbs so fast: every pair is a chance to match.'),
    row('Expected matching pairs',sF(pairs/d),sF(pairs)+' / '+d),
    row('People needed for a 50% chance',String(n50),d===365?'The famous answer: 23 people':''),
    row('People needed for a 99% chance',String(n99),''),
    row('Assumption to say out loud','Equal odds for every day, no leap day, no twins','Real birthdays cluster a little, which makes a match slightly more likely.')]};}},
 {id:'data',title:'Describe data',sub:'Paste a list. Mean, median, mode, range, variance, SD, with the work written out step by step.',
  fields:[{k:'x',l:'Numbers, separated by commas or spaces',v:'32, 25, 41, 25, 38, 29, 44, 25, 36',t:1,wide:1}],
  presets:[['Commute minutes',{x:'32, 25, 41, 25, 38, 29, 44, 25, 36'}],['Weekly sales',{x:'12, 18, 9, 15, 18, 21, 14'}]],
  rand:function(){var n=rint(6,9),a=[];for(var i=0;i<n;i++)a.push(rint(50,90));if(Math.random()<.6)a[rint(1,n-1)]=a[0];return {x:a.join(', ')};},
  run:function(v){var xs=String(v.x).split(/[\s,;]+/).filter(Boolean).map(Number);if(xs.length<2||xs.some(function(x){return !isFinite(x);}))return {err:'Type at least two numbers, separated by commas or spaces.'};
   var n=xs.length,S=xs.reduce(function(a,b){return a+b;},0),m=S/n,so=xs.slice().sort(function(a,b){return a-b;}),med=n%2?so[(n-1)/2]:(so[n/2-1]+so[n/2])/2,cnt={},mx=0;so.forEach(function(x){cnt[x]=(cnt[x]||0)+1;if(cnt[x]>mx)mx=cnt[x];});
   var modes=Object.keys(cnt).filter(function(k){return cnt[k]===mx;}).map(Number).sort(function(a,b){return a-b;}),dev=xs.map(function(x){return x-m;}),ss=dev.reduce(function(a,d){return a+d*d;},0),sx2=xs.reduce(function(a,x){return a+x*x;},0),s2=ss/(n-1);
   var modeTxt=mx===1?'No mode':modes.join(' and ')+(modes.length===2?' (bimodal)':'');
   return {table:'',rows:[
    row('Sorted (n = '+n+')',so.join(', '),'Sort first. Median and mode fall out.'),
    row('Mean x̄',sF(m),'Σx / n = '+sF(S)+' / '+n,1),
    row('Median',sF(med),n%2?'Middle value, position '+((n+1)/2):'Average of positions '+(n/2)+' and '+(n/2+1)+': ('+so[n/2-1]+' + '+so[n/2]+') / 2',1),
    row('Mode',modeTxt,mx===1?'Every value shows up once.':'Shows up '+mx+' times.',1),
    row('Range',sF(so[n-1]-so[0]),so[n-1]+' − '+so[0],1),
    row('Deviations from x̄',dev.map(function(d){return sF(d);}).join(', '),'They add to 0, which checks the mean.'),
    row('Squared deviations, Σ',sF(ss),dev.map(function(d){return sF(d*d);}).join(' + ')),
    row('Sample variance s²',sF(s2),sF(ss)+' / '+(n-1)+'. Sample, so divide by n − 1.',1),
    row('Sample SD s',sF(Math.sqrt(s2)),'√'+sF(s2),1),
    row('Shortcut check',sF((sx2-S*S/n)/(n-1)),'[Σx² − (Σx)²/n] / (n − 1) = ('+sF(sx2)+' − '+sF(S*S/n)+') / '+(n-1)),
    row('If the question says population',sF(ss/n)+' and σ = '+sF(Math.sqrt(ss/n)),'Divide by n = '+n+' instead.'),
    row('Mean vs median',m<med?'Mean below median: pulled left':m>med?'Mean above median: pulled right':'Equal: symmetric','The mean chases the tail; the median does not move.')]};}}
];}

function renderSolve(){
  var body=$('solve-body');if(body.dataset.done)return;body.dataset.done='1';SOLVERS=solverDefs();
  body.innerHTML=SOLVERS.map(function(S,i){
    return '<section class="box solver'+(S.id==='tree'?' span2':'')+'" id="sv-'+S.id+'" aria-labelledby="sv-'+S.id+'-title"><div class="stack-4"><h2 id="sv-'+S.id+'-title">'+(i+1)+'. '+S.title+'</h2><p class="small muted">'+esc(S.sub)+'</p></div>'+
     '<div class="chips" role="group" aria-label="Examples">'+S.presets.map(function(p,j){return '<button type="button" class="chip" data-sv="'+S.id+'" data-preset="'+j+'">'+esc(p[0])+'</button>';}).join('')+'</div>'+
     '<div class="inputs">'+S.fields.map(function(f){var id='sv-'+S.id+'-'+f.k;return '<div class="field'+(f.wide?' wide':'')+'"><label for="'+id+'">'+esc(f.l)+'</label>'+(f.opts?'<select id="'+id+'" data-sv="'+S.id+'">'+f.opts.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===f.v?' selected':'')+'>'+esc(o[1])+'</option>';}).join('')+'</select>':'<input id="'+id+'" type="text" data-sv="'+S.id+'" value="'+esc(f.v)+'" autocomplete="off"'+(f.t?'':' inputmode="decimal"')+'>')+'</div>';}).join('')+'</div>'+
     '<div class="row"><button type="button" class="btn" data-sv="'+S.id+'" data-act="new">New problem</button><button type="button" class="btn primary-btn" data-sv="'+S.id+'" data-act="show" hidden>Show answers</button><button type="button" class="btn" data-sv="'+S.id+'" data-act="copy">Copy work</button></div>'+
     '<p class="solve-msg" id="sv-'+S.id+'-err" role="alert" hidden></p><div id="sv-'+S.id+'-out" aria-live="polite"></div></section>';
  }).join('');
  SOLVERS.forEach(function(S){S.practice=false;solveRun(S);});
  body.addEventListener('input',function(e){var id=e.target.dataset&&e.target.dataset.sv;if(!id)return;var S=SOLVERS.filter(function(x){return x.id===id;})[0];solveRun(S);});
  body.addEventListener('change',function(e){var id=e.target.dataset&&e.target.dataset.sv;if(!id||e.target.tagName!=='SELECT')return;var S=SOLVERS.filter(function(x){return x.id===id;})[0];solveRun(S);});
  body.addEventListener('click',function(e){var b=e.target.closest('button[data-sv]');if(!b)return;var S=SOLVERS.filter(function(x){return x.id===b.dataset.sv;})[0];
    if(b.dataset.preset!=null){setVals(S,S.presets[+b.dataset.preset][1]);S.practice=false;}
    else if(b.dataset.act==='new'){setVals(S,S.rand());S.practice=true;}
    else if(b.dataset.act==='show'){S.practice=false;}
    else if(b.dataset.act==='copy'){copyWork(S,b);return;}
    solveRun(S);});
}
function setVals(S,o){Object.keys(o).forEach(function(k){var el=$('sv-'+S.id+'-'+k);if(el)el.value=o[k];});}
function solveRun(S){
  var v={};S.fields.forEach(function(f){v[f.k]=$('sv-'+S.id+'-'+f.k).value;});
  var r=S.run(v),err=$('sv-'+S.id+'-err'),out=$('sv-'+S.id+'-out'),showBtn=document.querySelector('#sv-'+S.id+' [data-act="show"]');
  var copyBtn=document.querySelector('#sv-'+S.id+' [data-act="copy"]');S.last=r;S.vals=v;
  if(r.err){err.textContent=r.err;err.hidden=false;out.innerHTML='';showBtn.hidden=true;copyBtn.hidden=true;return;}
  err.hidden=true;showBtn.hidden=!S.practice;copyBtn.hidden=S.practice;
  if(S.practice){out.innerHTML='<p class="note"><b>Practice.</b> Work these on paper, then tap Show answers.</p><ol class="srows">'+r.rows.map(function(x){return '<li><span class="sq">'+esc(x.q)+'</span></li>';}).join('')+'</ol>';return;}
  out.innerHTML='<div class="stack-16">'+(r.table?'<div class="tscroll">'+r.table+'</div>':'')+'<ol class="srows">'+r.rows.map(function(x){return '<li'+(x.hl?' class="hl"':'')+'><span class="sq">'+esc(x.q)+'</span><span class="sa">'+(x.a.indexOf('<b>')===0?x.a:esc(x.a))+'</span><span class="sw">'+esc(x.w)+'</span></li>';}).join('')+'</ol></div>';
}

function copyWork(S,btn){var r=S.last;if(!r||r.err)return;var strip=function(h){var d=document.createElement('div');d.innerHTML=h;return d.textContent;};
  var given=S.fields.filter(function(f){return String(S.vals[f.k]).trim();}).map(function(f){var val=S.vals[f.k];if(f.opts){var o=f.opts.filter(function(x){return x[0]===val;})[0];val=o?o[1]:val;}return f.l+': '+val;}).join('; ');
  var txt=S.title+'\nGiven: '+given+'\n\n'+r.rows.map(function(x){return x.q+' = '+strip(x.a)+(x.w?'\n   '+x.w:'');}).join('\n');
  function done(ok){var old=btn.textContent;btn.textContent=ok?'Copied':'Copy failed';setTimeout(function(){btn.textContent='Copy work';},1500);}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){done(true);},function(){done(fallback());});return;}}catch(e){}
  done(fallback());
  function fallback(){try{var ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.className='sr';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');document.body.removeChild(ta);return ok;}catch(e){return false;}}
}

// ---------- start
var saved=recall('sigmaRoute');
if(!location.hash&&saved&&saved.indexOf('#')===0)setHash(saved,true);
render();

}

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const $ = id => document.getElementById(id);
const canvas = $("game");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090d17);
scene.fog = new THREE.FogExp2(0x090d17, 0.012);
const camera = new THREE.PerspectiveCamera(58, innerWidth/innerHeight, 0.1, 220);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0x8292b8, 0x1b1115, 1.5));
const moon = new THREE.DirectionalLight(0xa9c6ff, 2.0);
moon.position.set(-15,25,10); moon.castShadow=true; moon.shadow.mapSize.set(1024,1024);
moon.shadow.camera.left=-45;moon.shadow.camera.right=45;moon.shadow.camera.top=45;moon.shadow.camera.bottom=-45;
scene.add(moon);
const fireLight = new THREE.PointLight(0xff713b, 8, 18); fireLight.position.set(1,3,1); scene.add(fireLight);
const fillLight = new THREE.PointLight(0x4b5e9c, 3, 28); fillLight.position.set(-12,7,-10); scene.add(fillLight);

const mat = (color, roughness=.85, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const mats = {
  ground:mat(0x24252a), stone:mat(0x45434a), darkstone:mat(0x252630), roof:mat(0x211d29),
  wood:mat(0x392a27), metal:mat(0x777d87,.45,.55), gold:mat(0xb38a4e,.4,.4),
  skin:mat(0xb98769), cloth:mat(0x272a3a), red:mat(0x711f30), leaf:mat(0x182923),
  bone:mat(0xb6b09c), black:mat(0x171821), crystal:mat(0x6b8abf,.35,.3)
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
function cube(parent, material, x,y,z,sx,sy,sz, cast=true) {
  const o = new THREE.Mesh(boxGeo,material); o.position.set(x,y,z); o.scale.set(sx,sy,sz); o.castShadow=cast; o.receiveShadow=true; parent.add(o); return o;
}
function cylinder(parent, material, x,y,z,r1,r2,h,seg=8) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function sphere(parent, material, x,y,z,r, seg=10) {
  const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(6,seg-2)),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;
}
function group(parent=scene){const g=new THREE.Group();parent.add(g);return g;}

// Ground and ancient road
cube(scene,mats.ground,0,-.38,0,110,.65,110,false);
for(let i=-8;i<=8;i++){
  for(let j=-8;j<=8;j++){
    if(Math.random()>.55) continue;
    const x=i*5+(Math.random()-.5)*1.4,z=j*5+(Math.random()-.5)*1.4;
    const stone=cube(scene,Math.random()>.5?mats.stone:mats.darkstone,x,-.015,z,.4+Math.random()*.8,.06,.35+Math.random()*.7,false);
    stone.rotation.y=Math.random()*Math.PI;
  }
}
for(let i=-6;i<=6;i++){
  cube(scene,mats.darkstone,i*2.7,-.015,3.5,2.55,.09,2.5,false);
  cube(scene,mats.darkstone,i*2.7,-.015,-3.5,2.55,.09,2.5,false);
}
function building(x,z,w,d,h,roofMat=mats.roof) {
  const g=group();g.position.set(x,0,z);
  cube(g,mats.stone,0,h/2,0,w,h,d);
  // buttresses and stone ledges
  for(const sx of [-1,1]){
    cube(g,mats.darkstone,sx*(w/2-.12),h*.48,0,.3,h*.98,d+.35);
    cube(g,mats.stone,sx*(w/2-.1),h*.98,0,.38,.22,d+.45);
  }
  cube(g,mats.darkstone,0,h+.05,0,w+.3,.22,d+.3);
  const roof=cylinder(g,roofMat,0,h+.75,0,Math.max(w,d)*.63,.05,1.55,4);roof.rotation.y=Math.PI/4;
  // dark doorway
  cube(g,mats.black,0,1.05,d/2+.012,w*.22,2.1,.08,false);
  cube(g,mats.wood,0,.1,d/2+.06,w*.24,.16,.1);
  // windows with glow
  for(const wx of [-w*.27,w*.27]){
    cube(g,mats.crystal,wx,h*.63,d/2+.015,.34,.65,.07,false);
    cube(g,mats.darkstone,wx,h*.63,d/2+.07,.07,.78,.08);
    cube(g,mats.darkstone,wx,h*.63,d/2+.07,.42,.07,.08);
  }
  return g;
}
building(-12,-9,8,7,8); building(0,-13,7,8,10); building(13,-9,8,7,7);
building(-16,2,6,7,6); building(17,3,7,8,8); building(-12,14,9,7,8);building(12,15,8,7,9);
building(-25,-15,8,8,10);building(25,-16,9,7,11);building(-26,14,7,8,7);building(26,15,8,8,9);
function tree(x,z,s=1){
 const g=group();g.position.set(x,0,z);g.scale.setScalar(s);
 cylinder(g,mats.wood,0,1.5,0,.25,.36,3,7);
 for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(1.5-i*.25,2.5,7),mats.leaf);c.position.y=2.6+i*1.15;c.castShadow=true;g.add(c)}
}
for(let i=0;i<65;i++){let x=(Math.random()-.5)*90,z=(Math.random()-.5)*90;if(Math.abs(x)<22&&Math.abs(z)<22)continue;tree(x,z,.7+Math.random()*.8)}
// Ruined gate, pillars, hanging banners
for(const x of [-5,5]){
 cube(scene,mats.darkstone,x,3,-23,1.5,6,1.5);
 cube(scene,mats.stone,x,6,-23,2,1,2);
 sphere(scene,mats.gold,x,6.8,-23,.22);
}
cube(scene,mats.darkstone,0,6,-23,12,1.2,1.5);
for(const x of [-3,3]){
 const b=cube(scene,mats.red,x,4.5,-22.15,1.2,2.5,.12);b.rotation.z=x<0?-.08:.08;
}
// Well in the square
cylinder(scene,mats.stone,0,.45,0,2,2,.9,12);
cylinder(scene,mats.black,0,.93,0,1.5,1.5,.08,12);
for(let i=0;i<4;i++){const a=i*Math.PI/2;cube(scene,mats.wood,Math.cos(a)*1.25,1.3,Math.sin(a)*1.25,.18,.9,.18)}
// Lanterns with point lights
const lanterns=[];
function lantern(x,z){
 cube(scene,mats.wood,x,2,z,.16,2,.16);
 cube(scene,mats.gold,x,2.9,z,.38,.12,.38);
 const orb=sphere(scene,new THREE.MeshBasicMaterial({color:0xffa45d}),x,2.65,z,.17);
 const l=new THREE.PointLight(0xff8748,2.4,10);l.position.set(x,2.7,z);scene.add(l);lanterns.push({l,orb,phase:Math.random()*8});
}
[[-7,5],[7,5],[-7,-5],[7,-5],[-19,0],[19,0],[-2,-19],[2,-19],[-19,10],[20,10]].forEach(p=>lantern(...p));

// Character rigs
function makeCharacter(kind="player", color=0x272a3a) {
 const root=group();
 const torso=cube(root,mat(color),0,1.25,0,.78,.88,.43);
 const cloak=cube(root,mat(kind==="enemy"?0x211722:0x211e2b),0,1.14,-.25,.78,1.1,.18);
 const head=sphere(root,kind==="enemy"?mats.bone:mats.skin,0,1.95,0,.29,12);
 const hood=cylinder(root,mat(kind==="enemy"?0x1a141d:0x25232e),0,2.1,0,.38,.04,.48,7);
 hood.position.y=2.12;
 cube(root,mats.metal,-.43,1.35,0,.19,.62,.25);
 cube(root,mats.metal,.43,1.35,0,.19,.62,.25);
 const legL=cube(root,mat(0x292832),-.22,.52,0,.25,.75,.29);
 const legR=cube(root,mat(0x292832),.22,.52,0,.25,.75,.29);
 const armL=cube(root,mat(color),-.56,1.25,0,.2,.65,.22);
 const armR=cube(root,mat(color),.56,1.25,0,.2,.65,.22);
 // sword on right hand
 const sword=group(root);sword.position.set(.67,1.0,.05);sword.rotation.z=-.3;
 cube(sword,mats.gold,0,0,0,.1,.42,.12);
 cube(sword,mats.metal,0,.48,0,.12,.78,.07);
 const blade=cube(sword,mat(kind==="enemy"?0x87516e:0xb5c8d7,.25,.65),0,.96,0,.1,.68,.045);
 blade.rotation.z=.04;
 if(kind==="enemy"){const eyeMat=new THREE.MeshBasicMaterial({color:0xff253e});sphere(root,eyeMat,-.12,1.97,.26,.055);sphere(root,eyeMat,.12,1.97,.26,.055)}
 root.userData={torso,head,legL,legR,armL,armR,sword,kind};
 return root;
}
const player=makeCharacter("player",0x31394a);player.position.set(0,0,8);
const remotePlayers=new Map();
function addNameTag(obj,name){
 const c=document.createElement("canvas");c.width=256;c.height=64;const ctx=c.getContext("2d");
 ctx.fillStyle="#ead9b5";ctx.font="bold 25px Arial";ctx.textAlign="center";ctx.fillText(name.slice(0,18),128,38);
 const tex=new THREE.CanvasTexture(c);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
 sprite.scale.set(2.3,.58,1);sprite.position.y=2.9;obj.add(sprite);return sprite;
}
addNameTag(player,"Viajante");
const npcs=[];
function makeNPC(name,role,x,z,color,kind="npc"){
 const obj=makeCharacter(kind,color);obj.position.set(x,0,z);scene.add(obj);
 if(kind==="npc"){obj.userData.sword.visible=false;obj.userData.armR.rotation.z=-.3;}
 addNameTag(obj,name);
 const marker=sphere(scene,new THREE.MeshBasicMaterial({color:0xe7c477}),x,3.1,z,.07);
 marker.userData.float=true;
 npcs.push({name,role,obj,marker,kind,hp:kind==="enemy"?65:100,maxHp:kind==="enemy"?65:100,alive:true,respawn:0});
 return npcs[npcs.length-1];
}
const maelis=makeNPC("Maelis","Guardiã do Véu",-4,2,0x4a3b56);
const smith=makeNPC("Doran","Ferreiro",5,1,0x574033);
const merchant=makeNPC("Ilyra","Mercadora",4,-4,0x344a48);
const enemy1=makeNPC("Corrompido","Criatura hostil",-9,-11,0x4c202f,"enemy");
const enemy2=makeNPC("Corrompido","Criatura hostil",10,-15,0x4c202f,"enemy");
const enemy3=makeNPC("Corrompido","Criatura hostil",20,8,0x4c202f,"enemy");

// Crystals, grave markers, and ground mist particles
for(let i=0;i<13;i++){
 const x=(Math.random()-.5)*48,z=(Math.random()-.5)*48;
 if(Math.abs(x)<7&&Math.abs(z)<7)continue;
 const crystal=cylinder(scene,mats.crystal,x,.7,z,.15,.02,1.4,5);crystal.rotation.z=(Math.random()-.5)*.35;
}
const mistGeo=new THREE.BufferGeometry(), count=180, positions=new Float32Array(count*3);
for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*100;positions[i*3+1]=Math.random()*3;positions[i*3+2]=(Math.random()-.5)*100}
mistGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));
const mist=new THREE.Points(mistGeo,new THREE.PointsMaterial({color:0x9ba6bd,size:.09,transparent:true,opacity:.3,depthWrite:false}));scene.add(mist);

let hp=100,xp=0,level=1,kills=0,questDone=false,dialogueTarget=null,nearTarget=null,attackCooldown=0,invuln=0,attackAnim=0,jumpV=0,onGround=true,dodgeTime=0;
const keys={};let moveX=0,moveZ=0,stickActive=false,stickId=null,stickCenter=null;
let name="Viajante";
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2400)}
function updateHud(){
 $("hpbar").style.width=hp+"%";$("hptext").textContent=`${Math.ceil(hp)} / 100`;
 $("xpbar").style.width=(xp%100)+"%";$("xptext").textContent=`${xp} / ${level*100} XP`;
 $("className").textContent=`Andarilho · Nv. ${level}`;
 $("questProgress").textContent=questDone?"MISSÃO CONCLUÍDA":"OBJETIVO · "+(questDone?"1":"0")+"/1";
 $("questDesc").textContent=questDone?"A praça está um pouco mais segura.":"Fale com a Guardiã Maelis na praça.";
 $("menuLevel").textContent=level;$("menuXP").textContent=xp;$("menuKills").textContent=kills;
}
function gainXP(n){xp+=n;while(xp>=level*100){xp-=level*100;level++;hp=100;toast(`NÍVEL ${level}! Sua força aumentou.`)}updateHud()}
function openDialogue(npc){
 dialogueTarget=npc;$("dialogue").classList.remove("hidden");$("npcRole").textContent=npc.role.toUpperCase();$("dialogueName").textContent=npc.name;
 const choices=$("dialogueChoices");choices.innerHTML="";
 let lines="", opts=[];
 if(npc===maelis){
  lines=questDone?"Você enfrentou a escuridão e voltou. Ainda não confie na névoa.":"Viajante, criaturas corrompidas rondam a estrada ao norte. A vila precisa de alguém que não tema o Véu.";
  opts=questDone?[["Ouvir rumores","A névoa se move como se respirasse. Há algo antigo além do portão."],["Encerrar",""]]:[["Aceitar missão","A marca da Guardiã brilha em sua mão. Derrote uma criatura corrompida e volte mais forte."],["Perguntar sobre a vila","O Último Sino foi tocado pela última vez há cem anos. Desde então, a noite não terminou."]];
 }else if(npc===smith){lines="O aço ainda canta, mesmo nestes tempos malditos. Traga essência e posso forjar algo digno.";opts=[["Ver equipamentos","O arsenal está incompleto nesta versão, mas sua jornada já começou."],["Encerrar",""]]}
 else if(npc===merchant){lines="Poções, mapas e pequenos milagres. Tudo tem seu preço, viajante.";opts=[["Comprar poção (em breve)","O comércio será expandido na próxima versão."],["Encerrar",""]]}
 else {lines="A criatura chia e ergue a lâmina. Não parece capaz de conversar.";opts=[["Atacar",""]]}
 $("dialogueText").textContent=lines;
 opts.forEach(([label,response])=>{const b=document.createElement("button");b.textContent=label;b.onclick=()=>{
   if(label==="Aceitar missão"){questDone=false;$("questTitle").textContent="Sussurros na Névoa";toast("Missão aceita: derrote um Corrompido.");}
   else if(label==="Atacar"){closeDialogue();attack();}
   else if(label==="Encerrar"){closeDialogue();return}
   else if(response){$("dialogueText").textContent=response;}
   if(label==="Aceitar missão"){$("dialogueText").textContent=response;const done=document.createElement("button");done.textContent="Partir";done.onclick=closeDialogue;choices.replaceChildren(done)}
 };choices.appendChild(b)});
}
function closeDialogue(){$("dialogue").classList.add("hidden");dialogueTarget=null}
$("closeDialogue").onclick=closeDialogue;
function interact(){
 if(dialogueTarget){closeDialogue();return}
 if(nearTarget){
  if(nearTarget.kind==="enemy"){target=nearTarget;attack();return}
  openDialogue(nearTarget);
 }else toast("Não há ninguém por perto para interagir.");
}
$("interactBtn").onclick=interact;
$("renameBtn").onclick=()=>{const v=prompt("Nome do seu viajante:",name);if(v&&v.trim()){name=v.trim().slice(0,18);$("playerName").textContent=name;player.children[player.children.length-1].material.map.dispose();player.remove(player.children[player.children.length-1]);addNameTag(player,name);toast("Nome atualizado.");if(socket)socket.emit("move",{x:player.position.x,y:player.position.y,z:player.position.z,rot:player.rotation.y,name})}};
$("menuBtn").onclick=()=>$("menu").classList.remove("hidden");
$("closeMenu").onclick=()=>$("menu").classList.add("hidden");
$("helpBtn").onclick=()=>{$("menu").classList.add("hidden");$("help").classList.remove("hidden")};
$("closeHelp").onclick=$("backHelp").onclick=()=>$("help").classList.add("hidden");

let target=null;
function attack(){
 if(attackCooldown>0)return;
 attackCooldown=.62;attackAnim=.35;
 player.userData.sword.rotation.z=-1.2;
 let victim=null,best=4.3;
 for(const n of npcs){if(n.kind!=="enemy"||!n.alive)continue;const d=player.position.distanceTo(n.obj.position);if(d<best){best=d;victim=n}}
 if(victim){
  victim.hp-=28;target=victim;showCombat(victim);
  toast(`Golpe acertou: -28 HP`);
  if(victim.hp<=0){victim.alive=false;victim.obj.visible=false;victim.marker.visible=false;kills++;gainXP(45);toast("Corrompido derrotado! +45 XP");if(!questDone){questDone=true;$("questTitle").textContent="O Primeiro Silêncio";$("questDesc").textContent="Volte à Guardiã Maelis para receber novas instruções.";toast("Objetivo concluído! Volte à Maelis.");}updateHud();setTimeout(()=>{victim.hp=victim.maxHp;victim.alive=true;victim.obj.visible=true;victim.marker.visible=true;victim.obj.position.set((Math.random()-.5)*28,0,(Math.random()-.5)*28-10)},12000)}
 }else{toast("Seu golpe cortou apenas a névoa.");}
}
function showCombat(n){$("combatHint").classList.remove("hidden");$("targetName").textContent=n.name;$("targetHp").textContent=Math.max(0,Math.ceil(n.hp))+" HP"}
$("attackBtn").onclick=attack;
$("jumpBtn").onclick=()=>{if(onGround){jumpV=7;onGround=false}};
$("dodgeBtn").onclick=()=>{dodgeTime=.22;invuln=.4};
function dodge(){dodgeTime=.22;invuln=.4}
function addChat(name,text,isSystem=false){const d=document.createElement("div");d.className=isSystem?"systemline":"chatline";if(isSystem)d.textContent="[SISTEMA] "+text;else{const b=document.createElement("b");b.textContent=name+": ";d.append(b,document.createTextNode(text))}$("chatlog").appendChild(d);$("chatlog").scrollTop=$("chatlog").scrollHeight;while($("chatlog").children.length>35)$("chatlog").firstChild.remove()}
let socket=null,networked=false,sendTimer=0;
try{
 if(location.protocol.startsWith("http")&&window.io){
  socket=io({transports:["websocket","polling"]});
  socket.on("connect",()=>{networked=true;addChat("SISTEMA","Conectado ao reino multiplayer.");toast("Conexão com o reino estabelecida.")});
  socket.on("disconnect",()=>{networked=false;addChat("SISTEMA","Conexão perdida. Tentando reconectar...")});
  socket.on("welcome",data=>{for(const p of data.players||[])if(p.id!==socket.id)makeRemote(p);updateOnline()});
  socket.on("playerJoined",p=>{makeRemote(p);addChat("SISTEMA",`${p.name} entrou no reino.`);updateOnline()});
  socket.on("playerMoved",p=>{const r=remotePlayers.get(p.id);if(r){r.goal.set(p.x,p.y,p.z);r.name=p.name;r.obj.rotation.y=p.rot}});
  socket.on("playerLeft",id=>{const r=remotePlayers.get(id);if(r){scene.remove(r.obj);remotePlayers.delete(id)}updateOnline();addChat("SISTEMA","Um viajante deixou o reino.")});
  socket.on("chat",m=>addChat(m.name,m.text));
 }else addChat("SISTEMA","Modo solo: publique o servidor para habilitar o multiplayer.");
}catch(e){console.warn(e)}
function makeRemote(p){
 if(!p||p.id===socket?.id||remotePlayers.has(p.id))return;
 const obj=makeCharacter("player",0x48516a);obj.position.set(p.x||0,p.y||0,p.z||0);addNameTag(obj,p.name||"Viajante");scene.add(obj);
 remotePlayers.set(p.id,{obj,goal:new THREE.Vector3(p.x||0,p.y||0,p.z||0),name:p.name||"Viajante"});
}
function updateOnline(){$("onlineCount").textContent=remotePlayers.size+1}
$("chatform").addEventListener("submit",e=>{e.preventDefault();const input=$("chatinput"),v=input.value.trim();if(!v)return;if(socket&&networked)socket.emit("chat",v);else addChat(name,v);input.value=""});

addEventListener("keydown",e=>{
 if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
 keys[e.code]=true;
 if(e.code==="KeyE")interact();
 if(e.code==="KeyF")attack();
 if(e.code==="Space"&&onGround){jumpV=7;onGround=false}
 if(e.code==="ShiftLeft"||e.code==="ShiftRight")dodge();
 if(e.code==="Escape"){closeDialogue();$("menu").classList.toggle("hidden")}
});
addEventListener("keyup",e=>keys[e.code]=false);
const stick=$("stick"),nub=$("sticknub");
function stickMove(e){
 const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 let dx=e.clientX-cx,dy=e.clientY-cy;const max=34,d=Math.hypot(dx,dy);if(d>max){dx=dx/d*max;dy=dy/d*max}
 nub.style.transform=`translate(${dx}px,${dy}px)`;moveX=dx/max;moveZ=dy/max;
}
stick.addEventListener("pointerdown",e=>{stickActive=true;stickId=e.pointerId;stick.setPointerCapture(e.pointerId);stickMove(e)});
stick.addEventListener("pointermove",e=>{if(stickActive&&e.pointerId===stickId)stickMove(e)});
function endStick(){stickActive=false;moveX=moveZ=0;nub.style.transform="translate(0,0)"}
stick.addEventListener("pointerup",endStick);stick.addEventListener("pointercancel",endStick);

const clock=new THREE.Clock();
let lastNet=0,footstep=0;
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
 attackCooldown=Math.max(0,attackCooldown-dt);invuln=Math.max(0,invuln-dt);dodgeTime=Math.max(0,dodgeTime-dt);
 if(attackAnim>0){attackAnim-=dt;player.userData.sword.rotation.z=-1.2+Math.max(0,attackAnim)*3.1}else player.userData.sword.rotation.z=-.3;
 let ix=moveX,iz=moveZ;
 if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
 if(keys.KeyW||keys.ArrowUp)iz-=1;if(keys.KeyS||keys.ArrowDown)iz+=1;
 const len=Math.hypot(ix,iz);if(len>1){ix/=len;iz/=len}
 const moving=len>.08;
 if(moving){
  const speed=dodgeTime>0?10:4.6;
  // Move relative to camera heading
  const forward=new THREE.Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();
  const right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).normalize().negate();
  const dir=forward.multiplyScalar(-iz).add(right.multiplyScalar(ix)).normalize();
  player.position.addScaledVector(dir,speed*dt);
  player.rotation.y=Math.atan2(dir.x,dir.z);
  player.userData.legL.rotation.x=Math.sin(t*10)*.55;player.userData.legR.rotation.x=-Math.sin(t*10)*.55;
  player.userData.armL.rotation.x=-Math.sin(t*10)*.25;player.userData.armR.rotation.x=Math.sin(t*10)*.25;
 }else{player.userData.legL.rotation.x*=.8;player.userData.legR.rotation.x*=.8;player.userData.armL.rotation.x*=.8;player.userData.armR.rotation.x*=.8}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-48,48);player.position.z=THREE.MathUtils.clamp(player.position.z,-48,48);
 if(!onGround||jumpV>0){player.position.y+=jumpV*dt;jumpV-=18*dt;if(player.position.y<=0){player.position.y=0;jumpV=0;onGround=true}}
 // enemy behavior: close in, attack with telegraphed red glow
 for(const n of npcs){
  n.marker.position.y=3.05+Math.sin(t*2+n.obj.position.x)*.12;
  if(n.kind==="enemy"&&n.alive){
   const d=n.obj.position.distanceTo(player.position);
   if(d<9&&d>1.8){const dir=player.position.clone().sub(n.obj.position).normalize();n.obj.position.addScaledVector(dir,dt*.85);n.obj.rotation.y=Math.atan2(dir.x,dir.z)}
   if(d<2.1&&Math.random()<dt*.75&&invuln<=0){hp=Math.max(0,hp-7);updateHud();toast("Você foi atingido!");if(hp<=0){hp=100;player.position.set(0,0,8);toast("Você caiu... e despertou na praça.");updateHud()}}
  }
 }
 nearTarget=null;let nearest=3.1;
 for(const n of npcs){if(!n.alive||!n.obj.visible)continue;const d=player.position.distanceTo(n.obj.position);if(d<nearest){nearest=d;nearTarget=n}}
 if(nearTarget&&!dialogueTarget){$("interaction").classList.remove("hidden");$("interactionText").textContent=nearTarget.kind==="enemy"?"Atacar "+nearTarget.name:"Conversar com "+nearTarget.name}else $("interaction").classList.add("hidden");
 for(const r of remotePlayers.values()){r.obj.position.lerp(r.goal,Math.min(1,dt*10));r.obj.userData.legL.rotation.x=Math.sin(t*7+r.obj.position.x)*.12;r.obj.userData.legR.rotation.x=-r.obj.userData.legL.rotation.x}
 const camTarget=new THREE.Vector3(player.position.x,player.position.y+1.4,player.position.z);
 const desired=new THREE.Vector3(player.position.x+Math.sin(player.rotation.y)*8,player.position.y+6.0,player.position.z+Math.cos(player.rotation.y)*8);
 // Camera follows behind character orientation, with slight look-ahead
 desired.set(player.position.x-Math.sin(player.rotation.y)*8,player.position.y+5.3,player.position.z-Math.cos(player.rotation.y)*8);
 camera.position.lerp(desired,.09);camera.lookAt(camTarget);
 fireLight.intensity=7.5+Math.sin(t*6)*.8;
 lanterns.forEach((l,i)=>{l.l.intensity=2.1+Math.sin(t*3+l.phase)*.35});
 const pos=mist.geometry.attributes.position;for(let i=0;i<count;i++){let y=pos.getY(i)+dt*.12;if(y>3)y=0;pos.setY(i,y)}pos.needsUpdate=true;
 if(socket&&networked&&t-lastNet>.06){socket.emit("move",{x:player.position.x,y:player.position.y,z:player.position.z,rot:player.rotation.y,name});lastNet=t}
 renderer.render(scene,camera);
}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))});
updateHud();
setTimeout(()=>$("loading").classList.add("loading-out"),1000);
animate();

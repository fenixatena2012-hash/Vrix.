import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const characters = [
 ["Aelion","Cavaleiro", "🛡️",0x6e9de0],["Lyra","Arqueira","🏹",0x63b78c],
 ["Kael","Mago","🔮",0x9c7be0],["Nyria"," Druida","🌿",0x65b88a],
 ["Draven","Ladino","🗡️",0x8c91a8],["Solara","Paladina","☀️",0xe9b95d],
 ["Thorin","Berserker","🪓",0xb86f57],["Mira","Feiticeira","✨",0xb77bd0],
 ["Eryndor","Guardião","🌙",0x6797b7],["Zara","Invocadora","🐉",0xd77b87]
];
const $ = id => document.getElementById(id);
let selected=0, started=false, socket, myId=null, players=new Map(), keys={}, move={x:0,y:0}, yaw=0, pitch=.25, cameraPointers=new Map(), jumpUntil=0;
const colliders=[];
function addCircleCollider(x,z,r){colliders.push({type:"circle",x,z,r})}
function addRectCollider(x,z,hx,hz){colliders.push({type:"rect",x,z,hx,hz})}
const grid=$("character-grid");
characters.forEach((c,i)=>{const b=document.createElement("button");b.className="character"+(i===0?" selected":"");b.innerHTML=`<div class="avatar">${c[2]}</div><b>${c[0]}</b><small>${c[1]}</small>`;b.onclick=()=>{selected=i;document.querySelectorAll(".character").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")};grid.appendChild(b)});
$("loading").classList.add("hidden");$("select").classList.remove("hidden");

const scene=new THREE.Scene();scene.background=new THREE.Color(0x91b9d5);scene.fog=new THREE.Fog(0x91b9d5,28,78);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,150);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;$("game").appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xdceeff,0x536044,2);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe5bc,2.4);sun.position.set(-12,24,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const daySky=new THREE.Color(0x91b9d5),nightSky=new THREE.Color(0x101a36),dawnSky=new THREE.Color(0xe49a78);
function mat(color,rough=.8,metal=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
const grass=mat(0x527b57), pathmat=mat(0xbba77e), stone=mat(0x7e8b91), wood=mat(0x76523b), gold=mat(0xe3bd72,.35,.55);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(220,220),grass);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const path=new THREE.Mesh(new THREE.PlaneGeometry(9,70),pathmat);path.rotation.x=-Math.PI/2;path.position.set(0,.012,0);scene.add(path);
const plaza=new THREE.Mesh(new THREE.CircleGeometry(8,48),pathmat);plaza.rotation.x=-Math.PI/2;plaza.position.y=.02;scene.add(plaza);
function box(parent,w,h,d,material,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18*s,.25*s,1.7*s,7),wood);trunk.position.y=.85*s;trunk.castShadow=true;g.add(trunk);for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry((1.0-i*.12)*s,1),mat([0x3e704d,0x477e54,0x56885c][i]));crown.position.set(0,(2.0+i*.48)*s,0);crown.castShadow=true;g.add(crown)}}
for(let i=0;i<42;i++){let a=i*2.399,r=11+(i%7)*3.4,x=Math.cos(a)*r,z=Math.sin(a)*r,scale=.75+(i%4)*.13;tree(x,z,scale);addCircleCollider(x,z,.38*scale)}
// Bosques nas bordas das novas áreas, mantendo livres as estradas e os pontos de interesse.
for(let i=0;i<58;i++){const a=i*2.399,r=36+(i%6)*5.2,x=Math.cos(a)*r,z=Math.sin(a)*r;const nearLake=Math.hypot(x-43,z-10)<15,nearRuins=Math.hypot(x+46,z-15)<12;if(nearLake||nearRuins||Math.abs(x)<13&&z<9&&z>-8)continue;const scale=.8+(i%4)*.16;tree(x,z,scale);addCircleCollider(x,z,.38*scale)}
// Portal and little village
const portal=new THREE.Group();portal.position.set(0,0,-13);scene.add(portal);
const arch=new THREE.Mesh(new THREE.TorusGeometry(2.15,.22,12,40,Math.PI),gold);arch.position.y=3;arch.castShadow=true;portal.add(arch);
box(portal,.42,3.1,.55,stone,-2.05,1.55,0);box(portal,.42,3.1,.55,stone,2.05,1.55,0);
const glow=new THREE.Mesh(new THREE.CircleGeometry(1.88,40),new THREE.MeshBasicMaterial({color:0x79d9ff,transparent:true,opacity:.28,side:THREE.DoubleSide}));glow.position.set(0,2.5,-.12);portal.add(glow);
for(let x of [-7,7]){const hut=new THREE.Group();hut.position.set(x,0,-3);scene.add(hut);box(hut,3,2.3,3,mat(0xc5a77d),0,1.15,0);const roof=new THREE.Mesh(new THREE.ConeGeometry(2.45,1.6,4),mat(0x754b48));roof.rotation.y=Math.PI/4;roof.position.y=3;roof.castShadow=true;hut.add(roof);box(hut,.7,1.3,.12,wood,0,.65,1.56);addRectCollider(x,-3,1.8,1.8)}
addRectCollider(-2.05,-13,.42,.48);addRectCollider(2.05,-13,.42,.48)
// stones and flowers
for(let i=0;i<55;i++){const a=Math.random()*Math.PI*2,r=5+Math.random()*25;const f=new THREE.Mesh(new THREE.SphereGeometry(.10+Math.random()*.1,6,5),mat([0xe8c5d0,0xf0d88c,0xb9d8e5][i%3]));f.position.set(Math.cos(a)*r,.12,Math.sin(a)*r);scene.add(f)}
// Novas regiões do vale: caminhos conectam a vila, o lago e as ruínas antigas.
function groundPath(x,z,w,d,rotation=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),pathmat);m.rotation.x=-Math.PI/2;m.rotation.z=rotation;m.position.set(x,.018,z);scene.add(m)}
groundPath(-20,-1,5,54,-.24);groundPath(20,-4,5,52,.24);groundPath(0,23,5,48,Math.PI/2);
// Lago cristalino a leste, com margem de pedras.
const lake=new THREE.Mesh(new THREE.CircleGeometry(10,48),new THREE.MeshStandardMaterial({color:0x3c9db5,roughness:.2,metalness:.18,transparent:true,opacity:.88}));lake.rotation.x=-Math.PI/2;lake.position.set(43,.035,10);scene.add(lake);
const shore=new THREE.Mesh(new THREE.RingGeometry(9.7,11.1,48),mat(0x9b987c));shore.rotation.x=-Math.PI/2;shore.position.set(43,.025,10);scene.add(shore);
for(let i=0;i<18;i++){const a=i*Math.PI*2/18,x=43+Math.cos(a)*10.4,z=10+Math.sin(a)*10.4;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.45+(i%3)*.12,0),stone);rock.position.set(x,.28,z);rock.scale.y=.65;rock.castShadow=true;scene.add(rock);addCircleCollider(x,z,.38)}
// Pequena ponte de madeira na margem sul do lago.
const bridge=new THREE.Group();bridge.position.set(43,0,21);scene.add(bridge);for(let i=0;i<7;i++)box(bridge,3.5,.16,.7,wood,0,.18,i*.62-1.8);for(const x of [-1.55,1.55]){box(bridge,.14,.75,4.7,wood,x,.48,0)}
// Ruínas antigas no oeste, com colunas e pedras espalhadas.
const ruins=new THREE.Group();ruins.position.set(-46,0,15);scene.add(ruins);
for(let i=0;i<6;i++){const a=i*Math.PI*2/6,x=Math.cos(a)*6,z=Math.sin(a)*6;const pillar=box(ruins,.85,3.8,.85,stone,x,1.9,z);pillar.rotation.z=(i%2?.04:-.04);addRectCollider(-46+x,15+z,.55,.55)}
const rune=new THREE.Mesh(new THREE.TorusGeometry(3.2,.13,8,32),gold);rune.position.y=1.4;rune.rotation.x=Math.PI/2;ruins.add(rune);
// Cristais luminosos marcam trilhas e pontos de exploração.
for(let i=0;i<14;i++){const x=-64+(i%7)*5,z=-22+Math.floor(i/7)*8;const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.8+(i%3)*.18),new THREE.MeshStandardMaterial({color:i%2?0x6bc9ed:0xa78bfa,emissive:i%2?0x164c69:0x38245d,emissiveIntensity:.65,roughness:.25,metalness:.25}));crystal.position.set(x,.9,z);crystal.rotation.y=i;crystal.castShadow=true;scene.add(crystal)}
// Colinas suaves para dar profundidade ao horizonte sem pesar no celular.
for(let i=0;i<16;i++){const a=i*Math.PI*2/16,x=Math.cos(a)*76,z=Math.sin(a)*76;const hill=new THREE.Mesh(new THREE.IcosahedronGeometry(9+(i%4)*2,1),mat(i%2?0x456b59:0x526f68));hill.position.set(x,-2.5,z);hill.scale.y=.7;scene.add(hill)}

function makeHero(index){const group=new THREE.Group();const color=characters[index][3];const armor=mat(color,.38,.18),dark=mat(0x293248),skin=mat(0xe8bd9b),cloth=mat(index%2?0x394c67:0x55405e);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.65,5,9),armor);torso.position.y=1.35;torso.castShadow=true;group.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),skin);head.position.y=2.12;head.castShadow=true;group.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.36,12,8,0,Math.PI*2,0,Math.PI*.55),dark);hair.position.y=2.23;group.add(hair);
const cape=new THREE.Mesh(new THREE.ConeGeometry(.52,1.15,5),cloth);cape.position.set(0,1.15,.38);cape.rotation.x=-.12;group.add(cape);
for(const x of [-.23,.23]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.55,4,7),dark);leg.position.set(x,.48,0);leg.castShadow=true;group.add(leg);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.52,4,7),armor);arm.position.set(x*2,1.45,0);arm.rotation.z=x<0?-.16:.16;group.add(arm)}
const aura=new THREE.Mesh(new THREE.RingGeometry(.48,.58,32),new THREE.MeshBasicMaterial({color:0xf6d18b,transparent:true,opacity:.7,side:THREE.DoubleSide}));aura.rotation.x=-Math.PI/2;aura.position.y=.035;group.add(aura);
group.userData={legs:group.children.filter((_,i)=>i===5||i===6)};return group}
// NPCs do reino: personagens locais com nomes e diálogos próprios.
const npcList=[];
function makeNpcModel(color,accent,kind=0){
 const g=new THREE.Group(),body=mat(color,.48,.08),trim=mat(accent,.38,.28),skin=mat(0xe8bd9b),dark=mat(0x293248);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.62,4,8),body);torso.position.y=1.28;torso.castShadow=true;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.31,14,10),skin);head.position.y=2.05;head.castShadow=true;g.add(head);
 const hood=new THREE.Mesh(new THREE.ConeGeometry(.43,.7,7),trim);hood.position.y=2.48;hood.castShadow=true;g.add(hood);
 for(const x of [-.2,.2]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.48,3,6),dark);leg.position.set(x,.43,0);g.add(leg)}
 const badge=new THREE.Mesh(new THREE.TorusGeometry(.42,.055,6,20),trim);badge.rotation.x=Math.PI/2;badge.position.y=.04;g.add(badge);
 if(kind===1){const tool=new THREE.Mesh(new THREE.BoxGeometry(.12,1.15,.12),trim);tool.position.set(.58,1.1,0);tool.rotation.z=-.25;g.add(tool)}
 if(kind===2){const pack=new THREE.Mesh(new THREE.BoxGeometry(.58,.65,.3),trim);pack.position.set(0,1.35,.38);g.add(pack)}
 return g;
}
function makeNpc(name,role,x,z,color,accent,kind,lines){const group=makeNpcModel(color,accent,kind);group.position.set(x,0,z);scene.add(group);addCircleCollider(x,z,.5);npcList.push({name,role,group,x,z,lines,index:0});}
makeNpc('Elaria','Guardiã do Vale',0,7,0x486d9c,0xf2d28a,0,[
 'Bem-vindo ao Vale dos Antigos! Siga as trilhas para descobrir lugares secretos.',
 'Dizem que as ruínas do oeste guardam uma energia muito antiga.',
 'Se encontrar cristais azuis, observe como eles brilham ao anoitecer.'
]);
makeNpc('Borin','Ferreiro da Vila',-9,-1,0x87513c,0xe6ad5d,1,[
 'Minha forja já foi famosa em todos os reinos! Um dia farei uma espada lendária.',
 'As pedras perto do lago são ótimas para testar ferramentas e armas.',
 'Cuide bem do seu equipamento, aventureiro. Nunca se sabe o que vive nas florestas.'
]);
makeNpc('Nilo','Mercador Viajante',9,-1,0x477b68,0x8ed8c1,2,[
 'Tenho mapas de lugares distantes... mas primeiro explore o vale ao redor da vila.',
 'A ponte de madeira leva até o Lago Cristalino. A água brilha quando o sol aparece.',
 'Ouvi passos estranhos perto das ruínas. Talvez exista algo escondido por lá.'
]);
makeNpc('Tessa','Aprendiz de Maga',39,1,0x76569b,0x9fe7f0,0,[
 'Este lago é cheio de magia! As luzes na água mudam conforme o céu.',
 'Os cristais do norte parecem reagir à luz da lua.',
 'Continue explorando. O mundo é muito maior do que parece daqui.'
]);
const interact=document.createElement('button');interact.id='npc-interact';interact.type='button';interact.textContent='FALAR';interact.style.cssText='display:none;position:fixed;z-index:6;left:50%;bottom:115px;transform:translateX(-50%);padding:12px 24px;border:1px solid #f4cf82;border-radius:24px;background:#17243ddd;color:#f4cf82;font:700 12px Inter,system-ui;letter-spacing:1px;box-shadow:0 5px 18px #0008;touch-action:manipulation';document.body.appendChild(interact);
let nearbyNpc=null;
function talkNpc(){if(!nearbyNpc)return;const line=nearbyNpc.lines[nearbyNpc.index%nearbyNpc.lines.length];nearbyNpc.index++;toast(`${nearbyNpc.name}: ${line}`);const d=document.createElement('div');d.innerHTML=`<b>${escapeHtml(nearbyNpc.name)}:</b> ${escapeHtml(line)}`;$('chat-lines').appendChild(d);$('chat-lines').scrollTop=99999;}
interact.addEventListener('click',talkNpc);
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e')talkNpc()});

function makeOther(p){const g=makeHero(p.character);g.position.set(p.x,0,p.z);scene.add(g);g.userData.name=p.name;return g}
let hero=null, heroName="Aventureiro", lastSend=0, clock=new THREE.Clock();
function start(){if(started)return;started=true;heroName=$("player-name").value.trim()||"Aventureiro";hero=makeHero(selected);scene.add(hero);$("select").classList.add("hidden");["hud","mobile-controls","chat-box","hint","player-tag"].forEach(id=>$(id).classList.remove("hidden"));$("hud-name").textContent=heroName;$("hud-class").textContent=characters[selected][1];$("hint").textContent="Analógico: andar • Arraste com outro dedo à direita: câmera";
socket=io();socket.on("connect",()=>{myId=socket.id;socket.emit("join",{name:heroName,character:selected})});socket.on("world:init",list=>{list.forEach(p=>{if(p.id!==myId)addPlayer(p)});updateOnline()});socket.on("player:joined",p=>{addPlayer(p);updateOnline();toast(`${p.name} chegou ao reino`)});
socket.on("player:moved",p=>{const q=players.get(p.id);if(q){q.target.set(p.x,0,p.z);q.group.rotation.y=p.rot}});
socket.on("player:left",id=>{const p=players.get(id);if(p){scene.remove(p.group);players.delete(id);updateOnline()}});
socket.on("chat",m=>{const d=document.createElement("div");d.innerHTML=`<b>${escapeHtml(m.name)}:</b> ${escapeHtml(m.text)}`;$("chat-lines").appendChild(d);$("chat-lines").scrollTop=99999});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function addPlayer(p){if(players.has(p.id)||p.id===myId)return;players.set(p.id,{group:makeOther(p),target:new THREE.Vector3(p.x,0,p.z)})}
function updateOnline(){$("online").textContent=`${players.size+1} online`}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1900)}
$("play").onclick=start;
$("chat-form").onsubmit=e=>{e.preventDefault();const v=$("chat-input").value.trim();if(v&&socket?.connected)socket.emit("chat",v);$("chat-input").value=""};
$("attack").onclick=()=>{if(hero){hero.rotation.y=yaw;toast("⚔ Golpe de treino!")}};
$("jump").onpointerdown=()=>{jumpUntil=performance.now()+480};
const joy=$("joystick"),stick=$("stick");let joyId=null;
joy.addEventListener("pointerdown",e=>{joyId=e.pointerId;joy.setPointerCapture(joyId);moveJoy(e)});
joy.addEventListener("pointermove",e=>{if(e.pointerId===joyId)moveJoy(e)});
function moveJoy(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,l=Math.hypot(dx,dy),max=38;if(l>max){dx=dx/l*max;dy=dy/l*max}stick.style.transform=`translate(${dx}px,${dy}px)`;move.x=dx/max;move.y=dy/max}
function endJoy(e){if(e.pointerId===joyId){joyId=null;move={x:0,y:0};stick.style.transform="translate(0,0)"}}
joy.addEventListener("pointerup",endJoy);joy.addEventListener("pointercancel",endJoy);
const canvas=renderer.domElement;
// A câmera é controlada por um segundo dedo na metade direita da tela.
canvas.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse" || (e.pointerType==="touch" && e.clientX>innerWidth*.42 && e.clientY<innerHeight-105)){
    cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener("pointermove",e=>{const prev=cameraPointers.get(e.pointerId);if(!prev)return;const dx=e.clientX-prev.x,dy=e.clientY-prev.y;yaw-=dx*.006;pitch=Math.max(-.12,Math.min(.9,pitch+dy*.004));cameraPointers.set(e.pointerId,{x:e.clientX,y:e.clientY})});
function endCamera(e){cameraPointers.delete(e.pointerId)}
canvas.addEventListener("pointerup",endCamera);canvas.addEventListener("pointercancel",endCamera);
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true});addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false});
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))});
function canOccupy(x,z){
  const radius=.43;
  if(x < -88+radius || x > 88-radius || z < -88+radius || z > 88-radius)return false;
  for(const c of colliders){
    if(c.type==="circle"){const dx=x-c.x,dz=z-c.z;if(dx*dx+dz*dz < (c.r+radius)*(c.r+radius))return false}
    else if(Math.abs(x-c.x)<c.hx+radius && Math.abs(z-c.z)<c.hz+radius)return false;
  }
  return true;
}
function updateDayNight(time){
  const cycle=(time/180)%(Math.PI*2),sunHeight=Math.sin(cycle-Math.PI/2);
  const daylight=THREE.MathUtils.clamp((sunHeight+.18)/.72,0,1);
  const dawn=Math.max(0,1-Math.abs(sunHeight)*5)*(1-daylight);
  const sky=nightSky.clone().lerp(daySky,daylight).lerp(dawnSky,dawn*.65);
  scene.background.copy(sky);scene.fog.color.copy(sky);
  hemi.intensity=.38+daylight*1.65;sun.intensity=.12+daylight*2.35;
  sun.color.setRGB(1,.72+.25*daylight,.55+.4*daylight);
  sun.position.set(Math.cos(cycle)*24,Math.max(2,sunHeight*30),Math.sin(cycle)*20);
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;updateDayNight(t);
if(hero){let ix=move.x+(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iy=move.y+(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);let len=Math.hypot(ix,iy);if(len>1){ix/=len;iy/=len}const speed=5.2;const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const vx=(right.x*ix+forward.x*(-iy))*speed*dt,vz=(right.z*ix+forward.z*(-iy))*speed*dt;// Colisão por eixo: encosta nas paredes e ainda permite deslizar ao longo delas.
const nextX=hero.position.x+vx,nextZ=hero.position.z+vz;
if(canOccupy(nextX,hero.position.z))hero.position.x=nextX;
if(canOccupy(hero.position.x,nextZ))hero.position.z=nextZ;
if(Math.abs(ix)+Math.abs(iy)>.08)hero.rotation.y=Math.atan2(vx,vz);hero.position.y=performance.now()<jumpUntil?Math.sin((jumpUntil-performance.now())/480*Math.PI)*.85:0;
const desired=new THREE.Vector3(hero.position.x+Math.sin(yaw)*Math.cos(pitch)*8,hero.position.y+3+Math.sin(pitch)*8,hero.position.z+Math.cos(yaw)*Math.cos(pitch)*8);camera.position.lerp(desired,1-Math.exp(-7*dt));camera.lookAt(hero.position.x,hero.position.y+1.25,hero.position.z);
if(socket?.connected&&performance.now()-lastSend>75){socket.volatile.emit("move",{x:hero.position.x,z:hero.position.z,rot:hero.rotation.y});lastSend=performance.now()}}
if(hero){let closest=null,dist=3.2;for(const npc of npcList){const d=Math.hypot(hero.position.x-npc.x,hero.position.z-npc.z);if(d<dist){dist=d;closest=npc}}nearbyNpc=closest;interact.style.display=closest?'block':'none';if(closest)interact.textContent=`FALAR • ${closest.name.toUpperCase()}`}
for(const p of players.values())p.group.position.lerp(p.target,1-Math.exp(-12*dt));
renderer.render(scene,camera)}
camera.position.set(0,5,9);animate();

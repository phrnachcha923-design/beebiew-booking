const LIMIT=2, KEY='beebiew_bookings_v3';
const form=document.querySelector('#bookingForm'), dateInput=document.querySelector('#date'), timeSelect=document.querySelector('#time'), typeSelect=document.querySelector('#type'), capacity=document.querySelector('#capacityMessage');
const today=new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset()); dateInput.min=today.toISOString().split('T')[0];
for(let h=9;h<=20;h++){const o=document.createElement('option');o.value=`${String(h).padStart(2,'0')}:00`;o.textContent=o.value;timeSelect.appendChild(o)}
const types=[...document.querySelectorAll('.type-card')]; types.forEach(card=>{const o=document.createElement('option');o.value=card.dataset.type;o.textContent=card.dataset.type;typeSelect.appendChild(o);card.addEventListener('click',()=>selectType(card.dataset.type))});
document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>selectType(a.dataset.pick)));
function selectType(value){typeSelect.value=value;types.forEach(c=>c.classList.toggle('active',c.dataset.type===value))}
typeSelect.addEventListener('change',()=>selectType(typeSelect.value));
function bookings(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v))}
function countFor(d){return bookings().filter(b=>b.date===d).length}
function updateCapacity(){const d=dateInput.value||today.toISOString().split('T')[0], used=countFor(d), left=Math.max(0,LIMIT-used);document.querySelector('#bookedToday').textContent=countFor(today.toISOString().split('T')[0]);document.querySelector('#remainingToday').textContent=Math.max(0,LIMIT-countFor(today.toISOString().split('T')[0]));capacity.textContent=used>=LIMIT?'❌ วันนี้คิวเต็มแล้ว กรุณาเลือกวันอื่น':dateInput.value?`วันที่เลือกยังเหลือ ${left} คิว`:'';form.querySelector('[type=submit]').disabled=used>=LIMIT}
dateInput.addEventListener('change',updateCapacity);updateCapacity();
form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));if(countFor(data.date)>=LIMIT){updateCapacity();return}const list=bookings();list.push({...data,id:Date.now(),status:'รอยืนยัน'});save(list);document.querySelector('#successText').textContent=`รับคำขอวันที่ ${data.date} เวลา ${data.time} แล้ว BeeBiew จะติดต่อกลับเพื่อยืนยันคิวค่ะ 💖`;document.querySelector('#successModal').showModal();form.reset();selectType('');updateCapacity()});
document.querySelector('#closeModal').onclick=()=>document.querySelector('#successModal').close();
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
addEventListener('scroll',()=>{const p=document.documentElement;document.querySelector('#progress').style.width=(p.scrollTop/(p.scrollHeight-p.clientHeight)*100)+'%'});
document.querySelector('#themeToggle').onclick=()=>{document.body.classList.toggle('dark');document.querySelector('#themeToggle').textContent=document.body.classList.contains('dark')?'☀️':'🌙'};

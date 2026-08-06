
const STORE_KEY='beebiew_bookings_v3', LIMIT=2, ADMIN_PIN='2468';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const localDate=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().split('T')[0]};
const getBookings=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY))||[]}catch{return[]}};
const saveBookings=v=>localStorage.setItem(STORE_KEY,JSON.stringify(v));
const countFor=d=>getBookings().filter(b=>b.date===d && b.status!=='ปฏิเสธ').length;
const formatDate=s=>new Intl.DateTimeFormat('th-TH',{dateStyle:'long'}).format(new Date(s+'T00:00:00'));
const makeId=()=>`BB${new Date().toISOString().slice(2,10).replaceAll('-','')}${String(Date.now()).slice(-4)}`;

function initGlobal(){
 const menu=$('#menuToggle'),nav=$('#mainNav'); if(menu&&nav)menu.onclick=()=>nav.classList.toggle('open');
 const theme=$('#themeToggle'); if(theme){theme.onclick=()=>{document.body.classList.toggle('dark');theme.textContent=document.body.classList.contains('dark')?'☀️':'🌙'}};
 addEventListener('scroll',()=>{const p=document.documentElement,bar=$('#scrollProgress');if(bar)bar.style.width=(p.scrollTop/(p.scrollHeight-p.clientHeight)*100||0)+'%'});
 const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});$$('.reveal').forEach(el=>observer.observe(el));
 $$('.ripple').forEach(btn=>btn.addEventListener('click',e=>{const s=document.createElement('span');s.className='ripple-dot';btn.appendChild(s);setTimeout(()=>s.remove(),500)}));
}

function initHome(){
 const all=getBookings(),today=localDate(),used=countFor(today);
 const vals=[['#todayBooked',used],['#todayRemaining',Math.max(0,LIMIT-used)],['#allBookings',all.length]];
 vals.forEach(([sel,target])=>{const el=$(sel);if(!el)return;let n=0;const step=Math.max(1,Math.ceil(target/20));const t=setInterval(()=>{n=Math.min(target,n+step);el.textContent=n;if(n>=target)clearInterval(t)},35)});
}

function initBooking(){
 const form=$('#bookingForm'),date=$('#bookingDate'),time=$('#bookingTime'),type=$('#bookingType'),capacity=$('#capacityMessage');
 if(!form)return;
 date.min=localDate();
 for(let h=9;h<=20;h++){const o=document.createElement('option');o.value=`${String(h).padStart(2,'0')}:00`;o.textContent=o.value;time.appendChild(o)}
 const typeButtons=$$('#typePicker button'); typeButtons.forEach(b=>{const o=document.createElement('option');o.value=b.dataset.type;o.textContent=b.dataset.type;type.appendChild(o);b.onclick=()=>selectType(b.dataset.type)});
 function selectType(v){type.value=v;typeButtons.forEach(b=>b.classList.toggle('active',b.dataset.type===v))}
 type.onchange=()=>selectType(type.value);
 const param=new URLSearchParams(location.search).get('type');if(param)selectType(param);
 function updateCapacity(){const d=date.value||localDate(),used=countFor(d),left=Math.max(0,LIMIT-used);capacity.textContent=date.value?(used>=LIMIT?'❌ วันนี้คิวเต็มแล้ว กรุณาเลือกวันอื่น':`วันที่เลือกยังเหลือ ${left} คิว`):'';form.querySelector('[type=submit]').disabled=used>=LIMIT}
 date.onchange=updateCapacity;updateCapacity();
 let pending=null;
 form.onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));if(countFor(data.date)>=LIMIT){updateCapacity();return}pending=data;$('#confirmSummary').innerHTML=`<p><b>ชื่อ:</b> ${data.name}</p><p><b>วันและเวลา:</b> ${formatDate(data.date)} เวลา ${data.time}</p><p><b>ประเภท:</b> ${data.type}</p>`;$('#confirmModal').showModal()};
 $('#cancelConfirm').onclick=()=>$('#confirmModal').close();
 $('#confirmSubmit').onclick=()=>{if(!pending)return;const list=getBookings(),id=makeId();list.push({...pending,id,status:'รอยืนยัน',createdAt:new Date().toISOString()});saveBookings(list);$('#confirmModal').close();$('#successMessage').innerHTML=`รหัสการจองของคุณคือ <strong>${id}</strong><br>กรุณาเก็บรหัสนี้ไว้ตรวจสอบสถานะ`;$('#successModal').showModal();form.reset();selectType('');pending=null;updateCapacity()};
 $('#closeSuccess').onclick=()=>$('#successModal').close();
}

function initStatus(){
 const form=$('#statusForm'),result=$('#statusResult');if(!form)return;
 form.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form)),b=getBookings().find(x=>x.id.toLowerCase()===d.bookingId.trim().toLowerCase()&&x.phone===d.phone.trim());
 if(!b){result.innerHTML='<div class="status-card glass"><h3>ไม่พบข้อมูลการจอง</h3><p>กรุณาตรวจสอบรหัสและเบอร์โทรอีกครั้ง</p></div>';return}
 const cls=b.status==='ยืนยันแล้ว'?'approved':b.status==='ปฏิเสธ'?'rejected':'pending';
 result.innerHTML=`<div class="status-card glass"><span class="status-pill ${cls}">${b.status}</span><h2>${b.id}</h2><p><b>ชื่อ:</b> ${b.name}</p><p><b>วันและเวลา:</b> ${formatDate(b.date)} เวลา ${b.time}</p><p><b>ประเภท:</b> ${b.type}</p><p><b>สถานที่:</b> ${b.location||'-'}</p></div>`};
}

function initAdmin(){
 const login=$('#adminLogin');if(!login)return;
 $('#adminLoginBtn').onclick=()=>{if($('#adminPin').value!==ADMIN_PIN){alert('PIN ไม่ถูกต้อง');return}login.hidden=true;$('#adminPanel').hidden=false;renderAdmin()};
 $('#adminSearch').oninput=renderAdmin;$('#adminFilter').onchange=renderAdmin;
 $('#exportBookings').onclick=()=>{const rows=[['รหัส','ชื่อ','เบอร์','วันที่','เวลา','ประเภท','สถานที่','รายละเอียด','สถานะ'],...getBookings().map(b=>[b.id,b.name,b.phone,b.date,b.time,b.type,b.location||'',b.details||'',b.status])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='beebiew-bookings.csv';a.click();URL.revokeObjectURL(a.href)};
}
function renderAdmin(){
 const list=getBookings(),q=($('#adminSearch')?.value||'').toLowerCase(),f=$('#adminFilter')?.value||'';
 $('#adminTotal').textContent=list.length;$('#adminPending').textContent=list.filter(b=>b.status==='รอยืนยัน').length;$('#adminApproved').textContent=list.filter(b=>b.status==='ยืนยันแล้ว').length;$('#adminRejected').textContent=list.filter(b=>b.status==='ปฏิเสธ').length;
 const filtered=list.filter(b=>(!f||b.status===f)&&(!q||[b.id,b.name,b.phone,b.type].join(' ').toLowerCase().includes(q))).sort((a,b)=>`${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
 $('#adminList').innerHTML=filtered.length?filtered.map(b=>`<article class="admin-card glass"><div class="admin-card-top"><div><span class="status-pill ${b.status==='ยืนยันแล้ว'?'approved':b.status==='ปฏิเสธ'?'rejected':'pending'}">${b.status}</span><h3>${b.name} • ${b.id}</h3><p>${formatDate(b.date)} เวลา ${b.time} • ${b.type}</p><p>📞 ${b.phone} ${b.location?'• 📍 '+b.location:''}</p></div></div><div class="admin-actions"><button class="small-btn approve" onclick="setStatus('${b.id}','ยืนยันแล้ว')">ยืนยัน</button><button class="small-btn reject" onclick="setStatus('${b.id}','ปฏิเสธ')">ปฏิเสธ</button><button class="small-btn delete" onclick="deleteBooking('${b.id}')">ลบ</button></div></article>`).join(''):'<div class="glass admin-card">ยังไม่มีรายการจอง</div>';
}
window.setStatus=(id,status)=>{const list=getBookings(),i=list.findIndex(b=>b.id===id);if(i>=0){list[i].status=status;saveBookings(list);renderAdmin()}};
window.deleteBooking=id=>{if(confirm('ต้องการลบรายการนี้หรือไม่?')){saveBookings(getBookings().filter(b=>b.id!==id));renderAdmin()}};

document.addEventListener('DOMContentLoaded',()=>{initGlobal();const p=document.body.dataset.page;if(p==='home')initHome();if(p==='booking')initBooking();if(p==='status')initStatus();if(p==='admin')initAdmin()});

const cover=document.getElementById("cover");
const main=document.getElementById("main");
const openBtn=document.getElementById("openInvitation");
const video=document.getElementById("weddingVideo");
const soundToggle=document.getElementById("soundToggle");
const playPause=document.getElementById("playPause");
const muteBtn=document.getElementById("muteBtn");
const progressBar=document.getElementById("progressBar");

const q=new URLSearchParams(location.search);
const guest=q.get("to");
if(guest) document.getElementById("guestGreeting").innerHTML=`Kepada Yth.<strong>${safe(guest)}</strong>`;

openBtn.addEventListener("click",async()=>{
  cover.style.opacity="0";cover.style.transform="scale(1.02)";
  setTimeout(()=>{cover.style.display="none";main.classList.remove("is-hidden");window.scrollTo(0,0)},700);
  try{video.muted=false;await video.play();setAudioUI()}catch(e){video.muted=false;setAudioUI()}
});

function setAudioUI(){
  const icon=video.muted?"🔇":"🔊";soundToggle.textContent=icon;muteBtn.textContent=icon;
  soundToggle.setAttribute("aria-label",video.muted?"Nyalakan suara video":"Matikan suara video");
}
function toggleMute(){video.muted=!video.muted;setAudioUI()}
soundToggle.addEventListener("click",toggleMute);muteBtn.addEventListener("click",toggleMute);
playPause.addEventListener("click",async()=>{if(video.paused)await video.play();else video.pause();});
video.addEventListener("play",()=>playPause.textContent="❚❚");
video.addEventListener("pause",()=>playPause.textContent="▶");
video.addEventListener("ended",()=>{playPause.textContent="▶";video.currentTime=0});
video.addEventListener("timeupdate",()=>{progressBar.style.width=(video.currentTime/video.duration*100||0)+"%"});

const target=new Date("2026-09-03T09:00:00+07:00").getTime();
function countdown(){
 const x=Math.max(0,target-Date.now());
 document.getElementById("d").textContent=Math.floor(x/86400000);
 document.getElementById("h").textContent=Math.floor(x%86400000/3600000);
 document.getElementById("m").textContent=Math.floor(x%3600000/60000);
 document.getElementById("s").textContent=Math.floor(x%60000/1000);
}
countdown();setInterval(countdown,1000);

const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
document.querySelectorAll(".section-reveal").forEach(x=>observer.observe(x));

document.getElementById("rsvpForm").addEventListener("submit",e=>{
 e.preventDefault();
 const data={name:rsvpName.value.trim(),attendance:rsvpAttendance.value,guests:rsvpGuests.value,at:Date.now()};
 const a=JSON.parse(localStorage.getItem("ks_rsvp")||"[]");a.push(data);localStorage.setItem("ks_rsvp",JSON.stringify(a));
 document.getElementById("rsvpStatus").textContent="Terima kasih, konfirmasi Anda telah tersimpan.";
 e.target.reset();
});

const wishList=document.getElementById("wishList");
function renderWishes(){
 const a=JSON.parse(localStorage.getItem("ks_wishes")||"[]");
 wishList.innerHTML=a.map(x=>`<article class="wish"><b>${safe(x.name)}</b><p>${safe(x.text)}</p></article>`).join("");
}
document.getElementById("wishForm").addEventListener("submit",e=>{
 e.preventDefault();
 const a=JSON.parse(localStorage.getItem("ks_wishes")||"[]");
 a.unshift({name:wishName.value.trim(),text:wishText.value.trim()});
 localStorage.setItem("ks_wishes",JSON.stringify(a));e.target.reset();renderWishes();
});
renderWishes();

function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id), grid=$("announcementGrid");
const toast=m=>{const t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3500)};
let currentUser=null, profile=null, localItems=JSON.parse(localStorage.getItem("ecofarm-local-announcements")||"[]");
const seed=[
{title:"Բերրի հողատարածք վարձակալության",category:"land",location:"Արարատի մարզ",price:"$1,200 / տարի",description:"5 հեկտար բերրի գյուղատնտեսական հողատարածք՝ ջրային հասանելիությամբ։ Հարմար է բանջարեղենի և հացահատիկի մշակության համար։",icon:"🌾",date:"13 Սեպտեմբեր 2026"},
{title:"John Deere տրակտոր",category:"equipment",location:"Արմավիր",price:"$18,500",description:"Լավ վիճակում գտնվող տրակտոր՝ մեծ և փոքր գյուղատնտեսական աշխատանքների համար։",icon:"🚜",date:"12 Սեպտեմբեր 2026"},
{title:"Թարմ օրգանական բանջարեղեն",category:"products",location:"Կոտայք",price:"750 ֏ / կգ",description:"Օրգանական լոլիկ, վարունգ, պղպեղ և կանաչեղեն։ Մեծածախ պատվերների դեպքում՝ հատուկ գին։",icon:"🥬",date:"11 Սեպտեմբեր 2026"},
{title:"Կաթնատու կովեր",category:"animals",location:"Շիրակ",price:"$1,400 / հատ",description:"Առողջ և պատվաստված կաթնատու կովեր՝ ֆերմայի ընդլայնման համար։",icon:"🐄",date:"9 Սեպտեմբեր 2026"},
{title:"Ֆերմայի աշխատակից",category:"jobs",location:"Արմավիր",price:"250,000 ֏ / ամիս",description:"Փնտրում ենք պատասխանատու աշխատակից գյուղատնտեսական ֆերմայում աշխատելու համար։",icon:"👨‍🌾",date:"8 Սեպտեմբեր 2026"}
];
const labels={land:"Հողատարածք",equipment:"Գյուղտեխնիկա",products:"Արտադրանք",animals:"Կենդանիներ",jobs:"Աշխատանք",services:"Ծառայություններ"};
function render(){const q=$("search").value.toLowerCase(),cat=$("category").value; const all=[...localItems,...seed]; grid.innerHTML=all.filter(x=>(cat==="all"||x.category===cat)&&`${x.title} ${x.description} ${x.location}`.toLowerCase().includes(q)).map(x=>`<article class="announcement-card"><div class="announcement-image">${x.image?`<img src="${x.image}" alt="">`:x.icon||"🌱"}</div><div class="announcement-body"><span class="tag">${labels[x.category]||x.category}</span><h2>${x.title}</h2><p>${x.description}</p><div class="meta">📍 ${x.location}<br>📅 ${x.date||"Այսօր"}</div><strong class="price">${x.price||"Գինը՝ ըստ պայմանավորվածության"}</strong><button onclick='window.showListing(${JSON.stringify(x).replaceAll("'","&#39;")})'>Դիտել հայտարարությունը →</button></div></article>`).join("")||`<div class="empty">Ոչ մի հայտարարություն չի գտնվել։ Փոխեք որոնման պայմանները։</div>`}
window.showListing=x=>toast(`${x.title} · ${x.location} · ${x.price||""}`);
$("search").addEventListener("input",render);$("category").addEventListener("change",render);
$("addAnnouncement").addEventListener("click",()=>{if(!currentUser)return location.href="login.html"; if(!profile?.subscriptionActive)return location.href="index.html#pricing"; $("modal").classList.remove("hidden")});
$("closeModal").addEventListener("click",()=>$("modal").classList.add("hidden"));
$("aImage").addEventListener("change",e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=()=>{$("imagePreview").innerHTML=`<img src="${r.result}" alt="">`;};r.readAsDataURL(f);}});
$("announcementForm").addEventListener("submit",async e=>{e.preventDefault(); if(!currentUser)return location.href="login.html"; if(!profile?.subscriptionActive)return location.href="index.html#pricing";
const file=$("aImage").files[0]; let image=""; if(file){image=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(file)});}
const item={title:$("aTitle").value.trim(),category:$("aCategory").value,price:$("aPrice").value.trim(),location:$("aLocation").value.trim(),description:$("aDescription").value.trim(),image,date:new Date().toLocaleDateString("hy-AM")};
localItems.unshift(item);localStorage.setItem("ecofarm-local-announcements",JSON.stringify(localItems)); $("modal").classList.add("hidden");e.target.reset();$("imagePreview").innerHTML="";render();toast("Հայտարարությունը տեղադրվեց։");
try{await fetch("/api/announcements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:currentUser.uid,announcement:item})})}catch{}});
onAuthStateChanged(auth,async u=>{currentUser=u;if(u){const s=await getDoc(doc(db,"users",u.uid));profile=s.exists()?s.data():null; $("subscriptionNotice").classList.toggle("hidden",!!profile?.subscriptionActive); if(!profile?.subscriptionActive){$("subscriptionNotice").textContent="🔒 Հայտարարություն տեղադրելու համար ընտրեք և ակտիվացրեք EcoFarm Connect-ի սակագին։";$("subscriptionNotice").classList.remove("hidden")}}render()});
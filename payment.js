import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig),auth=getAuth(app),$=id=>document.getElementById(id),toast=m=>{const t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3500)};
const params=new URLSearchParams(location.search),plan=params.get("plan")||localStorage.getItem("selectedPlan")||"Eco Start";
const prices={"Eco Start":"$9","Eco Grow":"$24","Eco Premium":"$49"};$("planName").textContent=plan;$("planPrice").textContent=prices[plan]||"$9";$("payAmount").textContent=prices[plan]||"$9";
$("cardNumber").addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,16);v=v.replace(/(.{4})/g,"$1 ").trim();e.target.value=v;$("visualNumber").textContent=v||"•••• •••• •••• ••••"});
$("cardHolder").addEventListener("input",e=>$("visualName").textContent=e.target.value.toUpperCase()||"YOUR NAME");
$("expiry").addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,4);if(v.length>2)v=v.slice(0,2)+" / "+v.slice(2);e.target.value=v});
$("cardForm").onsubmit=async e=>{e.preventDefault();const u=auth.currentUser;if(!u)return location.href="login.html";const digits=$("cardNumber").value.replace(/\D/g,"");if(digits.length<16)return toast("Մուտքագրեք 16-նիշ քարտի համար։");if($("cvv").value.length<3)return toast("Ստուգեք CVV-ն։");
localStorage.setItem("paymentStatus","success");localStorage.setItem("selectedPlan",plan);
try{await fetch("/api/user/plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:u.uid,plan,paymentId:`demo_${Date.now()}`})}}catch{}
toast("Վճարումը հաջողությամբ հաստատվեց։");setTimeout(()=>location.href="home.html",900)};
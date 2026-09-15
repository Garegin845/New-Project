import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const $=id=>document.getElementById(id);
onAuthStateChanged(auth,async user=>{
  if(!user){ if(location.pathname.endsWith("home.html")) location.href="login.html"; return; }
  if($("userName")) $("userName").textContent=user.displayName||user.email||"EcoFarm User";
  if($("userEmail")) $("userEmail").textContent=user.email||user.phoneNumber||"";
  if($("planBadge")) {
    try {
      const s=await getDoc(doc(db,"users",user.uid));
      $("planBadge").textContent=s.exists()?s.data().plan||"Free":"Free";
    } catch(e) {
      console.warn("Could not load profile/plan from Firestore:",e);
      $("planBadge").textContent=localStorage.getItem("selectedPlan")||"Free";
    }
  }
});

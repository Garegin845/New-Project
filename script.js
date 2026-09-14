/* =========================================================
   ECOFARM CONNECT
   FIREBASE AUTHENTICATION
   Email + Password
   Google
   Payment Flow
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyA6TZvB9PvnsBaivtb4JMbzucGKiAzCSv4",
    authDomain: "ecofarm-connect.firebaseapp.com",
    projectId: "ecofarm-connect",
    storageBucket: "ecofarm-connect.firebasestorage.app",
    messagingSenderId: "231887548228",
    appId: "1:231887548228:web:430446e1c16c9501eeb111",
    measurementId: "G-M4F4W17LRV"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


/* =========================================================
   GOOGLE PROVIDER
========================================================= */

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================================
   PLANS
========================================================= */

const plans = {
    "Eco Start": 9,
    "Eco Grow": 24,
    "Eco Premium": 49
};


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🌱 EcoFarm Connect loaded");

    loadSelectedPlan();

    loadLoginMode();

    loadHomeUser();

    loadProfileUser();

});


/* =========================================================
   SELECT PLAN
========================================================= */

function selectPlan(plan) {

    if (!plans[plan]) {
        return;
    }

    localStorage.setItem(
        "selectedPlan",
        plan
    );

    const planSelect =
        document.getElementById("plan-select");

    if (planSelect) {
        planSelect.value = plan;
    }

    const registerSection =
        document.getElementById("register");

    if (registerSection) {

        registerSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   LOAD PLAN
========================================================= */

function loadSelectedPlan() {

    const plan =
        localStorage.getItem("selectedPlan");

    const select =
        document.getElementById("plan-select");

    if (plan && select) {
        select.value = plan;
    }

}


/* =========================================================
   EMAIL REGISTER
========================================================= */

async function registerUser(event) {

    event.preventDefault();

    const country =
        document.getElementById("country")?.value.trim();

    const phone =
        document.getElementById("phone")?.value.trim();

    const email =
        document.getElementById("email")?.value.trim();

    const password =
        document.getElementById("password")?.value;

    const confirmPassword =
        document.getElementById("confirm-password")?.value;

    const terms =
        document.getElementById("terms")?.checked;

    const plan =
        document.getElementById("plan-select")?.value;


    /* VALIDATION */

    if (!country) {
        alert("Խնդրում ենք ընտրել երկիրը։");
        return;
    }

    if (!phone) {
        alert("Խնդրում ենք գրել հեռախոսահամարը։");
        return;
    }

    if (!email) {
        alert("Խնդրում ենք գրել էլ․ փոստը։");
        return;
    }

    if (password.length < 8) {
        alert(
            "Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։"
        );
        return;
    }

    if (password !== confirmPassword) {
        alert("Գաղտնաբառերը չեն համընկնում։");
        return;
    }

    if (!terms) {
        alert(
            "Խնդրում ենք ընդունել պայմանները։"
        );
        return;
    }

    if (!plan) {
        alert(
            "Խնդրում ենք ընտրել սակագինը։"
        );
        return;
    }


    const button =
        document.querySelector(
            "#registrationForm .auth-submit"
        );

    if (button) {
        button.disabled = true;
        button.innerHTML =
            "Հաշիվը ստեղծվում է...";
    }


    try {

        /* CREATE FIREBASE ACCOUNT */

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            credential.user;


        /* SAVE USER DATA */

        localStorage.setItem(
            "userId",
            user.uid
        );

        localStorage.setItem(
            "userEmail",
            email
        );

        localStorage.setItem(
            "userPhone",
            phone
        );

        localStorage.setItem(
            "userCountry",
            country
        );

        localStorage.setItem(
            "userPlan",
            plan
        );

        localStorage.setItem(
            "loginMethod",
            "email"
        );


        /* PAYMENT */

        window.location.href =
            "payment.html?plan=" +
            encodeURIComponent(plan);

    }

    catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        showFirebaseError(error);

        if (button) {
            button.disabled = false;
            button.innerHTML =
                "Ստեղծել հաշիվ →";
        }

    }

}


/* =========================================================
   GOOGLE REGISTER
========================================================= */

async function registerWithGoogle() {

    try {

        console.log(
            "🔵 Google registration started"
        );


        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            result.user;


        console.log(
            "✅ Google user:",
            user
        );


        /* SAVE GOOGLE USER */

        localStorage.setItem(
            "userId",
            user.uid
        );

        localStorage.setItem(
            "userEmail",
            user.email || ""
        );

        localStorage.setItem(
            "userName",
            user.displayName || ""
        );

        localStorage.setItem(
            "userPhoto",
            user.photoURL || ""
        );

        localStorage.setItem(
            "loginMethod",
            "google"
        );


        /* DEFAULT PLAN */

        const selectedPlan =
            localStorage.getItem(
                "selectedPlan"
            ) || "Eco Start";

        localStorage.setItem(
            "userPlan",
            selectedPlan
        );


        /* GOOGLE → PAYMENT */

        window.location.href =
            "payment.html?plan=" +
            encodeURIComponent(selectedPlan);

    }

    catch (error) {

        console.error(
            "❌ GOOGLE REGISTER ERROR:",
            error
        );

        showFirebaseError(error);

    }

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function loginWithGoogle() {

    try {

        console.log(
            "🔵 Google login started"
        );


        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            result.user;


        saveUserData(
            user,
            {
                loginMethod: "google"
            }
        );


        console.log(
            "✅ Google login successful"
        );


        window.location.href =
            "home.html";

    }

    catch (error) {

        console.error(
            "❌ GOOGLE LOGIN ERROR:",
            error
        );

        showFirebaseError(error);

    }

}


/* =========================================================
   EMAIL LOGIN
========================================================= */

async function loginUser(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }


    const email =
        document
            .getElementById("login-email")
            ?.value.trim();

    const password =
        document
            .getElementById("login-password")
            ?.value;


    if (!email || !password) {

        alert(
            "Լրացրեք էլ․ փոստը և գաղտնաբառը։"
        );

        return false;
    }


    const button =
        document.querySelector(
            "#loginForm .auth-submit"
        );


    const original =
        button
            ? button.innerHTML
            : "Մուտք գործել →";


    if (button) {

        button.disabled = true;

        button.innerHTML =
            "Մուտք է կատարվում...";

    }


    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        saveUserData(
            user,
            {
                loginMethod: "email"
            }
        );


        window.location.href =
            "home.html";

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        showFirebaseError(error);


        if (button) {

            button.disabled = false;

            button.innerHTML =
                original;

        }

    }


    return false;

}


/* =========================================================
   SAVE USER DATA
========================================================= */

function saveUserData(
    user,
    extra = {}
) {

    if (!user) {
        return;
    }


    localStorage.setItem(
        "userId",
        user.uid || ""
    );

    localStorage.setItem(
        "userEmail",
        user.email || ""
    );

    localStorage.setItem(
        "userName",
        user.displayName || ""
    );

    localStorage.setItem(
        "userPhoto",
        user.photoURL || ""
    );


    Object.entries(extra)
        .forEach(
            ([key, value]) => {

                localStorage.setItem(
                    key,
                    String(value)
                );

            }
        );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

async function forgotPassword(event) {

    if (event) {
        event.preventDefault();
    }


    const email =
        document
            .getElementById("login-email")
            ?.value.trim();


    if (!email) {

        alert(
            "Սկզբում գրեք ձեր էլ․ փոստը։"
        );

        return;
    }


    try {

        await sendPasswordResetEmail(
            auth,
            email
        );


        alert(
            "Գաղտնաբառը վերականգնելու հղումը ուղարկվեց ձեր էլ․ փոստին։"
        );

    }

    catch (error) {

        console.error(
            "PASSWORD RESET ERROR:",
            error
        );

        showFirebaseError(error);

    }

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    const register =
        document.getElementById(
            "register-form"
        );

    const login =
        document.getElementById(
            "login-form"
        );


    if (register) {
        register.classList.add("hidden");
    }

    if (login) {
        login.classList.remove("hidden");
    }

}


/* =========================================================
   SHOW REGISTER
========================================================= */

function showRegister() {

    const register =
        document.getElementById(
            "register-form"
        );

    const login =
        document.getElementById(
            "login-form"
        );


    if (login) {
        login.classList.add("hidden");
    }

    if (register) {
        register.classList.remove("hidden");
    }

}


/* =========================================================
   AUTO OPEN LOGIN
   index.html?login=true
========================================================= */

function loadLoginMode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    if (
        params.get("login") === "true"
    ) {

        showLogin();

        window.history.replaceState(
            {},
            document.title,
            "index.html"
        );

    }

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {
        return;
    }


    if (input.type === "password") {

        input.type = "text";

        if (button) {
            button.textContent = "🙈";
        }

    }

    else {

        input.type = "password";

        if (button) {
            button.textContent = "👁";
        }

    }

}


/* =========================================================
   LANGUAGE
========================================================= */

function changeLanguage(language) {

    localStorage.setItem(
        "ecofarm-language",
        language
    );

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    try {

        await signOut(auth);

        [
            "userId",
            "userEmail",
            "userName",
            "userPhoto",
            "userPhone",
            "userCountry",
            "userPlan",
            "loginMethod"
        ].forEach(
            key =>
                localStorage.removeItem(key)
        );


        window.location.href =
            "index.html";

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


/* =========================================================
   HOME USER
========================================================= */

function loadHomeUser() {

    const name =
        localStorage.getItem(
            "userName"
        );

    const email =
        localStorage.getItem(
            "userEmail"
        );

    const photo =
        localStorage.getItem(
            "userPhoto"
        );


    document
        .querySelectorAll(
            "[data-user-name]"
        )
        .forEach(
            element => {

                element.textContent =
                    name ||
                    email ||
                    "EcoFarm User";

            }
        );


    document
        .querySelectorAll(
            "[data-user-photo]"
        )
        .forEach(
            element => {

                if (photo) {

                    element.src =
                        photo;

                }

            }
        );

}


/* =========================================================
   PROFILE
========================================================= */

function loadProfileUser() {

    const name =
        localStorage.getItem(
            "userName"
        );

    const email =
        localStorage.getItem(
            "userEmail"
        );

    const country =
        localStorage.getItem(
            "userCountry"
        );

    const phone =
        localStorage.getItem(
            "userPhone"
        );

    const plan =
        localStorage.getItem(
            "userPlan"
        );

    const photo =
        localStorage.getItem(
            "userPhoto"
        );


    setText(
        "profile-name",
        name || "EcoFarm User"
    );

    setText(
        "profile-email",
        email || "—"
    );

    setText(
        "profile-country",
        country || "—"
    );

    setText(
        "profile-phone",
        phone || "—"
    );

    setText(
        "profile-plan",
        plan || "Eco Start"
    );


    const profileImage =
        document.getElementById(
            "profile-image"
        );


    if (
        profileImage &&
        photo
    ) {

        profileImage.src =
            photo;

    }

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   PROFILE PHOTO
========================================================= */

function uploadProfilePhoto(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        alert(
            "Ընտրեք միայն նկար։"
        );

        return;

    }


    if (file.size > 5 * 1024 * 1024) {

        alert(
            "Նկարի չափը պետք է լինի մինչև 5MB։"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function () {

        const image =
            reader.result;


        localStorage.setItem(
            "userPhoto",
            image
        );


        const profileImage =
            document.getElementById(
                "profile-image"
            );


        if (profileImage) {

            profileImage.src =
                image;

        }


        document
            .querySelectorAll(
                "[data-user-photo]"
            )
            .forEach(
                img => {
                    img.src = image;
                }
            );

    };


    reader.readAsDataURL(file);

}


/* =========================================================
   UPDATE PROFILE NAME
========================================================= */

async function updateUserName() {

    const input =
        document.getElementById(
            "edit-profile-name"
        );


    const name =
        input?.value.trim();


    if (!name) {

        alert(
            "Գրեք ձեր անունը։"
        );

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Մուտք գործեք ձեր հաշիվ։"
        );

        return;

    }


    try {

        await updateProfile(
            user,
            {
                displayName: name
            }
        );


        localStorage.setItem(
            "userName",
            name
        );


        setText(
            "profile-name",
            name
        );


        alert(
            "Պրոֆիլը հաջողությամբ թարմացվեց։"
        );

    }

    catch (error) {

        console.error(
            "Profile update error:",
            error
        );

        alert(
            "Պրոֆիլը թարմացնել չհաջողվեց։"
        );

    }

}


/* =========================================================
   FIREBASE ERROR
========================================================= */

function showFirebaseError(error) {

    console.error(
        "Firebase error:",
        error
    );


    let message =
        "Ինչ-որ բան սխալ տեղի ունեցավ։";


    switch (error.code) {

        case "auth/email-already-in-use":

            message =
                "Այս էլ․ փոստով հաշիվ արդեն գոյություն ունի։";

            break;


        case "auth/invalid-email":

            message =
                "Էլ․ փոստի հասցեն սխալ է։";

            break;


        case "auth/weak-password":

            message =
                "Գաղտնաբառը շատ թույլ է։";

            break;


        case "auth/invalid-credential":

        case "auth/wrong-password":

            message =
                "Էլ․ փոստը կամ գաղտնաբառը սխալ է։";

            break;


        case "auth/user-not-found":

            message =
                "Այս էլ․ փոստով հաշիվ չի գտնվել։";

            break;


        case "auth/popup-blocked":

            message =
                "Բրաուզերը արգելափակել է Google-ի պատուհանը։";

            break;


        case "auth/popup-closed-by-user":

            message =
                "Google-ի պատուհանը փակվեց։";

            break;


        case "auth/unauthorized-domain":

            message =
                "Այս domain-ը Firebase-ում թույլատրված չէ։";

            break;


        case "auth/operation-not-allowed":

            message =
                "Google կամ Email/Password Authentication-ը Firebase-ում միացված չէ։";

            break;


        case "auth/network-request-failed":

            message =
                "Ցանցային խնդիր է։ Ստուգեք ինտերնետ կապը։";

            break;


        default:

            message =
                error.message ||
                message;

    }


    alert(message);

}


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.selectPlan =
    selectPlan;

window.registerUser =
    registerUser;

window.registerWithGoogle =
    registerWithGoogle;

window.loginWithGoogle =
    loginWithGoogle;

window.loginUser =
    loginUser;

window.forgotPassword =
    forgotPassword;

window.showLogin =
    showLogin;

window.showRegister =
    showRegister;

window.togglePassword =
    togglePassword;

window.changeLanguage =
    changeLanguage;

window.logoutUser =
    logoutUser;

window.uploadProfilePhoto =
    uploadProfilePhoto;

window.updateUserName =
    updateUserName;
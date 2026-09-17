// =========================================================
// ECOFARM CONNECT
// FIREBASE AUTHENTICATION
// Email + Password
// Google Redirect
// =========================================================


// =========================================================
// FIREBASE IMPORTS
// =========================================================

import {
    initializeApp
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    signOut
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    firebaseConfig
} from "./firebase-config.js";


// =========================================================
// FIREBASE INITIALIZATION
// =========================================================

const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


// =========================================================
// GOOGLE PROVIDER
// =========================================================

const googleProvider =
    new GoogleAuthProvider();


googleProvider.setCustomParameters({
    prompt: "select_account"
});


// =========================================================
// HELPER
// =========================================================

const $ = (id) =>
    document.getElementById(id);


// =========================================================
// FIREBASE LOADED
// =========================================================

window.EcoFarmAuthLoaded = true;


console.log(
    "🌱 EcoFarm Firebase Auth loaded successfully"
);


// =========================================================
// TOAST
// =========================================================

function toast(
    message,
    type = "error"
) {

    const element =
        $("toast");


    if (!element) {

        alert(message);

        return;
    }


    element.textContent =
        message;


    element.dataset.type =
        type;


    element.classList.add(
        "show"
    );


    clearTimeout(
        window.__ecoToastTimer
    );


    window.__ecoToastTimer =
        setTimeout(() => {

            element.classList.remove(
                "show"
            );

        }, 4500);
}


// =========================================================
// BUTTON LOADING
// =========================================================

function setBusy(
    button,
    busy,
    text = "Խնդրում ենք սպասել..."
) {

    if (!button) {
        return;
    }


    if (busy) {

        if (!button.dataset.oldText) {

            button.dataset.oldText =
                button.innerHTML;
        }


        button.disabled =
            true;


        button.innerHTML = `
            <span class="auth-spinner"></span>
            ${text}
        `;

    } else {

        button.disabled =
            false;


        if (button.dataset.oldText) {

            button.innerHTML =
                button.dataset.oldText;

            delete button.dataset.oldText;
        }
    }
}


// =========================================================
// FIREBASE ERROR TRANSLATION
// =========================================================

function firebaseMessage(error) {

    const code =
        error?.code || "";


    const messages = {

        "auth/invalid-credential":
            "Email-ը կամ գաղտնաբառը սխալ է։",

        "auth/invalid-login-credentials":
            "Email-ը կամ գաղտնաբառը սխալ է։",

        "auth/user-not-found":
            "Այս email-ով հաշիվ չկա։",

        "auth/wrong-password":
            "Գաղտնաբառը սխալ է։",

        "auth/email-already-in-use":
            "Այս email-ով հաշիվ արդեն գոյություն ունի։",

        "auth/weak-password":
            "Գաղտնաբառը չափազանց թույլ է։",

        "auth/invalid-email":
            "Email հասցեն սխալ է։",

        "auth/operation-not-allowed":
            "Firebase Console-ում այս մուտքի մեթոդը միացված չէ։",

        "auth/unauthorized-domain":
            "Այս domain-ը Firebase-ում թույլատրված չէ։",

        "auth/network-request-failed":
            "Firebase-ին միանալ չհաջողվեց։",

        "auth/too-many-requests":
            "Շատ փորձեր են կատարվել։ Մի փոքր սպասեք։",

        "auth/api-key-not-valid":
            "Firebase API key-ը սխալ է։",

        "auth/configuration-not-found":
            "Firebase Authentication-ի կարգավորումները չեն գտնվել։",

        "auth/popup-blocked":
            "Google-ի պատուհանը արգելափակվել է։",

        "auth/cancelled-popup-request":
            "Google մուտքը չեղարկվեց։"
    };


    return (
        messages[code] ||
        error?.message ||
        "Գործողությունը չհաջողվեց։"
    );
}


// =========================================================
// SAVE USER TO FIRESTORE
// =========================================================

async function saveUser(
    user,
    extra = {}
) {

    try {

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {

                uid:
                    user.uid,

                name:
                    extra.name ??
                    user.displayName ??
                    "",

                email:
                    user.email ??
                    "",

                country:
                    extra.country ??
                    "",

                phone:
                    extra.phone ??
                    "",

                plan:
                    extra.plan ??
                    "Free",

                subscriptionActive:
                    extra.subscriptionActive ??
                    false,

                emailVerified:
                    user.emailVerified ??
                    false,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        console.log(
            "✅ User saved to Firestore"
        );

    } catch (error) {

        console.warn(
            "⚠️ Firestore profile save failed:",
            error
        );

        // Firestore-ի խնդիրը
        // Authentication-ը չի կանգնեցնում։
    }
}


// =========================================================
// GOOGLE LOGIN
// REDIRECT METHOD
// =========================================================

async function googleLogin() {

    console.log(
        "🟢 GOOGLE LOGIN CLICKED"
    );


    const button =
        $("googleLoginBtn");


    setBusy(
        button,
        true,
        "Միացում Google-ին..."
    );


    try {

        console.log(
            "🔵 Starting Google redirect..."
        );


        await signInWithRedirect(
            auth,
            googleProvider
        );


        console.log(
            "🔵 Google redirect requested"
        );

    } catch (error) {

        console.error(
            "❌ GOOGLE REDIRECT ERROR:",
            error
        );


        toast(
            firebaseMessage(error)
        );


        setBusy(
            button,
            false
        );
    }
}


// =========================================================
// CHECK GOOGLE REDIRECT RESULT
// =========================================================

async function checkGoogleRedirect() {

    console.log(
        "🔄 Checking Google redirect..."
    );


    try {

        const result =
            await getRedirectResult(
                auth
            );


        if (!result) {

            console.log(
                "ℹ️ No Google redirect result"
            );

            return;
        }


        const user =
            result.user;


        console.log(
            "✅ GOOGLE LOGIN SUCCESS:",
            user.email
        );


        // =================================================
        // SAVE GOOGLE USER
        // =================================================

        await saveUser(
            user,
            {

                name:
                    user.displayName ||
                    "",

                country:
                    "",

                phone:
                    "",

                plan:
                    "Free",

                subscriptionActive:
                    false
            }
        );


        // =================================================
        // REDIRECT HOME
        // =================================================

        console.log(
            "➡️ Redirecting to home.html..."
        );


        window.location.replace(
            "home.html"
        );

    } catch (error) {

        console.error(
            "❌ GOOGLE REDIRECT RESULT ERROR:",
            error
        );


        toast(
            firebaseMessage(error)
        );
    }
}


// =========================================================
// RUN GOOGLE REDIRECT CHECK
// =========================================================

checkGoogleRedirect();


// =========================================================
// GOOGLE BUTTON
// =========================================================

function initGoogleButton() {

    const button =
        $("googleLoginBtn");


    if (!button) {

        console.log(
            "ℹ️ Google button is not on this page"
        );

        return;
    }


    console.log(
        "✅ Google button found"
    );


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            googleLogin();

        }
    );
}


// =========================================================
// DOM READY
// =========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initGoogleButton
    );

} else {

    initGoogleButton();

}


// =========================================================
// REGISTRATION
// =========================================================

const registerForm =
    $("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const button =
                registerForm.querySelector(
                    'button[type="submit"]'
                );


            const name =
                $("regName")
                    ?.value
                    .trim();


            const email =
                $("regEmail")
                    ?.value
                    .trim();


            const phone =
                $("regPhone")
                    ?.value
                    .trim();


            const country =
                $("regCountry")
                    ?.value;


            const password =
                $("regPassword")
                    ?.value ||
                "";


            const password2 =
                $("regPassword2")
                    ?.value ||
                "";


            const planRaw =
                $("regPlan")
                    ?.value ||
                "";


            const plan =
                planRaw
                    .split(" — ")[0]
                    .trim();


            // =================================================
            // VALIDATION
            // =================================================

            if (!name) {

                toast(
                    "Մուտքագրեք անունը կամ ֆերմայի անունը։"
                );

                return;
            }


            if (!email) {

                toast(
                    "Մուտքագրեք email-ը։"
                );

                return;
            }


            if (!phone) {

                toast(
                    "Մուտքագրեք հեռախոսահամարը։"
                );

                return;
            }


            if (!country) {

                toast(
                    "Ընտրեք երկիրը։"
                );

                return;
            }


            if (!plan) {

                toast(
                    "Ընտրեք սակագինը։"
                );

                return;
            }


            if (
                password.length < 8
            ) {

                toast(
                    "Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։"
                );

                return;
            }


            if (
                password !== password2
            ) {

                toast(
                    "Գաղտնաբառերը չեն համընկնում։"
                );

                return;
            }


            // =================================================
            // CREATE ACCOUNT
            // =================================================

            setBusy(
                button,
                true,
                "Հաշիվը ստեղծվում է..."
            );


            try {

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                // =================================================
                // UPDATE PROFILE
                // =================================================

                await updateProfile(
                    user,
                    {
                        displayName:
                            name
                    }
                );


                // =================================================
                // FIRESTORE
                // =================================================

                await saveUser(
                    user,
                    {

                        name:
                            name,

                        phone:
                            phone,

                        country:
                            country,

                        plan:
                            plan,

                        subscriptionActive:
                            false
                    }
                );


                // =================================================
                // SESSION
                // =================================================

                sessionStorage.setItem(
                    "pendingVerificationEmail",
                    email
                );


                sessionStorage.setItem(
                    "pendingVerificationUid",
                    user.uid
                );


                sessionStorage.setItem(
                    "pendingVerificationPlan",
                    plan
                );


                // =================================================
                // OPTIONAL OTP
                // =================================================

                try {

                    const response =
                        await fetch(
                            "/api/otp/email/send",
                            {

                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        email:
                                            email
                                    })
                            }
                        );


                    const data =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );


                    if (response.ok) {

                        console.log(
                            "📧 Email OTP created"
                        );


                        window.location.replace(
                            "verify.html"
                        );


                        return;
                    }

                } catch (otpError) {

                    console.warn(
                        "OTP server unavailable:",
                        otpError
                    );
                }


                // =================================================
                // OTP UNAVAILABLE
                // =================================================

                console.log(
                    "✅ Registration successful"
                );


                window.location.replace(
                    "home.html"
                );

            } catch (error) {

                console.error(
                    "❌ Registration Error:",
                    error
                );


                toast(
                    firebaseMessage(error)
                );


                setBusy(
                    button,
                    false
                );
            }
        }
    );
}


// =========================================================
// EMAIL LOGIN
// =========================================================

const loginForm =
    $("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const button =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            const email =
                $("loginEmail")
                    ?.value
                    .trim();


            const password =
                $("loginPassword")
                    ?.value ||
                "";


            // =================================================
            // VALIDATION
            // =================================================

            if (!email) {

                toast(
                    "Մուտքագրեք email-ը։"
                );

                return;
            }


            if (!password) {

                toast(
                    "Մուտքագրեք գաղտնաբառը։"
                );

                return;
            }


            setBusy(
                button,
                true,
                "Մուտք..."
            );


            try {

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                console.log(
                    "✅ Email login successful:",
                    user.email
                );


                await saveUser(
                    user
                );


                window.location.replace(
                    "home.html"
                );

            } catch (error) {

                console.error(
                    "❌ Login Error:",
                    error
                );


                toast(
                    firebaseMessage(error)
                );


                setBusy(
                    button,
                    false
                );
            }
        }
    );
}


// =========================================================
// FORGOT PASSWORD
// =========================================================

const forgotPassword =
    $("forgotPassword");


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async () => {

            const email =
                $("loginEmail")
                    ?.value
                    .trim();


            if (!email) {

                toast(
                    "Սկզբում մուտքագրեք ձեր email-ը։"
                );

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                toast(
                    "Գաղտնաբառը վերականգնելու նամակը ուղարկվեց։",
                    "success"
                );

            } catch (error) {

                console.error(
                    "❌ Password reset error:",
                    error
                );


                toast(
                    firebaseMessage(error)
                );
            }
        }
    );
}


// =========================================================
// LOGOUT
// =========================================================

window.logoutUser =
    async function () {

        try {

            await signOut(
                auth
            );


            sessionStorage.clear();


            localStorage.removeItem(
                "selectedPlan"
            );


            localStorage.removeItem(
                "paymentStatus"
            );


            window.location.replace(
                "login.html"
            );

        } catch (error) {

            console.error(
                "❌ Logout error:",
                error
            );


            toast(
                firebaseMessage(error)
            );
        }
    };


// =========================================================
// OLD HTML SUPPORT
// =========================================================

window.loginWithGoogle =
    function () {

        googleLogin();

    };


window.registerWithGoogle =
    function () {

        googleLogin();

    };


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

document
    .querySelectorAll(
        "[data-toggle]"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        $(
                            button.dataset.toggle
                        );


                    if (!input) {
                        return;
                    }


                    input.type =
                        input.type ===
                        "password"
                            ? "text"
                            : "password";
                }
            );
        }
    );


// =========================================================
// FINISHED
// =========================================================

console.log(
    "🌱 EcoFarm Auth initialized"
);

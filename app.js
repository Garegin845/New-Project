// =========================================================
// ECOFARM CONNECT
// APP
// Navigation + Auth + Theme
// =========================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    firebaseConfig
} from "./firebase-config.js";


// =========================================================
// FIREBASE
// =========================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// =========================================================
// HELPERS
// =========================================================

const $ = (id) =>
    document.getElementById(id);


// =========================================================
// ELEMENTS
// =========================================================

const loginLink =
    $("loginLink");

const registerLink =
    $("registerLink");

const logoutBtn =
    $("logoutBtn");

const themeBtn =
    $("themeBtn");


// =========================================================
// THEME
// =========================================================

function applyTheme() {

    const theme =
        localStorage.getItem(
            "ecofarm-theme"
        ) || "light";

    document.documentElement.dataset.theme =
        theme;


    if (themeBtn) {

        if (theme === "dark") {

            themeBtn.textContent = "☀";

            themeBtn.title =
                "Անցնել բաց թեմայի";

        } else {

            themeBtn.textContent = "☾";

            themeBtn.title =
                "Անցնել մուգ թեմայի";
        }
    }
}


// Apply immediately
applyTheme();


// =========================================================
// THEME BUTTON
// =========================================================

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            const current =
                localStorage.getItem(
                    "ecofarm-theme"
                ) || "light";


            const next =
                current === "light"
                    ? "dark"
                    : "light";


            localStorage.setItem(
                "ecofarm-theme",
                next
            );


            applyTheme();

        }
    );

}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            console.log(
                "✅ User logged in:",
                user.email
            );


            // ========================================
            // HIDE LOGIN / REGISTER
            // ========================================

            if (loginLink) {

                loginLink.classList.add(
                    "hidden"
                );

            }


            if (registerLink) {

                registerLink.classList.add(
                    "hidden"
                );

            }


            // ========================================
            // SHOW LOGOUT
            // ========================================

            if (logoutBtn) {

                logoutBtn.classList.remove(
                    "hidden"
                );

            }


            // ========================================
            // LOAD USER INFO
            // ========================================

            try {

                const snapshot =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );


                if (snapshot.exists()) {

                    const data =
                        snapshot.data();

                    console.log(
                        "👤 Profile:",
                        data
                    );

                }

            } catch (error) {

                console.warn(
                    "Profile loading failed:",
                    error
                );

            }

        } else {

            console.log(
                "ℹ️ User is logged out"
            );


            // ========================================
            // SHOW LOGIN / REGISTER
            // ========================================

            if (loginLink) {

                loginLink.classList.remove(
                    "hidden"
                );

            }


            if (registerLink) {

                registerLink.classList.remove(
                    "hidden"
                );

            }


            // ========================================
            // HIDE LOGOUT
            // ========================================

            if (logoutBtn) {

                logoutBtn.classList.add(
                    "hidden"
                );

            }


            // ========================================
            // PROTECTED PAGES
            // ========================================

            const page =
                location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();


            const protectedPages = [
                "home.html",
                "profile.html",
                "announcements.html",
                "payment.html"
            ];


            if (
                protectedPages.includes(page)
            ) {

                location.replace(
                    "login.html"
                );

            }

        }

    }
);


// =========================================================
// LOGOUT
// =========================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                logoutBtn.disabled =
                    true;

                logoutBtn.textContent =
                    "Ելք...";


                await signOut(auth);


                localStorage.removeItem(
                    "selectedPlan"
                );


                localStorage.removeItem(
                    "paymentStatus"
                );


                location.replace(
                    "login.html"
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                logoutBtn.disabled =
                    false;

                logoutBtn.textContent =
                    "↪ Ելք";


                alert(
                    "Դուրս գալ չհաջողվեց։"
                );

            }

        }
    );

}
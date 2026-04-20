// ==========================================
// AUTHENTICATION GUARD (FIXED FLICKER)
// ==========================================

const Auth = {
    check() {
        if (window.location.pathname.includes('login.html')) {
            document.body.classList.add('authorized');
            return true;
        }

        const sessionData = localStorage.getItem('violet_session');
        
        if (!sessionData) {
            window.location.href = "login.html";
            return false;
        }

        const session = JSON.parse(sessionData);
        const now = new Date().getTime();

        if (now > session.expiry) {
            localStorage.removeItem('violet_session');
            window.location.href = "login.html";
            return false;
        }

        // Success! Reveal the body
        document.body.classList.add('authorized');
        return true;
    },
    getToken() {
        const session = JSON.parse(localStorage.getItem('violet_session'));
        return session ? session.token : "";
    },
    logout() {
        localStorage.removeItem('violet_session');
        window.location.href = "login.html";
    }
};

// Run check immediately
Auth.check();

// Backward compatibility for old calls
function getAuthToken() { return Auth.getToken(); }
function logout() { Auth.logout(); }
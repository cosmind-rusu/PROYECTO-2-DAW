// auth.js
const auth = {
    token: null,

    init() {
        this.token = localStorage.getItem('token');
        console.log('Token inicializado:', this.token ? 'Presente' : 'No presente');
    },

    isAuthenticated() {
        return !!this.token;
    },

    getToken() {
        console.log('Obteniendo token:', this.token);
        return this.token;
    },

    setAuthData(token, userId, userName) {
        console.log('Guardando datos de autenticación');
        this.token = token;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
    },

    clearAuthData() {
        console.log('Limpiando datos de autenticación');
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    },

    checkAuth(redirectUrl = '../index.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    logout(redirectUrl = '../index.html') {
        this.clearAuthData();
        window.location.href = redirectUrl;
    }
};

// Inicializar el token al cargar
auth.init();

export default auth;
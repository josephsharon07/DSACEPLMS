function checkAuth() {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('adminAuth');
    window.location.href = '/index.html';
}
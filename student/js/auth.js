function checkAuth(requireConfirmation = true) {
    const userId = localStorage.getItem('currentUser');
    const isConfirmed = localStorage.getItem('confirmUser');

    if (!userId) {
        window.location.href = 'login.html';
        return false;
    }

    if (requireConfirmation && !isConfirmed) {
        window.location.href = 'confirm.html';
        return false;
    }

    return true;
}

function checkDashboardAuth() {
    if (!checkAuth()) return false;
    
    const semester = localStorage.getItem('currentSemester');
    if (!semester) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentSemester');
    localStorage.removeItem('confirmUser');
    window.location.href = '/index.html';
}
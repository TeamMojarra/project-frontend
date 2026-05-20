// API Configuration
const API_URL = 'http://localhost:8000/api/auth';

// DOM Elements
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const dashboardView = document.getElementById('dashboardView');
const notification = document.getElementById('notification');
const notifMessage = document.getElementById('notifMessage');
const loader = document.getElementById('loaderOverlay');

// Links
const toRegister = document.getElementById('toRegister');
const toLogin = document.getElementById('toLogin');

// Forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard Elements
const userAvatar = document.getElementById('userAvatar');
const dashName = document.getElementById('dashName');
const dashEmail = document.getElementById('dashEmail');
const dashRole = document.getElementById('dashRole');

// View State Management
function switchView(viewId) {
    // Hide all
    loginView.classList.add('hidden');
    registerView.classList.add('hidden');
    dashboardView.classList.add('hidden');
    hideNotification();

    // Show requested
    document.getElementById(viewId).classList.remove('hidden');
}

toRegister.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('registerView');
});

toLogin.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('loginView');
});

// Notifications
function showNotification(message, isSuccess = false) {
    notifMessage.textContent = message;
    notification.className = `notification ${isSuccess ? 'success' : ''}`;
    notification.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(hideNotification, 5000);
}

function hideNotification() {
    notification.classList.add('hidden');
}

// Loader
function setLoader(active) {
    if (active) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

// ============================================================
// Auth Logic
// ============================================================

// 1. Register Flow
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirm').value;

    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', false);
        return;
    }

    setLoader(true);
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                confirm_password: confirmPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registro exitoso. Iniciando sesión...', true);
            // Simulate auto-login or redirect
            setTimeout(() => {
                document.getElementById('loginEmail').value = email;
                switchView('loginView');
            }, 2000);
        } else {
            // Handle validation errors from FastAPI
            if (data.detail && Array.isArray(data.detail)) {
                const error = data.detail[0];
                let errorMsg = error.msg;
                // If it's a Pydantic error, it usually has loc: ['body', 'field_name']
                if (error.loc && error.loc.length > 1) {
                    const fieldName = error.loc[error.loc.length - 1];
                    // Translate common field names
                    const fieldTranslations = {
                        'name': 'Nombre completo',
                        'email': 'Correo electrónico',
                        'password': 'Contraseña',
                        'confirm_password': 'Confirmar contraseña'
                    };
                    const translatedField = fieldTranslations[fieldName] || fieldName;
                    
                    if (errorMsg === "Field required") {
                        errorMsg = `El campo "${translatedField}" es obligatorio`;
                    } else if (errorMsg === "value is not a valid email address: The email address is not valid. It must have exactly one @-sign.") {
                        errorMsg = `El "${translatedField}" no tiene un formato válido`;
                    } else {
                        errorMsg = `${translatedField}: ${errorMsg}`;
                    }
                }
                showNotification(errorMsg, false);
            } else {
                showNotification(data.detail || 'Error en el registro', false);
            }
        }
    } catch (error) {
        showNotification('Error de conexión con el servidor', false);
    } finally {
        setLoader(false);
    }
});

// 2. Login Flow
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    setLoader(true);
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save token
            localStorage.setItem('reservent_token', data.access_token);
            // Load dashboard
            loadDashboard();
        } else {
            showNotification(data.detail || 'Credenciales incorrectas', false);
        }
    } catch (error) {
        showNotification('Error de conexión con el servidor', false);
    } finally {
        setLoader(false);
    }
});

// 3. Load Dashboard (Protected Route)
async function loadDashboard() {
    const token = localStorage.getItem('reservent_token');
    
    if (!token) {
        switchView('loginView');
        return;
    }

    setLoader(true);

    try {
        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            
            // Populate UI
            dashName.textContent = user.name;
            dashEmail.textContent = user.email;
            dashRole.textContent = user.role;
            userAvatar.textContent = user.name.charAt(0).toUpperCase();
            
            switchView('dashboardView');
        } else {
            // Token invalid or expired
            logout();
            showNotification('Tu sesión ha expirado', false);
        }
    } catch (error) {
        showNotification('Error al cargar datos del usuario', false);
        switchView('loginView');
    } finally {
        setLoader(false);
    }
}

// 4. Logout
function logout() {
    localStorage.removeItem('reservent_token');
    loginForm.reset();
    registerForm.reset();
    switchView('loginView');
}

logoutBtn.addEventListener('click', logout);

// Initialize
// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('reservent_token');
    if (token) {
        loadDashboard();
    }
});

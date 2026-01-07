// Configurações do Dashboard
const CONFIG = {
    // Configurações do Supabase (serão carregadas do localStorage)
    supabase: {
        url: localStorage.getItem('https://ktjpphfxulkymobkjvqo.supabase.co') || '',
        key: localStorage.getItem('sb_secret_vt_34shHD2vjIdn4rso3lg_Xc-KgTdW') || ''
    },
    
    // Usuário atual
    currentUser: {
        id: localStorage.getItem('userId') || null,
        name: localStorage.getItem('userName') || 'Usuário'
    },
    
    // Período de filtro
    period: {
        type: 'month', // today, week, month, custom
        startDate: null,
        endDate: null
    },
    
    // Tema
    theme: localStorage.getItem('theme') || 'light'
};

// Salvar configurações do Supabase
function saveSupabaseConfig(url, key) {
    localStorage.setItem('https://ktjpphfxulkymobkjvqo.supabase.co', url);
    localStorage.setItem('sb_secret_vt_34shHD2vjIdn4rso3lg_Xc-KgTdW', key);
    CONFIG.supabase.url = url;
    CONFIG.supabase.key = key;
}

// Salvar usuário
function saveUser(userId, userName) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName || 'Usuário');
    CONFIG.currentUser.id = userId;
    CONFIG.currentUser.name = userName || 'Usuário';
}

// Limpar usuário (logout)
function clearUser() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    CONFIG.currentUser.id = null;
    CONFIG.currentUser.name = 'Usuário';
}

// Salvar tema
function saveTheme(theme) {
    localStorage.setItem('theme', theme);
    CONFIG.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
}

// Aplicar tema inicial
document.documentElement.setAttribute('data-theme', CONFIG.theme);

// Funções auxiliares
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
}

function formatDateInput(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function getMonthName(monthNumber) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthNumber - 1] || '';
}

function getPeriodDates(periodType) {
    const today = new Date();
    let startDate, endDate;
    
    switch(periodType) {
        case 'today':
            startDate = new Date(today.setHours(0, 0, 0, 0));
            endDate = new Date(today.setHours(23, 59, 59, 999));
            break;
            
        case 'week':
            const firstDayOfWeek = today.getDate() - today.getDay();
            startDate = new Date(today.setDate(firstDayOfWeek));
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.setDate(firstDayOfWeek + 6));
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
            
        case 'custom':
            startDate = CONFIG.period.startDate ? new Date(CONFIG.period.startDate) : null;
            endDate = CONFIG.period.endDate ? new Date(CONFIG.period.endDate) : null;
            break;
            
        default:
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    return { startDate, endDate };
}

function showNotification(message, type = 'success') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

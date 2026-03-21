// Life Gamification Frontend - App JavaScript
// Dashboard interativo com FastAPI backend

const API_BASE = 'http://localhost:8000';
let currentUser = '+556286077431'; // Fixo para MVP (Nikolas)

// Estado da aplicação
let dashboardData = null;
let currentRecommendations = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboard();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    const recBtn = document.getElementById('generateRecommendations');
    if (recBtn) recBtn.addEventListener('click', generateRecommendations);

    const completeForm = document.getElementById('completeForm');
    if (completeForm) completeForm.addEventListener('submit', handleMissionComplete);

    const modal = document.getElementById('completeModal');
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal();
    });
}

// API Calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showLoading(elementId) {
    document.getElementById(elementId).innerHTML = '<div class="loading"><span class="spinner"></span>Carregando...</div>';
}

// ========== LOAD DASHBOARD ==========
async function loadDashboard() {
    try {
        showLoading('areasGrid');
        showLoading('achievementsList');
        showLoading('missionsList');

        dashboardData = await apiCall(`/dashboard?user_phone=${encodeURIComponent(currentUser)}`);

        renderAreas(dashboardData.user);
        renderAchievements(dashboardData.user);
        renderRecentMissions(dashboardData.user);
        updateHeader(dashboardData.user);

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showToast('Erro ao carregar dados', 'error');
    }
}

// ========== RENDERERS ==========
function renderAreas(userStats) {
    const container = document.getElementById('areasGrid');
    const areas = [
        { name: 'saude', icon: '🏃', color: '#4CAF50' },
        { name: 'foco', icon: '🎯', color: '#2196F3' },
        { name: 'aprendizado', icon: '📚', color: '#FF9800' },
        { name: 'financas', icon: '💰', color: '#9C27B0' }
    ];

    const scores = Object.values(userStats.area_scores);
    const maxScore = Math.max(...scores, 100);

    container.innerHTML = areas.map(area => {
        const score = userStats.area_scores[area.name] || 0;
        const streak = userStats.streaks[area.name] || 0;
        const percentage = (score / maxScore) * 100;

        return `
            <div class="area-card ${area.name}">
                <div class="area-header">
                    <div class="area-name">
                        <span class="area-icon">${area.icon}</span>
                        ${capitalize(area.name)}
                    </div>
                </div>
                <div class="area-stats">
                    <div class="stat-item">
                        <span class="stat-value">${formatNumber(score)}</span>
                        <span class="stat-label">Pontos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${streak}</span>
                        <span class="stat-label">Streak</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${percentage.toFixed(0)}%</span>
                        <span class="stat-label">Progresso</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${area.color}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAchievements(userStats) {
    const container = document.getElementById('achievementsList');
    const unlocked = userStats.unlocked_achievements;

    if (unlocked.length === 0) {
        container.innerHTML = `<p class="text-secondary">Nenhum achievement desbloqueado ainda. Complete missões para conseguir!</p>`;
        return;
    }

    container.innerHTML = unlocked.slice(0, 10).map(ach => `
        <div class="achievement-item unlocked">
            <div class="achievement-icon">${ach.icon || '🏆'}</div>
            <div class="achievement-info">
                <h4>${escapeHtml(ach.name)}</h4>
                <p>${escapeHtml(ach.description)}</p>
            </div>
            <div class="unlocked-badge">✓</div>
        </div>
    `).join('');
}

function renderRecentMissions(userStats) {
    const container = document.getElementById('missionsList');
    const missions = userStats.recent_missions;

    if (missions.length === 0) {
        container.innerHTML = `<p class="text-secondary">Nenhuma missão completada ainda. Comece agora!</p>`;
        return;
    }

    container.innerHTML = missions.slice(0, 10).map(mission => `
        <div class="mission-item">
            <div>
                <h4>${escapeHtml(mission.mission_title)}</h4>
                <span class="mission-area">${escapeHtml(mission.area_name)} • ${mission.completion_date}</span>
            </div>
            <div class="mission-points">
                <span class="points-badge">+${mission.points_earned} pts</span>
            </div>
        </div>
    `).join('');
}

function updateHeader(userStats) {
    document.getElementById('userLevel').textContent = userStats.level;
    document.getElementById('totalPoints').textContent = formatNumber(userStats.total_points);
}

// ========== QUICK COMPLETE (IA Missions) ==========
async function quickCompleteMission(idx) {
    const rec = currentRecommendations[idx];
    if (!rec) return;

    try {
        const result = await apiCall('/mission/quick-complete', 'POST', {
            user_phone: currentUser,
            title: rec.title,
            description: rec.description,
            area_name: rec.area,
            difficulty: rec.difficulty,
            notes: `Criada via IA - ${new Date().toLocaleDateString('pt-BR')}`
        });

        showToast(`✅ ${result.points_earned} pontos com ${rec.title}`, 'success');
        if (result.newly_unlocked_achievements && result.newly_unlocked_achievements.length > 0) {
            result.newly_unlocked_achievements.forEach(ach => {
                showToast(`🏆 Achievement: ${ach.name}`, 'success');
            });
        }
        if (result.points_earned >= 200) {
            showToast(`🔥 Missão difícil! +${result.points_earned} pontos`, 'success');
        }

        setTimeout(loadDashboard, 1500);

    } catch (error) {
        console.error('Erro ao completar missão IA:', error);
        showToast(error.message || 'Erro ao registrar missão', 'error');
    }
}

// ========== MODAL COMPLETE (Mission Existente) ==========
async function handleMissionComplete(e) {
    e.preventDefault();

    const missionId = document.getElementById('missionId').value;
    const notes = document.getElementById('notes').value;

    if (!missionId) {
        showToast('ID da missão não encontrado', 'error');
        return;
    }

    try {
        const result = await apiCall('/mission/complete', 'POST', {
            user_phone: currentUser,
            mission_id: parseInt(missionId),
            notes: notes || undefined
        });

        closeModal();
        showToast(`✅ ${result.points_earned} pontos ganhos! Streak: ${result.current_streak} dia(s)`, 'success');

        if (result.newly_unlocked_achievements && result.newly_unlocked_achievements.length > 0) {
            result.newly_unlocked_achievements.forEach(ach => {
                showToast(`🏆 Achievement desbloqueado: ${ach.name}`, 'success');
            });
        }

        if (result.leveled_up) {
            showToast(`🎉 Parabéns! Você alcançou o nível ${result.new_level}!`, 'success');
        }

        setTimeout(loadDashboard, 1000);

    } catch (error) {
        console.error('Erro ao completar missão:', error);
        showToast(error.message || 'Erro ao registrar missão', 'error');
    }
}

// ========== AI RECOMMENDATIONS ==========
async function generateRecommendations() {
    const container = document.getElementById('recommendationsList');
    const btn = document.getElementById('generateRecommendations');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Analisando seu histórico...';

    try {
        const result = await apiCall('/ai/recommend', 'POST', {
            user_phone: currentUser,
            limit: 3
        });

        currentRecommendations = result.recommendations;

        container.innerHTML = `
            <div class="coaching-advice">${result.reasoning}</div>
            ${currentRecommendations.map((rec, idx) => `
                <div class="recommendation-card">
                    <div class="rec-header">
                        <span class="rec-title">${escapeHtml(rec.title)}</span>
                        <span class="rec-area">${capitalize(rec.area)}</span>
                    </div>
                    <p class="rec-description">${escapeHtml(rec.description)}</p>
                    <div class="rec-footer">
                        <span class="rec-difficulty ${rec.difficulty}">${rec.difficulty}</span>
                        <span class="rec-points">+${rec.points} pts</span>
                    </div>
                    <p class="rec-reason">💡 ${escapeHtml(rec.reason)}</p>
                    <button onclick='quickCompleteMission(${idx})' class="complete-btn btn-small" style="margin-top:10px;">
                        ✅ Completar Agora
                    </button>
                </div>
            `).join('')}
        `;

        showToast('Missões personalizadas geradas com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar recomendações:', error);
        showToast('Erro ao gerar recomendações da IA', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Gerar Missões Personalizadas';
    }
}

// ========== Modal ==========
function openCompleteModal(missionId, missionTitle) {
    document.getElementById('missionId').value = missionId;
    document.getElementById('missionTitle').textContent = `Completar: ${missionTitle}`;
    document.getElementById('notes').value = '';
    document.getElementById('completeModal').classList.add('active');
}

function closeModal() {
    document.getElementById('completeModal').classList.remove('active');
}

// ========== TOAST ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ========== GLOBAL EXPORTS ==========
window.openCompleteModal = openCompleteModal;
window.closeModal = closeModal;
window.quickCompleteMission = quickCompleteMission;

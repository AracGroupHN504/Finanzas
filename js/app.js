const App = (() => {
    'use strict';

    let movements = [];
    let accounts = [];
    let budgets = [];
    let recurring = [];
    let debts = [];
    let creditCards = [];
    let goals = [];
    let categories = [];
    let incomeCategories = [];
    let paymentMethods = [];
let settings = {
        appName: 'Finanzas Personales',
        currency: 'HNL',
        dateFormat: 'dd/mm/yyyy',
        lowBalanceThreshold: 1000,
        theme: 'light',
        alertDays: 2,
        dismissedAlerts: [],
        language: 'es'
    };

    let currentPage = 'dashboard';
    let movementsPage = 1;
    let calendarViewDate = new Date();
    const MOVEMENTS_PER_PAGE = 15;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // ===== Data loading =====
    async function loadAllData() {
        try {
            const mov = await DB.getAll(DB.STORES.MOVEMENTS);
            movements = mov || [];
            accounts = await DB.getAll(DB.STORES.ACCOUNTS) || [];
            budgets = await DB.getAll(DB.STORES.BUDGETS) || [];
            recurring = await DB.getAll(DB.STORES.RECURRING) || [];
            debts = await DB.getAll(DB.STORES.DEBTS) || [];
            creditCards = await DB.getAll(DB.STORES.CREDIT_CARDS) || [];
            goals = await DB.getAll(DB.STORES.GOALS) || [];
            categories = await DB.getAll(DB.STORES.CATEGORIES) || [];
            paymentMethods = await DB.getAll(DB.STORES.PAYMENT_METHODS) || [];
            incomeCategories = categories.filter(c => c.isIncome);
            categories = categories.filter(c => !c.isIncome);
const config = await DB.get(DB.STORES.CONFIG, 'settings');
if (config) settings = { ...settings, ...config };
            applyTheme(settings.theme);
            applyI18n();
            document.getElementById('appName').textContent = settings.appName;
            document.title = settings.appName;
            updateCurrentMonthLabel();
        } catch (e) {
            console.error('Error cargando datos:', e);
            showToast('Error al cargar los datos', 'error');
        }
    }

function updateCurrentMonthLabel() {
        const label = document.getElementById('currentMonth');
        if (label) {
            label.textContent = new Date().toLocaleDateString('es-HN', { month: 'long', year: 'numeric' });
        }
    }

    function applyTheme(theme) {
        const t = theme === 'dark' ? 'dark' : 'light';
        settings.theme = t;
        document.documentElement.dataset.theme = t;
    }

async function saveSettings() {
        const { currency, appName, dateFormat, lowBalanceThreshold, theme, alertDays, dismissedAlerts, language } = settings;
        await DB.put(DB.STORES.CONFIG, { key: 'settings', currency, appName, dateFormat, lowBalanceThreshold, theme, alertDays, dismissedAlerts, language });
    }

    // ===== i18n =====
    const I18N = {
        es: {
            'nav.dashboard': 'Dashboard', 'nav.movements': 'Movimientos', 'nav.income': 'Ingresos', 'nav.expenses': 'Gastos', 'nav.budget': 'Presupuesto', 'nav.recurring': 'Recurrentes', 'nav.debts': 'Deudas', 'nav.cards': 'Tarjetas', 'nav.goals': 'Metas', 'nav.calendar': 'Calendario', 'nav.reports': 'Reportes', 'nav.settings': 'Configuración', 'nav.quickAdd': 'Registro rápido',
            'app.subtitle': 'Control financiero',
            'header.dashboard': 'Dashboard', 'header.movements': 'Movimientos', 'header.income': 'Ingresos', 'header.expenses': 'Gastos', 'header.budget': 'Presupuesto', 'header.recurring': 'Gastos recurrentes', 'header.debts': 'Deudas', 'header.cards': 'Tarjetas de crédito', 'header.goals': 'Metas de ahorro', 'header.calendar': 'Calendario financiero', 'header.reports': 'Reportes', 'header.settings': 'Configuración',
            'header.sub.dashboard': 'Resumen de tu situación financiera', 'header.sub.movements': 'Todos tus movimientos financieros', 'header.sub.income': 'Registro de tus ingresos', 'header.sub.expenses': 'Registro de tus gastos', 'header.sub.budget': 'Controla tus límites por categoría', 'header.sub.recurring': 'Pagos que se repiten cada período', 'header.sub.debts': 'Control de tus deudas y pagos', 'header.sub.cards': 'Control de tus tarjetas', 'header.sub.goals': 'Define tus objetivos financieros', 'header.sub.calendar': 'Visualiza tus eventos financieros', 'header.sub.reports': 'Análisis financiero detallado', 'header.sub.settings': 'Personaliza tu aplicación',
            'freq.daily': 'Diario', 'freq.weekly': 'Semanal', 'freq.biweekly': 'Quincenal', 'freq.monthly': 'Mensual', 'freq.quarterly': 'Trimestral', 'freq.semiannual': 'Semestral', 'freq.annual': 'Anual',
            'stat.income': 'Ingresos del mes', 'stat.incomeSub': 'Entradas del mes', 'stat.expense': 'Gastos del mes', 'stat.expenseSub': 'Salidas del mes', 'stat.balance': 'Disponible del mes', 'stat.balanceSub': 'Ingresos − gastos', 'stat.savings': 'Ahorro del mes', 'stat.savingsSub': 'Tasa de ahorro',
            'dash.saldo': 'Saldo disponible', 'dash.accounts': 'cuentas', 'dash.debts': 'Deudas pendientes', 'dash.debtsSub': 'deudas activas', 'dash.upcoming': 'Pagos próximos (7 días)', 'dash.upcomingSub': 'Pagos por venir', 'dash.upcomingNone': 'Ninguno próximo', 'dash.budgetLeft': 'Presupuesto restante', 'dash.budgetSub': 'Dentro del presupuesto', 'dash.budgetOver': 'Excediendo presupuesto', 'dash.todayExp': 'Gastos del día', 'dash.todayExpSub': 'Gasto de hoy', 'dash.noExpToday': 'Sin gastos hoy', 'dash.savingsRate': 'tasa de ahorro', 'dash.overspend': 'Gastando más de lo que ingresas',
            'rec.summary.monthly': 'Costo mensual', 'rec.summary.monthlySub': 'Impacto mensual total', 'rec.summary.active': 'Activos', 'rec.summary.next': 'Próximo pago', 'rec.summary.none': 'Sin pagos programados', 'rec.summary.days': 'días', 'rec.summary.day': 'día', 'rec.item.s': 'recurrente', 'rec.item.p': 'recurrentes',
            'status.active': 'Activo', 'status.paused': 'Pausado', 'status.paid': 'Pagado', 'status.over': 'Excedido', 'status.warning': 'Alerta', 'status.critical': 'Crítico',
            'alert.hoy': 'Hoy', 'alert.manana': 'Mañana', 'alert.en': 'En {n} días', 'alert.vencido': 'Vencido hace {n}d',
            'notif.title': 'Alertas', 'notif.markAll': 'Marcar todas leídas', 'notif.empty': 'No tienes alertas pendientes',
            'set.general': 'Preferencias generales', 'set.appName': 'Nombre de la aplicación', 'set.currency': 'Moneda', 'set.dateFormat': 'Formato de fecha', 'set.language': 'Idioma', 'set.languageHint': 'Elige el idioma de la interfaz', 'set.theme': 'Modo oscuro', 'set.themeHint': 'Activa la apariencia oscura de la aplicación', 'set.lowBalance': 'Saldo bajo umbral (L)', 'set.alertDays': 'Anticipación de alertas de pago (días)', 'set.alertDaysHint': 'Te avisaremos «hoy», «mañana» y los días previos elegidos.', 'set.save': 'Guardar cambios', 'set.categories': 'Categorías', 'set.catExp': 'Categorías de gasto', 'set.catInc': 'Categorías de ingreso', 'set.methods': 'Métodos de pago', 'set.accounts': 'Cuentas',
            'btn.save': 'Guardar cambios'
        },
        en: {
            'nav.dashboard': 'Dashboard', 'nav.movements': 'Movements', 'nav.income': 'Income', 'nav.expenses': 'Expenses', 'nav.budget': 'Budget', 'nav.recurring': 'Recurring', 'nav.debts': 'Debts', 'nav.cards': 'Cards', 'nav.goals': 'Goals', 'nav.calendar': 'Calendar', 'nav.reports': 'Reports', 'nav.settings': 'Settings', 'nav.quickAdd': 'Quick add',
            'app.subtitle': 'Financial control',
            'header.dashboard': 'Dashboard', 'header.movements': 'Movements', 'header.income': 'Income', 'header.expenses': 'Expenses', 'header.budget': 'Budget', 'header.recurring': 'Recurring expenses', 'header.debts': 'Debts', 'header.cards': 'Credit cards', 'header.goals': 'Savings goals', 'header.calendar': 'Financial calendar', 'header.reports': 'Reports', 'header.settings': 'Settings',
            'header.sub.dashboard': 'Overview of your financial situation', 'header.sub.movements': 'All your financial movements', 'header.sub.income': 'Register of your income', 'header.sub.expenses': 'Register of your expenses', 'header.sub.budget': 'Control your limits per category', 'header.sub.recurring': 'Payments that repeat each period', 'header.sub.debts': 'Control your debts and payments', 'header.sub.cards': 'Control of your cards', 'header.sub.goals': 'Set your financial goals', 'header.sub.calendar': 'View your financial events', 'header.sub.reports': 'Detailed financial analysis', 'header.sub.settings': 'Customize your application',
            'freq.daily': 'Daily', 'freq.weekly': 'Weekly', 'freq.biweekly': 'Biweekly', 'freq.monthly': 'Monthly', 'freq.quarterly': 'Quarterly', 'freq.semiannual': 'Semiannual', 'freq.annual': 'Annual',
            'stat.income': 'Month income', 'stat.incomeSub': 'Month entries', 'stat.expense': 'Month expenses', 'stat.expenseSub': 'Month exits', 'stat.balance': 'Month available', 'stat.balanceSub': 'Income − expenses', 'stat.savings': 'Month savings', 'stat.savingsSub': 'Savings rate',
            'dash.saldo': 'Available balance', 'dash.accounts': 'accounts', 'dash.debts': 'Pending debts', 'dash.debtsSub': 'active debts', 'dash.upcoming': 'Upcoming payments (7 days)', 'dash.upcomingSub': 'Payments ahead', 'dash.upcomingNone': 'None upcoming', 'dash.budgetLeft': 'Budget left', 'dash.budgetSub': 'Within budget', 'dash.budgetOver': 'Over budget', 'dash.todayExp': 'Today expenses', 'dash.todayExpSub': 'Today expense', 'dash.noExpToday': 'No expenses today', 'dash.savingsRate': 'savings rate', 'dash.overspend': 'Spending more than income',
            'rec.summary.monthly': 'Monthly cost', 'rec.summary.monthlySub': 'Total monthly impact', 'rec.summary.active': 'Active', 'rec.summary.next': 'Next payment', 'rec.summary.none': 'No scheduled payments', 'rec.summary.days': 'days', 'rec.summary.day': 'day', 'rec.item.s': 'recurring', 'rec.item.p': 'recurring',
            'status.active': 'Active', 'status.paused': 'Paused', 'status.paid': 'Paid', 'status.over': 'Exceeded', 'status.warning': 'Warning', 'status.critical': 'Critical',
            'alert.hoy': 'Today', 'alert.manana': 'Tomorrow', 'alert.en': 'In {n} days', 'alert.vencido': 'Overdue {n}d',
            'notif.title': 'Alerts', 'notif.markAll': 'Mark all as read', 'notif.empty': 'No pending alerts',
            'set.general': 'General preferences', 'set.appName': 'Application name', 'set.currency': 'Currency', 'set.dateFormat': 'Date format', 'set.language': 'Language', 'set.languageHint': 'Choose the interface language', 'set.theme': 'Dark mode', 'set.themeHint': 'Enable the dark appearance of the app', 'set.lowBalance': 'Low balance threshold (L)', 'set.alertDays': 'Payment alert advance (days)', 'set.alertDaysHint': 'We will notify you "today", "tomorrow" and the chosen days before.', 'set.save': 'Save changes', 'set.categories': 'Categories', 'set.catExp': 'Expense categories', 'set.catInc': 'Income categories', 'set.methods': 'Payment methods', 'set.accounts': 'Accounts',
            'btn.save': 'Save changes'
        }
    };

    function t(key) {
        const dict = (settings.language === 'en' ? I18N.en : I18N.es) || I18N.es;
        return (dict && dict[key]) || I18N.es[key] || key;
    }

    function applyI18n() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.dataset.i18nTitle);
        });
    }

    // ===== Alerts =====
    function buildAlerts() {
        const today = new Date();
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dismissed = settings.dismissedAlerts || [];
        const alertDays = Math.max(0, Number(settings.alertDays) || 0);
        const alerts = [];

        function add(kind, id, dateStr, severity, title, detail, daysLeft) {
            const key = `${kind}-${id}-${dateStr || ''}`;
            if (dismissed.includes(key)) return;
            let label = '';
            if (daysLeft === 0) label = t('alert.hoy');
            else if (daysLeft === 1) label = t('alert.manana');
            else if (daysLeft < 0) label = t('alert.vencido').replace('{n}', Math.abs(daysLeft));
            else label = t('alert.en').replace('{n}', daysLeft);
            const action = kind === 'recurring' ? 'recurring' : kind === 'debt' ? 'debts' : 'settings';
            alerts.push({ key, severity, title, detail, label, daysLeft, action });
        }

        recurring.forEach(r => {
            if (r.status !== 'active' || !r.nextPayment) return;
            const d = new Date(r.nextPayment + (String(r.nextPayment).length <= 10 ? 'T00:00:00' : ''));
            const daysLeft = Math.round((d - startToday) / 86400000);
            const detalle = `Recurrente · ${Calc.formatMoney(Number(r.amount))}`;
            if (daysLeft >= 0 && daysLeft <= alertDays) {
                add('recurring', r.id, r.nextPayment, daysLeft === 0 ? 'danger' : daysLeft === 1 ? 'warning' : 'info', r.name, detalle, daysLeft);
            } else if (daysLeft < 0) {
                add('recurring', r.id, r.nextPayment, 'danger', `${r.name} vencido`, detalle, daysLeft);
            }
        });

        debts.forEach(d => {
            if (d.status !== 'active' || !d.nextPayment) return;
            const dd = new Date(d.nextPayment + (String(d.nextPayment).length <= 10 ? 'T00:00:00' : ''));
            const daysLeft = Math.round((dd - startToday) / 86400000);
            const pago = Calc.formatMoney(Number(d.monthlyPayment) || 0);
            const pend = Calc.formatMoney(Number(d.pendingAmount) || 0);
            const detalle = `Pago de ${pago} · ${pend} pendiente`;
            if (daysLeft >= 0 && daysLeft <= alertDays) {
                add('debt', d.id, d.nextPayment, daysLeft === 0 ? 'danger' : daysLeft === 1 ? 'warning' : 'info', `Deuda: ${d.name}`, detalle, daysLeft);
            } else if (daysLeft < 0) {
                add('debt', d.id, d.nextPayment, 'danger', `Deuda vencida: ${d.name}`, detalle, daysLeft);
            }
        });

        accounts.forEach(a => {
            const bal = Number(a.currentBalance) || 0;
            if (bal < settings.lowBalanceThreshold) {
                const key = `balance-${a.id}`;
                if (!dismissed.includes(key)) {
                    alerts.push({ key, severity: 'warning', title: `Saldo bajo en "${a.name}"`, detail: Calc.formatMoney(bal) + ' disponible', label: 'Atención', daysLeft: null, action: 'settings' });
                }
            }
        });

        alerts.sort((x, y) => {
            const dx = x.daysLeft == null ? 9999 : x.daysLeft;
            const dy = y.daysLeft == null ? 9999 : y.daysLeft;
            return dx - dy;
        });

        return alerts;
    }

    function renderNotifications() {
        const list = document.getElementById('notifList');
        const badge = document.getElementById('notifBadge');
        const alerts = buildAlerts();
        badge.textContent = alerts.length > 9 ? '9+' : alerts.length;
        badge.style.display = alerts.length ? 'flex' : 'none';
        if (!alerts.length) {
            list.innerHTML = `<div class="notif-empty">${escapeHtml(t('notif.empty'))}</div>`;
            return;
        }
        list.innerHTML = alerts.map(a => `
            <div class="notif-item notif-${a.severity}">
                <span class="notif-dot"></span>
                <div class="notif-body">
                    <span class="notif-title">${escapeHtml(a.title)}</span>
                    <span class="notif-detail">${escapeHtml(a.detail)}</span>
                </div>
                <div class="notif-right">
                    <span class="notif-when">${a.label}</span>
                    <a class="notif-go" data-action="goto-alerts" data-id="${a.action}">Ver</a>
                </div>
            </div>
        `).join('');
    }

    async function dismissAllAlerts() {
        const alerts = buildAlerts();
        const dismissed = settings.dismissedAlerts || [];
        const merged = [...new Set([...dismissed, ...alerts.map(a => a.key)])];
        settings.dismissedAlerts = merged.slice(-100);
        await saveSettings();
        renderNotifications();
        showToast('Alertas marcadas como leídas');
    }

    // ===== Toast notifications =====
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
        toast.className = `toast toast-${type}`;
        toast.textContent = `${icons[type] || 'ℹ'} ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ===== Modal helper =====
    function openModal(title, bodyHTML) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHTML;
        document.getElementById('modalOverlay').classList.add('show');
        document.body.style.overflow = 'hidden';
        const firstInput = document.querySelector('#modalBody input, #modalBody select, #modalBody textarea');
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('show');
        document.body.style.overflow = '';
    }

    // ===== Navigation =====
    function navigateTo(page) {
        currentPage = page;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        window.scrollTo(0, 0);

        switch (page) {
            case 'dashboard': renderDashboard(); break;
            case 'movements': renderMovements(); break;
            case 'income': renderIncome(); break;
            case 'expenses': renderExpenses(); break;
            case 'budget': renderBudget(); break;
            case 'recurring': renderRecurring(); break;
            case 'debts': renderDebts(); break;
            case 'cards': renderCards(); break;
            case 'goals': renderGoals(); break;
            case 'calendar': renderCalendar(); break;
            case 'reports': renderReports(); break;
            case 'settings': renderSettings(); break;
        }
    }

    // ===== Account helpers =====
    function getAccountById(id) {
        return accounts.find(a => a.id === id);
    }

function getAccountName(id) {
        const acc = getAccountById(id);
        if (!acc) return 'Sin cuenta';
        return acc.bank ? `${acc.name} (${acc.bank})` : acc.name;
    }

    function getTotalBalance() {
        return accounts.reduce((s, a) => s + (Number(a.currentBalance) || 0), 0);
    }

    async function updateAccountBalance(accountId, delta) {
        const acc = getAccountById(accountId);
        if (!acc) return;
        acc.currentBalance = (Number(acc.currentBalance) || 0) + delta;
        await DB.put(DB.STORES.ACCOUNTS, acc);
    }

    async function recalcAllBalances() {
        const balances = {};
        accounts.forEach(a => { balances[a.id] = Number(a.initialBalance) || 0; });
        movements.forEach(m => {
            const amount = Number(m.amount) || 0;
if (m.type === 'income' && m.accountId) balances[m.accountId] += amount;
            if (m.type === 'expense' && m.accountId) {
                const isCreditCard = m.paymentMethod === 'Tarjeta de crédito' && m.creditCardId;
                if (!isCreditCard) balances[m.accountId] -= amount;
            }
            if (m.type === 'transfer') {
                if (m.accountId) balances[m.accountId] -= amount;
                if (m.toAccountId) balances[m.toAccountId] += amount;
            }
            if (m.type === 'debt_payment' && m.accountId) balances[m.accountId] -= amount;
            if (m.type === 'card_payment' && m.accountId) balances[m.accountId] -= amount;
            if (m.type === 'adjustment' && m.accountId) balances[m.accountId] += amount;
        });
        for (const acc of accounts) {
            acc.currentBalance = balances[acc.id] || 0;
            await DB.put(DB.STORES.ACCOUNTS, acc);
        }
    }

    function typeBadgeHTML(type) {
        const map = {
            income: ['Ingreso', 'badge-income'],
            expense: ['Gasto', 'badge-expense'],
            transfer: ['Transferencia', 'badge-transfer'],
            debt_payment: ['Pago deuda', 'badge-debt'],
            adjustment: ['Ajuste', 'badge-adjustment'],
            card_payment: ['Pago tarjeta', 'badge-info']
        };
        const [label, cls] = map[type] || ['-', 'badge-gray'];
        return `<span class="badge ${cls}">${label}</span>`;
    }
// ===== Movement operations =====
    function applyDebtPaymentEffect(movement, direction) {
        // direction: 1 = increase pending amount, -1 = decrease pending amount
        if (movement.type !== 'debt_payment' || !movement.debtId) return;
        const debt = debts.find(d => d.id === movement.debtId);
        if (!debt) return;
        const amount = Number(movement.amount) || 0;
        const newPending = (Number(debt.pendingAmount) || 0) + (direction * amount);
        debt.pendingAmount = Math.max(0, Math.min(Number(debt.originalAmount) || 0, newPending));
        debt.status = debt.pendingAmount > 0 ? 'active' : 'paid';
    }

    function applyCardExpenseEffect(movement, direction) {
        // direction: 1 = add to usedBalance, -1 = subtract from usedBalance
        if (movement.type !== 'expense' || movement.paymentMethod !== 'Tarjeta de crédito' || !movement.creditCardId) return;
        const card = creditCards.find(c => c.id === movement.creditCardId);
        if (!card) return;
        const amount = Number(movement.amount) || 0;
        const newUsed = (Number(card.usedBalance) || 0) + (direction * amount);
        card.usedBalance = Math.max(0, Math.min(Number(card.limit) || 0, newUsed));
    }

    function applyCardPaymentEffect(movement, direction) {
        // direction: 1 = add to usedBalance (undo payment), -1 = subtract (apply payment)
        if (movement.type !== 'card_payment' || !movement.creditCardId) return;
        const card = creditCards.find(c => c.id === movement.creditCardId);
        if (!card) return;
        const amount = Number(movement.amount) || 0;
        const newUsed = (Number(card.usedBalance) || 0) + (direction * amount);
        card.usedBalance = Math.max(0, Math.min(Number(card.limit) || 0, newUsed));
    }

    async function saveMovement(data) {
        const errors = Calc.validateMovement(data);
        if (errors.length > 0) {
            showToast(errors[0], 'error');
            return false;
        }

        const isEdit = !!data.id;
        let oldMovement = null;

        if (isEdit) {
            oldMovement = movements.find(m => m.id === data.id);
            if (!oldMovement) {
                showToast('Movimiento no encontrado', 'error');
                return false;
            }
        } else {
            data.id = DB.generateId();
        }

        if (oldMovement) {
            // Revert old movement side effects on debts and cards
            applyDebtPaymentEffect(oldMovement, 1);
            applyCardExpenseEffect(oldMovement, -1);
            applyCardPaymentEffect(oldMovement, 1);
            if (oldMovement.type === 'debt_payment' && oldMovement.debtId) {
                const debt = debts.find(d => d.id === oldMovement.debtId);
                if (debt) await DB.put(DB.STORES.DEBTS, debt);
            }
            const oldCardIds = new Set();
            if (oldMovement.type === 'card_payment' && oldMovement.creditCardId) oldCardIds.add(oldMovement.creditCardId);
            if (oldMovement.type === 'expense' && oldMovement.paymentMethod === 'Tarjeta de crédito' && oldMovement.creditCardId) oldCardIds.add(oldMovement.creditCardId);
            for (const cid of oldCardIds) {
                const card = creditCards.find(c => c.id === cid);
                if (card) await DB.put(DB.STORES.CREDIT_CARDS, card);
            }
            await DB.remove(DB.STORES.MOVEMENTS, oldMovement.id);
            movements = movements.filter(m => m.id !== oldMovement.id);
        }

        await DB.put(DB.STORES.MOVEMENTS, data);
        movements.push(data);

        // Apply new movement side effects on debts and cards
        if (data.type === 'debt_payment' && data.debtId) {
            applyDebtPaymentEffect(data, -1);
            const debt = debts.find(d => d.id === data.debtId);
            if (debt) {
                debt.payments = debt.payments || [];
                debt.payments.push({ date: data.date, amount: Number(data.amount) || 0 });
                await DB.put(DB.STORES.DEBTS, debt);
            }
        }
        if (data.type === 'expense' && data.paymentMethod === 'Tarjeta de crédito' && data.creditCardId) {
            applyCardExpenseEffect(data, 1);
            const card = creditCards.find(c => c.id === data.creditCardId);
            if (card) await DB.put(DB.STORES.CREDIT_CARDS, card);
        }
        if (data.type === 'card_payment' && data.creditCardId) {
            applyCardPaymentEffect(data, -1);
            const card = creditCards.find(c => c.id === data.creditCardId);
            if (card) await DB.put(DB.STORES.CREDIT_CARDS, card);
        }

        await recalcAllBalances();

        showToast(isEdit ? 'Movimiento actualizado' : 'Movimiento guardado');
        return true;
    }

    async function deleteMovement(id) {
        const movement = movements.find(m => m.id === id);
        if (!movement) return false;

        if (!confirm('¿Seguro que deseas eliminar este movimiento?\nEsta acción no se puede deshacer.')) {
            return false;
        }

        await DB.remove(DB.STORES.MOVEMENTS, id);
        movements = movements.filter(m => m.id !== id);

        applyDebtPaymentEffect(movement, 1);
        applyCardExpenseEffect(movement, -1);
        applyCardPaymentEffect(movement, 1);

        if (movement.type === 'debt_payment' && movement.debtId) {
            const debt = debts.find(d => d.id === movement.debtId);
            if (debt) await DB.put(DB.STORES.DEBTS, debt);
        }
        const affectedCards = new Set();
        if (movement.type === 'card_payment' && movement.creditCardId) affectedCards.add(movement.creditCardId);
        if (movement.type === 'expense' && movement.paymentMethod === 'Tarjeta de crédito' && movement.creditCardId) affectedCards.add(movement.creditCardId);
        for (const cid of affectedCards) {
            const card = creditCards.find(c => c.id === cid);
            if (card) await DB.put(DB.STORES.CREDIT_CARDS, card);
        }

        await recalcAllBalances();
        showToast('Movimiento eliminado');
        return true;
    }
// ===== Dashboard =====
    function renderDashboard() {
        renderDashboardCards();
        renderFinancialSummary();
        renderRecentMovements();
        renderUpcomingPayments();
        renderCharts();
        renderAlerts();
    }

    function renderDashboardCards() {
        const monthly = Calc.getMonthlyTotals(movements);
        const todayExp = Calc.getTodayExpenses(movements);
        const totalBalance = getTotalBalance();
        const totalDebts = Calc.getDebtSummary(debts).totalPending;
        const upcomingCount = Calc.getUpcomingPayments(movements, recurring, debts, 7).length;
        const budgetStatus = Calc.getBudgetStatus(budgets, movements);
        const totalBudget = Calc.getTotalBudget(budgets);
        const totalSpent = budgetStatus.reduce((s, b) => s + b.spent, 0);
        const remainingBudget = totalBudget - totalSpent;
        const savings = monthly.income - monthly.expense;
        const savingsRate = Calc.calculateSavingsRate(monthly.income, monthly.expense);

const cards = [
            { label: t('dash.saldo'), icon: '💳', iconClass: 'stat-primary', value: Calc.formatMoney(totalBalance), sub: `${accounts.length} ${t('dash.accounts')}`, target: 'movements' },
            { label: t('stat.income'), icon: '▲', iconClass: 'stat-positive', value: Calc.formatMoney(monthly.income), sub: t('stat.incomeSub'), target: 'income', filter: { incomePeriod: 'thisMonth' } },
            { label: t('stat.expense'), icon: '▼', iconClass: 'stat-negative', value: Calc.formatMoney(monthly.expense), sub: t('stat.expenseSub'), target: 'expenses', filter: { expensePeriod: 'thisMonth' } },
            { label: t('stat.savings'), icon: '◎', iconClass: savings >= 0 ? 'stat-info' : 'stat-negative', value: Calc.formatMoney(savings), sub: savings >= 0 ? `${savingsRate.toFixed(1)}% ${t('dash.savingsRate')}` : t('dash.overspend'), target: 'reports' },
            { label: t('dash.debts'), icon: '◆', iconClass: 'stat-warning', value: Calc.formatMoney(totalDebts), sub: `${debts.filter(d => d.status !== 'paid').length} ${t('dash.debtsSub')}`, target: 'debts' },
            { label: t('dash.upcoming'), icon: '⚡', iconClass: 'stat-info', value: String(upcomingCount), sub: upcomingCount > 0 ? t('dash.upcomingSub') : t('dash.upcomingNone'), target: 'recurring' },
            { label: t('dash.budgetLeft'), icon: '•', iconClass: remainingBudget >= 0 ? 'stat-positive' : 'stat-negative', value: Calc.formatMoney(remainingBudget), sub: remainingBudget >= 0 ? t('dash.budgetSub') : t('dash.budgetOver'), target: 'budget' },
            { label: t('dash.todayExp'), icon: '◉', iconClass: todayExp > 0 ? 'stat-warning' : 'stat-primary', value: Calc.formatMoney(todayExp), sub: todayExp > 0 ? t('dash.todayExpSub') : t('dash.noExpToday'), target: 'expenses', filter: { expensePeriod: 'today' } }
        ];

        const container = document.getElementById('dashboardCards');
        container.innerHTML = cards.map(c => `
            <div class="stat-card" data-target="${c.target}" ${c.filter ? `data-filters='${JSON.stringify(c.filter)}'` : ''}>
                <div class="stat-label">${c.label}</div>
                <div class="stat-value">${c.value}</div>
                <div class="stat-sub">${c.sub}</div>
                <div class="stat-icon ${c.iconClass}"><span>${c.icon}</span></div>
            </div>
        `).join('');

        container.querySelectorAll('.stat-card[data-target]').forEach(card => {
            card.addEventListener('click', () => {
                const target = card.dataset.target;
                try {
                    const filters = card.dataset.filters ? JSON.parse(card.dataset.filters) : {};
                    Object.keys(filters).forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = filters[id];
                    });
                } catch (err) { /* ignore */ }
                navigateTo(target);
            });
        });
    }

    function renderFinancialSummary() {
        const monthly = Calc.getMonthlyTotals(movements);
        const totalDebts = Calc.getDebtSummary(debts).totalPending;
        const savings = monthly.income - monthly.expense;
        const container = document.getElementById('financialSummary');

        const items = [
            { label: 'INGRESOS', value: monthly.income, cls: 'summary-income' },
            { label: 'GASTOS', value: monthly.expense, cls: 'summary-expense' },
            { label: 'DISPONIBLE', value: monthly.balance, cls: 'summary-balance' },
            { label: 'AHORRO', value: savings, cls: savings >= 0 ? 'summary-savings' : 'summary-expense' },
            { label: 'DEUDAS', value: totalDebts, cls: 'summary-debt' }
        ];

        container.innerHTML = items.map(i => `
            <div class="summary-item">
                <div class="summary-label">${i.label}</div>
                <div class="summary-value ${i.cls}">${Calc.formatMoney(i.value)}</div>
            </div>
        `).join('');
    }

    function renderRecentMovements() {
        const sorted = [...movements]
            .filter(m => m.type !== 'card_payment')
            .sort((a, b) => (b.date + (b.time || '00:00')).localeCompare(a.date + (a.time || '00:00')))
            .slice(0, 8);
        const tbody = document.querySelector('#recentMovements tbody');

        if (sorted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p>No hay movimientos aún. Agrega tu primer registro.</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = sorted.map(m => {
            const isPositive = m.type === 'income' || m.type === 'adjustment' || (m.type === 'transfer' && m.transferDirection === 'in');
            const amount = isPositive
                ? `<span class="amount-income">+${Calc.formatMoney(m.amount)}</span>`
                : `<span class="amount-expense">-${Calc.formatMoney(m.amount)}</span>`;
            return `<tr>
                <td>${Calc.formatDate(m.date)}</td>
                <td>${typeBadgeHTML(m.type)}</td>
                <td>${escapeHtml(m.description)}</td>
                <td>${escapeHtml(m.category || '-')}</td>
                <td>${amount}</td>
            </tr>`;
        }).join('');
    }

    function calcDaysUntil(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return Math.round((d - now) / 86400000);
    }

    function renderUpcomingPayments() {
        const upcoming = Calc.getUpcomingPayments(movements, recurring, debts, 7);
        const container = document.getElementById('upcomingList');

        if (upcoming.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No hay pagos en los próximos 7 días.</p></div>`;
            return;
        }

        container.innerHTML = upcoming.map(u => {
            const iconBg = u.type === 'recurring' ? 'stat-info' : 'stat-warning';
            const icon = u.type === 'recurring' ? '◷' : '◆';
            const days = calcDaysUntil(u.date);
            return `<div class="upcoming-item">
                <div class="upcoming-icon ${iconBg}">${icon}</div>
                <div>
                    <div class="upcoming-name">${escapeHtml(u.name)}</div>
                    <div class="upcoming-date">${Calc.formatDate(u.date)} · ${days} ${days === 1 ? 'día' : 'días'}</div>
                </div>
                <div class="upcoming-amount">${Calc.formatMoney(u.amount)}</div>
            </div>`;
        }).join('');
    }

    function renderCharts() {
        const byCategory = Calc.getExpensesByCategory(movements, 'thisMonth');
        const monthly = Calc.getMonthlyComparison(movements, 6);
        const budgetStatus = Calc.getBudgetStatus(budgets, movements);
        const byMethod = Calc.getExpensesByMethod(movements, 'thisMonth');
        const evolution = Calc.getBalanceEvolution(movements).slice(-30);

        Charts.categoryChart(byCategory);
        Charts.incomeExpenseChart(monthly);
        Charts.budgetChart(budgetStatus);
        Charts.methodChart(byMethod);
        Charts.balanceChart(evolution);
        Charts.monthlyChart(monthly);
    }

    function renderAlerts() {
        const alerts = [];
        const monthly = Calc.getMonthlyTotals(movements);
        const budgetStatus = Calc.getBudgetStatus(budgets, movements);

        budgetStatus.forEach(b => {
            if (b.status === 'over') {
                alerts.push({ type: 'danger', message: `Presupuesto excedido en ${b.category}: ${Calc.formatMoney(b.spent - b.amount)} sobre el límite` });
            } else if (b.status === 'warning') {
                alerts.push({ type: 'warning', message: `Has usado el ${b.percent.toFixed(0)}% del presupuesto de ${b.category}` });
            }
        });

        const overdue = Calc.getOverdueItems(recurring, debts);
        overdue.forEach(d => {
            alerts.push({ type: 'danger', message: `${d.name} (${d.type === 'debt' ? 'deuda' : 'recurrente'}) está vencido` });
        });

        const totalBalance = getTotalBalance();
        if (totalBalance < (settings.lowBalanceThreshold || 1000)) {
            alerts.push({ type: 'warning', message: `Saldo bajo: ${Calc.formatMoney(totalBalance)}` });
        }

        const cardsStatus = Calc.getCreditCardUtilization(creditCards);
        cardsStatus.forEach(c => {
            if (c.status === 'critical') {
                alerts.push({ type: 'danger', message: `Alta utilización en ${c.name}: ${c.percent.toFixed(0)}%` });
            } else if (c.status === 'warning') {
                alerts.push({ type: 'warning', message: `Tarjeta ${c.name} al ${c.percent.toFixed(0)}% de utilización` });
            }
        });

        if (monthly.expense > monthly.income && monthly.income > 0) {
            alerts.push({ type: 'danger', message: 'Gastos exceden ingresos este mes' });
        }

        alerts.slice(0, 5).forEach(a => showToast(a.message, a.type));
    }
// ===== Movements list =====
    function getFilteredMovements() {
        const search = document.getElementById('movSearch').value.trim().toLowerCase();
        const type = document.getElementById('movTypeFilter').value;
        const period = document.getElementById('movPeriodFilter').value;
        const category = document.getElementById('movCategoryFilter').value;
        const method = document.getElementById('movMethodFilter').value;

        let filtered = [...movements].filter(m => m.type !== 'card_payment');

        if (search) {
            filtered = filtered.filter(m =>
                (m.description && m.description.toLowerCase().includes(search)) ||
                (m.category && m.category.toLowerCase().includes(search)) ||
                (m.commerce && m.commerce.toLowerCase().includes(search)) ||
                (m.notes && m.notes.toLowerCase().includes(search))
            );
        }
        if (type) filtered = filtered.filter(m => m.type === type);
        if (period) {
            if (period === 'custom') {
                const from = document.getElementById('movFromDate').value;
                const to = document.getElementById('movToDate').value;
                if (from && to) filtered = Calc.filterByDateRange(filtered, from, to);
            } else {
                filtered = Calc.filterByPeriod(filtered, period);
            }
        }
        if (category) filtered = filtered.filter(m => m.category === category);
        if (method) filtered = filtered.filter(m => m.paymentMethod === method);

        return filtered.sort((a, b) => (b.date + (b.time || '00:00')).localeCompare(a.date + (a.time || '00:00')));
    }

    function renderPagination(containerId, totalItems, totalPages, currentPage, onPageChange) {
        const container = document.getElementById(containerId);
        if (totalItems === 0) {
            container.innerHTML = '';
            return;
        }
        if (totalPages <= 1) {
            container.innerHTML = `<span style="font-size:12px;color:var(--gray);">${totalItems} registros</span>`;
            return;
        }

        let html = `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
                if (!html.includes('…')) html += `<span>…</span>`;
                continue;
            }
            html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;

        container.innerHTML = html;
        container.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= totalPages) onPageChange(page);
            });
        });
    }

    function renderMovements() {
        const filtered = getFilteredMovements();
        const totalPages = Math.max(1, Math.ceil(filtered.length / MOVEMENTS_PER_PAGE));
        if (movementsPage > totalPages) movementsPage = totalPages;
        const pageItems = filtered.slice((movementsPage - 1) * MOVEMENTS_PER_PAGE, movementsPage * MOVEMENTS_PER_PAGE);

        const tbody = document.getElementById('movementsTableBody');
        const emptyEl = document.getElementById('movementsEmpty');

        let totalIncome = 0, totalExpense = 0;
        filtered.forEach(m => {
            if (m.type === 'income') totalIncome += Number(m.amount) || 0;
            if (m.type === 'expense') totalExpense += Number(m.amount) || 0;
        });

        if (filtered.length === 0) {
            emptyEl.style.display = 'block';
            tbody.innerHTML = '';
            document.getElementById('movementsPagination').innerHTML = '';
            return;
        }

        emptyEl.style.display = 'none';

        let rows = pageItems.map(m => {
            let sign = m.type === 'income' || m.type === 'adjustment' ? '+' : (m.type === 'expense' ? '-' : '');
            let amountColor = m.type === 'income' || m.type === 'adjustment' ? 'var(--success-dark)' : m.type === 'expense' ? 'var(--danger)' : 'var(--dark-2)';
            return `<tr>
                <td>${m.time ? Calc.formatDate(m.date) : Calc.formatDate(m.date)}</td>
                <td>${typeBadgeHTML(m.type)}</td>
                <td>${escapeHtml(m.description)}</td>
                <td>${escapeHtml(m.category || '-')}</td>
                <td>${m.type === 'transfer' ? escapeHtml(getAccountName(m.accountId) + ' → ' + getAccountName(m.toAccountId)) : escapeHtml(getAccountName(m.accountId))}</td>
                <td>${escapeHtml(m.paymentMethod || '-')}</td>
                <td style="color:${amountColor};font-weight:600">${sign}${Calc.formatMoney(m.amount)}</td>
                <td>${m.isRecurring ? '<span class="badge badge-info">Recurrente</span>' : '<span class="badge badge-gray">Normal</span>'}</td>
                <td>
                    <button class="btn-icon edit" data-action="edit-movement" data-id="${m.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-movement" data-id="${m.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');

        rows += `<tr style="background:var(--bg);font-weight:600;">
            <td colspan="6">Total: ${filtered.length} movimientos</td>
            <td style="color:var(--success-dark)">+${Calc.formatMoney(totalIncome)}</td>
            <td style="color:var(--danger)">-${Calc.formatMoney(totalExpense)}</td>
            <td style="color:${totalIncome - totalExpense >= 0 ? 'var(--success-dark)' : 'var(--danger)'}">${Calc.formatMoney(totalIncome - totalExpense)}</td>
        </tr>`;

        tbody.innerHTML = rows;
        renderPagination('movementsPagination', filtered.length, totalPages, movementsPage, page => {
            movementsPage = page;
            renderMovements();
        });
    }

    function populateMovementFilters() {
        const catSelect = document.getElementById('movCategoryFilter');
        const methodSelect = document.getElementById('movMethodFilter');
        const incomeCat = document.getElementById('incomeCategory');
        const expenseCat = document.getElementById('expenseCategory');
        const expenseMethod = document.getElementById('expenseMethod');

        const expenseCatNames = categories.map(c => c.name);
        const incomeCatNames = incomeCategories.map(c => c.name);

        const catValues = new Set(movements.map(m => m.category).filter(Boolean));
        if (catSelect) {
            catSelect.innerHTML = '<option value="">Todas</option>' + [...catValues].map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        }
        if (incomeCat) {
            const incCats = [...incomeCatNames, ...new Set(movements.filter(m => m.type === 'income').map(m => m.category).filter(Boolean))];
            incomeCat.innerHTML = '<option value="">Todas</option>' + [...new Set(incCats)].map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        }
        if (expenseCat) {
            const expCats = [...expenseCatNames, ...new Set(movements.filter(m => m.type === 'expense').map(m => m.category).filter(Boolean))];
            expenseCat.innerHTML = '<option value="">Todas</option>' + [...new Set(expCats)].map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
        }
        if (methodSelect) {
            methodSelect.innerHTML = '<option value="">Todos</option>' + paymentMethods.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`).join('');
        }
        if (expenseMethod) {
            expenseMethod.innerHTML = '<option value="">Todos</option>' + paymentMethods.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`).join('');
        }
    }

    // ===== Income =====
    function renderIncome() {
        const search = document.getElementById('incomeSearch').value.trim().toLowerCase();
        const period = document.getElementById('incomePeriod').value;
        const catFilter = document.getElementById('incomeCategory').value;

        let filtered = movements.filter(m => m.type === 'income');
        if (search) {
            filtered = filtered.filter(m =>
                (m.description && m.description.toLowerCase().includes(search)) ||
                (m.category && m.category.toLowerCase().includes(search)) ||
                (m.notes && m.notes.toLowerCase().includes(search))
            );
        }
        if (period && period !== 'all') filtered = Calc.filterByPeriod(filtered, period);
        if (catFilter) filtered = filtered.filter(m => m.category === catFilter);
        filtered.sort((a, b) => b.date.localeCompare(a.date));

        const total = filtered.reduce((s, m) => s + (Number(m.amount) || 0), 0);
        const container = document.getElementById('incomeSummary');
        const months = new Set(filtered.map(m => Calc.getMonthKey(m.date)));
        const avgMonthly = total / Math.max(1, months.size);
        const maxIncome = filtered.length > 0 ? Math.max(...filtered.map(m => Number(m.amount) || 0)) : 0;

        container.innerHTML = `
            <div class="stat-card"><div class="stat-label">Total ingresos</div><div class="stat-value" style="color:var(--success-dark)">${Calc.formatMoney(total)}</div><div class="stat-sub">${filtered.length} registros</div></div>
            <div class="stat-card"><div class="stat-label">Promedio mensual</div><div class="stat-value">${Calc.formatMoney(avgMonthly)}</div><div class="stat-sub">${months.size} ${months.size === 1 ? 'mes' : 'meses'}</div></div>
            <div class="stat-card"><div class="stat-label">Mayor ingreso</div><div class="stat-value">${Calc.formatMoney(maxIncome)}</div></div>
        `;

        const tbody = document.getElementById('incomeTableBody');
        const emptyEl = document.getElementById('incomeEmpty');

        if (filtered.length === 0) {
            emptyEl.style.display = 'block';
            tbody.innerHTML = '';
            return;
        }

        emptyEl.style.display = 'none';
        tbody.innerHTML = filtered.slice(0, 100).map(m => {
            const src = m.source || m.commerce || '-';
            return `<tr>
                <td>${Calc.formatDate(m.date)}</td>
                <td>${escapeHtml(m.description)}</td>
                <td>${escapeHtml(m.category || '-')}</td>
                <td>${escapeHtml(src)}</td>
                <td>${escapeHtml(m.paymentMethod || '-')}</td>
                <td class="amount-income">+${Calc.formatMoney(m.amount)}</td>
                <td>
                    <button class="btn-icon edit" data-action="edit-movement" data-id="${m.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-movement" data-id="${m.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }

    // ===== Expenses =====
    function renderExpenses() {
        const search = document.getElementById('expenseSearch').value.trim().toLowerCase();
        const period = document.getElementById('expensePeriod').value;
        const catFilter = document.getElementById('expenseCategory').value;
        const methodFilter = document.getElementById('expenseMethod').value;
        const recFilter = document.getElementById('expenseRecurrentFilter').value;

        let filtered = movements.filter(m => m.type === 'expense');
        if (search) {
            filtered = filtered.filter(m =>
                (m.description && m.description.toLowerCase().includes(search)) ||
                (m.category && m.category.toLowerCase().includes(search)) ||
                (m.commerce && m.commerce.toLowerCase().includes(search)) ||
                (m.notes && m.notes.toLowerCase().includes(search))
            );
        }
        if (period && period !== 'all') filtered = Calc.filterByPeriod(filtered, period);
        if (catFilter) filtered = filtered.filter(m => m.category === catFilter);
        if (methodFilter) filtered = filtered.filter(m => m.paymentMethod === methodFilter);
        if (recFilter === 'yes') filtered = filtered.filter(m => m.isRecurring);
        if (recFilter === 'no') filtered = filtered.filter(m => !m.isRecurring);
        filtered.sort((a, b) => b.date.localeCompare(a.date));

        const total = filtered.reduce((s, m) => s + (Number(m.amount) || 0), 0);
        const container = document.getElementById('expenseSummary');
        const months = new Set(filtered.map(m => Calc.getMonthKey(m.date)));
        const avgMonthly = total / Math.max(1, months.size);
        const byCat = Calc.getExpensesByCategory(filtered, period === 'all' ? 'all' : period);
        const topCat = byCat.length > 0 ? `${byCat[0].category}: ${Calc.formatMoney(byCat[0].amount)}` : '-';
        const maxExpense = filtered.length > 0 ? Math.max(...filtered.map(m => Number(m.amount) || 0)) : 0;

        container.innerHTML = `
            <div class="stat-card"><div class="stat-label">Total gastos</div><div class="stat-value" style="color:var(--danger)">${Calc.formatMoney(total)}</div><div class="stat-sub">${filtered.length} registros</div></div>
            <div class="stat-card"><div class="stat-label">Promedio mensual</div><div class="stat-value">${Calc.formatMoney(avgMonthly)}</div><div class="stat-sub">${months.size} ${months.size === 1 ? 'mes' : 'meses'}</div></div>
            <div class="stat-card"><div class="stat-label">Categoría mayor</div><div class="stat-value" style="font-size:16px;color:var(--dark-2)">${escapeHtml(topCat)}</div></div>
            <div class="stat-card"><div class="stat-label">Mayor gasto</div><div class="stat-value">${Calc.formatMoney(maxExpense)}</div></div>
        `;

        const tbody = document.getElementById('expenseTableBody');
        const emptyEl = document.getElementById('expenseEmpty');

        if (filtered.length === 0) {
            emptyEl.style.display = 'block';
            tbody.innerHTML = '';
            return;
        }

        emptyEl.style.display = 'none';
        tbody.innerHTML = filtered.slice(0, 100).map(m => {
            const necessaryBadge = m.isNecessary
                ? '<span class="badge badge-success">Necesario</span>'
                : '<span class="badge badge-warning">Opcional</span>';
            const recBadge = m.isRecurring ? '<span class="badge badge-info">Recurrente</span>' : '';
            return `<tr>
                <td>${Calc.formatDate(m.date)}</td>
                <td>${escapeHtml(m.description)}</td>
                <td>${escapeHtml(m.category || '-')}</td>
                <td>${escapeHtml(m.commerce || '-')}</td>
                <td>${escapeHtml(m.paymentMethod || '-')}</td>
                <td class="amount-expense">-${Calc.formatMoney(m.amount)}</td>
                <td>${necessaryBadge} ${recBadge}</td>
                <td>
                    <button class="btn-icon edit" data-action="edit-movement" data-id="${m.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-movement" data-id="${m.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }
// ===== Budget =====
    function renderBudget() {
        const budgetStatus = Calc.getBudgetStatus(budgets, movements);
        const totalBudget = Calc.getTotalBudget(budgets);
        const totalSpent = budgetStatus.reduce((s, b) => s + b.spent, 0);
        const remainingBudget = totalBudget - totalSpent;

        const overview = document.getElementById('budgetOverview');
        overview.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Presupuesto total</div>
                <div class="stat-value">${Calc.formatMoney(totalBudget)}</div>
                <div class="stat-sub">${budgets.length} categorías</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Gastado</div>
                <div class="stat-value" style="color:var(--danger)">${Calc.formatMoney(totalSpent)}</div>
                <div class="stat-sub">${totalBudget > 0 ? ((totalSpent / totalBudget * 100).toFixed(1) + '%') : 'Sin presupuesto'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Disponible</div>
                <div class="stat-value" style="color:${remainingBudget >= 0 ? 'var(--success-dark)' : 'var(--danger)'}">${Calc.formatMoney(remainingBudget)}</div>
                <div class="stat-sub">${totalBudget > 0 ? (remainingBudget / totalBudget * 100).toFixed(1) + '% restante' : ''}</div>
            </div>
        `;

        const list = document.getElementById('budgetList');
        const emptyEl = document.getElementById('budgetEmpty');

        if (budgetStatus.length === 0) {
            list.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        list.innerHTML = budgetStatus.map(b => {
            const statusLabels = { ok: 'Dentro del presupuesto', warning: 'Cerca del límite', over: 'Presupuesto excedido' };
            const statusText = b.status === 'over'
                ? `Excedido por ${Calc.formatMoney(b.spent - b.amount)}`
                : `Queda ${Calc.formatMoney(b.remaining)}`;
            return `<div class="budget-item">
                <div>
                    <div class="budget-item-header">
                        <span class="budget-item-name">${escapeHtml(b.category)}</span>
                        <span class="budget-item-status ${b.status}">${statusText}</span>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar ${b.status}" style="width:${Math.min(100, b.percent)}%"></div>
                    </div>
                    <div class="budget-item-values">
                        Presupuesto: ${Calc.formatMoney(b.amount)} · Gastado: ${Calc.formatMoney(b.spent)} · Disponible: ${Calc.formatMoney(b.remaining)} · ${b.percent.toFixed(0)}%
                    </div>
                </div>
                <div>
                    <button class="btn-icon edit" data-action="edit-budget" data-id="${b.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-budget" data-id="${b.id}" title="Eliminar">🗑️</button>
                </div>
            </div>`;
        }).join('');
    }

    // ===== Recurring =====
    function renderRecurring() {
        const monthlyTotal = Calc.getRecurringMonthlyTotal(recurring);
        const activeCount = recurring.filter(r => r.status !== 'paid' && r.status !== 'paused').length;
        const container = document.getElementById('recurringSummary');
        const sorted = [...recurring].sort((a,b) => (a.nextPayment||'9999').localeCompare(b.nextPayment||'9999'));
        const nextPayment = sorted.length > 0 && sorted[0].nextPayment ? sorted[0].nextPayment : '';

container.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">${t('rec.summary.monthly')}</div>
                <div class="stat-value">${Calc.formatMoney(monthlyTotal)}</div>
                <div class="stat-sub">${t('rec.summary.monthlySub')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">${t('rec.summary.active')}</div>
                <div class="stat-value" style="color:var(--info)">${activeCount}</div>
                <div class="stat-sub">${recurring.length} ${recurring.length === 1 ? t('rec.item.s') : t('rec.item.p')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">${t('rec.summary.next')}</div>
                <div class="stat-value" style="font-size:16px">${nextPayment ? Calc.formatDate(nextPayment) : '-'}</div>
                <div class="stat-sub">${nextPayment ? `${calcDaysUntil(nextPayment)} ${calcDaysUntil(nextPayment) === 1 ? t('rec.summary.day') : t('rec.summary.days')}` : t('rec.summary.none')}</div>
            </div>
        `;

        const tbody = document.getElementById('recurringTableBody');
        const emptyEl = document.getElementById('recurringEmpty');

        if (recurring.length === 0) {
            tbody.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        tbody.innerHTML = recurring.map(r => {
            const statusMap = { active: [t('status.active'), 'badge-success'], paused: [t('status.paused'), 'badge-warning'], paid: [t('status.paid'), 'badge-info'] };
            const [sLabel, sClass] = statusMap[r.status] || ['-', 'badge-gray'];
            const daysLeft = r.nextPayment ? calcDaysUntil(r.nextPayment) : null;
            return `<tr>
                <td>${escapeHtml(r.name)}</td>
                <td style="font-weight:600">${Calc.formatMoney(r.amount)}</td>
                <td>${frequencyLabel(r.frequency)}</td>
                <td>${r.nextPayment ? `${Calc.formatDate(r.nextPayment)}${daysLeft !== null ? ` (${daysLeft} ${daysLeft === 1 ? 'día' : 'días'})` : ''}` : '-'}</td>
                <td>${escapeHtml(r.category || '-')}</td>
                <td>${escapeHtml(r.paymentMethod || '-')}</td>
                <td><span class="badge ${sClass}">${sLabel}</span></td>
                <td>
                    <button class="btn-icon" data-action="pay-recurring" data-id="${r.id}" title="Marcar como pagado">💳</button>
                    <button class="btn-icon edit" data-action="edit-recurring" data-id="${r.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-recurring" data-id="${r.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }

    // ===== Debts =====
    function renderDebts() {
        const summary = Calc.getDebtSummary(debts);
        const container = document.getElementById('debtSummaryCards');
        const activeDebts = debts.filter(d => d.status !== 'paid');

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total deuda</div>
                <div class="stat-value">${Calc.formatMoney(summary.totalOriginal)}</div>
                <div class="stat-sub">Monto original</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total pagado</div>
                <div class="stat-value" style="color:var(--success-dark)">${Calc.formatMoney(summary.totalPaid)}</div>
                <div class="stat-sub">${summary.totalOriginal > 0 ? ((summary.totalPaid / summary.totalOriginal * 100).toFixed(1) + '% pagado') : ''}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Saldo pendiente</div>
                <div class="stat-value" style="color:var(--danger)">${Calc.formatMoney(summary.totalPending)}</div>
                <div class="stat-sub">${activeDebts.length} deudas activas</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pagos mensuales</div>
                <div class="stat-value">${Calc.formatMoney(summary.totalMonthlyPayment)}</div>
                <div class="stat-sub">Compromiso mensual</div>
            </div>
        `;

        const tbody = document.getElementById('debtTableBody');
        const emptyEl = document.getElementById('debtEmpty');

        if (debts.length === 0) {
            tbody.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        tbody.innerHTML = debts.map(d => {
            const isOverdue = d.nextPayment && new Date(d.nextPayment) < new Date() && d.status !== 'paid';
            const shownStatus = isOverdue ? ['Vencido', 'badge-danger']
: d.status === 'paid' ? [t('status.paid'), 'badge-success']
                : d.status === 'active' ? [t('status.active'), 'badge-warning'] : ['-', 'badge-gray'];
            return `<tr>
                <td>${escapeHtml(d.name)}</td>
                <td>${escapeHtml(d.creditor || '-')}</td>
                <td>${Calc.formatMoney(d.originalAmount)}</td>
                <td style="font-weight:600">${Calc.formatMoney(d.pendingAmount)}</td>
                <td>${Calc.formatMoney(d.monthlyPayment)}</td>
                <td>${d.interestRate ? d.interestRate + '%' : '-'}</td>
                <td>${d.nextPayment ? Calc.formatDate(d.nextPayment) : '-'}</td>
                <td><span class="badge ${shownStatus[1]}">${shownStatus[0]}</span></td>
                <td>
                    <button class="btn-icon" data-action="pay-debt" data-id="${d.id}" title="Registrar pago">💳</button>
                    <button class="btn-icon edit" data-action="edit-debt" data-id="${d.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-debt" data-id="${d.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }
// ===== Credit Cards =====
    function renderCards() {
        const container = document.getElementById('cardsGrid');
        const cardsStatus = Calc.getCreditCardUtilization(creditCards);

        if (creditCards.length === 0) {
            container.innerHTML = `<div class="card" style="grid-column:1/-1"><div class="empty-state"><p>No hay tarjetas registradas.</p></div></div>`;
        } else {
            const colors = ['blue', 'green', 'purple', 'red', 'dark'];
            container.innerHTML = cardsStatus.map((c, i) => {
                const colorClass = c.status === 'critical' ? 'red' : colors[i % colors.length];
                return `<div class="credit-card ${colorClass}">
                    <div>
                        <div class="card-brand">Tarjeta de Crédito</div>
                        <div class="card-name">${escapeHtml(c.name)}</div>
                        <div style="font-size:11px;opacity:.8;margin-top:2px">${escapeHtml(c.bank || '')}</div>
                    </div>
                    <div>
                        <div class="card-details">
                            <div><div class="detail-label">Límite</div><div class="detail-value">${Calc.formatMoney(c.limit)}</div></div>
                            <div><div class="detail-label">Utilizado</div><div class="detail-value">${Calc.formatMoney(c.usedBalance)}</div></div>
                            <div><div class="detail-label">Disponible</div><div class="detail-value">${Calc.formatMoney(c.available)}</div></div>
                        </div>
                        <div class="utilization-bar ${c.status}">
                            <div style="font-size:10px;opacity:.8">Utilización: ${c.percent.toFixed(0)}%</div>
                            <div class="bar"><div class="bar-fill" style="width:${Math.min(100, c.percent)}%"></div></div>
                        </div>
                        <div class="card-details" style="margin-top:8px">
                            <div><div class="detail-label">Corte</div><div class="detail-value">${escapeHtml(c.cutoffDate || '-')}</div></div>
                            <div><div class="detail-label">Pago</div><div class="detail-value">${escapeHtml(c.paymentDate || '-')}</div></div>
                        </div>
                        <div style="margin-top:8px;display:flex;gap:6px">
                            <button class="btn-icon edit" data-action="edit-card" data-id="${c.id}" style="color:#fff;background:rgba(255,255,255,.15)">✏️</button>
                            <button class="btn-icon delete" data-action="delete-card" data-id="${c.id}" style="color:#fff;background:rgba(255,255,255,.15)">🗑️</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        const tbody = document.getElementById('cardTableBody');
        const emptyEl = document.getElementById('cardEmpty');

        if (creditCards.length === 0) {
            tbody.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        tbody.innerHTML = cardsStatus.map(c => {
            const pct = c.percent.toFixed(0);
            const pctClass = c.status === 'critical' ? 'badge-danger' : c.status === 'warning' ? 'badge-warning' : 'badge-success';
            return `<tr>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.bank || '-')}</td>
                <td>${Calc.formatMoney(c.limit)}</td>
                <td style="color:var(--danger);font-weight:600">${Calc.formatMoney(c.usedBalance)}</td>
                <td style="color:var(--success-dark);font-weight:600">${Calc.formatMoney(c.available)}</td>
                <td><span class="badge ${pctClass}">${pct}%</span></td>
                <td>${escapeHtml(c.cutoffDate || '-')}</td>
                <td>${escapeHtml(c.paymentDate || '-')}</td>
                <td>
                    <button class="btn-icon edit" data-action="edit-card" data-id="${c.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-card" data-id="${c.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    }

    // ===== Goals =====
    function renderGoals() {
        const container = document.getElementById('goalsGrid');

        if (goals.length === 0) {
            container.innerHTML = `<div class="card" style="grid-column:1/-1"><div class="empty-state"><p>No hay metas de ahorro. Crea tu primer objetivo financiero.</p></div></div>`;
            return;
        }

        container.innerHTML = goals.map((g, i) => {
            const target = Number(g.targetAmount) || 0;
            const saved = Number(g.savedAmount) || 0;
            const remaining = target - saved;
            const percent = target > 0 ? (saved / target * 100) : 0;
            const projections = Calc.getGoalProjections(g);
            const colors = ['blue', 'green', 'purple', 'red', 'dark'];
            const colorClass = colors[i % colors.length];
            const daysLeft = g.deadline ? calcDaysUntil(g.deadline) : null;

            return `<div class="credit-card ${colorClass}" style="min-height:220px">
                <div>
                    <div class="card-brand">Meta de ahorro</div>
                    <div class="card-name">${escapeHtml(g.name)}</div>
                    <div style="font-size:11px;opacity:.8;margin-top:2px">${target > 0 ? `Objetivo: ${Calc.formatMoney(target)}` : ''}</div>
                </div>
                <div>
                    <div style="font-size:22px;font-weight:700">${percent.toFixed(0)}%</div>
                    <div class="utilization-bar">
                        <div style="font-size:10px;opacity:.8">Ahorrado: ${Calc.formatMoney(saved)} · Faltante: ${Calc.formatMoney(remaining)}</div>
                        <div class="bar"><div class="bar-fill" style="width:${Math.min(100, percent)}%"></div></div>
                    </div>
                    <div class="card-details" style="margin-top:10px">
                        <div><div class="detail-label">Fecha límite</div><div class="detail-value">${g.deadline ? `${Calc.formatDate(g.deadline)}${daysLeft !== null && daysLeft >= 0 ? ` (${daysLeft}d)` : ''}` : 'Sin fecha'}</div></div>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:6px">
                        <button class="btn-icon" data-action="contribute-goal" data-id="${g.id}" style="color:#fff;background:rgba(255,255,255,.15)" title="Aportar">➕</button>
                        <button class="btn-icon edit" data-action="edit-goal" data-id="${g.id}" style="color:#fff;background:rgba(255,255,255,.15)" title="Editar">✏️</button>
                        <button class="btn-icon delete" data-action="delete-goal" data-id="${g.id}" style="color:#fff;background:rgba(255,255,255,.15)" title="Eliminar">🗑️</button>
                    </div>
                </div>
            </div>`;
        }).join('');

        container.innerHTML += `<div class="card panel" style="grid-column:1/-1">
            <h3 class="panel-title">Plan de ahorro</h3>
            <div class="goal-details">
                ${goals.map(g => {
                    const projections = Calc.getGoalProjections(g);
                    if (!g.deadline) return '';
                    return `<div class="goal-detail" style="grid-column:1/-1;background:var(--primary-light)">
                        <span class="detail-label">${escapeHtml(g.name)}</span>
                        <span class="detail-value">Debes ahorrar para alcanzar tu meta:</span>
                        <div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
                            <div class="goal-detail"><span class="detail-label">Por día</span><span class="detail-value">${Calc.formatMoney(projections.daily)}</span></div>
                            <div class="goal-detail"><span class="detail-label">Por semana</span><span class="detail-value">${Calc.formatMoney(projections.weekly)}</span></div>
                            <div class="goal-detail"><span class="detail-label">Por quincena</span><span class="detail-value">${Calc.formatMoney(projections.biweekly)}</span></div>
                            <div class="goal-detail"><span class="detail-label">Por mes</span><span class="detail-value">${Calc.formatMoney(projections.monthly)}</span></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }
// ===== Calendar =====
    function renderCalendar() {
        const year = calendarViewDate.getFullYear();
        const month = calendarViewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = firstDay.getDay();

        const label = document.getElementById('calendarMonthLabel');
        label.textContent = calendarViewDate.toLocaleDateString('es-HN', { month: 'long', year: 'numeric' });

        const events = Calc.getCalendarEvents(movements, recurring, debts);
        const grid = document.getElementById('calendarGrid');

        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

        for (let i = 0; i < startDay; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            let eventsHtml = '';
            const shownEvents = dayEvents.slice(0, 3);
            shownEvents.forEach(e => {
                const sign = e.type === 'income' ? '+' : e.type === 'expense' ? '-' : '';
                const name = e.title || e.name || 'Evento';
                eventsHtml += `<div class="calendar-event ${e.type}" data-date="${dateStr}" data-event="${encodeURIComponent(JSON.stringify(e))}" title="${escapeHtml(name)}">${name}</div>`;
            });
            if (dayEvents.length > 3) {
                eventsHtml += `<div style="font-size:9px;color:var(--gray)">+${dayEvents.length - 3} más</div>`;
            }

            let dayTotal = 0;
            dayEvents.forEach(e => {
                if (e.type === 'income') dayTotal += Number(e.amount) || 0;
                if (e.type === 'expense') dayTotal -= Number(e.amount) || 0;
                if (e.type === 'debt_payment') dayTotal -= Number(e.amount) || 0;
            });

            html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
                <div class="day-num">${day}</div>
                ${eventsHtml}
                ${dayTotal !== 0 ? `<div style="font-size:9px;font-weight:600;color:${dayTotal >= 0 ? 'var(--success-dark)' : 'var(--danger)'}">${dayTotal >= 0 ? '+' : ''}${Calc.formatMoney(dayTotal)}</div>` : ''}
            </div>`;
        }

        const remaining = (startDay + daysInMonth) % 7;
        if (remaining > 0) {
            for (let i = 0; i < 7 - remaining; i++) {
                html += `<div class="calendar-day empty"></div>`;
            }
        }

        grid.innerHTML = html;

        grid.querySelectorAll('.calendar-event').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventData = JSON.parse(decodeURIComponent(el.dataset.event));
                showEventDetails(eventData);
            });
        });

        grid.querySelectorAll('.calendar-day:not(.empty)').forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                const dayEvents = events.filter(ev => ev.date === date);
                if (dayEvents.length > 0) showDayEvents(date, dayEvents);
            });
        });
    }

    function showDayEvents(date, dayEvents) {
        let html = `<p style="font-size:12px;color:var(--gray);margin-bottom:12px">${Calc.formatDate(date)}</p>`;
        dayEvents.forEach(e => {
            const typeLabel = { income: 'Ingreso', expense: 'Gasto', recurring: 'Recurrente', debt_payment: 'Pago deuda' }[e.type] || 'Evento';
            const iconClasses = { income: 'badge-success', expense: 'badge-danger', recurring: 'badge-info', debt_payment: 'badge-warning' };
            html += `<div class="upcoming-item">
                <div><span class="badge ${iconClasses[e.type] || 'badge-gray'}">${typeLabel}</span></div>
                <div style="flex:1">
                    <div class="upcoming-name">${escapeHtml(e.title || e.name || '')}</div>
                    <div class="upcoming-date">${escapeHtml(e.category || e.creditor || '')}</div>
                </div>
                <div class="upcoming-amount" style="color:${e.type === 'income' ? 'var(--success-dark)' : 'var(--danger)'}">${e.type === 'income' ? '+' : '-'}${Calc.formatMoney(e.amount)}</div>
            </div>`;
        });
        openModal(`Eventos del ${Calc.formatDate(date)}`, html);
    }

    function showEventDetails(event) {
        let details = '';
        const rows = [
            ['Tipo', { income: 'Ingreso', expense: 'Gasto', recurring: 'Recurrente', debt_payment: 'Pago deuda' }[event.type] || event.type],
            ['Descripción', event.title || event.name],
            ['Monto', event.amount ? Calc.formatMoney(event.amount) : '-'],
            ['Categoría', event.category || '-'],
            ['Fecha', Calc.formatDate(event.date)]
        ];
        if (event.data) {
            Object.entries(event.data).forEach(([k, v]) => {
                if (['id', 'date', 'time', 'amount', 'category', 'title', 'name', 'nextPayment', 'payments'].includes(k)) return;
                if (v && typeof v !== 'object') {
                    if (k === 'originalAmount' || k === 'pendingAmount' || k === 'monthlyPayment' || k === 'limit' || k === 'usedBalance' || k === 'targetAmount' || k === 'savedAmount') {
                        details += `<div class="goal-detail"><span class="detail-label">${k}</span><span class="detail-value">${Calc.formatMoney(v)}</span></div>`;
                    } else {
                        details += `<div class="goal-detail"><span class="detail-label">${k}</span><span class="detail-value">${escapeHtml(String(v))}</span></div>`;
                    }
                }
            });
        }
        openModal('Detalles del evento', `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${rows.map(r => `<div class="goal-detail"><span class="detail-label">${r[0]}</span><span class="detail-value">${escapeHtml(String(r[1]))}</span></div>`).join('')}${details}</div>`);
    }

    // ===== Reports =====
    function renderReports() {
        const period = document.getElementById('reportPeriod').value;
        const label = Reports.getPeriodText(period);
        Reports.setPeriodLabel(label);
        const report = Reports.getReportData(movements, recurring, debts, period);
        const type = document.getElementById('reportType').value;
        const format = document.getElementById('reportFormat').value;
        const results = Reports.generate(type, report, format);
        const container = document.getElementById('reportResults');
        if (format === 'csv') {
            const a = document.createElement('a');
            const blob = new Blob([results], { type: 'text/csv;charset=utf-8' });
            a.href = URL.createObjectURL(blob);
            a.download = `reporte_${type}_${period}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
            container.innerHTML = `<div class="report-container"><p>Reporte CSV exportado.</p></div>`;
            showToast('Reporte CSV descargado');
        } else {
            container.innerHTML = results;
        }
    }

    // ===== Settings =====
function renderSettings() {
         document.getElementById('setAppName').value = settings.appName;
         document.getElementById('setCurrency').value = settings.currency;
         document.getElementById('setDateFormat').value = settings.dateFormat;
         document.getElementById('setLanguage').value = settings.language;
 document.getElementById('setThemeToggle').checked = settings.theme === 'dark';
        document.getElementById('setLowBalance').value = settings.lowBalanceThreshold;
        document.getElementById('setAlertDays').value = settings.alertDays;

        renderCategoryList();
        renderIncomeCategoryList();
        renderMethodsList();
        renderAccountsList();
    }

    function renderCategoryList() {
        const container = document.getElementById('categoryList');
        if (categories.length === 0) {
            container.innerHTML = '<div class="settings-item"><span class="item-name">Sin categorías</span></div>';
            return;
        }
        container.innerHTML = categories.map(c => `
            <div class="settings-item">
                <span class="item-name">${escapeHtml(c.name)}</span>
                <div class="item-actions">
                    <button class="btn-icon edit" data-action="edit-category" data-id="${c.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-category" data-id="${c.id}" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function renderIncomeCategoryList() {
        const container = document.getElementById('incomeCategoryList');
        if (incomeCategories.length === 0) {
            container.innerHTML = '<div class="settings-item"><span class="item-name">Sin categorías de ingreso</span></div>';
            return;
        }
        container.innerHTML = incomeCategories.map(c => `
            <div class="settings-item">
                <span class="item-name">${escapeHtml(c.name)}</span>
                <div class="item-actions">
                    <button class="btn-icon edit" data-action="edit-income-category" data-id="${c.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-income-category" data-id="${c.id}" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function renderMethodsList() {
        const container = document.getElementById('methodsList');
        if (paymentMethods.length === 0) {
            container.innerHTML = '<div class="settings-item"><span class="item-name">Sin métodos de pago</span></div>';
            return;
        }
        container.innerHTML = paymentMethods.map(m => `
            <div class="settings-item">
                <span class="item-name">${escapeHtml(m.name)}</span>
                <div class="item-actions">
                    <button class="btn-icon edit" data-action="edit-method" data-id="${m.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-method" data-id="${m.id}" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function renderAccountsList() {
        const container = document.getElementById('accountsList');
        if (accounts.length === 0) {
            container.innerHTML = '<div class="settings-item"><span class="item-name">Sin cuentas</span></div>';
            return;
        }
container.innerHTML = accounts.map(a => `
            <div class="settings-item">
                <div>
                    <div class="item-name">${escapeHtml(a.name)}</div>
                    <div class="item-badge">${escapeHtml(a.type || 'Cuenta')} · ${Calc.formatMoney(a.currentBalance)}</div>
                    ${a.bank || a.accountNumber ? `<div class="item-badge bank-badge">${escapeHtml(a.bank || '')}${a.bank && a.accountNumber ? ' · ' : ''}${a.accountNumber ? 'Nº ' + escapeHtml(a.accountNumber) : ''}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn-icon edit" data-action="edit-account" data-id="${a.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete-account" data-id="${a.id}" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('');
    }
// ===== Modals / Form builders =====
function accountOptions(selectedId = '') {
        return accounts.map(a => `<option value="${a.id}" ${a.id === selectedId ? 'selected' : ''}>${escapeHtml(a.bank ? `${a.name} (${a.bank})` : a.name)}</option>`).join('');
    }

function methodOptions(selected = '') {
        return paymentMethods.map(m => `<option value="${escapeHtml(m.name)}" ${m.name === selected ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('');
    }

    function escAttr(text) {
        return escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function categoryOptionsHTML(selected = '', income = false) {
        const list = income ? incomeCategories : categories;
        const names = new Set(list.map(c => c.name));
        movements.forEach(m => { if (m.category) names.add(m.category); });
        if (selected) names.add(selected);
        let html = '<option value="">Sin categoría</option>';
        names.forEach(name => {
            html += `<option value="${escAttr(name)}" ${name === selected ? 'selected' : ''}>${escapeHtml(name)}</option>`;
        });
        return html;
    }

    function frequencyLabel(freq) {
        if (!freq) return '-';
        const known = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual'];
        return known.includes(freq) ? t('freq.' + freq) : freq;
    }

    function cardOptions(selected = '') {
        return creditCards.map(c => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
    }

    function debtOptions(selected = '') {
        return debts.map(d => `<option value="${d.id}" ${d.id === selected ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('');
    }

    function addModalActions(edit, id) {
        const saveLabel = edit ? 'Guardar cambios' : 'Guardar';
        return `<div class="modal-actions">
            <button class="btn btn-secondary" type="button" data-action="modal-cancel">Cancelar</button>
            <button class="btn btn-primary" type="submit" data-action="modal-submit" data-edit="${edit}" data-id="${id}">${saveLabel}</button>
        </div>`;
    }

    function validateModalForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return true;
        const inputs = form.querySelectorAll('input[required], select[required]');
        let valid = true;
        inputs.forEach(inp => {
            if (!inp.value) {
                inp.style.borderColor = 'var(--danger)';
                valid = false;
            } else {
                inp.style.borderColor = '';
            }
        });
        const amountInputs = form.querySelectorAll('input[data-money]');
        amountInputs.forEach(inp => {
            const val = parseFloat(inp.value);
            if (isNaN(val) || val <= 0) {
                inp.style.borderColor = 'var(--danger)';
                valid = false;
            } else {
                inp.style.borderColor = '';
            }
        });
        return valid;
    }

    function showMovementForm(movement = null) {
        let title = 'Nuevo movimiento';
        let isEdit = false;

        const form = document.createElement('form');
        form.id = 'movementForm';

        const initialData = movement || { type: 'income' };

if (movement) {
            title = 'Editar movimiento';
            isEdit = true;
        }

        form.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Tipo *</label>
                    <select id="mvType" required>
                        <option value="income" ${initialData.type === 'income' ? 'selected' : ''}>Ingreso</option>
                        <option value="expense" ${initialData.type === 'expense' ? 'selected' : ''}>Gasto</option>
                        <option value="transfer" ${initialData.type === 'transfer' ? 'selected' : ''}>Transferencia</option>
                        <option value="debt_payment" ${initialData.type === 'debt_payment' ? 'selected' : ''}>Pago de deuda</option>
                        <option value="adjustment" ${initialData.type === 'adjustment' ? 'selected' : ''}>Ajuste</option>
                        <option value="card_payment" ${initialData.type === 'card_payment' ? 'selected' : ''}>Pago de tarjeta</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Fecha *</label>
                    <input type="date" id="mvDate" required value="${initialData.date || new Date().toISOString().slice(0, 10)}">
                </div>
            </div>
            <div class="form-group">
                <label>Descripción *</label>
                <input type="text" id="mvDescription" required value="${escapeHtml(initialData.description || '')}" placeholder="Ej: Compra de supermercado">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Monto *</label>
                    <input type="number" id="mvAmount" required data-money min="0.01" step="0.01" value="${initialData.amount || ''}" placeholder="0.00">
                </div>
<div class="form-group">
                    <label>Categoría</label>
                    <select id="mvCategory">
                        ${categoryOptionsHTML(initialData.category || '', initialData.type === 'income')}
                    </select>
                </div>
            </div>
            <div class="form-row" id="subcategoryRow">
                <div class="form-group">
                    <label>Subcategoría</label>
                    <input type="text" id="mvSubcategory" value="${escapeHtml(initialData.subcategory || '')}" placeholder="Subcategoría">
                </div>
                <div class="form-group">
                    <label>Método de pago</label>
                    <select id="mvMethod">
                        <option value="">Sin método</option>
                        ${methodOptions(initialData.paymentMethod || '')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" id="accountGroup">
                    <label>Cuenta</label>
                    <select id="mvAccount">
                        <option value="">Selecciona una cuenta</option>
                        ${accountOptions(initialData.accountId || '')}
                    </select>
                </div>
                <div class="form-group" id="toAccountGroup" style="display:none;">
                    <label>Cuenta de destino</label>
                    <select id="mvToAccount">
                        <option value="">Selecciona cuenta</option>
                        ${accountOptions(initialData.toAccountId || '')}
                    </select>
                </div>
                <div class="form-group" id="debtSelectGroup" style="display:none;">
                    <label>Deuda</label>
                    <select id="mvDebt">
                        <option value="">Selecciona deuda</option>
                        ${debtOptions(initialData.debtId || '')}
                    </select>
                </div>
                <div class="form-group" id="cardSelectGroup" style="display:none;">
                    <label>Tarjeta de crédito</label>
                    <select id="mvCard">
                        <option value="">Selecciona tarjeta</option>
                        ${cardOptions(initialData.creditCardId || '')}
                    </select>
                </div>
            </div>
            <div class="form-row" id="extraFieldsRow">
                <div class="form-group">
                    <label>Comercio / Proveedor</label>
                    <input type="text" id="mvCommerce" value="${escapeHtml(initialData.commerce || '')}" placeholder="Comercio">
                </div>
                <div class="form-group">
                    <label>Hora</label>
                    <input type="time" id="mvTime" value="${initialData.time || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Notas</label>
                    <textarea id="mvNotes" placeholder="Notas adicionales">${escapeHtml(initialData.notes || '')}</textarea>
                </div>
            </div>
<div class="checkbox-group" id="checkboxGroup">
                <label><input type="checkbox" id="mvRecurring" ${initialData.isRecurring ? 'checked' : ''}> Recurrente</label>
                <label><input type="checkbox" id="mvNecessary" ${initialData.isNecessary ? 'checked' : ''}> Necesario</label>
            </div>
            ${addModalActions(isEdit, movement ? movement.id : '')}
        `;

        openModal(title, form.outerHTML);

        // bind type change
        const typeSelectEl = document.getElementById('mvType');
        const toAccountGroup = document.getElementById('toAccountGroup');
        const debtSelectGroup = document.getElementById('debtSelectGroup');
        const cardSelectGroup = document.getElementById('cardSelectGroup');
        const checkboxGroup = document.getElementById('checkboxGroup');
        const accountGroup = document.getElementById('accountGroup');

        function updateTypeUI() {
            const type = typeSelectEl.value;
toAccountGroup.style.display = type === 'transfer' ? 'block' : 'none';
            debtSelectGroup.style.display = type === 'debt_payment' ? 'block' : 'none';
            cardSelectGroup.style.display = type === 'card_payment' || (type === 'expense' && document.getElementById('mvMethod').value === 'Tarjeta de crédito') ? 'block' : 'none';
            accountGroup.style.display = type === 'transfer' ? 'block' : 'block';
            if (type === 'income' || type === 'adjustment' || type === 'card_payment') {
                checkboxGroup.style.display = 'none';
            } else {
                checkboxGroup.style.display = 'flex';
            }
            const categorySelect = document.getElementById('mvCategory');
            const currentCat = categorySelect.value;
            categorySelect.innerHTML = categoryOptionsHTML(currentCat, type === 'income');
            if (currentCat && ![...categorySelect.options].some(o => o.value === currentCat)) {
                categorySelect.add(new Option(currentCat, currentCat, false, true));
            }
        }

        typeSelectEl.addEventListener('change', updateTypeUI);
        const methodEl = document.getElementById('mvMethod');
        if (methodEl) methodEl.addEventListener('change', updateTypeUI);
        updateTypeUI();

        const formEl = document.getElementById('movementForm');
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateModalForm('movementForm')) {
                showToast('Por favor completa los campos obligatorios', 'error');
                return;
            }

            const type = document.getElementById('mvType').value;
            const accountId = document.getElementById('mvAccount').value;
            if ((type === 'expense' || type === 'income' || type === 'debt_payment' || type === 'adjustment') && !accountId) {
                showToast('Debe seleccionar una cuenta', 'error');
                return;
            }
            if (type === 'transfer') {
                const toAcc = document.getElementById('mvToAccount').value;
                if (!toAcc) { showToast('Debe seleccionar cuenta de destino', 'error'); return; }
                if (toAcc === accountId) { showToast('Las cuentas de origen y destino no pueden ser iguales', 'error'); return; }
            }
            if (type === 'debt_payment' && !document.getElementById('mvDebt').value) {
                showToast('Debe seleccionar la deuda', 'error');
                return;
            }

            const data = {
                id: movement ? movement.id : null,
                type,
                date: document.getElementById('mvDate').value,
                time: document.getElementById('mvTime').value || '',
                description: document.getElementById('mvDescription').value.trim(),
                amount: parseFloat(document.getElementById('mvAmount').value),
                category: document.getElementById('mvCategory').value.trim() || null,
                paymentMethod: document.getElementById('mvMethod').value || null,
                accountId,
                toAccountId: type === 'transfer' ? document.getElementById('mvToAccount').value : null,
                debtId: type === 'debt_payment' ? document.getElementById('mvDebt').value : null,
                creditCardId: (type === 'card_payment' || (type === 'expense' && document.getElementById('mvMethod').value === 'Tarjeta de crédito')) ? (document.getElementById('mvCard').value || null) : null,
                subcategory: document.getElementById('mvSubcategory').value.trim() || null,
                commerce: document.getElementById('mvCommerce').value.trim() || null,
                isRecurring: !!document.getElementById('mvRecurring')?.checked,
                isNecessary: !!document.getElementById('mvNecessary')?.checked,
                notes: document.getElementById('mvNotes').value.trim() || null,
                source: type === 'income' ? document.getElementById('mvCommerce').value.trim() || null : null,
                transferDirection: type === 'transfer' ? 'in' : null
            };

            const ok = await saveMovement(data);
            if (ok) {
                closeModal();
                await refreshStates();
            }
        });
    }

    function showBudgetForm(budget = null) {
        const title = budget ? 'Editar presupuesto' : 'Nuevo presupuesto';
        const form = `
            <form id="budgetForm">
                <div class="form-group">
                    <label>Categoría *</label>
                    <select id="bgCategory" required>
                        <option value="">Selecciona categoría</option>
                        ${categories.map(c => `<option value="${escapeHtml(c.name)}" ${budget && budget.category === c.name ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Límite mensual (L) *</label>
                    <input type="number" id="bgAmount" required min="0.01" step="0.01" value="${budget ? budget.amount : ''}" placeholder="0.00">
                </div>
                ${addModalActions(!!budget, budget ? budget.id : '')}
            </form>`;

        openModal(title, form);

        document.getElementById('budgetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const category = document.getElementById('bgCategory').value;
            const amount = parseFloat(document.getElementById('bgAmount').value);
            if (!category) { showToast('Selecciona una categoría', 'error'); return; }
            if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }

            if (budget) {
                budget.category = category;
                budget.amount = amount;
                await DB.put(DB.STORES.BUDGETS, budget);
            } else {
                await DB.add(DB.STORES.BUDGETS, {
                    id: DB.generateId(), category, amount
                });
            }
            budgets = await DB.getAll(DB.STORES.BUDGETS);
            closeModal();
            renderBudget();
            showToast(budget ? 'Presupuesto actualizado' : 'Presupuesto creado');
        });
    }

    function showRecurringForm(item = null) {
        const title = item ? 'Editar recurrente' : 'Nuevo gasto recurrente';
        const form = `
            <form id="recurringForm">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="rcName" required value="${item ? escapeHtml(item.name) : ''}" placeholder="Ej: Internet">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Monto *</label>
                        <input type="number" id="rcAmount" required min="0.01" step="0.01" value="${item ? item.amount : ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Frecuencia</label>
                        <select id="rcFrequency">
                            ${['daily','weekly','biweekly','monthly','quarterly','semiannual','annual'].map(f => `<option value="${f}" ${item && item.frequency === f ? 'selected' : ''}>${({daily:'Diario',weekly:'Semanal',biweekly:'Quincenal',monthly:'Mensual',quarterly:'Trimestral',semiannual:'Semestral',annual:'Anual'})[f]}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Próximo pago</label>
                        <input type="date" id="rcNextPayment" value="${item && item.nextPayment ? item.nextPayment : ''}">
                    </div>
<div class="form-group">
                        <label>Categoría</label>
                        <select id="rcCategory">
                            ${categoryOptionsHTML(item ? item.category || '' : '', false)}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Método de pago</label>
                        <select id="rcMethod">
                            <option value="">Sin método</option>
                            ${methodOptions(item ? item.paymentMethod || '' : '')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="rcStatus">
                            <option value="active" ${item && item.status === 'active' ? 'selected' : ''}>Activo</option>
                            <option value="paused" ${item && item.status === 'paused' ? 'selected' : ''}>Pausado</option>
                            <option value="paid" ${item && item.status === 'paid' ? 'selected' : ''}>Pagado</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <textarea id="rcNotes" placeholder="Notas">${item ? escapeHtml(item.notes || '') : ''}</textarea>
                </div>
                ${addModalActions(!!item, item ? item.id : '')}
            </form>`;

        openModal(title, form);

        document.getElementById('recurringForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                id: item ? item.id : null,
                name: document.getElementById('rcName').value.trim(),
                amount: parseFloat(document.getElementById('rcAmount').value),
                frequency: document.getElementById('rcFrequency').value,
                nextPayment: document.getElementById('rcNextPayment').value || null,
                category: document.getElementById('rcCategory').value.trim() || null,
                paymentMethod: document.getElementById('rcMethod').value || null,
                status: document.getElementById('rcStatus').value,
                notes: document.getElementById('rcNotes').value.trim() || null
            };
            if (!data.name) { showToast('El nombre es obligatorio', 'error'); return; }
            if (!data.amount || data.amount <= 0) { showToast('Monto inválido', 'error'); return; }

            if (item) {
                await DB.put(DB.STORES.RECURRING, data);
            } else {
                data.id = DB.generateId();
                await DB.add(DB.STORES.RECURRING, data);
            }
            recurring = await DB.getAll(DB.STORES.RECURRING);
            closeModal();
            renderRecurring();
            showToast(item ? 'Recurrente actualizado' : 'Recurrente agregado');
        });
    }
function showDebtForm(debt = null) {
        const title = debt ? 'Editar deuda' : 'Nueva deuda';
        const form = `
            <form id="debtForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" id="dbName" required value="${debt ? escapeHtml(debt.name) : ''}" placeholder="Ej: Préstamo auto">
                    </div>
                    <div class="form-group">
                        <label>Acreedor</label>
                        <input type="text" id="dbCreditor" value="${debt ? escapeHtml(debt.creditor || '') : ''}" placeholder="Ej: Banco">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Monto original *</label>
                        <input type="number" id="dbOriginal" required min="0.01" step="0.01" value="${debt ? debt.originalAmount : ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Saldo pendiente</label>
                        <input type="number" id="dbPending" min="0" step="0.01" value="${debt ? debt.pendingAmount : ''}" placeholder="0.00">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Pago mensual</label>
                        <input type="number" id="dbMonthly" min="0" step="0.01" value="${debt ? debt.monthlyPayment : ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Tasa de interés (%)</label>
                        <input type="number" id="dbInterest" min="0" step="0.01" value="${debt ? debt.interestRate : ''}" placeholder="0.00">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de vencimiento</label>
                        <input type="date" id="dbDueDate" value="${debt ? debt.dueDate || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label>Próximo pago</label>
                        <input type="date" id="dbNextPayment" value="${debt ? debt.nextPayment || '' : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="dbStatus">
                        <option value="active" ${debt && debt.status === 'active' ? 'selected' : ''}>Activa</option>
                        <option value="paid" ${debt && debt.status === 'paid' ? 'selected' : ''}>Pagada</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <textarea id="dbNotes" placeholder="Notas">${debt ? escapeHtml(debt.notes || '') : ''}</textarea>
                </div>
                ${addModalActions(!!debt, debt ? debt.id : '')}
            </form>`;

        openModal(title, form);

        document.getElementById('dbOriginal').addEventListener('change', () => {
            const orig = parseFloat(document.getElementById('dbOriginal').value) || 0;
            const pending = document.getElementById('dbPending');
            if (!pending.value || parseFloat(pending.value) === 0 || parseFloat(pending.value) > orig) {
                pending.value = orig;
            }
        });

        document.getElementById('debtForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                id: debt ? debt.id : null,
                name: document.getElementById('dbName').value.trim(),
                creditor: document.getElementById('dbCreditor').value.trim() || null,
                originalAmount: parseFloat(document.getElementById('dbOriginal').value),
                pendingAmount: parseFloat(document.getElementById('dbPending').value || document.getElementById('dbOriginal').value),
                monthlyPayment: parseFloat(document.getElementById('dbMonthly').value) || 0,
                interestRate: parseFloat(document.getElementById('dbInterest').value) || null,
                dueDate: document.getElementById('dbDueDate').value || null,
                nextPayment: document.getElementById('dbNextPayment').value || null,
                status: document.getElementById('dbStatus').value,
                notes: document.getElementById('dbNotes').value.trim() || null,
                payments: debt && debt.payments ? debt.payments : []
            };
            if (!data.name) { showToast('El nombre es obligatorio', 'error'); return; }
            if (!data.originalAmount || data.originalAmount <= 0) { showToast('Monto original inválido', 'error'); return; }

            if (debt) {
                await DB.put(DB.STORES.DEBTS, data);
            } else {
                data.id = DB.generateId();
                await DB.add(DB.STORES.DEBTS, data);
            }
            debts = await DB.getAll(DB.STORES.DEBTS);
            closeModal();
            renderDebts();
            showToast(debt ? 'Deuda actualizada' : 'Deuda registrada');
        });
    }

    function showCardForm(card = null) {
        const title = card ? 'Editar tarjeta' : 'Nueva tarjeta de crédito';
        const form = `
            <form id="cardForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre *</label>
                        <input type="text" id="ccName" required value="${card ? escapeHtml(card.name) : ''}" placeholder="Ej: Visa BAC">
                    </div>
                    <div class="form-group">
                        <label>Banco</label>
                        <input type="text" id="ccBank" value="${card ? escapeHtml(card.bank || '') : ''}" placeholder="Ej: BAC">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Límite *</label>
                        <input type="number" id="ccLimit" required min="0.01" step="0.01" value="${card ? card.limit : ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Saldo utilizado</label>
                        <input type="number" id="ccUsed" min="0" step="0.01" value="${card ? card.usedBalance : '0'}" placeholder="0.00">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de corte (día del mes)</label>
                        <input type="number" id="ccCutoff" min="1" max="31" value="${card ? card.cutoffDate : ''}" placeholder="Ej: 15">
                    </div>
                    <div class="form-group">
                        <label>Fecha de pago (día del mes)</label>
                        <input type="number" id="ccPayday" min="1" max="31" value="${card ? card.paymentDate : ''}" placeholder="Ej: 10">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Pago mínimo</label>
                        <input type="number" id="ccMinPay" min="0" step="0.01" value="${card ? card.minimumPayment : ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Pago sin intereses</label>
                        <input type="number" id="ccNoInterest" min="0" step="0.01" value="${card ? card.noInterestPayment : ''}" placeholder="0.00">
                    </div>
                </div>
                ${addModalActions(!!card, card ? card.id : '')}
            </form>`;

        openModal(title, form);

        document.getElementById('cardForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                id: card ? card.id : null,
                name: document.getElementById('ccName').value.trim(),
                bank: document.getElementById('ccBank').value.trim() || null,
                limit: parseFloat(document.getElementById('ccLimit').value),
                usedBalance: parseFloat(document.getElementById('ccUsed').value) || 0,
                cutoffDate: document.getElementById('ccCutoff').value || null,
                paymentDate: document.getElementById('ccPayday').value || null,
                minimumPayment: parseFloat(document.getElementById('ccMinPay').value) || 0,
                noInterestPayment: parseFloat(document.getElementById('ccNoInterest').value) || 0
            };
            if (!data.name) { showToast('El nombre es obligatorio', 'error'); return; }
            if (!data.limit || data.limit <= 0) { showToast('El límite debe ser mayor que 0', 'error'); return; }

            if (card) {
                await DB.put(DB.STORES.CREDIT_CARDS, data);
            } else {
                data.id = DB.generateId();
                await DB.add(DB.STORES.CREDIT_CARDS, data);
            }
            creditCards = await DB.getAll(DB.STORES.CREDIT_CARDS);
            closeModal();
            renderCards();
            showToast(card ? 'Tarjeta actualizada' : 'Tarjeta registrada');
        });
    }

    function showGoalForm(goal = null) {
        const title = goal ? 'Editar meta' : 'Nueva meta de ahorro';
        const form = `
            <form id="goalForm">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="glName" required value="${goal ? escapeHtml(goal.name) : ''}" placeholder="Ej: Computadora nueva">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Objetivo (L) *</label>
                        <input type="number" id="glTarget" required min="0.01" step="0.01" value="${goal ? goal.targetAmount : ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Ahorrado</label>
                        <input type="number" id="glSaved" min="0" step="0.01" value="${goal ? goal.savedAmount : '0'}" placeholder="0.00">
                    </div>
                </div>
                <div class="form-group">
                    <label>Fecha límite</label>
                    <input type="date" id="glDeadline" value="${goal ? goal.deadline || '' : ''}">
                </div>
                <div class="form-group">
                    <label>Notas</label>
                    <textarea id="glNotes" placeholder="Notas">${goal ? escapeHtml(goal.notes || '') : ''}</textarea>
                </div>
                ${addModalActions(!!goal, goal ? goal.id : '')}
            </form>`;

        openModal(title, form);

        document.getElementById('goalForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                id: goal ? goal.id : null,
                name: document.getElementById('glName').value.trim(),
                targetAmount: parseFloat(document.getElementById('glTarget').value),
                savedAmount: parseFloat(document.getElementById('glSaved').value) || 0,
                deadline: document.getElementById('glDeadline').value || null,
                notes: document.getElementById('glNotes').value.trim() || null
            };
            if (!data.name) { showToast('El nombre es obligatorio', 'error'); return; }
            if (!data.targetAmount || data.targetAmount <= 0) { showToast('El objetivo debe ser mayor que 0', 'error'); return; }

            if (goal) {
                await DB.put(DB.STORES.GOALS, data);
            } else {
                data.id = DB.generateId();
                await DB.add(DB.STORES.GOALS, data);
            }
            goals = await DB.getAll(DB.STORES.GOALS);
            closeModal();
            renderGoals();
            showToast(goal ? 'Meta actualizada' : 'Meta creada');
        });
    }

    function showContributeForm(goal) {
        if (!goal) return;
        const remaining = (Number(goal.targetAmount) || 0) - (Number(goal.savedAmount) || 0);
        const form = `
            <form id="contributeForm">
                <p style="font-size:13px;color:var(--gray);margin-bottom:12px">
                    Meta: <strong>${escapeHtml(goal.name)}</strong><br>
                    Ahorrado: ${Calc.formatMoney(goal.savedAmount)} · Faltante: ${Calc.formatMoney(remaining)}
                </p>
                <div class="form-group">
                    <label>Monto a aportar (L) *</label>
                    <input type="number" id="ctAmount" required min="0.01" step="0.01" value="${remaining}" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Fecha</label>
                    <input type="date" id="ctDate" value="${new Date().toISOString().slice(0, 10)}">
                </div>
                ${addModalActions(false, '')}
            </form>`;

        openModal('Aportar a meta', form);

        document.getElementById('contributeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('ctAmount').value);
            if (!amount || amount <= 0) { showToast('Monto inválido', 'error'); return; }
            const contribution = { date: document.getElementById('ctDate').value, amount };
            goal.savedAmount = (Number(goal.savedAmount) || 0) + amount;
            goal.contributions = goal.contributions || [];
            goal.contributions.push(contribution);
            await DB.put(DB.STORES.GOALS, goal);
            goals = await DB.getAll(DB.STORES.GOALS);
            closeModal();
            renderGoals();
            showToast('Aporte registrado');
        });
    }

    function showPayDebtForm(debt) {
        if (!debt) return;
        const form = `
            <form id="payDebtForm">
                <p style="font-size:13px;color:var(--gray);margin-bottom:12px">
                    Deuda: <strong>${escapeHtml(debt.name)}</strong><br>
                    Saldo pendiente: ${Calc.formatMoney(debt.pendingAmount)}
                </p>
                <div class="form-row">
                    <div class="form-group">
                        <label>Monto del pago *</label>
                        <input type="number" id="pdAmount" required min="0.01" step="0.01" value="${debt.monthlyPayment || Math.min(debt.pendingAmount, 100)}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Fecha</label>
                        <input type="date" id="pdDate" value="${new Date().toISOString().slice(0, 10)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Cuenta desde donde pagas</label>
                    <select id="pdAccount">
                        <option value="">Selecciona cuenta</option>
                        ${accountOptions()}
                    </select>
                </div>
                <div class="form-group">
                    <label>Método de pago</label>
                    <select id="pdMethod">
                        <option value="">Sin método</option>
                        ${methodOptions()}
                    </select>
                </div>
                ${addModalActions(false, '')}
            </form>`;

        openModal('Registrar pago de deuda', form);

        document.getElementById('payDebtForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('pdAmount').value);
            const accountId = document.getElementById('pdAccount').value;
            if (!amount || amount <= 0) { showToast('Monto inválido', 'error'); return; }
            if (!accountId) { showToast('Selecciona una cuenta', 'error'); return; }

            const data = {
                type: 'debt_payment',
                date: document.getElementById('pdDate').value,
                description: `Pago de deuda: ${debt.name}`,
                amount,
                category: 'Deudas',
                paymentMethod: document.getElementById('pdMethod').value || null,
                accountId,
                debtId: debt.id,
                notes: `Pago a ${debt.creditor || debt.name}`
            };
            const ok = await saveMovement(data);
            if (ok) {
                closeModal();
                await refreshStates();
            }
        });
    }

    function showPayRecurringForm(item) {
        if (!item) return;
        const form = `
            <form id="payRecurringForm">
                <p style="font-size:13px;color:var(--gray);margin-bottom:12px">
                    Recurrente: <strong>${escapeHtml(item.name)}</strong><br>
                    Monto: ${Calc.formatMoney(item.amount)} · Frecuencia: ${frequencyLabel(item.frequency)}
                </p>
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha del pago *</label>
                        <input type="date" id="prDate" required value="${new Date().toISOString().slice(0, 10)}">
                    </div>
                    <div class="form-group">
                        <label>Cuenta</label>
                        <select id="prAccount">
                            <option value="">Selecciona cuenta</option>
                            ${accountOptions()}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Método de pago</label>
                    <select id="prMethod">
                        <option value="">Sin método</option>
                        ${methodOptions(item.paymentMethod || '')}
                    </select>
                </div>
                ${addModalActions(false, '')}
            </form>`;

        openModal('Registrar pago recurrente', form);

        document.getElementById('payRecurringForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const accountId = document.getElementById('prAccount').value;
            if (!accountId) { showToast('Selecciona una cuenta', 'error'); return; }

            const data = {
                type: 'expense',
                date: document.getElementById('prDate').value,
                description: item.name,
                amount: item.amount,
                category: item.category || 'Suscripciones',
                paymentMethod: document.getElementById('prMethod').value || item.paymentMethod || null,
                accountId,
                isRecurring: true,
                notes: `Pago de gasto recurrente (${frequencyLabel(item.frequency)})`
            };
            const ok = await saveMovement(data);
            if (ok) {
                item.status = 'paid';
                await DB.put(DB.STORES.RECURRING, item);
                recurring = await DB.getAll(DB.STORES.RECURRING);
                closeModal();
                await refreshStates();
            }
        });
    }

    function showCardPaymentForm(card) {
        if (!card) return;
        const recommended = card.noInterestPayment || 0;
        const form = `
            <form id="cardPaymentForm">
                <p style="font-size:13px;color:var(--gray);margin-bottom:12px">
                    Tarjeta: <strong>${escapeHtml(card.name)}</strong><br>
                    Saldo utilizado: ${Calc.formatMoney(card.usedBalance)}
                </p>
                <div class="form-row">
                    <div class="form-group">
                        <label>Monto a pagar *</label>
                        <input type="number" id="cpAmount" required min="0.01" step="0.01" value="${recommended > 0 ? recommended : card.usedBalance}">
                    </div>
                    <div class="form-group">
                        <label>Fecha</label>
                        <input type="date" id="cpDate" value="${new Date().toISOString().slice(0, 10)}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Cuenta desde donde pagas</label>
                    <select id="cpAccount">
                        <option value="">Selecciona cuenta</option>
                        ${accountOptions()}
                    </select>
                </div>
                ${addModalActions(false, '')}
            </form>`;

        openModal('Pagar tarjeta de crédito', form);

        document.getElementById('cardPaymentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('cpAmount').value);
            const accountId = document.getElementById('cpAccount').value;
            if (!amount || amount <= 0) { showToast('Monto inválido', 'error'); return; }
            if (!accountId) { showToast('Selecciona una cuenta', 'error'); return; }

            const data = {
                type: 'card_payment',
                date: document.getElementById('cpDate').value,
                description: `Pago tarjeta: ${card.name}`,
                amount,
                category: 'Deudas',
                paymentMethod: 'Transferencia',
                accountId,
                creditCardId: card.id,
                notes: `Pago a tarjeta ${card.name}`
            };
            const ok = await saveMovement(data);
            if (ok) {
                closeModal();
                await refreshStates();
            }
        });
    }
function showCategoryForm(category = null, isIncome = false) {
        const title = category ? 'Editar categoría' : (isIncome ? 'Nueva categoría de ingreso' : 'Nueva categoría');
        const form = `
            <form id="categoryForm">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="ctName" required value="${category ? escapeHtml(category.name) : ''}" placeholder="Ej: Compras">
                </div>
                ${addModalActions(!!category, category ? category.id : '')}
                <input type="hidden" id="ctIsIncome" value="${isIncome ? '1' : '0'}">
            </form>`;

        openModal(title, form);

        document.getElementById('categoryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('ctName').value.trim();
            const asIncome = document.getElementById('ctIsIncome').value === '1';
            if (!name) { showToast('El nombre es obligatorio', 'error'); return; }

            if (category) {
                category.name = name;
                if (asIncome && !category.isIncome) category.isIncome = true;
                if (!asIncome && category.isIncome) category.isIncome = false;
                await DB.put(DB.STORES.CATEGORIES, category);
            } else {
                const newCat = { id: DB.generateId(), name, isIncome: asIncome };
                await DB.add(DB.STORES.CATEGORIES, newCat);
            }
            categories = await DB.getAll(DB.STORES.CATEGORIES);
            incomeCategories = categories.filter(c => c.isIncome);
            categories = categories.filter(c => !c.isIncome);
            closeModal();
            renderSettings();
            populateMovementFilters();
            showToast('Categoría guardada');
        });
    }

    function showMethodForm(methodItem = null) {
        const title = methodItem ? 'Editar método' : 'Nuevo método de pago';
        const form = `
            <form id="methodForm">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="mtName" required value="${methodItem ? escapeHtml(methodItem.name) : ''}" placeholder="Ej: Billetera Tigo Money">
                </div>
                ${addModalActions(!!methodItem, methodItem ? methodItem.id : '')}
            </form>`;

        openModal(title, form);

        document.getElementById('methodForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('mtName').value.trim();
            if (!name) { showToast('El nombre es obligatorio', 'error'); return; }

            if (methodItem) {
                methodItem.name = name;
                await DB.put(DB.STORES.PAYMENT_METHODS, methodItem);
            } else {
                await DB.add(DB.STORES.PAYMENT_METHODS, { id: DB.generateId(), name });
            }
            paymentMethods = await DB.getAll(DB.STORES.PAYMENT_METHODS);
            closeModal();
            renderSettings();
            populateMovementFilters();
            showToast('Método guardado');
        });
    }

    function showAccountForm(account = null) {
        const title = account ? 'Editar cuenta' : 'Nueva cuenta';
const form = `
            <form id="accountForm">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" id="acName" required value="${account ? escapeHtml(account.name) : ''}" placeholder="Ej: Cuenta de ahorro">
                </div>
                <div class="form-group">
                    <label>Banco</label>
                    <input type="text" id="acBank" value="${account ? escapeHtml(account.bank || '') : ''}" placeholder="Ej: Banco Atlántida, Ficohsa, BAC...">
                </div>
                <div class="form-group">
                    <label>Número de cuenta</label>
                    <input type="text" id="acNumber" value="${account ? escapeHtml(account.accountNumber || '') : ''}" placeholder="Ej: 0101-0520-021456">
                </div>
                <div class="form-group">
                    <label>Tipo</label>
                    <select id="acType">
                        ${['Efectivo','Cuenta bancaria','Cuenta de ahorro','Cuenta corriente','Billetera digital','Otro'].map(t => `<option value="${t}" ${account && account.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Saldo inicial</label>
                    <input type="number" id="acInitial" min="0" step="0.01" value="${account ? account.initialBalance : '0'}" placeholder="0.00">
                </div>
                ${addModalActions(!!account, account ? account.id : '')}
            </form>`;

        openModal(title, form);

        document.getElementById('accountForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                id: account ? account.id : null,
                name: document.getElementById('acName').value.trim(),
                bank: document.getElementById('acBank').value.trim(),
                accountNumber: document.getElementById('acNumber').value.trim(),
                type: document.getElementById('acType').value,
                initialBalance: parseFloat(document.getElementById('acInitial').value) || 0,
                currentBalance: 0
            };
            if (!data.name) { showToast('El nombre es obligatorio', 'error'); return; }

            if (account) {
                const oldInitial = Number(account.initialBalance) || 0;
                const delta = data.initialBalance - oldInitial;
                account.name = data.name;
                account.bank = data.bank;
                account.accountNumber = data.accountNumber;
                account.type = data.type;
                account.initialBalance = data.initialBalance;
                account.currentBalance = (Number(account.currentBalance) || 0) + delta;
                await DB.put(DB.STORES.ACCOUNTS, account);
            } else {
                const newAcc = { ...data, id: DB.generateId() };
                newAcc.currentBalance = data.initialBalance;
                await DB.add(DB.STORES.ACCOUNTS, newAcc);
            }
            accounts = await DB.getAll(DB.STORES.ACCOUNTS);
            closeModal();
            renderSettings();
            showToast('Cuenta guardada');
        });
    }

    function showQuickAdd() {
        openModal('Registro rápido', `
            <form id="quickForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo *</label>
                        <select id="qaType">
                            <option value="expense">Gasto</option>
                            <option value="income">Ingreso</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Monto *</label>
                        <input type="number" id="qaAmount" required min="0.01" step="0.01" placeholder="0.00" autofocus>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción *</label>
                    <input type="text" id="qaDescription" required placeholder="¿En qué gastaste / de dónde recibiste?">
                </div>
                <div class="form-row">
<div class="form-group">
                        <label>Categoría</label>
                        <select id="qaCategory">
                            ${categoryOptionsHTML('', false)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cuenta *</label>
                        <select id="qaAccount" required>
                            <option value="">Selecciona</option>
                            ${accountOptions()}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Método</label>
                    <select id="qaMethod">
                        <option value="">Sin método</option>
                        ${methodOptions()}
                    </select>
                </div>
                <div class="form-group">
                    <label>Comercio / Fuente</label>
                    <input type="text" id="qaCommerce" placeholder="Comercio o fuente">
                </div>
${addModalActions(false, '')}
            </form>
        `);

        document.getElementById('qaType').addEventListener('change', (e) => {
            const sel = document.getElementById('qaCategory');
            const currentCat = sel.value;
            sel.innerHTML = categoryOptionsHTML(currentCat, e.target.value === 'income');
            if (currentCat && ![...sel.options].some(o => o.value === currentCat)) {
                sel.add(new Option(currentCat, currentCat, false, true));
            }
        });

        document.getElementById('quickForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('qaType').value;
            const amount = parseFloat(document.getElementById('qaAmount').value);
            const accountId = document.getElementById('qaAccount').value;
            const commerce = document.getElementById('qaCommerce').value.trim();
            const category = document.getElementById('qaCategory').value.trim();

            if (!amount || amount <= 0) { showToast('Monto inválido', 'error'); return; }
            if (!accountId) { showToast('Selecciona una cuenta', 'error'); return; }

            const data = {
                type,
                date: new Date().toISOString().slice(0, 10),
                description: document.getElementById('qaDescription').value.trim(),
                amount,
                category: category || (type === 'income' ? 'Otros' : 'Otros'),
                paymentMethod: document.getElementById('qaMethod').value || null,
                accountId,
                commerce: type === 'expense' ? commerce : null,
                source: type === 'income' ? commerce : null,
                isRecurring: false,
                isNecessary: true
            };
            const ok = await saveMovement(data);
            if (ok) {
                closeModal();
                await refreshStates();
            }
        });
    }

    // ===== Demo data =====
    async function loadDemoData() {
        const existing = await DB.count(DB.STORES.MOVEMENTS);
        if (existing > 0) {
            if (!confirm('Ya tienes datos. ¿Deseas reemplazar todos los datos con la información de demostración?')) return;
            await DB.clearAll();
        }

        const today = new Date();
        const iso = (d) => d.toISOString().slice(0, 10);
        const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };
        const daysAhead = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };
        const monthsAgo = (n) => { const d = new Date(today.getFullYear(), today.getMonth() - n, 15); return iso(d); };

        const defaultCategories = ['Alimentación','Vivienda','Transporte','Salud','Educación','Servicios','Internet','Telefonía','Entretenimiento','Compras','Deudas','Suscripciones','Trabajo','Familia','Otros'];
        const defaultIncomeCategories = ['Salario','Trabajo extra','Negocio','Comisiones','Ventas','Transferencias','Otros'];
        const defaultMethods = ['Efectivo','Tarjeta de débito','Tarjeta de crédito','Transferencia','Depósito','Pago móvil'];

        for (const c of defaultCategories) {
            await DB.add(DB.STORES.CATEGORIES, { id: DB.generateId(), name: c, isIncome: false });
        }
        for (const c of defaultIncomeCategories) {
            await DB.add(DB.STORES.CATEGORIES, { id: DB.generateId(), name: c, isIncome: true });
        }
        for (const m of defaultMethods) {
            await DB.add(DB.STORES.PAYMENT_METHODS, { id: DB.generateId(), name: m });
        }

const cashAcc = { id: DB.generateId(), name: 'Efectivo', type: 'Efectivo', initialBalance: 500, currentBalance: 500 };
        const bankAcc = { id: DB.generateId(), name: 'Cuenta bancaria', type: 'Cuenta bancaria', bank: 'Banco Atlántida', accountNumber: '0101-0520-0214563', initialBalance: 15000, currentBalance: 15000 };
        const savingsAcc = { id: DB.generateId(), name: 'Cuenta de ahorro', type: 'Cuenta de ahorro', bank: 'BAC Credomatic', accountNumber: '4159-0087-1122007', initialBalance: 8000, currentBalance: 8000 };
        await DB.put(DB.STORES.ACCOUNTS, cashAcc);
        await DB.put(DB.STORES.ACCOUNTS, bankAcc);
        await DB.put(DB.STORES.ACCOUNTS, savingsAcc);
        accounts = [cashAcc, bankAcc, savingsAcc];

        const card = {
            id: DB.generateId(), name: 'Visa BAC', bank: 'BAC Honduras',
            limit: 20000, usedBalance: 4500,
            cutoffDate: '15', paymentDate: '10',
            minimumPayment: 900, noInterestPayment: 4500
        };
        await DB.put(DB.STORES.CREDIT_CARDS, card);
        creditCards = [card];

        const demoTx = [
            { type: 'income', date: daysAgo(28), description: 'Salario mensual', category: 'Salario', amount: 25000, method: 'Depósito', account: bankAcc, source: 'Empleador' },
            { type: 'income', date: daysAgo(14), description: 'Trabajo extra freelance', category: 'Trabajo extra', amount: 3000, method: 'Transferencia', account: bankAcc, source: 'Cliente' },
            { type: 'income', date: daysAgo(5), description: 'Venta de muebles', category: 'Ventas', amount: 1500, method: 'Efectivo', account: cashAcc, source: 'Marketplace' },

            { type: 'expense', date: daysAgo(27), description: 'Supermercado La Colonia', category: 'Alimentación', amount: 1250, method: 'Tarjeta de débito', account: bankAcc, commerce: 'La Colonia', necessary: true },
            { type: 'expense', date: daysAgo(24), description: 'Combustible', category: 'Transporte', amount: 800, method: 'Efectivo', account: cashAcc, commerce: 'Puma', necessary: true },
            { type: 'expense', date: daysAgo(22), description: 'Alquiler de apartamento', category: 'Vivienda', amount: 4000, method: 'Transferencia', account: bankAcc, commerce: 'Arrendador', necessary: true, recurring: true },
            { type: 'expense', date: daysAgo(20), description: 'Cena en restaurante', category: 'Entretenimiento', amount: 650, method: 'Tarjeta de crédito', account: bankAcc, commerce: 'La Parrilla', card },
            { type: 'expense', date: daysAgo(18), description: 'Factura de energía', category: 'Servicios', amount: 520, method: 'Pago móvil', account: cashAcc, commerce: 'ENEE', necessary: true, recurring: true },
            { type: 'expense', date: daysAgo(15), description: 'Farmacia', category: 'Salud', amount: 340, method: 'Efectivo', account: cashAcc, commerce: 'Farmacia Simán', necessary: true },
            { type: 'expense', date: daysAgo(13), description: 'Internet fibra', category: 'Internet', amount: 450, method: 'Tarjeta de débito', account: bankAcc, commerce: 'Tigo', necessary: true, recurring: true },
            { type: 'expense', date: daysAgo(10), description: 'Ropa nueva', category: 'Compras', amount: 1200, method: 'Tarjeta de crédito', account: bankAcc, commerce: 'Mall Premier', card },
            { type: 'expense', date: daysAgo(8), description: 'Uber', category: 'Transporte', amount: 180, method: 'Pago móvil', account: cashAcc, commerce: 'Uber' },
            { type: 'expense', date: daysAgo(6), description: 'Recarga teléfono', category: 'Telefonía', amount: 300, method: 'Pago móvil', account: cashAcc, commerce: 'Tigo', necessary: true, recurring: true },
            { type: 'expense', date: daysAgo(4), description: 'Suscripción Netflix', category: 'Suscripciones', amount: 260, method: 'Tarjeta de crédito', account: bankAcc, commerce: 'Netflix', card, recurring: true },
            { type: 'expense', date: daysAgo(2), description: 'Salidas y café', category: 'Entretenimiento', amount: 380, method: 'Efectivo', account: cashAcc, commerce: 'Esquinas Coffee' },
            { type: 'expense', date: daysAgo(1), description: 'Mercado del día', category: 'Alimentación', amount: 420, method: 'Efectivo', account: cashAcc, commerce: 'Mercado', necessary: true },
            { type: 'expense', date: daysAgo(0), description: 'Almuerzo', category: 'Alimentación', amount: 180, method: 'Efectivo', account: cashAcc, commerce: 'Pupusería' }
        ];

        for (const tx of demoTx) {
            const m = {
                id: DB.generateId(),
                type: tx.type,
                date: tx.date,
                time: '',
                description: tx.description,
                category: tx.category,
                amount: tx.amount,
                paymentMethod: tx.method,
                accountId: tx.account.id,
                commerce: tx.commerce || null,
                source: tx.source || null,
                isRecurring: !!tx.recurring,
                isNecessary: !!tx.necessary,
                notes: null
            };
if (tx.card) m.creditCardId = card.id;
            await DB.put(DB.STORES.MOVEMENTS, m);
            movements.push(m);
        }

        for (const card of creditCards) {
            movements.filter(m => m.creditCardId === card.id)
                .forEach(m => applyCardExpenseEffect(m, 1));
            await DB.put(DB.STORES.CREDIT_CARDS, card);
        }

        const recurringDemo = [
            { name: 'Internet', amount: 450, frequency: 'monthly', nextPayment: daysAhead(2), category: 'Internet', method: 'Tarjeta de débito' },
            { name: 'Netflix', amount: 260, frequency: 'monthly', nextPayment: daysAhead(5), category: 'Suscripciones', method: 'Tarjeta de crédito' },
            { name: 'Alquiler', amount: 4000, frequency: 'monthly', nextPayment: daysAhead(8), category: 'Vivienda', method: 'Transferencia' },
            { name: 'Electricidad', amount: 520, frequency: 'monthly', nextPayment: daysAhead(12), category: 'Servicios', method: 'Pago móvil' },
            { name: 'Telefonía', amount: 300, frequency: 'monthly', nextPayment: daysAhead(16), category: 'Telefonía', method: 'Pago móvil' }
        ];
        for (const r of recurringDemo) {
            await DB.add(DB.STORES.RECURRING, {
                id: DB.generateId(), name: r.name, amount: r.amount,
                frequency: r.frequency, nextPayment: r.nextPayment,
                category: r.category, paymentMethod: r.method,
                status: 'active', notes: 'Dato de demostración'
            });
        }
        recurring = await DB.getAll(DB.STORES.RECURRING);

        const demoDebt = {
            id: DB.generateId(), name: 'Préstamo personal', creditor: 'Banco Ficohsa',
            originalAmount: 15000, pendingAmount: 7750, monthlyPayment: 1250,
            interestRate: 18, dueDate: null, nextPayment: daysAhead(3),
            status: 'active', notes: 'Prestamo de demostración', payments: []
        };
        await DB.put(DB.STORES.DEBTS, demoDebt);
        debts = [demoDebt];

        const demoGoal = {
            id: DB.generateId(), name: 'Computadora nueva', targetAmount: 30000,
            savedAmount: 12000, deadline: daysAhead(180), notes: 'Meta de demostración',
            contributions: [{ date: daysAgo(30), amount: 12000 }]
        };
        await DB.put(DB.STORES.GOALS, demoGoal);
        goals = [demoGoal];

        const demoBudgets = [
            { id: DB.generateId(), category: 'Alimentación', amount: 5000 },
            { id: DB.generateId(), category: 'Transporte', amount: 2500 },
            { id: DB.generateId(), category: 'Entretenimiento', amount: 1500 },
            { id: DB.generateId(), category: 'Salud', amount: 800 }
        ];
        for (const b of demoBudgets) await DB.put(DB.STORES.BUDGETS, b);
        budgets = await DB.getAll(DB.STORES.BUDGETS);

        await recalcAllBalances();

        categories = await DB.getAll(DB.STORES.CATEGORIES);
        incomeCategories = categories.filter(c => c.isIncome);
        categories = categories.filter(c => !c.isIncome);
        paymentMethods = await DB.getAll(DB.STORES.PAYMENT_METHODS);

        showToast('Datos de demostración cargados');
        await refreshStates();
    }

async function refreshStates() {
        loadAllData().then(() => {
            populateMovementFilters();
            navigateTo(currentPage);
            if (currentPage === 'settings') renderSettings();
            renderNotifications();
        });
    }

    async function clearAllData() {
        if (!confirm('¿Seguro que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) return;
        await DB.clearAll();
        movements = []; accounts = []; budgets = []; recurring = [];
        debts = []; creditCards = []; goals = []; categories = [];
        incomeCategories = []; paymentMethods = [];
        showToast('Todos los datos han sido eliminados');
        await refreshStates();
    }

    // ===== Event listeners =====
    function setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(item.dataset.page);
            });
        });

        document.querySelectorAll('[data-go]').forEach(el => {
            el.addEventListener('click', () => navigateTo(el.dataset.go));
        });

        const menuBtn = document.getElementById('menuBtn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('show');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });

        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

document.getElementById('btnQuickAdd').addEventListener('click', () => showQuickAdd());

        // Notifications bell
        const notifBtn = document.getElementById('notifBtn');
        const notifPanel = document.getElementById('notifPanel');
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = notifPanel.classList.toggle('show');
            if (isOpen) renderNotifications();
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notif-wrapper')) notifPanel.classList.remove('show');
        });

        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.dataset.action;
            const id = target.dataset.id;
            handleAction(action, id, target);
        });

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        globalSearch.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                const results = Calc.searchMovements(movements, e.target.value);
                showToast(`${results.length} movimientos encontrados`, 'info');
            }
        });
        globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                navigateTo('movements');
                document.getElementById('movSearch').value = e.target.value;
                renderMovements();
            }
        });

        // Movements filters
        ['movSearch', 'movTypeFilter', 'movPeriodFilter', 'movCategoryFilter', 'movMethodFilter'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => {
                movementsPage = 1;
                renderMovements();
            });
        });
        document.getElementById('movPeriodFilter').addEventListener('change', (e) => {
            document.getElementById('customDateRange').style.display = e.target.value === 'custom' ? 'flex' : 'none';
        });
        document.getElementById('movFromDate')?.addEventListener('change', renderMovements);
        document.getElementById('movToDate')?.addEventListener('change', renderMovements);
        document.getElementById('movClearFilters')?.addEventListener('click', () => {
            ['movSearch','movTypeFilter','movPeriodFilter','movCategoryFilter','movMethodFilter'].forEach(id => {
                document.getElementById(id).value = '';
            });
            document.getElementById('customDateRange').style.display = 'none';
            movementsPage = 1;
            renderMovements();
        });

        // Income filters
        ['incomeSearch', 'incomePeriod', 'incomeCategory'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', renderIncome);
        });

        // Expense filters
        ['expenseSearch', 'expensePeriod', 'expenseCategory', 'expenseMethod', 'expenseRecurrentFilter'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', renderExpenses);
        });

        // Calendar
        document.getElementById('calendarPrev').addEventListener('click', () => {
            calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1);
            renderCalendar();
        });
        document.getElementById('calendarNext').addEventListener('click', () => {
            calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1);
            renderCalendar();
        });
        document.getElementById('calendarToday').addEventListener('click', () => {
            calendarViewDate = new Date();
            renderCalendar();
        });

// Reports
        document.getElementById('btnGenerateReport').addEventListener('click', renderReports);

        // Settings
        document.getElementById('settingsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            settings.appName = document.getElementById('setAppName').value.trim() || 'Finanzas Personales';
            settings.currency = document.getElementById('setCurrency').value;
            settings.dateFormat = document.getElementById('setDateFormat').value;
            settings.language = document.getElementById('setLanguage').value;
            settings.lowBalanceThreshold = parseFloat(document.getElementById('setLowBalance').value) || 1000;
            settings.alertDays = parseInt(document.getElementById('setAlertDays').value, 10);
            if (isNaN(settings.alertDays) || settings.alertDays < 0) settings.alertDays = 0;
            if (settings.alertDays > 30) settings.alertDays = 30;
            applyTheme(document.getElementById('setThemeToggle').checked ? 'dark' : 'light');
            await saveSettings();
            document.getElementById('appName').textContent = settings.appName;
            document.title = settings.appName;
            renderNotifications();
            showToast('Configuración guardada');
        });

        // Instant theme toggle from settings
        document.getElementById('setThemeToggle').addEventListener('change', (e) => {
            applyTheme(e.target.checked ? 'dark' : 'light');
            saveSettings();
            Charts.destroyAll();
            if (currentPage === 'dashboard') renderDashboard();
        });

        // Instant language change from settings
        document.getElementById('setLanguage').addEventListener('change', async (e) => {
            settings.language = e.target.value;
            await saveSettings();
            applyI18n();
            renderNotifications();
            Charts.destroyAll();
            navigateTo(currentPage);
        });

        // Import file
        const importFile = document.getElementById('importFile');
        document.querySelector('[data-action="import-json"]').addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const result = await ImportExport.importJSONFile(file);
            if (result.success) {
                showToast(result.message);
                await refreshStates();
            } else {
                showToast(result.errors.join('; '), 'error');
            }
            importFile.value = '';
        });

        // Data buttons
        document.querySelector('[data-action="export-json"]').addEventListener('click', async () => {
            const filename = await ImportExport.exportJSON();
            showToast(`Datos exportados: ${filename}`);
        });
        document.querySelector('[data-action="export-backup"]').addEventListener('click', async () => {
            const filename = await ImportExport.exportJSON();
            showToast(`Copia de seguridad creada: ${filename}`);
        });
        document.querySelector('[data-action="load-demo"]').addEventListener('click', async () => {
            await loadDemoData();
        });
        document.querySelector('[data-action="clear-data"]').addEventListener('click', async () => {
            await clearAllData();
        });
        document.querySelector('[data-action="export-report"]').addEventListener('click', () => {
            navigateTo('reports');
        });
    }

function handleAction(action, id, element) {
        switch (action) {
            case 'mark-alerts-read': dismissAllAlerts(); break;
            case 'goto-alerts': navigateTo(id); document.getElementById('notifPanel').classList.remove('show'); break;
            case 'new-movement': showMovementForm(); break;
            case 'new-income': showMovementForm({ type: 'income' }); break;
            case 'new-expense': showMovementForm({ type: 'expense' }); break;
            case 'new-budget': showBudgetForm(); break;
            case 'new-recurring': showRecurringForm(); break;
            case 'new-debt': showDebtForm(); break;
            case 'new-card': showCardForm(); break;
            case 'new-goal': showGoalForm(); break;
            case 'new-category': showCategoryForm(); break;
            case 'new-income-category': showCategoryForm(null, true); break;
            case 'new-method': showMethodForm(); break;
            case 'new-account': showAccountForm(); break;
            case 'edit-movement': {
                const m = movements.find(x => x.id === id);
                if (m) showMovementForm(m);
                break;
            }
            case 'delete-movement':
                deleteMovement(id).then(() => {
                    if (currentPage === 'movements') renderMovements();
                    if (currentPage === 'income') renderIncome();
                    if (currentPage === 'expenses') renderExpenses();
                    if (currentPage === 'dashboard') renderDashboard();
                });
                break;
            case 'edit-budget': {
                const b = budgets.find(x => x.id === id);
                if (b) showBudgetForm(b);
                break;
            }
            case 'delete-budget': {
                if (!confirm('¿Eliminar este presupuesto?')) break;
                DB.remove(DB.STORES.BUDGETS, id).then(() => {
                    budgets = budgets.filter(x => x.id !== id);
                    renderBudget();
                    showToast('Presupuesto eliminado');
                });
                break;
            }
            case 'edit-recurring': {
                const r = recurring.find(x => x.id === id);
                if (r) showRecurringForm(r);
                break;
            }
            case 'delete-recurring': {
                if (!confirm('¿Eliminar este gasto recurrente?')) break;
                DB.remove(DB.STORES.RECURRING, id).then(() => {
                    recurring = recurring.filter(x => x.id !== id);
                    renderRecurring();
                    showToast('Recurrente eliminado');
                });
                break;
            }
            case 'pay-recurring': {
                const r = recurring.find(x => x.id === id);
                if (r) showPayRecurringForm(r);
                break;
            }
            case 'edit-debt': {
                const d = debts.find(x => x.id === id);
                if (d) showDebtForm(d);
                break;
            }
            case 'delete-debt': {
                if (!confirm('¿Eliminar esta deuda? Los pagos registrados conservarán su historial.')) break;
                DB.remove(DB.STORES.DEBTS, id).then(() => {
                    debts = debts.filter(x => x.id !== id);
                    renderDebts();
                    showToast('Deuda eliminada');
                });
                break;
            }
            case 'pay-debt': {
                const d = debts.find(x => x.id === id);
                if (d) showPayDebtForm(d);
                break;
            }
            case 'edit-card': {
                const c = creditCards.find(x => x.id === id);
                if (c) showCardForm(c);
                break;
            }
            case 'delete-card': {
                if (!confirm('¿Eliminar esta tarjeta?')) break;
                DB.remove(DB.STORES.CREDIT_CARDS, id).then(() => {
                    creditCards = creditCards.filter(x => x.id !== id);
                    renderCards();
                    showToast('Tarjeta eliminada');
                });
                break;
            }
            case 'edit-goal': {
                const g = goals.find(x => x.id === id);
                if (g) showGoalForm(g);
                break;
            }
            case 'delete-goal': {
                if (!confirm('¿Eliminar esta meta?')) break;
                DB.remove(DB.STORES.GOALS, id).then(() => {
                    goals = goals.filter(x => x.id !== id);
                    renderGoals();
                    showToast('Meta eliminada');
                });
                break;
            }
            case 'contribute-goal': {
                const g = goals.find(x => x.id === id);
                if (g) showContributeForm(g);
                break;
            }
            case 'edit-category': {
                const c = categories.find(x => x.id === id);
                if (c) showCategoryForm(c);
                break;
            }
            case 'delete-category': {
                if (!confirm('¿Eliminar esta categoría? Los movimientos existentes mantendrán su categoría.')) break;
                DB.remove(DB.STORES.CATEGORIES, id).then(() => {
                    categories = categories.filter(x => x.id !== id);
                    renderSettings();
                    populateMovementFilters();
                    showToast('Categoría eliminada');
                });
                break;
            }
            case 'edit-income-category': {
                const c = categories.find(x => x.id === id);
                if (c) showCategoryForm(c, true);
                break;
            }
            case 'delete-income-category': {
                if (!confirm('¿Eliminar esta categoría de ingreso?')) break;
                DB.remove(DB.STORES.CATEGORIES, id).then(() => {
                    incomeCategories = incomeCategories.filter(x => x.id !== id);
                    renderSettings();
                    populateMovementFilters();
                    showToast('Categoría eliminada');
                });
                break;
            }
            case 'edit-method': {
                const m = paymentMethods.find(x => x.id === id);
                if (m) showMethodForm(m);
                break;
            }
            case 'delete-method': {
                if (!confirm('¿Eliminar este método de pago?')) break;
                DB.remove(DB.STORES.PAYMENT_METHODS, id).then(() => {
                    paymentMethods = paymentMethods.filter(x => x.id !== id);
                    renderSettings();
                    populateMovementFilters();
                    showToast('Método eliminado');
                });
                break;
            }
            case 'edit-account': {
                const a = accounts.find(x => x.id === id);
                if (a) showAccountForm(a);
                break;
            }
            case 'delete-account': {
                if (!confirm('¿Eliminar esta cuenta? Los movimientos asociados se conservarán.')) break;
                if (movements.some(m => m.accountId === id)) {
                    if (!confirm('Existen movimientos vinculados a esta cuenta. Los registros se conservarán pero sin cuenta asociada. ¿Continuar?')) break;
                }
                DB.remove(DB.STORES.ACCOUNTS, id).then(() => {
                    accounts = accounts.filter(x => x.id !== id);
                    renderSettings();
                    showToast('Cuenta eliminada');
                });
                break;
            }
            case 'modal-cancel': closeModal(); break;
        }
    }

    // ===== Init =====
    async function init() {
        await DB.open();
        await loadAllData();

        const storedCategories = await DB.getAll(DB.STORES.CATEGORIES);
        const storedMethods = await DB.getAll(DB.STORES.PAYMENT_METHODS);

        if (storedMethods.length === 0) {
            const defaults = ['Efectivo','Tarjeta de débito','Tarjeta de crédito','Transferencia','Depósito','Pago móvil'];
            for (const m of defaults) await DB.add(DB.STORES.PAYMENT_METHODS, { id: DB.generateId(), name: m });
        }

        if (storedCategories.length === 0) {
            const defaults = [
                ['Alimentación', false], ['Vivienda', false], ['Transporte', false], ['Salud', false],
                ['Educación', false], ['Servicios', false], ['Internet', false], ['Telefonía', false],
                ['Entretenimiento', false], ['Compras', false], ['Deudas', false], ['Suscripciones', false],
                ['Trabajo', false], ['Familia', false], ['Otros', false],
                ['Salario', true], ['Trabajo extra', true], ['Negocio', true], ['Comisiones', true],
                ['Ventas', true], ['Transferencias', true], ['Otros', true]
            ];
            for (const [name, isIncome] of defaults) {
                await DB.add(DB.STORES.CATEGORIES, { id: DB.generateId(), name, isIncome });
            }
        }

        await loadAllData();

        categories = await DB.getAll(DB.STORES.CATEGORIES);
        incomeCategories = categories.filter(c => c.isIncome);
        categories = categories.filter(c => !c.isIncome);
        paymentMethods = await DB.getAll(DB.STORES.PAYMENT_METHODS);

        setupEventListeners();
populateMovementFilters();
        navigateTo('dashboard');
        renderNotifications();

        const alerts = buildAlerts();
        if (alerts.length) {
            const urgent = alerts.filter(a => a.severity === 'danger').length;
            showToast(`Tienes ${alerts.length} ${alerts.length === 1 ? 'alerta' : 'alertas'} de pago pendiente${urgent ? ' (incluye vencimientos/hoy)' : ''}`, urgent ? 'warning' : 'info');
        }
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => { App.init(); });

const Calc = (() => {
    const CURRENCY_SYMBOL = 'L';
    const CURRENCY_LOCALE = 'es-HN';

    function formatMoney(amount) {
        const num = Number(amount) || 0;
        return `${CURRENCY_SYMBOL} ${num.toLocaleString(CURRENCY_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function parseMoney(str) {
        if (typeof str === 'number') return str;
        if (!str) return 0;
        return parseFloat(String(str).replace(/[^0-9.\-]/g, '')) || 0;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + (dateStr.length <= 10 ? 'T00:00:00' : ''));
        return d.toLocaleDateString(CURRENCY_LOCALE, { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + (dateStr.length <= 10 ? 'T00:00:00' : ''));
        return d.toLocaleDateString(CURRENCY_LOCALE, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function formatPercent(value) {
        return `${(Number(value) || 0).toFixed(1)}%`;
    }

    function getMonthKey(dateStr) {
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    function getWeekKey(dateStr) {
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        const jan1 = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    }

    function isSameMonth(dateStr, referenceDate) {
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        const r = referenceDate || new Date();
        return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth();
    }

    function isToday(dateStr) {
        const today = new Date();
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        return d.toDateString() === today.toDateString();
    }

    function isYesterday(dateStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        return d.toDateString() === yesterday.toDateString();
    }

    function isThisWeek(dateStr) {
        const now = new Date();
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return d >= startOfWeek && d <= now;
    }

    function isLastMonth(dateStr) {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth();
    }

    function isLastMonths(dateStr, months) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        return d >= start && d <= now;
    }

    function isThisYear(dateStr) {
        const d = new Date(dateStr + (dateStr && dateStr.length <= 10 ? 'T00:00:00' : ''));
        return d.getFullYear() === new Date().getFullYear();
    }

    function filterByPeriod(items, period, dateField = 'date') {
        if (!items) return [];
        switch (period) {
            case 'today': return items.filter(i => isToday(i[dateField]));
            case 'yesterday': return items.filter(i => isYesterday(i[dateField]));
            case 'thisWeek': return items.filter(i => isThisWeek(i[dateField]));
            case 'thisMonth': return items.filter(i => isSameMonth(i[dateField]));
            case 'lastMonth': return items.filter(i => isLastMonth(i[dateField]));
            case 'last3Months': return items.filter(i => isLastMonths(i[dateField], 3));
            case 'last6Months': return items.filter(i => isLastMonths(i[dateField], 6));
            case 'thisYear': return items.filter(i => isThisYear(i[dateField]));
            default: return items;
        }
    }

    function filterByDateRange(items, startDate, endDate, dateField = 'date') {
        if (!items) return [];
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        return items.filter(i => {
            const d = new Date(i[dateField] + (i[dateField].length <= 10 ? 'T00:00:00' : ''));
            return d >= start && d <= end;
        });
    }

    function getMonthlyTotals(movements) {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const filtered = movements.filter(m => m.type === 'income' || m.type === 'expense');
        const income = filtered.filter(m => m.type === 'income' && getMonthKey(m.date) === monthKey)
            .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
        const expense = filtered.filter(m => m.type === 'expense' && getMonthKey(m.date) === monthKey)
            .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
        return { income, expense, balance: income - expense };
    }

    function getTodayExpenses(movements) {
        return movements.filter(m => m.type === 'expense' && isToday(m.date))
            .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    }

    function getExpensesByCategory(movements, period = 'thisMonth') {
        const expenses = movements.filter(m => m.type === 'expense');
        const filtered = filterByPeriod(expenses, period);
        const byCategory = {};
        filtered.forEach(m => {
            const cat = m.category || 'Sin categoría';
            byCategory[cat] = (byCategory[cat] || 0) + (Number(m.amount) || 0);
        });
        return Object.entries(byCategory)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    function getExpensesByMethod(movements, period = 'thisMonth') {
        const expenses = movements.filter(m => m.type === 'expense');
        const filtered = filterByPeriod(expenses, period);
        const byMethod = {};
        filtered.forEach(m => {
            const method = m.paymentMethod || 'Sin especificar';
            byMethod[method] = (byMethod[method] || 0) + (Number(m.amount) || 0);
        });
        return Object.entries(byMethod)
            .map(([method, amount]) => ({ method, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    function getExpensesByCommerce(movements, period = 'thisMonth') {
        const expenses = movements.filter(m => m.type === 'expense');
        const filtered = filterByPeriod(expenses, period);
        const byCommerce = {};
        filtered.forEach(m => {
            const commerce = m.commerce || 'Sin especificar';
            byCommerce[commerce] = (byCommerce[commerce] || 0) + (Number(m.amount) || 0);
        });
        return Object.entries(byCommerce)
            .map(([commerce, amount]) => ({ commerce, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    function getExpensesByDay(movements, period = 'thisMonth') {
        const expenses = movements.filter(m => m.type === 'expense');
        const filtered = filterByPeriod(expenses, period);
        const byDay = {};
        filtered.forEach(m => {
            byDay[m.date] = (byDay[m.date] || 0) + (Number(m.amount) || 0);
        });
        return Object.entries(byDay)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    function getExpensesByWeek(movements, period = 'thisYear') {
        const expenses = movements.filter(m => m.type === 'expense');
        const filtered = filterByPeriod(expenses, period);
        const byWeek = {};
        filtered.forEach(m => {
            const wk = getWeekKey(m.date);
            byWeek[wk] = (byWeek[wk] || 0) + (Number(m.amount) || 0);
        });
        return Object.entries(byWeek)
            .map(([week, amount]) => ({ week, amount }))
            .sort((a, b) => a.week.localeCompare(b.week));
    }

    function getMonthlyComparison(movements, months = 6) {
        const now = new Date();
        const result = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthMovements = movements.filter(m => {
                const mk = getMonthKey(m.date);
                return mk === key && (m.type === 'income' || m.type === 'expense');
            });
            const income = monthMovements.filter(m => m.type === 'income')
                .reduce((s, m) => s + (Number(m.amount) || 0), 0);
            const expense = monthMovements.filter(m => m.type === 'expense')
                .reduce((s, m) => s + (Number(m.amount) || 0), 0);
            result.push({
                month: key,
                label: d.toLocaleDateString(CURRENCY_LOCALE, { year: 'numeric', month: 'short' }),
                income, expense, balance: income - expense
            });
        }
        return result;
    }

    function getBalanceEvolution(movements) {
        const sorted = [...movements]
            .filter(m => m.type === 'income' || m.type === 'expense' || m.type === 'transfer')
            .sort((a, b) => a.date.localeCompare(b.date));
        let running = 0;
        return sorted.map(m => {
            if (m.type === 'income') running += Number(m.amount) || 0;
            else if (m.type === 'expense') running -= Number(m.amount) || 0;
            else if (m.type === 'transfer') {
                if (m.transferDirection === 'out') running -= Number(m.amount) || 0;
                else running += Number(m.amount) || 0;
            }
            return { date: m.date, balance: running, description: m.description };
        });
    }

    function getBudgetStatus(budgets, movements) {
        return budgets.map(budget => {
            const spent = movements.filter(m =>
                m.type === 'expense' && m.category === budget.category && isSameMonth(m.date)
            ).reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
            const limit = Number(budget.amount) || 0;
            const remaining = limit - spent;
            const percent = limit > 0 ? (spent / limit * 100) : 0;
            let status = 'ok';
            if (percent >= 100) status = 'over';
            else if (percent >= 80) status = 'warning';
            return { ...budget, spent, remaining, percent, status };
        });
    }

    function getTotalBudget(budgets) {
        return budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    }

    function getRecurringMonthlyTotal(recurring) {
        return recurring.reduce((sum, r) => {
            const amount = Number(r.amount) || 0;
            switch (r.frequency) {
                case 'daily': return sum + amount * 30;
                case 'weekly': return sum + amount * 4.33;
                case 'biweekly': return sum + amount * 2.17;
                case 'monthly': return sum + amount;
                case 'quarterly': return sum + amount / 3;
                case 'semiannual': return sum + amount / 6;
                case 'annual': return sum + amount / 12;
                default: return sum + amount;
            }
        }, 0);
    }

    function getDebtSummary(debts) {
        const totalOriginal = debts.reduce((s, d) => s + (Number(d.originalAmount) || 0), 0);
        const totalPending = debts.reduce((s, d) => s + (Number(d.pendingAmount) || 0), 0);
        const totalPaid = totalOriginal - totalPending;
        const totalMonthlyPayment = debts.reduce((s, d) => s + (Number(d.monthlyPayment) || 0), 0);
        return { totalOriginal, totalPending, totalPaid, totalMonthlyPayment };
    }

    function getUpcomingPayments(movements, recurring, debts, days = 7) {
        const now = new Date();
        const limit = new Date(now);
        limit.setDate(limit.getDate() + days);
        const payments = [];

        recurring.forEach(r => {
            if (r.nextPayment) {
                const np = new Date(r.nextPayment + 'T00:00:00');
                if (np >= now && np <= limit) {
                    payments.push({
                        type: 'recurring', name: r.name, amount: r.amount,
                        date: r.nextPayment, category: r.category
                    });
                }
            }
        });

        debts.forEach(d => {
            if (d.nextPayment) {
                const np = new Date(d.nextPayment + 'T00:00:00');
                if (np >= now && np <= limit) {
                    payments.push({
                        type: 'debt', name: d.name, amount: d.monthlyPayment,
                        date: d.nextPayment, creditor: d.creditor
                    });
                }
            }
        });

        return payments.sort((a, b) => a.date.localeCompare(b.date));
    }

    function getOverdueItems(recurring, debts) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const overdue = [];

        recurring.forEach(r => {
            if (r.nextPayment && r.status !== 'paid') {
                const np = new Date(r.nextPayment + 'T00:00:00');
                if (np < now) {
                    overdue.push({ type: 'recurring', name: r.name, amount: r.amount, date: r.nextPayment });
                }
            }
        });

        debts.forEach(d => {
            if (d.nextPayment && d.status !== 'paid') {
                const np = new Date(d.nextPayment + 'T00:00:00');
                if (np < now) {
                    overdue.push({ type: 'debt', name: d.name, amount: d.monthlyPayment, date: d.nextPayment });
                }
            }
        });

        return overdue;
    }

    function getCreditCardUtilization(cards) {
        return cards.map(c => {
            const limit = Number(c.limit) || 0;
            const used = Number(c.usedBalance) || 0;
            const available = limit - used;
            const percent = limit > 0 ? (used / limit * 100) : 0;
            let status = 'ok';
            if (percent >= 90) status = 'critical';
            else if (percent >= 70) status = 'warning';
            return { ...c, available, percent, status };
        });
    }

    function calculateSavingsRate(income, expense) {
        if (income === 0) return 0;
        return ((income - expense) / income * 100);
    }

    function getGoalProjections(goal) {
        const target = Number(goal.targetAmount) || 0;
        const saved = Number(goal.savedAmount) || 0;
        const remaining = target - saved;
        const deadline = goal.deadline ? new Date(goal.deadline + 'T00:00:00') : null;
        const result = { daily: 0, weekly: 0, biweekly: 0, monthly: 0 };

        if (remaining <= 0) return result;
        if (!deadline) return result;

        const now = new Date();
        const daysLeft = Math.max(1, Math.ceil((deadline - now) / 86400000));

        result.daily = remaining / daysLeft;
        result.weekly = remaining / (daysLeft / 7);
        result.biweekly = remaining / (daysLeft / 14);
        result.monthly = remaining / (daysLeft / 30);

        return result;
    }

    function searchMovements(movements, query) {
        if (!query || query.trim() === '') return movements;
        const q = query.toLowerCase().trim();
        return movements.filter(m =>
            (m.description && m.description.toLowerCase().includes(q)) ||
            (m.category && m.category.toLowerCase().includes(q)) ||
            (m.commerce && m.commerce.toLowerCase().includes(q)) ||
            (m.notes && m.notes.toLowerCase().includes(q)) ||
            (m.paymentMethod && m.paymentMethod.toLowerCase().includes(q)) ||
            (m.type && m.type.toLowerCase().includes(q))
        );
    }

    function getCalendarEvents(movements, recurring, debts) {
        const events = [];

        movements.forEach(m => {
            events.push({
                date: m.date, type: m.type, title: m.description,
                amount: m.amount, category: m.category, data: m
            });
        });

        recurring.forEach(r => {
            if (r.nextPayment) {
                events.push({
                    date: r.nextPayment, type: 'recurring', title: r.name,
                    amount: r.amount, category: r.category, data: r
                });
            }
        });

        debts.forEach(d => {
            if (d.nextPayment) {
                events.push({
                    date: d.nextPayment, type: 'debt_payment', title: `Pago: ${d.name}`,
                    amount: d.monthlyPayment, creditor: d.creditor, data: d
                });
            }
        });

        return events.sort((a, b) => a.date.localeCompare(b.date));
    }

    function validateMovement(m) {
        const errors = [];
        if (!m.date) errors.push('La fecha es obligatoria');
        if (!m.description || m.description.trim() === '') errors.push('La descripción es obligatoria');
        if (!m.amount || Number(m.amount) <= 0) errors.push('El monto debe ser mayor a 0');
        if (!m.type) errors.push('El tipo es obligatorio');
        if (m.type === 'expense' && !m.accountId) errors.push('Debe seleccionar una cuenta');
        if (m.type === 'income' && !m.accountId) errors.push('Debe seleccionar una cuenta');
        if (m.type === 'transfer' && !m.accountId) errors.push('Debe seleccionar cuenta de origen');
        if (m.type === 'transfer' && !m.toAccountId) errors.push('Debe seleccionar cuenta de destino');
        return errors;
    }

    return {
        formatMoney, parseMoney, formatDate, formatDateTime, formatPercent,
        getMonthKey, getWeekKey, isSameMonth, isToday, isYesterday, isThisWeek,
        isLastMonth, isLastMonths, isThisYear,
        filterByPeriod, filterByDateRange,
        getMonthlyTotals, getTodayExpenses,
        getExpensesByCategory, getExpensesByMethod, getExpensesByCommerce,
        getExpensesByDay, getExpensesByWeek,
        getMonthlyComparison, getBalanceEvolution,
        getBudgetStatus, getTotalBudget,
        getRecurringMonthlyTotal,
        getDebtSummary, getUpcomingPayments, getOverdueItems,
        getCreditCardUtilization,
        calculateSavingsRate, getGoalProjections,
        searchMovements, getCalendarEvents, validateMovement
    };
})();

const Charts = (() => {
    let charts = {};

    const PALETTE = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#22c55e',
        '#eab308', '#06b6d4', '#a855f7', '#dc2626', '#059669'
    ];

    const FONT = { family: "'Segoe UI', system-ui, sans-serif", size: 12 };

    function cssColor(varName, fallback) {
        try {
            const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            return v || fallback;
        } catch (e) {
            return fallback;
        }
    }

    const textColor = () => cssColor('--gray', '#64748b');
    const tickColor = () => cssColor('--gray-light', '#94a3b8');
    const gridColor = () => cssColor('--border', 'rgba(15,23,42,0.06)');

    function moneyTooltip(value) {
        return Calc.formatMoney(value);
    }

    function defaultOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { font: FONT, color: textColor() }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.parsed.y !== undefined) {
                                return `${ctx.dataset.label}: ${Calc.formatMoney(ctx.parsed.y)}`;
                            }
                            if (ctx.parsed !== undefined) {
                                return `${ctx.label}: ${Calc.formatMoney(ctx.parsed)}`;
                            }
                            return ctx.label;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { color: gridColor() }, ticks: { font: FONT, color: tickColor() } },
                y: {
                    grid: { color: gridColor() },
                    ticks: {
                        font: FONT,
                        color: tickColor(),
                        callback: (v) => {
                            if (Math.abs(v) >= 1000) return `L ${(v/1000).toFixed(1)}k`;
                            return v;
                        }
                    }
                }
            }
        };
    }

    function destroy(name) {
        if (charts[name]) {
            charts[name].destroy();
            delete charts[name];
        }
    }

    function categoryChart(data) {
        destroy('category');
        const canvas = document.getElementById('chartCategory');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!data || data.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const labels = data.map(d => d.category);
        const values = data.map(d => d.amount);
        const colors = values.map((_, i) => PALETTE[i % PALETTE.length]);
        charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { font: FONT, color: textColor(), padding: 12 } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${Calc.formatMoney(ctx.parsed)} (${((ctx.parsed / ctx.dataset.data.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)`
                        }
                    }
                }
            }
        });
    }

    function incomeExpenseChart(monthlyData) {
        destroy('incomeExpense');
        const canvas = document.getElementById('chartIncomeExpense');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!monthlyData || monthlyData.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const labels = monthlyData.map(d => d.label);
        const income = monthlyData.map(d => d.income);
        const expense = monthlyData.map(d => d.expense);
        charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: income,
                        backgroundColor: 'rgba(16,185,129,0.8)',
                        borderRadius: 6
                    },
                    {
                        label: 'Gastos',
                        data: expense,
                        backgroundColor: 'rgba(239,68,68,0.8)',
                        borderRadius: 6
                    }
                ]
            },
            options: defaultOptions()
        });
    }

    function budgetChart(budgetStatus) {
        destroy('budget');
        const canvas = document.getElementById('chartBudget');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!budgetStatus || budgetStatus.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const labels = budgetStatus.map(b => b.category);
        const budget = budgetStatus.map(b => b.amount);
        const spent = budgetStatus.map(b => b.spent);
        charts.budget = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Presupuesto',
                        data: budget,
                        backgroundColor: 'rgba(99,102,241,0.5)',
                        borderRadius: 4
                    },
                    {
                        label: 'Gastado',
                        data: spent,
                        backgroundColor: budgetStatus.map(b => b.status === 'over' ? 'rgba(239,68,68,0.8)' : b.status === 'warning' ? 'rgba(245,158,11,0.8)' : 'rgba(16,185,129,0.8)'),
                        borderRadius: 4
                    }
                ]
            },
            options: defaultOptions()
        });
    }

    function methodChart(data) {
        destroy('method');
        const canvas = document.getElementById('chartMethod');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!data || data.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const labels = data.map(d => d.method);
        const values = data.map(d => d.amount);
        const colors = values.map((_, i) => PALETTE[i % PALETTE.length]);
        charts.method = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { font: FONT, color: textColor(), padding: 12 } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${Calc.formatMoney(ctx.parsed)}`
                        }
                    }
                }
            }
        });
    }

    function balanceChart(evolution) {
        destroy('balance');
        const canvas = document.getElementById('chartBalance');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!evolution || evolution.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const labels = evolution.map(d => Calc.formatDate(d.date));
        const values = evolution.map(d => d.balance);
        const lineColor = values.length > 0 && values[values.length - 1] >= 0 ? '#10b981' : '#ef4444';
        charts.balance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Saldo',
                    data: values,
                    borderColor: lineColor,
                    backgroundColor: (ctx) => {
                        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
                        g.addColorStop(0, 'rgba(16,185,129,0.2)');
                        g.addColorStop(1, 'rgba(16,185,129,0)');
                        return g;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: lineColor,
                    borderWidth: 2
                }]
            },
            options: defaultOptions()
        });
    }

    function monthlyChart(monthlyData) {
        destroy('monthly');
        const canvas = document.getElementById('chartMonthly');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!monthlyData || monthlyData.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        const labels = monthlyData.map(d => d.label);
        const expense = monthlyData.map(d => d.expense);
        const balance = monthlyData.map(d => d.balance);
        charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Gastos',
                        data: expense,
                        backgroundColor: 'rgba(239,68,68,0.8)',
                        borderRadius: 6
                    },
                    {
                        label: 'Balance',
                        data: balance,
                        type: 'line',
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99,102,241,0.1)',
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#6366f1',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: defaultOptions()
        });
    }

    function destroyAll() {
        for (const key of Object.keys(charts)) {
            destroy(key);
        }
        charts = {};
    }

    return { categoryChart, incomeExpenseChart, budgetChart, methodChart, balanceChart, monthlyChart, destroyAll, PALETTE };
})();
const Reports = (() => {

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function getReportData(movements, recurring, debts, period) {
        const filtered = Calc.filterByPeriod(movements, period);
        return {
            movements: filtered,
            recurring,
            debts,
            period
        };
    }

    function generateSummary(report, format) {
        const filtered = report.movements.filter(m => m.type === 'income' || m.type === 'expense');
        const income = filtered.filter(m => m.type === 'income').reduce((s, m) => s + (Number(m.amount) || 0), 0);
        const expense = filtered.filter(m => m.type === 'expense').reduce((s, m) => s + (Number(m.amount) || 0), 0);
        const savings = income - expense;
        const debtPaid = report.movements.filter(m => m.type === 'debt_payment')
            .reduce((s, m) => s + (Number(m.amount) || 0), 0);
        const recurringMonthly = Calc.getRecurringMonthlyTotal(report.recurring);
        const byCategory = Calc.getExpensesByCategory(report.movements, report.period);
        const topCategory = byCategory.length > 0 ? byCategory[0].category : 'N/A';
        const savingsRate = income > 0 ? (savings / income * 100) : 0;
        const totalMovement = filtered.length;
        const avgDaily = expense > 0 ? expense / Math.max(1, Math.max(...filtered.map(m => new Date(m.date).getDate()))) : 0;

        const data = [
            { label: 'Ingresos', value: income, income: true },
            { label: 'Gastos', value: expense, expense: true },
            { label: 'Ahorro', value: savings },
            { label: 'Deudas pagadas', value: debtPaid },
            { label: 'Gastos recurrentes al mes', value: recurringMonthly },
            { label: 'Categoría con mayor gasto', value: null, text: topCategory },
            { label: 'Tasa de ahorro', value: null, text: `${savingsRate.toFixed(1)}%` },
            { label: 'Total movimientos', value: null, text: String(totalMovement) }
        ];

        return renderReport('Resumen financiero', data, format);
    }

    function generateByDay(report, format) {
        const daily = Calc.getExpensesByDay(report.movements, report.period);
        return renderTableReport('Gastos por día', ['Fecha', 'Monto'], daily.map(d => [Calc.formatDate(d.date), Calc.formatMoney(d.amount)]), format);
    }

    function generateByWeek(report, format) {
        const weekly = Calc.getExpensesByWeek(report.movements, report.period);
        return renderTableReport('Gastos por semana', ['Semana', 'Monto'], weekly.map(d => [d.week, Calc.formatMoney(d.amount)]), format);
    }

    function generateByMonth(report, format) {
        const monthly = Calc.getMonthlyComparison(report.movements, 12);
        const rows = monthly.filter(m => m.income > 0 || m.expense > 0);
        return renderTableReport('Comparación mensual',
            ['Mes', 'Ingresos', 'Gastos', 'Balance'],
            rows.map(d => [d.label, Calc.formatMoney(d.income), Calc.formatMoney(d.expense), Calc.formatMoney(d.balance)]),
            format);
    }

    function generateByCategory(report, format) {
        const byCategory = Calc.getExpensesByCategory(report.movements, report.period);
        const total = byCategory.reduce((s, c) => s + c.amount, 0);
        return renderTableReport('Gastos por categoría',
            ['Categoría', 'Monto', 'Porcentaje'],
            byCategory.map(c => [c.category, Calc.formatMoney(c.amount), total > 0 ? ((c.amount / total * 100).toFixed(1) + '%') : '0%']),
            format);
    }

    function generateByMethod(report, format) {
        const byMethod = Calc.getExpensesByMethod(report.movements, report.period);
        return renderTableReport('Gastos por método de pago',
            ['Método', 'Monto'],
            byMethod.map(m => [m.method, Calc.formatMoney(m.amount)]),
            format);
    }

    function generateByCommerce(report, format) {
        const byCommerce = Calc.getExpensesByCommerce(report.movements, report.period);
        return renderTableReport('Gastos por comercio',
            ['Comercio', 'Monto'],
            byCommerce.map(m => [m.commerce, Calc.formatMoney(m.amount)]),
            format);
    }

    function renderReport(title, data, format) {
        if (format === 'csv') {
            const headers = ['Concepto', 'Valor'];
            const rows = data.map(d => [
                d.text || d.label,
                d.text ? d.text : Calc.formatMoney(d.value)
            ]);
            return toCSV(title, headers, rows);
        }

        let html = `<div class="report-container">
            <h2>${escapeHtml(title)}</h2>
            <div class="report-dates">Período: ${getPeriodLabel}</div>
            <div class="report-summary-grid">`;
        data.forEach(d => {
            if (d.text !== null && d.text !== undefined) {
                html += `<div class="report-stat">
                    <div class="rs-label">${escapeHtml(d.label)}</div>
                    <div class="rs-value">${escapeHtml(d.text)}</div>
                </div>`;
            } else {
                let colorClass = '';
                if (d.income) colorClass = 'summary-income';
                if (d.expense) colorClass = 'summary-expense';
                if (d.label === 'Ahorro') colorClass = d.value >= 0 ? 'summary-income' : 'summary-expense';
                if (d.label === 'Deudas pagadas') colorClass = 'summary-debt';
                html += `<div class="report-stat">
                    <div class="rs-label">${escapeHtml(d.label)}</div>
                    <div class="rs-value ${colorClass}">${Calc.formatMoney(d.value)}</div>
                </div>`;
            }
        });
        html += `</div></div>`;
        return html;
    }

    function renderTableReport(title, headers, rows, format) {
        if (format === 'csv') {
            return toCSV(title, headers, rows);
        }

        let html = `<div class="report-container">
            <h2>${escapeHtml(title)}</h2>
            <div class="report-dates">Período: ${getPeriodLabel}</div>
            <table class="table">
                <thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
                <tbody>`;
        rows.forEach(row => {
            html += `<tr>${row.map(c => `<td>${escapeHtml(String(c))}</td>`).join('')}</tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
    }

    function toCSV(title, headers, rows) {
        const esc = (v) => {
            const s = String(v || '');
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const lines = [
            `#${title}`,
            headers.map(esc).join(','),
            ...rows.map(r => r.map(esc).join(','))
        ];
        return lines.join('\n');
    }

    let getPeriodLabel = 'Personalizado';

    function setPeriodLabel(label) {
        getPeriodLabel = label;
    }

    function generate(reportType, report, format) {
        switch (reportType) {
            case 'summary': return generateSummary(report, format);
            case 'daily': return generateByDay(report, format);
            case 'weekly': return generateByWeek(report, format);
            case 'monthly': return generateByMonth(report, format);
            case 'category': return generateByCategory(report, format);
            case 'method': return generateByMethod(report, format);
            case 'commerce': return generateByCommerce(report, format);
            default: return generateSummary(report, format);
        }
    }

    function downloadReport(content, format, filename) {
        const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `reporte_${Date.now()}.${format === 'csv' ? 'csv' : 'html'}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const PERIOD_LABELS = {
        today: 'Hoy',
        yesterday: 'Ayer',
        thisWeek: 'Esta semana',
        thisMonth: 'Este mes',
        lastMonth: 'Mes anterior',
        last3Months: 'Últimos 3 meses',
        last6Months: 'Últimos 6 meses',
        thisYear: 'Este año',
        all: 'Todos los períodos'
    };

    function getPeriodText(period) {
        return PERIOD_LABELS[period] || period;
    }

    return { generate, downloadReport, getReportData, setPeriodLabel, getPeriodText };
})();
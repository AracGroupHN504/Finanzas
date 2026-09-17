const ImportExport = (() => {

    function downloadBlob(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function toCSV(items, headers, rowMapper) {
        const esc = (v) => {
            const s = String(v ?? '');
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const lines = [headers.map(esc).join(',')];
        items.forEach(item => {
            lines.push(rowMapper(item).map(esc).join(','));
        });
        return lines.join('\n');
    }

    async function exportJSON() {
        const data = await DB.exportAll();
        const json = JSON.stringify(data, null, 2);
        const filename = `finanzas_backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
        downloadBlob(json, 'application/json;charset=utf-8', filename);
        return filename;
    }

    function validateBackup(data) {
        const errors = [];
        if (!data || typeof data !== 'object') {
            errors.push('El archivo no es un objeto JSON válido');
            return errors;
        }
        const storeNames = Object.values(DB.STORES);
        const hasAny = storeNames.some(store => Array.isArray(data[store]));
        if (!hasAny) {
            errors.push('El archivo no contiene datos financieros reconocibles');
        }
        return errors;
    }

    async function importJSON(jsonText, mode = 'merge') {
        let data;
        try {
            data = JSON.parse(jsonText);
        } catch (e) {
            return { success: false, errors: ['JSON inválido: ' + e.message] };
        }

        const errors = validateBackup(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        try {
            await DB.importAll(data, mode === 'merge');
            return { success: true, message: 'Datos importados correctamente' };
        } catch (e) {
            return { success: false, errors: ['Error al importar: ' + e.message] };
        }
    }

    async function importJSONFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const result = await importJSON(e.target.result, 'merge');
                resolve(result);
            };
            reader.onerror = () => resolve({ success: false, errors: ['No se pudo leer el archivo'] });
            reader.readAsText(file);
        });
    }

    function exportMovementsCSV(movements) {
        const headers = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Subcategoría', 'Cuenta', 'Método de pago', 'Monto', 'Comercio', 'Notas'];
        const csv = toCSV(movements, headers, m => [
            m.date, m.type, m.description, m.category, m.subcategory || '',
            m.accountName || m.accountId || '', m.paymentMethod || '', m.amount,
            m.commerce || '', m.notes || ''
        ]);
        const filename = `movimientos_${new Date().toISOString().slice(0, 10)}.csv`;
        downloadBlob('\ufeff' + csv, 'text/csv;charset=utf-8', filename);
        return filename;
    }

    function exportAccountsCSV(accounts) {
        const headers = ['Nombre', 'Tipo', 'Saldo Inicial', 'Saldo Actual'];
        const csv = toCSV(accounts, headers, a => [a.name, a.type, a.initialBalance, a.currentBalance]);
        downloadBlob('\ufeff' + csv, 'text/csv;charset=utf-8', 'cuentas.csv');
    }

    function exportDebtsCSV(debts) {
        const headers = ['Nombre', 'Acreedor', 'Monto Original', 'Saldo Pendiente', 'Pago Mensual', 'Interés', 'Estado'];
        const csv = toCSV(debts, headers, d => [d.name, d.creditor, d.originalAmount, d.pendingAmount, d.monthlyPayment, d.interestRate, d.status]);
        downloadBlob('\ufeff' + csv, 'text/csv;charset=utf-8', 'deudas.csv');
    }

    async function exportFullCSV() {
        const movements = await DB.getAll(DB.STORES.MOVEMENTS);
        exportMovementsCSV(movements);
    }

    return { exportJSON, importJSON, importJSONFile, exportMovementsCSV, exportAccountsCSV, exportDebtsCSV, exportFullCSV };
})();
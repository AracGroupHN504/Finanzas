const DB = (() => {
    const DB_NAME = 'FinanzasPersonales';
    const DB_VERSION = 2;
    let db = null;

    const STORES = {
        MOVEMENTS: 'movements',
        ACCOUNTS: 'accounts',
        BUDGETS: 'budgets',
        RECURRING: 'recurring',
        DEBTS: 'debts',
        CREDIT_CARDS: 'creditCards',
        GOALS: 'goals',
        CATEGORIES: 'categories',
        PAYMENT_METHODS: 'paymentMethods',
        CONFIG: 'config'
    };

    function open() {
        return new Promise((resolve, reject) => {
            if (db) { resolve(db); return; }
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORES.MOVEMENTS)) {
                    const ms = d.createObjectStore(STORES.MOVEMENTS, { keyPath: 'id' });
                    ms.createIndex('date', 'date', { unique: false });
                    ms.createIndex('type', 'type', { unique: false });
                    ms.createIndex('category', 'category', { unique: false });
                    ms.createIndex('account', 'accountId', { unique: false });
                }
                if (!d.objectStoreNames.contains(STORES.ACCOUNTS)) {
                    d.createObjectStore(STORES.ACCOUNTS, { keyPath: 'id' });
                }
                if (!d.objectStoreNames.contains(STORES.BUDGETS)) {
                    const bs = d.createObjectStore(STORES.BUDGETS, { keyPath: 'id' });
                    bs.createIndex('category', 'category', { unique: false });
                }
                if (!d.objectStoreNames.contains(STORES.RECURRING)) {
                    d.createObjectStore(STORES.RECURRING, { keyPath: 'id' });
                }
                if (!d.objectStoreNames.contains(STORES.DEBTS)) {
                    d.createObjectStore(STORES.DEBTS, { keyPath: 'id' });
                }
                if (!d.objectStoreNames.contains(STORES.CREDIT_CARDS)) {
                    d.createObjectStore(STORES.CREDIT_CARDS, { keyPath: 'id' });
                }
                if (!d.objectStoreNames.contains(STORES.GOALS)) {
                    d.createObjectStore(STORES.GOALS, { keyPath: 'id' });
                }
                if (!d.objectStoreNames.contains(STORES.CATEGORIES)) {
                    d.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
                }
                if (!d.objectStoreNames.contains(STORES.PAYMENT_METHODS)) {
                    d.createObjectStore(STORES.PAYMENT_METHODS, { keyPath: 'id' });
                }
                if (!d.objectStoreNames.contains(STORES.CONFIG)) {
                    d.createObjectStore(STORES.CONFIG, { keyPath: 'key' });
                }
            };
            request.onsuccess = (e) => { db = e.target.result; resolve(db); };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    function tx(storeName, mode = 'readonly') {
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    function promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function add(storeName, data) {
        await open();
        return promisify(tx(storeName, 'readwrite').add(data));
    }

    async function put(storeName, data) {
        await open();
        return promisify(tx(storeName, 'readwrite').put(data));
    }

    async function get(storeName, id) {
        await open();
        return promisify(tx(storeName).get(id));
    }

    async function getAll(storeName) {
        await open();
        return promisify(tx(storeName).getAll());
    }

    async function remove(storeName, id) {
        await open();
        return promisify(tx(storeName, 'readwrite').delete(id));
    }

    async function clear(storeName) {
        await open();
        return promisify(tx(storeName, 'readwrite').clear());
    }

    async function getByIndex(storeName, indexName, value) {
        await open();
        const store = tx(storeName);
        const index = store.index(indexName);
        return promisify(index.getAll(value));
    }

    async function clearAll() {
        await open();
        const storeNames = Object.values(STORES);
        for (const name of storeNames) {
            await clear(name);
        }
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    async function exportAll() {
        await open();
        const data = {};
        for (const [key, storeName] of Object.entries(STORES)) {
            data[storeName] = await getAll(storeName);
        }
        data._exportDate = new Date().toISOString();
        data._version = DB_VERSION;
        return data;
    }

    async function importAll(data, merge = false) {
        await open();
        if (!merge) await clearAll();
        for (const [storeName, items] of Object.entries(data)) {
            if (storeName.startsWith('_') || !items || !Array.isArray(items)) continue;
            if (!Object.values(STORES).includes(storeName)) continue;
            for (const item of items) {
                await put(storeName, item);
            }
        }
    }

    async function count(storeName) {
        await open();
        return promisify(tx(storeName).count());
    }

    return {
        open, add, put, get, getAll, remove, clear, getByIndex,
        clearAll, generateId, exportAll, importAll, count, STORES
    };
})();

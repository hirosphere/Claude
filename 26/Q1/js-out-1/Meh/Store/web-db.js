const log = console.log;
export class IDB {
    schema;
    stores = new Map;
    get core() { return this.#_core; }
    constructor(schema) {
        this.schema = schema;
    }
    init() {
        try {
            const oreq = indexedDB.open(this.schema.name, this.schema.version);
            oreq.onsuccess = ev => {
                this.#_core = oreq.result;
                this.#_available = true;
                this.on_init();
                this.#_inits.forEach(oper => oper());
            };
            oreq.onupgradeneeded = ev => {
                log("upgrade", ev);
                make_store(oreq.result, this.stores);
            };
            oreq.onerror = ev => {
                log("IDB init onerror", ev);
            };
        }
        catch (err) {
            log(err);
        }
    }
    set inits(oper) {
        if (this.#_available)
            oper();
        else
            this.#_inits.push(oper);
    }
    #_core;
    #_available = false;
    #_inits = [];
    on_init() { }
}
const make_store = (db, stores) => {
    stores.forEach(store => {
        if (db.objectStoreNames.contains(store.name) == false) {
            db.createObjectStore(store.name, store.param);
            log("IDB : ストア作成", store.name);
        }
    });
};
(function (IDB) {
    class Store {
        db;
        name;
        param;
        constructor(db, name, param) {
            this.db = db;
            this.name = name;
            this.param = param;
            db.stores.set(name, this);
        }
        add(value, tr) {
            const db = this.db.core;
            if (!db)
                return;
            tr ??= db.transaction([this.name], "readwrite");
            const req = tr.objectStore(this.name).add(value);
            req.onsuccess = () => log(this.name, "add", value);
        }
        set(value, tr) {
            const db = this.db.core;
            if (!db)
                return false;
            tr ??= db.transaction([this.name], "readwrite");
            const req = tr.objectStore(this.name).put(value);
            req.onsuccess = () => log(this.name, "set", value);
            return true;
        }
        async get(key, tr) {
            const f = (resolve, reject) => {
                try {
                    if (!this.db.core) {
                        resolve(undefined);
                        return;
                    }
                    tr ??= this.db.core.transaction([this.name], "readonly");
                    if (!tr) {
                        log("IDB.Store get", "transaction がないよ。");
                        resolve(undefined);
                        return;
                    }
                    const st = tr.objectStore(this.name);
                    const g_req = st.get(key);
                    g_req.onsuccess = ev => {
                        log("IDB.Store get onsuccess", g_req.result);
                        resolve(g_req.result);
                    };
                    g_req.onerror = ev => {
                        log("IDB.Store get", "get req エラーだよ。");
                        resolve(undefined);
                    };
                }
                catch (exc) {
                    log("IDB.Store get", this.db.schema.name, this.name, exc);
                    resolve(undefined);
                }
            };
            return new Promise(f);
        }
    }
    IDB.Store = Store;
})(IDB || (IDB = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLWRiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMtc3JjL01laC9TdG9yZS93ZWItZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBRTtBQWN6QixNQUFNLE9BQU8sR0FBRztJQUtlO0lBSGQsTUFBTSxHQUFHLElBQUksR0FBOEMsQ0FBRTtJQUM3RSxJQUFXLElBQUksS0FBZ0MsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBQztJQUVyRSxZQUE4QixNQUFpQjtRQUFqQixXQUFNLEdBQU4sTUFBTSxDQUFXO0lBQzlDLENBQUM7SUFFSyxJQUFJO1FBRVYsSUFDQSxDQUFDO1lBQ0EsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBRSxDQUFFO1lBRXhFLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBRXJCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBRTtnQkFDM0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUU7Z0JBRXpCLElBQUksQ0FBQyxPQUFPLEVBQUcsQ0FBRTtnQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUcsQ0FBRSxDQUFFO1lBQzNDLENBQUMsQ0FBQTtZQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBRTNCLEdBQUcsQ0FBRyxTQUFTLEVBQUcsRUFBRSxDQUFFLENBQUU7Z0JBQ3hCLFVBQVUsQ0FBRyxJQUFJLENBQUMsTUFBTSxFQUFHLElBQUksQ0FBQyxNQUFNLENBQUUsQ0FBRTtZQUMzQyxDQUFDLENBQUE7WUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUs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
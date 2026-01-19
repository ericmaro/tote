import { load } from "@tauri-apps/plugin-store";

// Initialize store
const STORE_PATH = "store.bin";

/**
 * Generic store utility for Tote
 */
export async function setStorage(key: string, value: any) {
    const store = await load(STORE_PATH, { autoSave: true, defaults: {} });
    await store.set(key, value);
    await store.save();
}

export async function getStorage<T>(key: string): Promise<T | null> {
    const store = await load(STORE_PATH, { autoSave: true, defaults: {} });
    const value = await store.get<T>(key);
    return (value as T) ?? null;
}

export async function clearStorage() {
    const store = await load(STORE_PATH, { autoSave: true, defaults: {} });
    await store.clear();
    await store.save();
}

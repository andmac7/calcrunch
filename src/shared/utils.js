export function saveValue(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
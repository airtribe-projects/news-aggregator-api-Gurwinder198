'use strict';
class Cache {
  constructor() { this.store = new Map(); }

  set(key, value, ttlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) return undefined;
    return entry.value;
  }

  getStale(key) {
    const entry = this.store.get(key);
    return entry ? entry.value : undefined;
  }

  clear() { this.store.clear(); }
}

module.exports = { Cache, cache: new Cache() };

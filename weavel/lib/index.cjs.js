'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var weavelCore = require('weavel-core');

// Methods partially borrowed from quirksmode.org/js/cookies.html
const cookieStore = {
  getItem(key) {
    try {
      const nameEQ = key + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
    } catch (err) {}
    return null;
  },
  setItem(key, value) {
    try {
      const cdomain = "",
        expires = "",
        secure = "";
      const new_cookie_val = key + "=" + encodeURIComponent(value) + expires + "; path=/" + cdomain + secure;
      document.cookie = new_cookie_val;
    } catch (err) {
      return;
    }
  },
  removeItem(name) {
    try {
      cookieStore.setItem(name, "");
    } catch (err) {
      return;
    }
  },
  clear() {
    document.cookie = "";
  },
  getAllKeys() {
    const ca = document.cookie.split(";");
    const keys = [];
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1, c.length);
      }
      keys.push(c.split("=")[0]);
    }
    return keys;
  }
};
const createStorageLike = store => {
  return {
    getItem(key) {
      return store.getItem(key);
    },
    setItem(key, value) {
      store.setItem(key, value);
    },
    removeItem(key) {
      store.removeItem(key);
    },
    clear() {
      store.clear();
    },
    getAllKeys() {
      const keys = [];
      for (const key in localStorage) {
        keys.push(key);
      }
      return keys;
    }
  };
};
const checkStoreIsSupported = (storage, key = "__mplssupport__") => {
  if (!window) {
    return false;
  }
  try {
    const val = "xyz";
    storage.setItem(key, val);
    if (storage.getItem(key) !== val) {
      return false;
    }
    storage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
};
let localStore = undefined;
let sessionStore = undefined;
const createMemoryStorage = () => {
  const _cache = {};
  const store = {
    getItem(key) {
      return _cache[key];
    },
    setItem(key, value) {
      _cache[key] = value !== null ? value : undefined;
    },
    removeItem(key) {
      delete _cache[key];
    },
    clear() {
      for (const key in _cache) {
        delete _cache[key];
      }
    },
    getAllKeys() {
      const keys = [];
      for (const key in _cache) {
        keys.push(key);
      }
      return keys;
    }
  };
  return store;
};
const getStorage = (type, window) => {
  if (typeof window !== undefined && window) {
    if (!localStorage) {
      const _localStore = createStorageLike(window.localStorage);
      localStore = checkStoreIsSupported(_localStore) ? _localStore : undefined;
    }
    if (!sessionStore) {
      const _sessionStore = createStorageLike(window.sessionStorage);
      sessionStore = checkStoreIsSupported(_sessionStore) ? _sessionStore : undefined;
    }
  }
  switch (type) {
    case "cookie":
      return cookieStore || localStore || sessionStore || createMemoryStorage();
    case "localStorage":
      return localStore || sessionStore || createMemoryStorage();
    case "sessionStorage":
      return sessionStore || createMemoryStorage();
    case "memory":
      return createMemoryStorage();
    default:
      return createMemoryStorage();
  }
};

var version = "0.1.0";

class Weavel extends weavelCore.WeavelCore {
  constructor(params) {
    const weavelConfig = weavelCore.utils.configWeavelSDK(params);
    super(weavelConfig);
    if (typeof window !== "undefined" && "Deno" in window === false) {
      this._storageKey = params?.persistence_name ? `lf_${params.persistence_name}` : `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage(params?.persistence || "localStorage", window);
    } else {
      this._storageKey = `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage("memory", undefined);
    }
  }
  getPersistedProperty(key) {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }
    return this._storageCache[key];
  }
  setPersistedProperty(key, value) {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }
    if (value === null) {
      delete this._storageCache[key];
    } else {
      this._storageCache[key] = value;
    }
    this._storage.setItem(this._storageKey, JSON.stringify(this._storageCache));
  }
  fetch(url, options) {
    return fetch(url, options);
  }
  getLibraryId() {
    return "weavel";
  }
  getLibraryVersion() {
    return version;
  }
  getCustomUserAgent() {
    return;
  }
}
class WeavelWeb extends weavelCore.WeavelWebStateless {
  constructor(params) {
    const weavelConfig = weavelCore.utils.configWeavelSDK(params);
    super(weavelConfig);
    if (typeof window !== "undefined") {
      this._storageKey = params?.persistence_name ? `lf_${params.persistence_name}` : `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage(params?.persistence || "localStorage", window);
    } else {
      this._storageKey = `lf_${weavelConfig.apiKey}_weavel`;
      this._storage = getStorage("memory", undefined);
    }
  }
  getPersistedProperty(key) {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }
    return this._storageCache[key];
  }
  setPersistedProperty(key, value) {
    if (!this._storageCache) {
      this._storageCache = JSON.parse(this._storage.getItem(this._storageKey) || "{}") || {};
    }
    if (value === null) {
      delete this._storageCache[key];
    } else {
      this._storageCache[key] = value;
    }
    this._storage.setItem(this._storageKey, JSON.stringify(this._storageCache));
  }
  fetch(url, options) {
    return fetch(url, options);
  }
  getLibraryId() {
    return "weavel-frontend";
  }
  getLibraryVersion() {
    return version;
  }
  getCustomUserAgent() {
    return;
  }
}

exports.Weavel = Weavel;
exports.WeavelWeb = WeavelWeb;
exports.default = Weavel;
//# sourceMappingURL=index.cjs.js.map

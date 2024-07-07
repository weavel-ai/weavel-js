import { type WeavelOptions } from "./types";

export type WeavelStorage = {
  getItem: (key: string) => string | null | undefined;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  getAllKeys: () => readonly string[];
};

// Methods partially borrowed from quirksmode.org/js/cookies.html
export const cookieStore: WeavelStorage = {
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

  setItem(key: string, value: string) {
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
  },
};

const createStorageLike = (store: any): WeavelStorage => {
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
    },
  };
};

const checkStoreIsSupported = (storage: WeavelStorage, key = "__mplssupport__"): boolean => {
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

let localStore: WeavelStorage | undefined = undefined;
let sessionStore: WeavelStorage | undefined = undefined;

const createMemoryStorage = (): WeavelStorage => {
  const _cache: { [key: string]: any | undefined } = {};

  const store: WeavelStorage = {
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
    },
  };
  return store;
};

export const getStorage = (type: WeavelOptions["persistence"], window: Window | undefined): WeavelStorage => {
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

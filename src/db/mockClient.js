// Mock Supabase client using localStorage for local development and offline testing
// Activated when real Supabase credentials are not provided or unreachable

const STORAGE_KEYS = {
  SESSION: "trimrr_mock_session",
  USERS: "trimrr_mock_users",
  URLS: "trimrr_mock_urls",
  CLICKS: "trimrr_mock_clicks",
  STORAGE: "trimrr_mock_storage",
  INIT: "trimrr_mock_init",
};

const initMockData = () => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEYS.INIT)) return;

  const defaultUser = {
    id: "mock-user-12345",
    email: "demo@trimrr.in",
    role: "authenticated",
    user_metadata: {
      name: "Demo User",
      profile_pic: "/logo.png",
    },
  };

  const defaultUrls = [
    {
      id: 1,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      original_url: "https://github.com",
      short_url: "gitdemo",
      custom_url: "git",
      user_id: "mock-user-12345",
      title: "GitHub Homepage",
      qr: "/qr.png",
      is_active: true,
      expires_at: null,
      max_clicks: null,
      password_hash: null,
      tags: ["code", "developer"],
      notes: "Main official repository.",
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      original_url: "https://news.ycombinator.com",
      short_url: "hackernews",
      custom_url: "hn",
      user_id: "mock-user-12345",
      title: "Hacker News",
      qr: "/qr.png",
      is_active: true,
      expires_at: null,
      max_clicks: 100,
      password_hash: null,
      tags: ["tech", "community"],
      notes: "Daily technology discussion board.",
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultClicks = [
    {
      id: 1,
      url_id: 1,
      city: "San Francisco",
      country: "United States",
      device: "desktop",
      browser: "Chrome",
      os: "macOS",
      referrer: "twitter.com",
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 2,
      url_id: 1,
      city: "London",
      country: "United Kingdom",
      device: "mobile",
      browser: "Safari",
      os: "iOS",
      referrer: "linkedin.com",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 3,
      url_id: 1,
      city: "Bengaluru",
      country: "India",
      device: "desktop",
      browser: "Firefox",
      os: "Linux",
      referrer: "Direct",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 4,
      url_id: 1,
      city: "Tokyo",
      country: "Japan",
      device: "mobile",
      browser: "Chrome",
      os: "Android",
      referrer: "github.com",
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 5,
      url_id: 1,
      city: "Toronto",
      country: "Canada",
      device: "tablet",
      browser: "Safari",
      os: "iPadOS",
      referrer: "reddit.com",
      created_at: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultUser]));
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({user: defaultUser}));
  localStorage.setItem(STORAGE_KEYS.URLS, JSON.stringify(defaultUrls));
  localStorage.setItem(STORAGE_KEYS.CLICKS, JSON.stringify(defaultClicks));
  localStorage.setItem(STORAGE_KEYS.INIT, "true");
};

initMockData();

const getItems = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setItems = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("Mock storage quota or error:", err);
  }
};

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.key = table === "urls" ? STORAGE_KEYS.URLS : STORAGE_KEYS.CLICKS;
    this.filters = [];
    this.isSingle = false;
    this.sortField = null;
    this.sortAsc = true;
    this.updatePayload = null;
  }

  select() {
    return this;
  }

  eq(field, value) {
    this.filters.push((item) => String(item[field]) === String(value));
    return this;
  }

  in(field, values) {
    const stringValues = (values || []).map(String);
    this.filters.push((item) => stringValues.includes(String(item[field])));
    return this;
  }

  or(expression) {
    // Expression format: "short_url.eq.xyz,custom_url.eq.xyz"
    const clauses = expression.split(",").map((c) => {
      const parts = c.split(".eq.");
      return {field: parts[0]?.trim(), value: parts[1]?.trim()};
    });
    this.filters.push((item) =>
      clauses.some((c) => String(item[c.field]) === String(c.value))
    );
    return this;
  }

  order(field, options = {}) {
    this.sortField = field;
    this.sortAsc = options.ascending !== false;
    return this;
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  async execute() {
    const items = getItems(this.key);
    let results = items.filter((item) =>
      this.filters.every((fn) => fn(item))
    );

    if (this.sortField) {
      results.sort((a, b) => {
        const valA = a[this.sortField];
        const valB = b[this.sortField];
        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
    }

    if (this.isSingle) {
      if (results.length === 0) {
        return {data: null, error: {code: "PGRST116", message: "Row not found"}};
      }
      return {data: results[0], error: null};
    }

    return {data: results, error: null};
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  async insert(rows) {
    const list = Array.isArray(rows) ? rows : [rows];
    const current = getItems(this.key);
    const inserted = list.map((row) => ({
      id: Date.now() + Math.floor(Math.random() * 1000),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      ...row,
    }));
    current.push(...inserted);
    setItems(this.key, current);
    return {
      select: async () => ({data: inserted, error: null}),
      data: inserted,
      error: null,
    };
  }

  update(payload) {
    this.updatePayload = payload;
    return {
      eq: (field, value) => {
        const current = getItems(this.key);
        const updated = [];
        const modifiedList = current.map((item) => {
          if (String(item[field]) === String(value)) {
            const newItem = {...item, ...this.updatePayload, updated_at: new Date().toISOString()};
            updated.push(newItem);
            return newItem;
          }
          return item;
        });
        setItems(this.key, modifiedList);
        return {
          select: async () => ({data: updated, error: null}),
          data: updated,
          error: null,
        };
      },
    };
  }

  delete() {
    return {
      eq: (field, value) => {
        const current = getItems(this.key);
        const filtered = current.filter(
          (item) => String(item[field]) !== String(value)
        );
        setItems(this.key, filtered);
        return Promise.resolve({data: null, error: null});
      },
    };
  }
}

export const mockSupabase = {
  from(table) {
    return new QueryBuilder(table);
  },

  rpc(functionName, params = {}) {
    if (functionName === "verify_link_password") {
      const urls = getItems(STORAGE_KEYS.URLS);
      const url = urls.find((u) => String(u.id) === String(params.p_url_id));
      if (!url || !url.password_hash) {
        return Promise.resolve({data: true, error: null});
      }
      const match = url.password_hash === params.p_password;
      return Promise.resolve({data: match, error: null});
    }
    return Promise.resolve({data: null, error: null});
  },

  storage: {
    from(bucket) {
      return {
        upload: async (fileName, file) => {
          let url = "/qr.png";
          if (file instanceof Blob || file instanceof File) {
            url = URL.createObjectURL(file);
          }
          const currentStorage = getItems(STORAGE_KEYS.STORAGE);
          currentStorage.push({bucket, fileName, url});
          setItems(STORAGE_KEYS.STORAGE, currentStorage);
          return {data: {path: fileName}, error: null};
        },
      };
    },
  },

  auth: {
    async signInWithPassword({email}) {
      const users = getItems(STORAGE_KEYS.USERS);
      let user = users.find((u) => u.email === email);
      if (!user) {
        user = {
          id: `user-${Date.now()}`,
          email,
          role: "authenticated",
          user_metadata: {
            name: email.split("@")[0],
            profile_pic: "/logo.png",
          },
        };
        users.push(user);
        setItems(STORAGE_KEYS.USERS, users);
      }
      const session = {user};
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      return {data: {user, session}, error: null};
    },

    async signUp({email, options}) {
      const users = getItems(STORAGE_KEYS.USERS);
      const user = {
        id: `user-${Date.now()}`,
        email,
        role: "authenticated",
        user_metadata: {
          name: options?.data?.name || email.split("@")[0],
          profile_pic: options?.data?.profile_pic || "/logo.png",
        },
      };
      users.push(user);
      setItems(STORAGE_KEYS.USERS, users);
      const session = {user};
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      return {data: {user, session}, error: null};
    },

    async getSession() {
      try {
        const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        return {data: {session}, error: null};
      } catch {
        return {data: {session: null}, error: null};
      }
    },

    async signOut() {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return {error: null};
    },
  },
};

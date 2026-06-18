const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "gm_jewel_marine_token";

const entityNames = [
  "Brand",
  "Category",
  "Inquiry",
  "Listing",
  "Model",
  "News",
  "SiteSettings",
];

const tokenStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function request(path, options = {}) {
  const token = tokenStore.get();
  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const preview = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
      throw Object.assign(new Error(preview || "Risposta API non valida."), {
        status: response.status,
        data: text,
      });
    }
  }

  if (!response.ok) {
    const message = data?.message || Object.values(data?.errors || {})?.flat()?.[0] || "Errore API";
    throw Object.assign(new Error(message), { status: response.status, data });
  }

  return data;
}

function queryString(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

function entityClient(entity) {
  return {
    list(sort, limit) {
      return request(`/entities/${entity}${queryString({ sort, limit })}`);
    },
    filter(filters = {}, sort, limit) {
      return request(`/entities/${entity}${queryString({ q: filters, sort, limit })}`);
    },
    get(id) {
      return request(`/entities/${entity}/${id}`);
    },
    create(data) {
      return request(`/entities/${entity}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/entities/${entity}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return request(`/entities/${entity}/${id}`, {
        method: "DELETE",
      });
    },
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function imageFileToPayload(file) {
  if (file.size <= 800 * 1024) {
    return {
      filename: file.name,
      mime_type: file.type,
      image_data: await fileToDataUrl(file),
    };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = objectUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    let { width, height } = image;
    let maxSide = 1600;
    let quality = 0.82;
    let blob = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const scale = Math.min(1, maxSide / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      blob = await canvasToBlob(canvas, "image/jpeg", quality);
      if (blob && blob.size <= 650 * 1024) {
        break;
      }

      maxSide = Math.round(maxSide * 0.8);
      quality = Math.max(0.62, quality - 0.08);
    }

    if (!blob) {
      throw new Error("Impossibile preparare l'immagine per l'upload.");
    }

    const compressedFile = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, "") + ".jpg",
      { type: "image/jpeg" },
    );

    return {
      filename: compressedFile.name,
      mime_type: compressedFile.type,
      image_data: await fileToDataUrl(compressedFile),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const entities = entityNames.reduce((acc, entity) => {
  acc[entity] = entityClient(entity);
  return acc;
}, {});

export const api = {
  entities,
  users: {
    list() {
      return request("/users");
    },
    create(data) {
      return request("/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return request(`/users/${id}`, {
        method: "DELETE",
      });
    },
  },
  auth: {
    async loginViaEmailPassword(email, password) {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      tokenStore.set(data.access_token);
      return data;
    },
    async register({ name, email, password }) {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      tokenStore.set(data.access_token);
      return data;
    },
    async me() {
      return request("/auth/me");
    },
    async logout(redirectTo) {
      try {
        await request("/auth/logout", { method: "POST" });
      } finally {
        tokenStore.clear();
        if (redirectTo) {
          window.location.href = redirectTo;
        }
      }
    },
    setToken(token) {
      tokenStore.set(token);
    },
    getToken() {
      return tokenStore.get();
    },
    redirectToLogin() {
      window.location.href = "/login";
    },
    loginWithProvider() {
      throw new Error("Login con provider esterni non configurato.");
    },
    resetPasswordRequest() {
      throw new Error("Reset password non ancora configurato.");
    },
    resetPassword() {
      throw new Error("Reset password non ancora configurato.");
    },
    verifyOtp() {
      return Promise.resolve({ access_token: tokenStore.get() });
    },
    resendOtp() {
      return Promise.resolve({ ok: true });
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const payload = await imageFileToPayload(file);
        return request("/upload", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      },
    },
  },
};


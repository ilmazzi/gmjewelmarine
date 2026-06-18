import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Pencil, Trash2, Check, Users } from "lucide-react";

const EMPTY_USER = { name: "", email: "", password: "", role: "admin" };

const inputClass =
  "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all";

function UserForm({ user, onSave, onCancel, isNew }) {
  const [form, setForm] = useState(
    user || { ...EMPTY_USER, password: "" },
  );

  const canSave =
    form.name.trim() &&
    form.email.trim() &&
    (isNew ? form.password.length >= 8 : true);

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Nome *
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Nome completo"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Email *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="email@esempio.it"
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Password {isNew ? "*" : "(lascia vuoto per non cambiare)"}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder={isNew ? "Minimo 8 caratteri" : "Nuova password"}
            autoComplete={isNew ? "new-password" : "off"}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Ruolo
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className={inputClass}
          >
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(form)}
          disabled={!canSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Check className="w-4 h-4" /> Salva
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-lg text-sm transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.users
      .list()
      .then(setUsers)
      .catch((err) => {
        if (err.status === 401) {
          api.auth.logout("/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (data) => {
    setError(null);
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role || "admin",
      };

      if (data.id) {
        if (data.password?.length >= 8) {
          payload.password = data.password;
        }
        const result = await api.users.update(data.id, payload);
        if (result.access_token) {
          api.auth.setToken(result.access_token);
        }
      } else {
        payload.password = data.password;
        await api.users.create(payload);
      }

      setEditing(null);
      setShowNew(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const del = async (id) => {
    if (id === currentUser?.id) {
      alert("Non puoi eliminare il tuo account mentre sei connesso.");
      return;
    }
    if (!confirm("Eliminare questo utente?")) return;

    setError(null);
    try {
      await api.users.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Utenti</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gestisci gli account con accesso al pannello admin.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuovo utente
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {showNew && (
        <UserForm isNew onSave={save} onCancel={() => setShowNew(false)} />
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
            Nessun utente trovato.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((user) => (
              <div key={user.id}>
                {editing?.id === user.id ? (
                  <div className="p-4">
                    <UserForm
                      user={{ ...editing, password: "" }}
                      onSave={(data) => save({ ...data, id: user.id })}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                        {user.id === currentUser?.id && (
                          <span className="ml-2 text-xs font-normal text-brand-600">(tu)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full capitalize">
                      {user.role}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing({ ...user })}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => del(user.id)}
                        disabled={user.id === currentUser?.id}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

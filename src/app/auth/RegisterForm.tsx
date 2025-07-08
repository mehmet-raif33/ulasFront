"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login, setError, setLoading } from "../redux/sliceses/authSlices";
import { registerApi } from "../api";

const RegisterForm: React.FC = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoadingState] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    dispatch(setLoading(true));
    setLoadingState(true);
    try {
      const data = await registerApi({ username, email, password, role });
      localStorage.setItem("token", data.token);
      dispatch(
        login({
          id: data.user.id,
          email: data.user.email,
          name: data.user.username || data.user.name || "",
          role: data.user.role === "admin" ? "admin" : "user",
        })
      );
    } catch (err: unknown) {
      let message = "Bir hata oluştu";
      if (typeof err === "object" && err && "message" in err) {
        message = (err as { message?: string }).message || message;
      } else if (typeof err === "string") {
        message = err;
      }
      setFormError(message);
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
      setLoadingState(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Kayıt Ol</h2>
      <div>
        <label className="block mb-1 font-medium">Kullanıcı Adı</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Şifre</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Rol</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="user">Kullanıcı</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {formError && <div className="text-red-600 text-sm">{formError}</div>}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
      </button>
    </form>
  );
};

export default RegisterForm; 
// Backend Auth API yardımcı fonksiyonları

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function loginApi({ username, password }: { username: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Giriş başarısız');
  }
  return res.json();  
}

export async function registerApi({ username, email, password, role }: { username: string; email: string; password: string; role?: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Kayıt başarısız');
  }
  return res.json();
}

export async function getProfileApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Profil alınamadı');
  }
  return res.json();
} 
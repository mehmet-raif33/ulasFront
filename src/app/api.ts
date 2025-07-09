let API_BASE_URL = '';

// Environment variables'dan API URL'ini al
if (process.env.NODE_ENV === 'production') {
  // Production ortamında Railway server'ını kullan
  API_BASE_URL = process.env.SERVER_API1 || '';
} else {
  // Development ortamında local server'ı kullan
  API_BASE_URL = process.env.SERVER_API || '';
}

// Fallback için güvenlik kontrolü
if (!API_BASE_URL) {
  console.warn('API_BASE_URL is not set, using default localhost');
  API_BASE_URL = 'http://localhost:5000';
}

console.log('API_BASE_URL:', API_BASE_URL);

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
  console.log('Register API called with:', { username, email, role });
  console.log('API URL:', `${API_BASE_URL}/auth/register`);
  
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role }),
  });
  
  console.log('Response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.log('Error response:', errorText);
    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || 'Kayıt başarısız');
    } catch (e) {
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
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

export async function changePasswordApi(token: string, { oldPassword, newPassword }: { oldPassword: string; newPassword: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Şifre değiştirme başarısız');
  }
  return res.json();
}

export async function getUserApi(token: string, userId: string) {
  const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Kullanıcı bilgisi alınamadı');
  }
  return res.json();
}

// Health check endpoint
export async function healthCheckApi() {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Health check başarısız');
  }
  return res.json();
} 
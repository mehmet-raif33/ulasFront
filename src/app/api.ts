import { broadcastTokenExpired } from './utils/broadcastChannel';

let API_BASE_URL = '';

// Environment variables'dan API URL'ini al
if (process.env.NODE_ENV === 'production') {
  // Production ortamında Railway server'ını kullan
  API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API1 || 'https://ulasserver-production.up.railway.app';
} else {
  // Development ortamında local server'ı kullan
  API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API || 'http://localhost:5000';
} 

// Fallback için güvenlik kontrolü - protokolü garanti et
if (!API_BASE_URL || !API_BASE_URL.startsWith('http')) {
  console.warn('API_BASE_URL is not set or invalid, using default localhost');
  API_BASE_URL = 'http://localhost:5000';
}

console.log('=== API DEBUG INFO ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SERVER_API:', process.env.NEXT_PUBLIC_SERVER_API);
console.log('NEXT_PUBLIC_SERVER_API1:', process.env.NEXT_PUBLIC_SERVER_API1);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('========================');

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



export async function getProfileApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    // Token expired durumunda diğer sekmelere bildir
    if (res.status === 401) {
      broadcastTokenExpired();
    }
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

export async function getUsersApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/user`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    // Token expired durumunda diğer sekmelere bildir
    if (res.status === 401) {
      broadcastTokenExpired();
    }
    throw new Error(error.message || 'Kullanıcılar alınamadı');
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

// Transaction Categories API
export async function getTransactionCategoriesApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/transaction-categories`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Kategoriler alınamadı');
  }
  const data = await res.json();
  return data;
}

export async function createTransactionCategoryApi(token: string, data: { name: string }) {
  const res = await fetch(`${API_BASE_URL}/transaction-categories`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Kategori oluşturulamadı');
  }
  return res.json();
}

export async function updateTransactionCategoryApi(token: string, id: string, data: { name: string }) {
  const res = await fetch(`${API_BASE_URL}/transaction-categories/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Kategori güncellenemedi');
  }
  return res.json();
}

export async function deleteTransactionCategoryApi(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/transaction-categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Kategori silinemedi');
  }
  return res.json();
}

// Vehicles API
export async function getVehiclesApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/vehicles`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Araçlar alınamadı');
  }
  const data = await res.json();
  return data;
}

export async function getVehicleApi(token: string, plate: string) {
  const res = await fetch(`${API_BASE_URL}/vehicles/${plate}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Araç bilgisi alınamadı');
  }
  return res.json();
}

export async function createVehicleApi(token: string, data: { 
  plate: string; 
  brand: string; 
  model: string; 
  year: number; 
  color: string; 
}) {
  const res = await fetch(`${API_BASE_URL}/vehicles`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Araç oluşturulamadı');
  }
  return res.json();
}

export async function updateVehicleApi(token: string, plate: string, data: { 
  brand?: string; 
  model?: string; 
  year?: number; 
  color?: string; 
}) {
  const res = await fetch(`${API_BASE_URL}/vehicles/${plate}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Araç güncellenemedi');
  }
  return res.json();
}

export async function deleteVehicleApi(token: string, plate: string) {
  const res = await fetch(`${API_BASE_URL}/vehicles/${plate}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Araç silinemedi');
  }
  return res.json();
}

// Personnel API
export async function getPersonnelApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/personnel`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Personel alınamadı');
  }
  const data = await res.json();
  return data;
}

export async function getPersonnelByIdApi(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/personnel/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Personel bilgisi alınamadı');
  }
  return res.json();
}

export async function createPersonnelApi(token: string, data: { 
  full_name: string; 
  username?: string; 
  email: string; 
  phone: string; 
  hire_date: string; 
  status: string; 
  notes?: string;
  password?: string;
  role?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/personnel`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Personel oluşturulamadı');
  }
  return res.json();
}

export async function updatePersonnelApi(token: string, id: string, data: { 
  name?: string; 
  surname?: string; 
  email?: string; 
  phone?: string; 
  position?: string; 
  department?: string; 
  hire_date?: string; 
  salary?: number; 
  status?: string; 
  notes?: string;
  is_active?: boolean 
}) {
  const res = await fetch(`${API_BASE_URL}/personnel/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Personel güncellenemedi');
  }
  return res.json();
}

export async function deletePersonnelApi(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/personnel/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Personel silinemedi');
  }
  return res.json();
}

// Transactions API
export async function getTransactionsApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'İşlemler alınamadı');
  }
  return res.json();
}

export async function getTransactionApi(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'İşlem bilgisi alınamadı');
  }
  return res.json();
}

export async function createTransactionApi(token: string, data: { 
  vehicle_id: string; 
  category_id: string; 
  amount: number; 
  description: string; 
  transaction_date: string; 
}) {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'İşlem oluşturulamadı');
  }
  return res.json();
}

export async function updateTransactionApi(token: string, id: string, data: { 
  vehicle_id?: string; 
  category_id?: string; 
  amount?: number; 
  description?: string; 
  transaction_date?: string; 
}) {
  const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'İşlem güncellenemedi');
  }
  return res.json();
}

export async function deleteTransactionApi(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'İşlem silinemedi');
  }
  return res.json();
}

// Get transactions by vehicle
export async function getTransactionsByVehicleApi(token: string, plate: string) {
  const res = await fetch(`${API_BASE_URL}/transactions/by-plate/${plate}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Araç işlemleri alınamadı');
  }
  return res.json();
}

// Get transactions by category
export async function getTransactionsByCategoryApi(token: string, categoryId: string) {
  const res = await fetch(`${API_BASE_URL}/transactions/category/${categoryId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Kategori işlemleri alınamadı');
  }
  return res.json();
} 

export async function getActivitiesApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/activities`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Etkinlikler alınamadı');
  }
  const data = await res.json();
  return data.data || data; // Backend'den gelen veriyi düzgün şekilde al
} 

export async function getVehiclesCountApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/vehicles/stats/overview`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Araç sayısı alınamadı');
  }
  const data = await res.json();
  return data.stats?.total_vehicles || 0;
}

export async function getPersonnelCountApi(token: string) {
  const res = await fetch(`${API_BASE_URL}/personnel/stats/overview`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Personel sayısı alınamadı');
  }
  const data = await res.json();
  return data.stats?.active_personnel || 0;
}

export async function getTransactionsStatsApi(token: string, start_date?: string, end_date?: string) {
  let url = `${API_BASE_URL}/transactions/stats/overview`;
  if (start_date && end_date) {
    url += `?start_date=${start_date}&end_date=${end_date}`;
  }
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'İşlem istatistikleri alınamadı');
  }
  const data = await res.json();
  return data.stats;
} 
# Supabase Backend Organizasyonu

Bu klasör, Ulas projesinin Supabase backend kısmını organize eder ve yönetir.

## Klasör Yapısı

```
supabase/
├── migrations/          # Veritabanı şema değişiklikleri
│   ├── 000_complete_setup.sql    # Ana setup dosyası (tüm migration'ları çalıştırır)
│   └── 001_initial_schema.sql    # İlk şema oluşturma
├── functions/           # PostgreSQL fonksiyonları
│   ├── update_updated_at_column.sql
│   └── create-test-function.sql
├── triggers/            # Veritabanı trigger'ları
│   └── updated_at_triggers.sql
├── policies/            # Row Level Security (RLS) politikaları
│   └── rls_policies.sql
├── auth/                # Kimlik doğrulama ayarları
│   ├── auth_triggers.sql
│   └── google_provider.sql
├── seed-data/           # Örnek veriler
│   └── sample_data.sql
└── fixes/               # Geçici düzeltme dosyaları
    ├── fix-all-issues.sql
    ├── fix-rls-policies.sql
    ├── fix-vehicle-schema.sql
    ├── add-vehicle-columns.sql
    ├── disable-rls.sql
    └── disable-rls-temp.sql
```

## Kullanım

### Yeni Proje Kurulumu
```sql
-- Tüm migration'ları çalıştırmak için:
\i 'supabase/migrations/000_complete_setup.sql'
```

### Tekil Dosyaları Çalıştırma
```sql
-- Sadece şema oluşturmak için:
\i 'supabase/migrations/001_initial_schema.sql'

-- Sadece RLS politikalarını eklemek için:
\i 'supabase/policies/rls_policies.sql'

-- Sadece örnek verileri eklemek için:
\i 'supabase/seed-data/sample_data.sql'
```

## Dosya Açıklamaları

### Migrations
- **000_complete_setup.sql**: Tüm migration'ları sırayla çalıştıran ana dosya
- **001_initial_schema.sql**: Temel tabloları (users, vehicles, personnel, transactions) oluşturur

### Functions
- **update_updated_at_column.sql**: `updated_at` alanını otomatik güncelleyen fonksiyon

### Triggers
- **updated_at_triggers.sql**: Tüm tablolar için `updated_at` trigger'ları

### Policies
- **rls_policies.sql**: Row Level Security politikaları (kimlik doğrulama gerektirir)

### Auth
- **auth_triggers.sql**: Supabase Auth ile senkronizasyon için trigger'lar
- **google_provider.sql**: Google OAuth provider ayarları

### Seed Data
- **sample_data.sql**: Test için örnek kullanıcı, araç ve personel verileri

### Fixes
Bu klasör geçici düzeltme dosyalarını içerir. Bu dosyalar genellikle geliştirme sırasında oluşturulur ve production'da kullanılmaz.

## Geliştirme İpuçları

1. **Yeni tablo eklerken**: `migrations/` klasörüne yeni bir dosya oluşturun
2. **Yeni fonksiyon eklerken**: `functions/` klasörüne ekleyin
3. **RLS politikası değişikliği**: `policies/` klasöründeki dosyaları güncelleyin
4. **Auth ayarları**: `auth/` klasörüne ekleyin
5. **Geçici düzeltmeler**: `fixes/` klasörüne ekleyin

## Güvenlik Notları

- RLS politikaları production ortamında daha sıkı olmalıdır
- `fixes/` klasöründeki dosyalar production'da kullanılmamalıdır
- Auth trigger'ları güvenlik açısından kritiktir, dikkatli değiştirin 
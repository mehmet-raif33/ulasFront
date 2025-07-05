-- Google OAuth provider'ını aktifleştir
INSERT INTO auth.providers (id, name, enabled, created_at, updated_at)
VALUES ('google', 'google', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  enabled = true,
  updated_at = NOW();

-- Google provider ayarlarını güncelle
UPDATE auth.providers 
SET 
  enabled = true,
  updated_at = NOW()
WHERE id = 'google'; 
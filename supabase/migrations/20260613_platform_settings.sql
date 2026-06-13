-- Run this in Supabase SQL Editor (project: kuepdjxaomcjyyhyanfk)
-- Also create storage bucket "product-images" (public) via Supabase Dashboard → Storage

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read platform_settings"
  ON platform_settings FOR SELECT
  USING (true);

CREATE POLICY "service role write platform_settings"
  ON platform_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

INSERT INTO platform_settings (key, value) VALUES
  ('broadcast_doa', 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا'),
  ('broadcast_doa_trans', 'Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amalan yang diterima.')
ON CONFLICT (key) DO NOTHING;

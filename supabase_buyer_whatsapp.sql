-- Add buyer WhatsApp number for profile sidebar settings.
alter table buyers
add column if not exists whatsapp_number text;

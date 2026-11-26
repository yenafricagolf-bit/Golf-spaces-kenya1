export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  whatsapp: (import.meta.env.VITE_CONTACT_WHATSAPP || '').replace(/[^0-9]/g, ''),
  email: import.meta.env.VITE_CONTACT_EMAIL || '',
  phone: import.meta.env.VITE_CONTACT_PHONE || '',
};

// supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.supabase.co';
const SUPABASE_ANON_KEY = 'miamiary';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = "https://rckoavysqdtspozxadii.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJja29hdnlzcWR0c3BvenhhZGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzAwNTksImV4cCI6MjA4MDYwNjA1OX0.fXuCqVOKQqt76lLk9qqUCo2e4V8BxCYmW7kBDZzUp9I";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

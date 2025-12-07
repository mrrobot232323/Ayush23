
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://rckoavysqdtspozxadii.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJja29hdnlzcWR0c3BvenhhZGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzAwNTksImV4cCI6MjA4MDYwNjA1OX0.fXuCqVOKQqt76lLk9qqUCo2e4V8BxCYmW7kBDZzUp9I";

// Create a single Supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
    console.log("1. Starting Supabase Test...");

    const testEmail = `test_user_${Date.now()}@example.com`;
    const testPassword = "password123";

    console.log(`2. Attempting to sign up user: ${testEmail}`);

    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });

    if (authError) {
        console.error("❌ Signup Failed:", authError.message);
        return;
    }

    if (!authData.user) {
        console.error("❌ No user returned. Is 'Confirm Email' disabled?");
        return;
    }

    console.log("✅ Signup Successful! User ID:", authData.user.id);

    // 2. Insert Profile
    console.log("3. Attempting to insert profile into 'profiles' table...");

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
            {
                id: authData.user.id,
                email: testEmail,
                name: 'Test Account',
                age: 25
            }
        ])
        .select();

    if (profileError) {
        console.error("❌ Profile Insert Failed:", profileError.message);
        console.error("   Hint: Check if the 'profiles' table exists and RLS policies are correct.");
    } else {
        console.log("✅ Profile Insert Successful!");
        console.log("   Inserted Data:", profileData);
    }
}

testSupabase();

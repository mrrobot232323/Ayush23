import { supabase } from "./supabase";

export async function registerPushToken(userId: string, expoPushToken: string, platform = "expo") {
  if (!userId || !expoPushToken) return;
  await supabase.from("push_tokens").upsert({
    user_id: userId,
    expo_token: expoPushToken,
    platform
  }, { onConflict: "user_id, expo_token" });
}

// Example: send push (requires server or 3rd party)
export async function getPushTokensForUser(userId: string) {
  const { data } = await supabase.from("push_tokens").select("expo_token").eq("user_id", userId);
  return (data || []).map((d: any) => d.expo_token);
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SignupRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Signup service is not configured." }, 500);
  }

  const body = (await request.json().catch(() => ({}))) as SignupRequest;
  const firstName = body.firstName?.trim() || "";
  const lastName = body.lastName?.trim() || "";
  const email = body.email?.trim().toLowerCase() || "";
  const phone = normalizePhone(body.phone?.trim() || "");
  const password = body.password || "";

  if (!firstName || !lastName || !email.includes("@") || phone.length < 10 || password.length < 8) {
    return jsonResponse({ error: "Please enter valid account details." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: duplicateCheck, error: duplicateCheckError } = await admin
    .rpc("find_account_duplicates", {
      check_email: email,
      check_phone: phone,
    })
    .maybeSingle();

  if (duplicateCheckError) {
    return jsonResponse({ error: duplicateCheckError.message }, 500);
  }

  if (duplicateCheck?.email_exists) {
    return jsonResponse({ error: "An account already exists with this email." }, 409);
  }

  if (duplicateCheck?.phone_exists) {
    return jsonResponse({ error: "An account already exists with this phone." }, 409);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone,
    },
  });

  if (error || !data.user) {
    const message = error?.message || "Could not create account.";
    const status = message.toLowerCase().includes("already") ? 409 : 400;
    return jsonResponse({ error: message }, status);
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return jsonResponse({ error: profileError.message }, 400);
  }

  return jsonResponse({ userId: data.user.id, phone }, 201);
});

# Fix: "Supabase sent an invalid response" on Login

This error means Supabase is blocking the redirect. Add your URLs to the allowlist.

## Step-by-step fix

### 1. Open Supabase URL Configuration
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (**bubwzavexxjjckzbvthl**)
3. Click **Authentication** (left sidebar)
4. Click **URL Configuration**

### 2. Add Redirect URLs
In **Redirect URLs**, click **Add URL** and add **each** of these (one per line or separate entries):

```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

Click **Save**.

### 3. Set Site URL (for local dev)
In **Site URL**, set:
```
http://localhost:3001
```
(or `http://localhost:3000` if that's your dev port)

Click **Save**.

### 4. Enable Google provider
1. Go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. Add your Google OAuth Client ID and Secret (from [Google Cloud Console](https://console.cloud.google.com))
4. In Google Cloud Console → Credentials → your OAuth client → **Authorized redirect URIs**, add:
   ```
   https://bubwzavexxjjckzbvthl.supabase.co/auth/v1/callback
   ```

### 5. Try again
Refresh http://localhost:3001/login and click **Continue with Google**.

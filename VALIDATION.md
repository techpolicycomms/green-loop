# GreenLoop Project Validation

Systematic validation of each project element.

---

## 1. Project Structure & Config Files

### 1.1 package.json
| Check | Status | Notes |
|-------|--------|-------|
| Name | ✅ | `green-loop` |
| Next.js version | ✅ | 15.2.8 (patched) |
| Dependencies | ✅ | @supabase/ssr, @supabase/supabase-js, next, react, zod |
| Scripts | ✅ | dev, build, start, lint, deploy |

### 1.2 tsconfig.json
| Check | Status | Notes |
|-------|--------|-------|
| Path alias @/* | ✅ | Maps to ./src/* |
| baseUrl | ✅ | "." |
| Strict mode | ✅ | Enabled |

### 1.3 next.config.mjs
| Check | Status | Notes |
|-------|--------|-------|
| Webpack alias | ✅ | @ → src |
| Env fallbacks | ✅ | Placeholder for build without .env |
| reactStrictMode | ✅ | true |

### 1.4 vercel.json
| Check | Status | Notes |
|-------|--------|-------|
| Framework | ✅ | nextjs |
| Build command | ✅ | npm run build |

### 1.5 .gitignore
| Check | Status | Notes |
|-------|--------|-------|
| node_modules | ✅ | |
| .next | ✅ | |
| .env* | ✅ | |
| .vercel | ✅ | |

### 1.6 .env.local.example
| Check | Status | Notes |
|-------|--------|-------|
| Required vars | ✅ | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY |
| Optional | ✅ | NEXT_PUBLIC_SITE_URL |

---

## 2. App Routes & Pages

### 2.1 Layout & Root
| Route | File | Status |
|-------|------|--------|
| / | src/app/page.tsx | ✅ |
| Layout | src/app/layout.tsx | ✅ |
| Globals | src/app/globals.css | ✅ |

### 2.2 Public Pages
| Route | File | Status |
|-------|------|--------|
| /login | src/app/login/page.tsx | ✅ |

### 2.3 Protected Pages (require auth)
| Route | File | Status |
|-------|------|--------|
| /volunteer | src/app/volunteer/page.tsx | ✅ |
| /organizer | src/app/organizer/page.tsx | ✅ |
| /admin | src/app/admin/page.tsx | ✅ |

### 2.4 Auth Routes
| Route | File | Purpose |
|-------|------|---------|
| POST /auth | src/app/auth/route.ts | Sign out |
| GET /auth/callback | src/app/auth/callback/route.ts | OAuth callback |
| POST /auth/signout | src/app/auth/signout/route.ts | Sign out (form action) |

### 2.5 API Routes
| Route | File | Purpose |
|-------|------|---------|
| GET /api/me | src/app/api/me/route.ts | Current user |
| GET/POST /api/events | src/app/api/events/route.ts | Events CRUD |
| GET /api/admin/users | src/app/api/admin/users/route.ts | Admin user list |
| POST /api/uploads | src/app/api/uploads/route.ts | Photo upload (stub) |

---

## 3. Supabase Integration

### 3.1 Client Libraries
| File | Purpose |
|------|---------|
| src/lib/supabaseClient.ts | Browser client (OAuth, client-side) |
| src/lib/supabaseServer.ts | Server client (cookies, API routes) |

### 3.2 Auth Flow
| Step | Implementation |
|------|----------------|
| Login | Login page → signInWithOAuth → redirect to provider |
| Callback | /auth/callback → exchangeCodeForSession → redirect to /volunteer |
| Sign out | /auth/signout → signOut → redirect to / |

### 3.3 Authorization (authz.ts)
| Function | Purpose |
|----------|---------|
| requireUser() | Throws if not authenticated |
| requireRole(allowed) | Throws if role not in allowed (fetches from profiles) |

---

## 4. Database Schema

### 4.1 Tables (supabase/schema.sql)
| Table | Purpose |
|-------|---------|
| profiles | id, email, role (volunteer/organizer/admin) |
| events | id, name, location, created_by, created_at |

### 4.2 RLS Policies
| Table | Policies |
|-------|----------|
| profiles | Users read own; admins read all |
| events | Authenticated read; organizer/admin insert |

### 4.3 Trigger
| Trigger | Purpose |
|---------|---------|
| on_auth_user_created | Auto-create profile with role=volunteer on signup |

---

## 5. Middleware

| Check | Status |
|-------|--------|
| Security headers | ✅ Applied to all responses |
| Protected routes | /admin, /organizer, /volunteer |
| Auth check | Redirect to /login if no sb-* cookies |
| Matcher | Excludes _next/static, _next/image, favicon |

---

## 6. Build & Deployment

### 6.1 Build
Run: `npm run build`

### 6.2 Deployment Checklist
- [ ] Push to techpolicycomms/green-loop
- [ ] Vercel connected to repo
- [ ] Env vars set in Vercel
- [ ] Supabase Auth URLs configured
- [ ] Schema run in Supabase
- [ ] Google/Apple providers enabled in Supabase

---

## Summary

| Category | Status |
|----------|--------|
| Config | ✅ Valid |
| Routes | ✅ Complete |
| Supabase | ✅ Integrated |
| Schema | ✅ Defined |
| Middleware | ✅ Configured |
| Build | Run `npm run build` to verify |

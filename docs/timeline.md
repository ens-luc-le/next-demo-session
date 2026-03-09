# Sharing Session: How we work with API in Next.js App Router

## Presentation Timeline

---

## Part 1: Introduction

### 1.1 Overview

- Why external API patterns matter in modern Next.js:
  - Performance implications (caching, CDN, server cost)
  - User experience (speed, freshness)
  - SEO considerations
  - Scalability concerns
- Session agenda:
  - Query: SSG, SSR, and ISR patterns for external APIs
  - Mutation: Server Actions, forms, and cache invalidation

---

## Part 2: Query Patterns - External API Fetching

### 2.1 Fetching Data from External APIs

**Key Concept:** Use `fetch` in Server Components with caching strategies

```tsx
// Direct fetch from external API
export default async function Page() {
  const res = await fetch("https://api.example.com/posts");
  const data = await res.json();
  return <PostList posts={data} />;
}
```

**Benefits:**

- Zero client-side JavaScript for data fetching
- Server-side execution by default
- Automatic caching with Next.js extended fetch API
- Reduced bundle size

### 2.2 SSG - Static Site Generation

**When to use:**

- Content that rarely changes (blog posts, docs, marketing pages)
- Data that can be stale until next deployment
- Public pages with high traffic

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts", {
    cache: "force-cache", // Default - can be omitted
  });
  const posts = await res.json();
  return <PostList posts={posts} />;
}

// Alternative: Using export (page-level)
// const staticData = await fetch('https://...') // Default is force-cache
```

**How it works:**

1. Data fetched during `next build`
2. HTML rendered and cached
3. Served from CDN (fastest possible)
4. Only updates on next deployment

**Use cases:**

- ✅ Blog posts & articles
- ✅ Documentation pages
- ✅ Marketing/landing pages
- ✅ About pages
- ✅ FAQ pages

### 2.3 SSR - Server-Side Rendering (10 min)

**When to use:**

- Real-time or frequently changing data
- User-specific content (requires authentication)
- Data that must be fresh on every request

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const res = await fetch("https://api.example.com/user/analytics", {
    cache: "no-store",
  });
  const analytics = await res.json();
  return <Dashboard data={analytics} />;
}

// Alternative: Using export (page-level)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const res = await fetch("https://api.example.com/user/analytics");
  const analytics = await res.json();
  return <Dashboard data={analytics} />;
}
```

**How it works:**

1. Data fetched on every request
2. HTML rendered on each request
3. Always fresh data
4. Slower than static (server cost)

**Use cases:**

- ✅ User dashboards (with auth)
- ✅ Real-time analytics
- ✅ Search results
- ✅ User profiles (with personalized data)
- ✅ Shopping carts
- ✅ Admin panels

### 2.4 ISR - Incremental Static Regeneration (12 min)

**When to use:**

- Frequently changing data that tolerates some staleness
- High-traffic pages that need periodic updates
- Content that changes predictably

```tsx
// app/products/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function ProductsPage() {
  const res = await fetch("https://api.example.com/products");
  const products = await res.json();
  return <ProductList products={products} />;
}

// Alternative: Using fetch options
export default async function ProductsPage() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 3600 }, // 1 hour
  });
  const products = await res.json();
  return <ProductList products={products} />;
}
```

**How it works:**

1. Initial request: Fetch & cache (like SSG)
2. Subsequent requests: Serve cached (fast)
3. After revalidation period: Fetch fresh in background, update cache
4. Next request: Serve fresh cache

**Use cases:**

- ✅ E-commerce product listings
- ✅ News feeds
- ✅ Event listings
- ✅ Stock/inventory data
- ✅ Weather forecasts
- ✅ Aggregated data from multiple APIs

**Revalidation Strategies:**

```tsx
// Strategy 1: Time-based (revalidate)
export const revalidate = 60; // Every 60 seconds

export default async function Page() {
  const data = await fetch("https://api.example.com/data");
  return <Component data={await data.json()} />;
}

// Strategy 2: Per-fetch revalidate
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 }, // 1 minute for real-time data
  });
  return <Component data={await data.json()} />;
}

// Strategy 3: Tag-based revalidation (for granular control)
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { tags: ["products"] },
  });
  return <Component data={await data.json()} />;
}

// Later, invalidate when needed
// In a Server Action:
// import { revalidateTag } from 'next/cache'
// revalidateTag('products')
```

### 2.5 Comparison: SSG vs SSR vs ISR (5 min)

| Feature           | SSG (Static)           | SSR (Dynamic)       | ISR (Revalidate)          |
| ----------------- | ---------------------- | ------------------- | ------------------------- |
| **Build time**    | Yes                    | No                  | Yes (initial)             |
| **Runtime fetch** | No                     | Yes                 | Yes (background)          |
| **Freshness**     | Stale until build      | Always fresh        | Fresh after revalidation  |
| **Speed**         | ⚡ Fastest             | 🐢 Slowest          | ⚡ Fast (cached)          |
| **Server cost**   | 💰 Lowest              | 💰💰 Highest        | 💰 Low                    |
| **CDN cache**     | ✅ Yes                 | ❌ No               | ✅ Yes                    |
| **Cache control** | `cache: 'force-cache'` | `cache: 'no-store'` | `next: { revalidate: N }` |
| **Best for**      | Static content         | Real-time data      | Periodic updates          |

**Decision Matrix:**

- **SSG** - Use when content rarely changes, SEO is critical, or high traffic expected
- **SSR** - Use when data must be fresh, user-specific content, or real-time requirements
- **ISR** - Use when data changes frequently but tolerates staleness, or need balance of speed and freshness

### 2.6 Parallel Data Fetching (5 min)

**Performance optimization for multiple external APIs:**

```tsx
// ❌ Sequential (slow)
export default async function Page() {
  const users = await fetch("https://api.example.com/users").then((r) => r.json());
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());
  const comments = await fetch("https://api.example.com/comments").then((r) => r.json());

  // Total time = users + posts + comments
  return <PageContent users={users} posts={posts} comments={comments} />;
}
```

```tsx
// ✅ Parallel (fast)
export default async function Page() {
  // Start all requests concurrently
  const usersPromise = fetch("https://api.example.com/users").then((r) => r.json());
  const postsPromise = fetch("https://api.example.com/posts").then((r) => r.json());
  const commentsPromise = fetch("https://api.example.com/comments").then((r) => r.json());

  // Wait for all
  const [users, posts, comments] = await Promise.all([usersPromise, postsPromise, commentsPromise]);

  // Total time = max(users, posts, comments)
  return <PageContent users={users} posts={posts} comments={comments} />;
}
```

**Best Practice:** Extract data fetching functions for reusability

```tsx
// lib/api.ts
export async function getUsers() {
  const res = await fetch("https://api.example.com/users");
  return res.json();
}

export async function getPosts() {
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}

// app/dashboard/page.tsx
import { getUsers, getPosts } from "@/lib/api";

export default async function DashboardPage() {
  const [users, posts] = await Promise.all([getUsers(), getPosts()]);
  return <Dashboard users={users} posts={posts} />;
}
```

### 2.7 Loading Handling (5 min)

**Route-level loading (`loading.tsx`):**

```tsx
// app/posts/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  // While this fetches, loading.tsx is shown
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());
  return <PostList posts={posts} />;
}
```

**Component-level loading with Suspense:**

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>
      <Suspense fallback={<div>Loading recent activity...</div>}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}

async function Analytics() {
  const data = await fetch("https://api.example.com/analytics").then((r) => r.json());
  return <AnalyticsChart data={data} />;
}

async function RecentActivity() {
  const activities = await fetch("https://api.example.com/activities").then((r) => r.json());
  return <ActivityList activities={activities} />;
}
```

**Benefits of Suspense for loading:**

- Streams content progressively (users see content as it loads)
- Independent loading states for different sections
- Better perceived performance
- Prevents slow requests from blocking the entire page

**Best Practices:**

1. ✅ Use `loading.tsx` for route-level loading (simple, automatic)
2. ✅ Use Suspense for component-level loading (granular control)
3. ✅ Show meaningful loading states (skeletons, spinners)
4. ✅ Make loading states match the layout of your content
5. ❌ Don't show a full-page loader when you can stream content
6. ❌ Don't use Suspense unnecessarily (adds complexity)

### 2.8 Error Handling

```tsx
// ✅ Proper error handling for external APIs
export default async function Page() {
  try {
    const res = await fetch("https://api.example.com/data");

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return <Component data={data} />;
  } catch (error) {
    console.error("Failed to fetch data:", error);

    // Return error component
    return <ErrorState message="Failed to load data" />;

    // Or throw to trigger Next.js error.tsx
    // throw error
  }
}
```

---

## Part 3: Mutation Patterns

### 3.1 Server Components + Server Actions (No Client Code)

**Core pattern:** Pure Server Components with Server Actions—no client JavaScript required.

```
User Action → Browser Submit → Server → Response → Browser
```

#### Basic Pattern

```tsx
// app/actions.ts
"use server";
export async function createUser(prevState: any, formData: FormData) {
  const user = await db.users.create({ name: formData.get("name") });
  return { success: true, user };
}

// app/page.tsx (Server Component)
import { createUser } from "@/app/actions";

export default function Page() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button>Create</button>
    </form>
  );
}
```

### 3.2 Pattern 1: Return Data (Stay on Page)

**Use case:** Show success/error messages, validation feedback.

```tsx
// actions.ts
export async function updateUser(prevState: any, formData: FormData) {
  if (!formData.get("email")?.includes("@")) {
    return { error: "Invalid email" };
  }
  const user = await db.users.update(formData.get("email"));
  return { success: true, user };
}

// page.tsx
import { updateUser } from "@/app/actions";
import { useFormState } from "react-dom";

export default function Page() {
  const [state, formAction] = useFormState(updateUser, null);
  return (
    <div>
      {state?.error && <p>{state.error}</p>}
      {state?.success && <p>Updated: {state.user.name}</p>}
      <form action={formAction}>
        <input name="email" />
        <button>Update</button>
      </form>
    </div>
  );
}
```

### 3.3 Pattern 2: Redirect (Navigate Away)

**Use case:** After mutation, navigate to list/detail pages, prevent resubmission.

```tsx
// actions.ts
import { redirect } from "next/navigation";

export async function deleteUser(prevState: any, formData: FormData) {
  await db.users.delete(formData.get("id"));
  redirect("/users");
}

// page.tsx
import { deleteUser } from "@/app/actions";

export default function DeletePage({ params }) {
  return (
    <form action={deleteUser}>
      <input type="hidden" name="id" value={params.id} />
      <button>Confirm Delete</button>
    </form>
  );
}
```

### 3.4 Pattern 3: Revalidate + Return Data

**Use case:** Update data, refresh cached pages, show result.

```tsx
// actions.ts
import { revalidatePath } from "next/navigation";

export async function createPost(prevState: any, formData: FormData) {
  const post = await db.posts.create({ title: formData.get("title") });
  revalidatePath("/posts");
  return { success: true, post };
}
```

### 3.5 Pattern 4: Revalidate + Redirect

**Use case:** Update data, navigate to fresh page.

```tsx
// actions.ts
import { revalidatePath, redirect } from "next/navigation";

export async function updateProduct(prevState: any, formData: FormData) {
  const product = await db.products.update(formData);
  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}
```

### 3.6 Quick Reference

| Pattern               | Returns | Redirects | Revalidates | Best For                     |
| --------------------- | ------- | --------- | ----------- | ---------------------------- |
| Return Data           | ✅      | ❌        | ❌          | Messages, validation         |
| Redirect Only         | ❌      | ✅        | ❌          | Navigation, prevent resubmit |
| Revalidate + Return   | ✅      | ❌        | ✅          | Update cache, show result    |
| Revalidate + Redirect | ❌      | ✅        | ✅          | Update cache, navigate       |

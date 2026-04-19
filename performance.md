PROJECT CONTEXT:

I have a personal web application built using Next.js (App Router) and Supabase. The app is a shared task manager for two users (parents) to track school assignments for their child. It allows creating tasks, attaching files (images/documents), and viewing tasks in a dashboard with due dates and status.

The application currently feels slow, especially on the task listing page. It also uses a real-time update mechanism implemented via Supabase broadcast.

GOAL:

Perform a deep performance analysis of the current implementation and propose improvements across frontend, backend, data fetching, and real-time handling.

---

AREAS TO ANALYZE:

1. FRONTEND (React / Next.js)
- Detect unnecessary re-renders
- Identify inefficient state updates (e.g., replacing entire arrays)
- Evaluate component structure (e.g., task list and task card separation)
- Check for overuse of "use client"
- Suggest memoization strategies if needed

2. DATA FETCHING STRATEGY
- Identify if data is being fetched on the client (useEffect) instead of server components
- Evaluate number of network requests per page load
- Suggest moving logic to server-side (Server Components or Server Actions)
- Propose caching strategies (revalidate, fetch cache)
- Suggest query consolidation

3. REAL-TIME / BROADCAST IMPLEMENTATION
- Analyze how broadcast events are handled
- Check if events trigger full data refetch
- Identify unnecessary or excessive subscriptions
- Suggest alternatives:
  - local state updates instead of refetch
  - removing realtime in favor of manual refresh
  - or optimized event handling

4. DATABASE (Supabase / PostgreSQL)
- Analyze query efficiency
- Check for missing indexes (e.g., due_date, task_id)
- Evaluate table structure (tasks, attachments, relationships)
- Suggest query optimization (joins, limiting columns, pagination)

5. FILE HANDLING (IMAGES / DOCUMENTS)
- Evaluate image sizes and loading strategy
- Check if images are optimized (Next.js Image component)
- Suggest compression or thumbnail strategy
- Evaluate impact on performance when rendering task lists

6. NETWORK / INFRASTRUCTURE
- Evaluate latency between frontend hosting and Supabase region
- Identify slow requests (TTFB, response time)
- Suggest region alignment if needed

7. BUNDLE SIZE / JAVASCRIPT
- Identify large dependencies
- Suggest code splitting or dynamic imports
- Evaluate impact of UI libraries

---

EXPECTED OUTPUT:

- List of concrete performance issues found (prioritized)
- Explanation of why each issue affects performance
- Specific code-level recommendations
- Suggested refactoring strategy (step-by-step if possible)
- Optional: simplified architecture proposal for better performance

---

CONSTRAINTS:

- Keep the solution simple and maintainable
- Avoid overengineering
- Prioritize performance improvements with the highest impact
- Consider this is a small-scale app (2 users), not a high-concurrency system

---

IMPORTANT:

If possible, suggest a simplified architecture that removes unnecessary complexity (e.g., replacing realtime with server-driven updates) while improving performance and maintainability.
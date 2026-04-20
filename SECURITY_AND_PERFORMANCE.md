# Security & Performance Guide - Violet Chemistry

## 1. Security: GitHub & API Protection

### A. Protecting Your Credentials (DONE)
We have implemented **PropertiesService** in your Google Apps Script. 
- **The Risk:** Hardcoding your password in the script means anyone with access to the code sees it.
- **The Fix:** We moved the password to "Script Properties". Even if you share your script code, the password remains hidden in your Google settings.

### B. Use a .gitignore (DONE)
Your project now has a `.gitignore` that automatically hides:
- `config.js` (Your private API URL)
- `google app script code.gs` (Your backend logic)

### C. Public vs Private Repo
- If your repo is **Public**: Anyone can see your code. They can see how the API works, but they can't see your password or API URL.
- If your repo is **Private**: This is the safest way to hide everything.

---

## 2. Performance: High-Speed Optimization (DONE)

### A. Stale-While-Revalidate Caching
The app now uses a modern caching strategy. 
1. It shows the **cached data instantly** from `localStorage`.
2. It fetches **fresh data in the background**.
3. This makes the UI feel like it loads in 0.1 seconds instead of 2 seconds.

### B. Batched DOM Rendering
Instead of updating the table row-by-row (which is slow), we now build the entire table in memory and update the screen once. This handles hundreds of products without lagging.

### C. Debounced Searching
When you type in the search bar, the app waits 150ms for you to stop typing before filtering. This prevents the "typing lag" commonly found in web apps.

### D. FastEdit Navigation
We use `sessionStorage` to pass product data between pages. When you click "Edit", the next page loads the product data **instantly** without waiting for the API.

---

## 3. How to Go Live

1. **Push to GitHub:** Follow the instructions in `README.md`.
2. **Enable GitHub Pages:** Set it to the `main` branch.
3. **Manually add config.js on GitHub:** Since it's ignored, you'll need to create it once on the GitHub website to provide your `API_URL`.

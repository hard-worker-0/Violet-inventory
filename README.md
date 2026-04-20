# 🧪 Violet Chemistry Inventory Management

A fast, secure, and modern inventory management system powered by Google Sheets.

## 🚀 Quick Start (GitHub Deployment)

### 1. Repository Setup
1. Create a new repository on GitHub named `Violet-inventory`.
2. Push this code to your repository. 
   *Note: `config.js` is ignored by default for security. You will need to handle this for the live site.*

### 2. Live Website (GitHub Pages)
1. Go to your GitHub repository **Settings**.
2. Click **Pages** in the left sidebar.
3. Under **Build and deployment**, set the source to `Deploy from a branch`.
4. Select the `main` branch and `/root` folder, then click **Save**.
5. Your site will be live at `https://your-username.github.io/Violet-inventory/`.

### 3. Fixing the "Missing API" Error
Since `config.js` is ignored to protect your API URL, the live site won't work immediately.
**Option A (Easiest):**
- Create `config.js` directly on GitHub (Add File -> Create new file) and paste your URL. 
- *Warning: This makes your API URL visible to anyone who sees the repo.*

**Option B (Better Security):**
- Keep the repo private.
- Only share the live link with authorized personnel.

## 🔐 Security Updates (Google Apps Script)

To prevent your password from being stolen if you share your script:

1. Open your Google Apps Script editor.
2. Go to **Project Settings** (gear icon).
3. Scroll down to **Script Properties**.
4. Add a property:
   - Property: `ADMIN_PASS`
   - Value: `your_secret_password`
5. Update your code to use `PropertiesService.getScriptProperties().getProperty('ADMIN_PASS')` instead of hardcoding it.

## ⚡ Performance Features
- **Stale-While-Revalidate Caching:** Instant loading using local storage.
- **FastEdit:** Instant form population for editing.
- **Debounced Search:** Smooth filtering of thousands of items.
- **Batched Rendering:** High-performance UI updates.

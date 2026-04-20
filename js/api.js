// ==========================================
// API CONNECTION FILE (AUTHENTICATED & FAST)
// ==========================================

/**
 * Function to GET data from Google Sheets
 * Uses "Stale-While-Revalidate" caching for instant loading.
 */
async function getData(action = 'getProducts') {
    const cacheKey = `violet_cache_${action}`;
    const cachedData = localStorage.getItem(cacheKey);

    // 1. If we have cached data, return it immediately for instant UI
    if (cachedData) {
        console.log(`⚡ Speed: Showing cached ${action}`);
        
        // Trigger a background refresh to get the latest data without making user wait
        refreshCacheInBackground(action, cacheKey);
        
        return JSON.parse(cachedData);
    }

    // 2. If no cache, perform slow fetch
    return await refreshCacheInBackground(action, cacheKey);
}

/**
 * Helper to fetch data and update cache
 */
async function refreshCacheInBackground(action, cacheKey) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}?action=${action}&token=${token}`);
        
        if (!response.ok) throw new Error("Network error");
        
        const result = await response.json();

        if (result.loginRequired) {
            logout();
            return [];
        }

        // Save to cache for next time
        localStorage.setItem(cacheKey, JSON.stringify(result));
        
        // If this was called as a background refresh, we might want to 
        // silently update the UI if data changed. For now, it updates on next navigation.
        return result || [];
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}

/**
 * Function to POST data to Google Sheets
 */
async function postData(action, data) {
    try {
        const token = getAuthToken();
        const url = `${API_URL}?action=${action}&token=${token}`;
        
        const response = await fetch(url, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' 
            },
            body: JSON.stringify(data)
        });
        
        // After any change (Add/Edit/Delete), clear the specific cache so the user sees their change
        localStorage.removeItem('violet_cache_getProducts');
        localStorage.removeItem('violet_cache_getHistory');
        localStorage.removeItem('violet_cache_getTrash');
        
        // Wait a bit for GAS to process
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return true;
    } catch (error) {
        console.error("Data Post Error:", error);
        return false;
    }
}
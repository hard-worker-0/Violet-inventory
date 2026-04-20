// ==========================================
// SHARED UTILITY FOR FAST EDITING
// ==========================================

function fastEdit(id, inventoryData) {
    const product = inventoryData.find(p => p.id === id);
    if (product) {
        // Save to sessionStorage for instant loading on the next page
        sessionStorage.setItem('editProductCache', JSON.stringify(product));
        window.location.href = `add.html?id=${id}`;
    } else {
        window.location.href = `add.html?id=${id}`; // Fallback to slow load
    }
}

// ==========================================
// PRODUCT LIST LOGIC
// ==========================================

let inventoryData = [];

// Run this when the page loads
window.onload = async () => {
    inventoryData = await getData('getProducts');
    renderList(inventoryData);
};

// Render the table with Edit and Delete buttons
function renderList(data) {
    const tbody = document.getElementById('productTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No products found in inventory.</td></tr>`;
        return;
    }

    const rows = data.map(p => {
        // Safe math
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        const total = Number(p.total) || 0;
        const keywords = p.keywords ? p.keywords : "<span style='color: #cbd5e1;'>None</span>";

        // Low Stock Highlight
        const isLowStock = qty < 5;
        const stockStyle = isLowStock ? 'color: var(--danger); font-weight: 700;' : '';
        const stockLabel = isLowStock ? ' ⚠️ Low' : '';

        return `
            <tr>
                <td style="font-size: 0.85em; color: var(--text-muted); font-family: monospace;">${p.id}</td>
                <td>
                    <div style="font-weight: 600;">${p.name}</div>
                    <div style="font-size: 0.75em; color: var(--text-muted);">${p.unit} unit</div>
                </td>
                <td style="${stockStyle}">${qty.toLocaleString()} ${p.unit}${stockLabel}</td>
                <td>৳${price.toLocaleString()}</td>
                <td style="font-size: 0.85em; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${keywords}">${keywords}</td>
                <td style="font-weight: 700; color: var(--primary-hover);">৳${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <!-- Use fastEdit for instant loading -->
                    <button class="btn btn-edit" onclick="fastEdit('${p.id}', inventoryData)">🖊️ Edit</button>
                    <button class="btn btn-danger" onclick="safeDelete('${p.id}', '${p.name}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
}

// Smart Search Logic with Debounce
let searchTimeout;
document.getElementById('listSearch').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase();
        
        const filteredData = inventoryData.filter(p => {
            const nameMatch = (p.name || "").toLowerCase().includes(searchTerm);
            const idMatch = (p.id || "").toLowerCase().includes(searchTerm);
            const keywordMatch = (p.keywords || "").toLowerCase().includes(searchTerm);
            
            return nameMatch || idMatch || keywordMatch;
        });

        renderList(filteredData);
    }, 150); // 150ms delay for smoother typing
});

// ==========================================
// ACTION FUNCTIONS
// ==========================================

// Safe Delete: Asks for confirmation before removing
async function safeDelete(id, name) {
    const userConfirmed = confirm(`VIOLET CHEMISTRY WARNING:\n\nAre you sure you want to move "${name}" to the Trash Bin?`);
    
    if (userConfirmed) {
        document.body.style.cursor = 'wait';
        const success = await postData('deleteProduct', { id: id });
        document.body.style.cursor = 'default';
        
        if (success) {
            alert(`${name} was moved to the Trash Bin.`);
            location.reload();
        }
    }
}
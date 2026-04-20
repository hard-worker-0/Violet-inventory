// ==========================================
// DASHBOARD LOGIC
// ==========================================

let allProducts = []; 

// Shared Fast Edit Function
function fastEdit(id, inventoryData) {
    const product = inventoryData.find(p => p.id === id);
    if (product) {
        sessionStorage.setItem('editProductCache', JSON.stringify(product));
        window.location.href = `add.html?id=${id}`;
    } else {
        window.location.href = `add.html?id=${id}`;
    }
}

// Safe Delete: Asks for confirmation before removing
async function safeDelete(id, name) {
    const userConfirmed = confirm(`VIOLET CHEMISTRY WARNING:\n\nAre you sure you want to move "${name}" to the Trash Bin?\nThis will also be recorded in History.`);
    
    if (userConfirmed) {
        document.body.style.cursor = 'wait';
        const success = await postData('deleteProduct', { id: id });
        document.body.style.cursor = 'default';
        
        if (success) {
            alert(`${name} was moved to the Trash Bin and logged in History.`);
            location.reload();
        } else {
            alert("Failed to delete product.");
        }
    }
}

// Run this when the page loads
window.onload = async () => {
    // 1. Fetch both products and history
    allProducts = await getData('getProducts');
    const history = await getData('getHistory');
    
    // 2. Update UI
    renderStats(allProducts, history);
    renderTable(allProducts);
};

// Calculate and display top stats
function renderStats(products, history) {
    // Total Active Products
    document.getElementById('stat-count').innerText = products.length;

    // Total Inventory Value
    const totalVal = products.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
    document.getElementById('stat-val').innerText = "৳" + totalVal.toLocaleString(undefined, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    });

    // Last Sale Detail
    const lastSaleContainer = document.getElementById('last-sale-info');
    if (history && history.length > 0) {
        // Sort by date newest first
        const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = sortedHistory[0];
        
        const customer = last.customerName || last.companyName || "Unknown Customer";
        const dateStr = new Date(last.date).toLocaleDateString();

        lastSaleContainer.innerHTML = `
            <div style="font-weight: 700; color: var(--primary-hover); margin-bottom: 4px;">${last.productName}</div>
            <div style="display: flex; justify-content: space-between;">
                <span>Qty: ${last.quantity} ${last.unit || ''}</span>
                <span style="font-weight: 600;">৳${Number(last.total).toLocaleString()}</span>
            </div>
            <div style="margin-top: 4px; color: var(--text-muted); font-size: 0.9em;">
                👤 ${customer} | 📅 ${dateStr}
            </div>
        `;
    } else {
        lastSaleContainer.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 10px;">No records found</div>`;
    }
}

// Display the table preview
function renderTable(data) {
    const tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = ''; 

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No products found in inventory.</td></tr>`;
        return;
    }

    data.forEach(p => {
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        const total = Number(p.total) || 0;
        
        const isLowStock = qty < 5;
        const stockStyle = isLowStock ? 'color: var(--danger); font-weight: 700;' : '';

        tbody.innerHTML += `
            <tr>
                <td style="font-size: 0.85em; color: var(--text-muted); font-family: monospace;">${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td style="${stockStyle}">${qty.toLocaleString()} ${p.unit}${isLowStock ? ' ⚠️' : ''}</td>
                <td>৳${price.toLocaleString()}</td>
                <td style="font-weight: 700; color: var(--primary-hover);">৳${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-edit" style="padding: 6px 12px; font-size: 0.85em;" onclick="fastEdit('${p.id}', allProducts)">🖊️ Edit</button>
                    <button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.85em;" onclick="safeDelete('${p.id}', '${p.name}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });
}

// Smart Search Logic
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredData = allProducts.filter(p => {
        const nameMatch = (p.name || "").toLowerCase().includes(searchTerm);
        const idMatch = (p.id || "").toLowerCase().includes(searchTerm);
        const keywordMatch = (p.keywords || "").toLowerCase().includes(searchTerm);
        
        return nameMatch || idMatch || keywordMatch;
    });

    renderTable(filteredData);
});
// ==========================================
// SALES HISTORY LOGIC
// ==========================================

let historyData = [];

window.onload = async () => {
    historyData = await getData('getHistory');
    renderHistory(historyData);
};

function renderHistory(data) {
    const tbody = document.getElementById('historyTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px;">No sales history found.</td></tr>`;
        return;
    }

    // Sort by date (newest first)
    const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

    const rows = sortedData.map((item) => {
        const date = new Date(item.date).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const customerInfo = `
            <div style="line-height: 1.4;">
                <div style="font-weight: 700; color: var(--text-main);">${item.customerName || 'N/A'}</div>
                <div style="font-size: 0.85em; color: var(--text-muted); font-style: italic;">${item.companyName || 'No Company'}</div>
            </div>
        `;

        const contactInfo = `
            <div style="line-height: 1.4; font-size: 0.85em;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                    <span>📞</span> <span>${item.customerPhone || 'N/A'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; color: var(--text-muted);">
                    <span>📍</span> <span style="white-space: normal; word-break: break-word;">${item.customerAddress || 'N/A'}</span>
                </div>
            </div>
        `;

        return `
            <tr>
                <td style="font-size: 0.85em; color: var(--text-muted); white-space: nowrap;">${date}</td>
                <td>
                    <div style="font-weight: 600;">${item.productName}</div>
                    <div style="font-size: 0.7em; color: var(--primary);">ID: ${item.productId}</div>
                </td>
                <td style="white-space: nowrap;">${Number(item.quantity).toLocaleString()} ${item.unit || ''}</td>
                <td style="font-weight: 700; color: var(--success-hover); white-space: nowrap;">৳${Number(item.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td>${customerInfo}</td>
                <td style="min-width: 180px;">${contactInfo}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.8em;" onclick="deleteSale('${item.date}', '${item.productName}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows;
}

// Search Logic with Debounce
let searchTimeout;
document.getElementById('historySearch').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const term = e.target.value.toLowerCase();
        
        const filtered = historyData.filter(item => {
            const productMatch = (item.productName || "").toLowerCase().includes(term);
            const customerMatch = (item.customerName || "").toLowerCase().includes(term);
            const companyMatch = (item.companyName || "").toLowerCase().includes(term);
            const dateMatch = (item.date || "").toLowerCase().includes(term);
            
            return productMatch || customerMatch || companyMatch || dateMatch;
        });

        renderHistory(filtered);
    }, 150);
});

async function deleteSale(date, productName) {
    if (confirm(`Are you sure you want to delete the sale for "${productName}"?\n\nNOTE: This will NOT restore the stock. It only removes the record from history.`)) {
        document.body.style.cursor = 'wait';
        // We use the unique ISO date string to find and delete the row
        const success = await postData('deleteSale', { date: date });
        document.body.style.cursor = 'default';

        if (success) {
            alert("Sale record deleted.");
            location.reload();
        } else {
            alert("Failed to delete sale record.");
        }
    }
}
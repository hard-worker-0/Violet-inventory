// ==========================================
// TRASH BIN LOGIC
// ==========================================

window.onload = async () => {
    document.body.style.cursor = 'wait';
    const trashData = await getData('getTrash');
    document.body.style.cursor = 'default';
    
    if (!trashData || trashData.length === 0) {
        const btn = document.getElementById('emptyTrashBtn');
        if (btn) btn.disabled = true;
    }
    
    renderTrash(trashData);
};

function renderTrash(data) {
    const tbody = document.getElementById('trashTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 40px; color: var(--text-muted);">
                    <div style="font-size: 3em; margin-bottom: 10px;">🗑️</div>
                    <div>Your trash bin is currently empty.</div>
                </td>
            </tr>`;
        return;
    }

    const rows = data.map(p => {
        let deletedDate = "Unknown";
        if (p.deletedAt) {
            const dateObj = new Date(p.deletedAt);
            deletedDate = dateObj.toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }

        return `
            <tr>
                <td style="font-family: monospace; color: var(--text-muted);">${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td style="color: var(--text-muted); font-size: 0.9em;">${deletedDate}</td>
                <td style="text-align: right;">
                    <button class="btn btn-success" onclick="restoreProduct('${p.id}', '${p.name}')">
                        🔄 Restore Product
                    </button>
                </td>
            </tr>`;
    }).join('');

    tbody.innerHTML = rows;
}

async function restoreProduct(id, name) {
    const confirmed = confirm(`Do you want to restore "${name}" back to the active inventory?`);
    
    if (confirmed) {
        document.body.style.cursor = 'wait';
        const success = await postData('restoreProduct', { id: id });
        document.body.style.cursor = 'default';
        
        if (success) {
            alert(`"${name}" has been successfully restored.`);
            location.reload();
        } else {
            alert("Failed to restore product.");
        }
    }
}

async function emptyTrash() {
    const confirmed = confirm("⚠️ PERMANENT ACTION ⚠️\n\nAre you sure you want to PERMANENTLY delete ALL items in the trash?\nThis cannot be undone!");
    
    if (confirmed) {
        const secondConfirm = confirm("Are you REALLY sure? This will wipe the trash bin forever.");
        if (secondConfirm) {
            document.body.style.cursor = 'wait';
            const btn = document.getElementById('emptyTrashBtn');
            btn.innerText = "⏳ Emptying...";
            btn.disabled = true;

            const success = await postData('emptyTrash', {});
            document.body.style.cursor = 'default';

            if (success) {
                alert("Trash bin has been emptied.");
                location.reload();
            } else {
                alert("Failed to empty trash.");
                btn.innerText = "🗑️ Empty Trash Forever";
                btn.disabled = false;
            }
        }
    }
}
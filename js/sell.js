// ==========================================
// SELL PRODUCT LOGIC
// ==========================================

const sellForm = document.getElementById('sellForm');
const productSelect = document.getElementById('productSelect');
const sellQtyInput = document.getElementById('sellQuantity');
const sellPriceInput = document.getElementById('sellPrice');
const sellTotalDisplay = document.getElementById('sellTotalDisplay');
const stockWarning = document.getElementById('stockWarning');
const submitBtn = document.getElementById('sellSubmitBtn');

let allProducts = [];
let selectedProduct = null;

// 1. Load products for selection
window.onload = async () => {
    document.body.style.cursor = 'wait';
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ Loading Products...";

    allProducts = await getData('getProducts');
    
    allProducts.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.text = `${p.name} (Stock: ${p.quantity} ${p.unit})`;
        productSelect.add(option);
    });

    document.body.style.cursor = 'default';
    submitBtn.disabled = false;
    submitBtn.innerText = "🤝 Confirm Sale & Generate Receipt";
};

// 2. Handle Product Selection
productSelect.addEventListener('change', () => {
    const id = productSelect.value;
    selectedProduct = allProducts.find(p => p.id === id);

    if (selectedProduct) {
        sellPriceInput.value = selectedProduct.price;
        updateSellTotal();
        checkStock();
    }
});

// 3. Live Total Calculation
function updateSellTotal() {
    const qty = parseFloat(sellQtyInput.value) || 0;
    const price = parseFloat(sellPriceInput.value) || 0;
    const total = qty * price;
    
    sellTotalDisplay.innerText = "৳" + total.toLocaleString(undefined, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    });
}

function checkStock() {
    if (selectedProduct) {
        const qtyToSell = parseFloat(sellQtyInput.value) || 0;
        const currentStock = parseFloat(selectedProduct.quantity) || 0;

        if (qtyToSell > currentStock) {
            stockWarning.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        } else {
            stockWarning.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }
}

sellQtyInput.addEventListener('input', () => {
    updateSellTotal();
    checkStock();
});
sellPriceInput.addEventListener('input', updateSellTotal);

// 4. Submit Sale
sellForm.onsubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
        alert("Please select a product first.");
        return;
    }

    const qty = parseFloat(sellQtyInput.value);
    if (qty <= 0) {
        alert("Quantity must be greater than zero.");
        return;
    }

    submitBtn.innerText = "⏳ Processing Sale...";
    submitBtn.disabled = true;
    document.body.style.cursor = 'wait';

    const saleData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: qty,
        unit: selectedProduct.unit,
        price: parseFloat(sellPriceInput.value),
        total: qty * parseFloat(sellPriceInput.value),
        customerName: document.getElementById('customerName').value.trim(),
        companyName: document.getElementById('companyName').value.trim(),
        customerPhone: document.getElementById('customerPhone').value.trim(),
        customerAddress: document.getElementById('customerAddress').value.trim(),
        date: new Date().toISOString()
    };

    // Send to API
    const success = await postData('sellProduct', saleData);
    
    document.body.style.cursor = 'default';

    if (success) {
        submitBtn.innerHTML = "✅ Sale Successful!";
        submitBtn.style.background = "var(--success)";
        
        setTimeout(() => {
            window.location.href = "history.html";
        }, 1000);
    } else {
        alert("Failed to record sale. Please try again.");
        submitBtn.innerText = "🤝 Confirm Sale & Generate Receipt";
        submitBtn.disabled = false;
    }
};
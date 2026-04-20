// ==========================================
// ADD/EDIT FORM LOGIC
// ==========================================

const form = document.getElementById('productForm');
const pageTitle = document.getElementById('pageTitle');
const submitBtn = document.getElementById('submitBtn');
const liveTotalDisplay = document.getElementById('liveTotal');

// Inputs
const nameInput = document.getElementById('name');
const qtyInput = document.getElementById('quantity');
const unitInput = document.getElementById('unit');
const priceInput = document.getElementById('price');
const keywordsInput = document.getElementById('keywords');

let editId = null; 

// 1. Run this when the page loads
window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    editId = urlParams.get('id');

    if (editId) {
        pageTitle.innerText = "✏️ Edit Product Details";
        submitBtn.innerHTML = "💾 Update Product Information";
        
        // --- FAST LOAD ATTEMPT ---
        const cachedData = sessionStorage.getItem('editProductCache');
        let productToEdit = null;

        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            // Verify the ID matches just in case
            if (parsed.id === editId) {
                productToEdit = parsed;
                console.log("🚀 Loaded product from cache!");
            }
            sessionStorage.removeItem('editProductCache'); // Clean up
        }

        if (productToEdit) {
            populateForm(productToEdit);
        } else {
            // --- SLOW LOAD FALLBACK ---
            document.body.style.cursor = 'wait';
            submitBtn.disabled = true;
            submitBtn.innerText = "⏳ Loading Data...";

            try {
                const allProducts = await getData('getProducts');
                productToEdit = allProducts.find(p => p.id === editId);

                if (productToEdit) {
                    populateForm(productToEdit);
                } else {
                    alert("Product not found!");
                    window.location.href = "products.html";
                }
            } catch (error) {
                alert("Failed to load product data.");
            } finally {
                document.body.style.cursor = 'default';
                submitBtn.disabled = false;
                submitBtn.innerHTML = "💾 Update Product Information";
            }
        }
    }
};

function populateForm(product) {
    nameInput.value = product.name || "";
    qtyInput.value = product.quantity || "";
    unitInput.value = product.unit || "kg";
    priceInput.value = product.price || "";
    keywordsInput.value = product.keywords || "";
    updateLiveTotal();
}

// 2. Live Total Calculation
function updateLiveTotal() {
    const qty = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const total = qty * price;
    
    liveTotalDisplay.innerText = "৳" + total.toLocaleString(undefined, {
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    });
}

qtyInput.addEventListener('input', updateLiveTotal);
priceInput.addEventListener('input', updateLiveTotal);

// 3. Form Submit Logic
form.onsubmit = async (e) => {
    e.preventDefault(); 
    
    if (parseFloat(qtyInput.value) < 0 || parseFloat(priceInput.value) < 0) {
        alert("Quantity and Price cannot be negative!");
        return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = "⏳ Saving to Database...";
    submitBtn.disabled = true;
    document.body.style.cursor = 'wait';

    const productData = {
        name: nameInput.value.trim(),
        quantity: qtyInput.value,
        unit: unitInput.value,
        price: priceInput.value,
        keywords: keywordsInput.value.trim()
    };

    let success = false;

    try {
        if (editId) {
            productData.id = editId;
            success = await postData('updateProduct', productData);
        } else {
            success = await postData('addProduct', productData);
        }
    } catch (err) {
        success = false;
    } finally {
        document.body.style.cursor = 'default';
    }

    if (success) {
        submitBtn.innerHTML = "✅ Saved Successfully!";
        submitBtn.style.background = "var(--success)";
        setTimeout(() => {
            window.location.href = "products.html";
        }, 800);
    } else {
        alert("Something went wrong.");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
};
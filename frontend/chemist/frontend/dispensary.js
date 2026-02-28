const API = "http://127.0.0.1:5003/api/chemist";

// Cart storage
let cart = [];
let medicines = [];

// Elements
const dashboardTab = document.getElementById("tab-dashboard");
const medicinesTab = document.getElementById("tab-medicines");
const dashboardView = document.getElementById("dashboard-view");
const medicinesView = document.getElementById("medicines-view");
const floatingCart = document.getElementById("floating-cart");
const cartPopup = document.getElementById("cart-popup");
const cartOverlay = document.getElementById("cart-overlay");
const closeCart = document.getElementById("close-cart");

// Add Medicine Modal Elements
const addMedicineBtn = document.getElementById("add-medicine-btn");
const addMedicineModal = document.getElementById("add-medicine-modal");
const addMedicineOverlay = document.getElementById("add-medicine-overlay");
const closeAddMedicine = document.getElementById("close-add-medicine");
const cancelAddMedicine = document.getElementById("cancel-add-medicine");
const addMedicineForm = document.getElementById("add-medicine-form");

// Tab switching
dashboardTab.addEventListener("click", e => {
    e.preventDefault();
    dashboardTab.classList.add("active");
    medicinesTab.classList.remove("active");
    dashboardView.style.display = "block";
    medicinesView.style.display = "none";
    floatingCart.style.display = "none";
    loadDashboardData();
});

medicinesTab.addEventListener("click", e => {
    e.preventDefault();
    medicinesTab.classList.add("active");
    dashboardTab.classList.remove("active");
    dashboardView.style.display = "none";
    medicinesView.style.display = "block";
    floatingCart.style.display = "flex";
    loadMedicines();
});

// Cart popup toggle - ONLY opens when cart button clicked
floatingCart.addEventListener("click", () => {
    cartPopup.classList.add("active");
    cartOverlay.classList.add("active");
});

closeCart.addEventListener("click", () => {
    cartPopup.classList.remove("active");
    cartOverlay.classList.remove("active");
});

cartOverlay.addEventListener("click", () => {
    cartPopup.classList.remove("active");
    cartOverlay.classList.remove("active");
});

// Add Medicine Modal Controls
addMedicineBtn.addEventListener("click", () => {
    addMedicineModal.classList.add("active");
    addMedicineOverlay.classList.add("active");
    // Set minimum date to tomorrow (must be in future)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById("expiry-date").setAttribute("min", minDate);
});

closeAddMedicine.addEventListener("click", () => {
    closeAddMedicineModal();
});

cancelAddMedicine.addEventListener("click", () => {
    closeAddMedicineModal();
});

addMedicineOverlay.addEventListener("click", () => {
    closeAddMedicineModal();
});

function closeAddMedicineModal() {
    addMedicineModal.classList.remove("active");
    addMedicineOverlay.classList.remove("active");
    addMedicineForm.reset();
}

// Add Medicine Form Submission
addMedicineForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values - matching backend field names exactly
    const formData = {
        medicine_name: document.getElementById("medicine-name").value.trim(),
        generic_name: document.getElementById("generic-name").value.trim(),
        category: document.getElementById("category").value,
        manufacturer: document.getElementById("manufacturer").value.trim(),
        batch_no: document.getElementById("batch-no").value.trim(),
        expiry_date: document.getElementById("expiry-date").value,
        quantity_in_stock: parseInt(document.getElementById("quantity").value),
        unit_price: parseFloat(document.getElementById("unit-price").value),
        reorder_level: parseInt(document.getElementById("reorder-level").value),
        storage_location: document.getElementById("storage-location").value.trim(),
        prescription_required: document.getElementById("prescription-required").checked
    };

    // Validate quantity is positive
    if (formData.quantity_in_stock < 0) {
        alert("❌ Quantity cannot be negative!");
        return;
    }

    // Validate unit price is positive
    if (formData.unit_price < 0) {
        alert("❌ Unit price cannot be negative!");
        return;
    }

    try {
        // Disable submit button to prevent double submission
        const submitBtn = addMedicineForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = "Adding...";

        const response = await fetch(`${API}/medicines`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(`✅ Medicine added successfully!\n\n` +
                `Medicine: ${formData.medicine_name}\n` +
                `Generic: ${formData.generic_name}\n` +
                `Batch: ${formData.batch_no}\n` +
                `Quantity: ${formData.quantity_in_stock}\n` +
                `Price: ₹${formData.unit_price}`);

            // Close modal and reset form
            closeAddMedicineModal();

            // Reload medicines list and dashboard
            await loadMedicines();
            await loadDashboardData();
        } else {
            alert(`❌ Error: ${result.error || "Failed to add medicine"}`);
        }
    } catch (err) {
        console.error("Add medicine error:", err);
        alert("❌ Failed to add medicine. Please check your connection and try again.");
    } finally {
        // Re-enable submit button
        const submitBtn = addMedicineForm.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = "Add Medicine";
    }
});

// Load dashboard data
function loadDashboardData() {
    fetch(`${API}/dashboard`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("metric-medicines").innerText = data.total_medicines || 0;
            document.getElementById("metric-transactions").innerText = data.transactions_today || 0;
            document.getElementById("metric-low").innerText = data.low_stock || 0;
        })
        .catch(err => console.error("Dashboard error:", err));

    // Load inventory table
    fetch(`${API}/medicines`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("inventory-table");
            tbody.innerHTML = "";

            // Show top 10 medicines
            data.slice(0, 10).forEach(med => {
                const tr = document.createElement("tr");
                const isLow = med.low || med.quantity <= 10;
                const isExpired = med.expired;

                let statusClass = 'ok';
                if (isExpired) {
                    statusClass = 'expired';
                } else if (isLow) {
                    statusClass = 'low';
                }

                tr.innerHTML = `
                    <td><b>${med.name}</b>${isExpired ? ' ⚠️' : ''}</td>
                    <td>${med.category}</td>
                    <td class="${statusClass}">${med.quantity}${isExpired ? ' (Expired)' : ''}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Inventory error:", err));

    // Load low stock items
    fetch(`${API}/medicines`)
        .then(res => res.json())
        .then(data => {
            const lowStockList = document.getElementById("low-stock-list");
            lowStockList.innerHTML = "";

            // Filter for low stock or expired
            const attentionItems = data.filter(med => med.low || med.expired);

            if (attentionItems.length === 0) {
                lowStockList.innerHTML = '<li>All medicines are adequately stocked</li>';
            } else {
                attentionItems.forEach(med => {
                    const li = document.createElement("li");
                    if (med.expired) {
                        li.innerHTML = `<b>${med.name}</b> - ⚠️ <span class="expired">EXPIRED</span>`;
                    } else {
                        li.innerHTML = `<b>${med.name}</b> - Only ${med.quantity} left`;
                    }
                    lowStockList.appendChild(li);
                });
            }
        })
        .catch(err => console.error("Low stock error:", err));
}

// Initial dashboard load
loadDashboardData();

// Load medicines
function loadMedicines() {
    fetch(`${API}/medicines`)
        .then(res => res.json())
        .then(data => {
            medicines = data;
            renderMedicineTable();
        })
        .catch(err => console.error("Medicines error:", err));
}

function renderMedicineTable() {
    const tbody = document.getElementById("medicine-table");
    tbody.innerHTML = "";

    medicines.forEach(med => {
        const isLow = med.low || med.quantity <= 10;
        const isExpired = med.expired;
        const tr = document.createElement("tr");

        const available = med.quantity;

        let statusClass = 'ok';
        if (isExpired) {
            statusClass = 'expired';
        } else if (isLow) {
            statusClass = 'low';
        }

        tr.innerHTML = `
            <td><b>${med.name}</b>${isExpired ? ' ⚠️' : ''}</td>
            <td>${med.category}</td>
            <td class="${statusClass}">${available}${isExpired ? ' (Expired)' : ''}</td>
            <td>
                <div class="action-cell">
                    <input type="number" id="qty-${med.id}" min="1" max="${available}" value="1" 
                           ${available <= 0 || isExpired ? 'disabled' : ''}>
                    <button class="add-to-cart-btn" onclick="addToCart(${med.id})"
                            ${available <= 0 || isExpired ? 'disabled' : ''}>
                        ${isExpired ? 'Expired' : 'Add to Cart'}
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Add to cart - NO AUTO POPUP
function addToCart(medicineId) {
    const qtyInput = document.getElementById(`qty-${medicineId}`);
    const quantity = parseInt(qtyInput.value) || 1;

    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    // Check if expired
    if (medicine.expired) {
        alert("❌ Cannot add expired medicine to cart!");
        return;
    }

    const existingItem = cart.find(item => item.medicine_id === medicineId);
    const currentCartQty = existingItem ? existingItem.quantity : 0;
    const newTotalQty = currentCartQty + quantity;

    if (newTotalQty > medicine.quantity) {
        alert(`Cannot add ${quantity}. Only ${medicine.quantity - currentCartQty} more available (${currentCartQty} already in cart).`);
        return;
    }

    if (existingItem) {
        existingItem.quantity = newTotalQty;
    } else {
        cart.push({
            medicine_id: medicineId,
            medicine_name: medicine.name,
            quantity: quantity,
            price: medicine.price || 0
        });
    }

    renderCart();
    qtyInput.value = 1;

    // Show visual feedback without opening popup
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "✓ Added";
    btn.style.background = "#059669";
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = "";
    }, 1000);
}

// Remove from cart
function removeFromCart(medicineId) {
    cart = cart.filter(item => item.medicine_id !== medicineId);
    renderCart();
}

// Increase quantity
function increaseQty(medicineId) {
    const item = cart.find(item => item.medicine_id === medicineId);
    const medicine = medicines.find(m => m.id === medicineId);

    if (item && medicine && item.quantity < medicine.quantity) {
        item.quantity++;
        renderCart();
    } else {
        alert(`Maximum stock reached: ${medicine.quantity}`);
    }
}

// Decrease quantity
function decreaseQty(medicineId) {
    const item = cart.find(item => item.medicine_id === medicineId);

    if (item && item.quantity > 1) {
        item.quantity--;
        renderCart();
    }
}

// Render cart with +/- controls
function renderCart() {
    const cartBody = document.getElementById("cart-body");
    const cartFooter = document.getElementById("cart-footer");
    const cartBadge = document.getElementById("cart-badge");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (cart.length === 0) {
        cartBody.innerHTML = '<div class="cart-empty">Your cart is empty. Add medicines to get started.</div>';
        cartFooter.style.display = "none";
        cartBadge.style.display = "none";
        return;
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = "flex";

    let html = '';
    cart.forEach(item => {
        const medicine = medicines.find(m => m.id === item.medicine_id);
        const maxQty = medicine ? medicine.quantity : item.quantity;

        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.medicine_name}</div>
                    <small style="opacity: 0.7;">Max: ${maxQty}</small>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="decreaseQty(${item.medicine_id})">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="increaseQty(${item.medicine_id})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.medicine_id})">
                        ✕
                    </button>
                </div>
            </div>
        `;
    });

    cartBody.innerHTML = html;

    document.getElementById("cart-total-items").textContent = totalItems;
    cartFooter.style.display = "block";

    updateCheckoutButton();
}

// Checkout with Employee ID lookup
document.getElementById("checkout-btn").addEventListener("click", async () => {
    const empId = document.getElementById("cart-patient-id").value.trim();
    const patientName = document.getElementById("cart-patient-name").value.trim();

    if (!empId || !patientName) {
        alert("Please enter Employee ID and Patient Name");
        return;
    }

    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    try {
        // Step 1: Lookup patient UUID by employee ID
        const lookupResponse = await fetch(`${API}/patient/lookup?emp_id=${empId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!lookupResponse.ok) {
            const error = await lookupResponse.json();
            alert(`❌ Patient not found: ${error.error || 'Invalid Employee ID'}`);
            return;
        }

        const patientData = await lookupResponse.json();
        const patientUuid = patientData.patient_id;

        // Verify name matches (optional)
        if (patientData.name.toLowerCase() !== patientName.toLowerCase()) {
            const confirm = window.confirm(
                `Name mismatch!\nDatabase: ${patientData.name}\nEntered: ${patientName}\n\nContinue anyway?`
            );
            if (!confirm) return;
        }

        // Step 2: Place order with UUID
        const orderData = {
            patient_id: patientUuid,
            patient_name: patientData.name,
            emp_id: empId,
            items: cart.map(item => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                dosage: "",
                remarks: ""
            }))
        };

        const orderResponse = await fetch(`${API}/medicine-orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        const result = await orderResponse.json();

        if (orderResponse.ok) {
            alert(`✅ Order placed successfully!\n\nPatient: ${patientData.name}\nEmployee ID: ${empId}\nOrder ID: ${result.order_id}\nTotal Items: ${cart.reduce((s, i) => s + i.quantity, 0)}`);

            // Clear cart and reload data
            cart = [];
            renderCart();
            loadMedicines();
            loadDashboardData();

            // Clear patient info
            document.getElementById("cart-patient-id").value = "";
            document.getElementById("cart-patient-name").value = "";

            // Close popup
            cartPopup.classList.remove("active");
            cartOverlay.classList.remove("active");
        } else {
            alert(`❌ Error: ${result.error || "Failed to place order"}`);
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("❌ Failed to place order. Please check your connection and try again.");
    }
});

// Search functionality
document.getElementById("medicine-search").addEventListener("input", function () {
    const value = this.value.toLowerCase();
    document.querySelectorAll("#medicine-table tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
    });
});

// Enable/disable checkout based on patient info
document.getElementById("cart-patient-id").addEventListener("input", updateCheckoutButton);
document.getElementById("cart-patient-name").addEventListener("input", updateCheckoutButton);

function updateCheckoutButton() {
    const empId = document.getElementById("cart-patient-id").value;
    const patientName = document.getElementById("cart-patient-name").value;
    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.disabled = !empId || !patientName || cart.length === 0;
}
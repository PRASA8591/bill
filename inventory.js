
const role = sessionStorage.getItem("role");
const form = document.getElementById("addItemForm");
const table = document.getElementById("inventoryTable").querySelector("tbody");

if (!role || !["admin", "audit", "manager"].includes(role)) {
  alert("Access Denied");
  window.location.href = "dashboard.html";
}

if (role !== "admin") {
  document.querySelector(".admin-only")?.remove();
}
if (role !== "admin" && form) {
  form.style.display = "none";
}

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const code = document.getElementById("code").value;
  const cost = parseFloat(document.getElementById("cost").value);
  const price = parseFloat(document.getElementById("price").value);
  const qty = parseInt(document.getElementById("qty").value);
  await db.collection("products").add({ name, code, cost, price, qty });
  form.reset();
  loadProducts();
});

async function deleteProduct(id) {
  if (confirm("Delete this item?")) {
    await db.collection("products").doc(id).delete();
    loadProducts();
  }
}

async function applyQty(id, type) {
  const input = document.getElementById(`change-${id}`);
  const change = parseInt(input.value) || 0;
  if (change <= 0) return alert("Enter valid quantity");

  const ref = db.collection("products").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return;

  const current = doc.data().qty || 0;
  const newQty = type === "add" ? current + change : current - change;

  if (newQty < 0) return alert("Stock cannot be negative");

  await ref.update({ qty: newQty });
  loadProducts();
}

async function loadProducts() {
  table.innerHTML = "";
  try {
    const snap = await db.collection("products").get();
    if (snap.empty) {
      table.innerHTML = `<tr><td colspan="6">No products found.</td></tr>`;
      return;
    }

    snap.forEach(doc => {
      const i = doc.data();
      const cost = i.cost ?? 0;
      const price = i.price ?? 0;
      const qty = i.qty ?? 0;

      let row = `<tr>
        <td>${i.name}</td>
        <td>${i.code}</td>
        <td>${cost}</td>
        <td>${price}</td>
        <td>${qty}</td>
        <td style="display: flex; flex-direction: column; gap: 4px;">`;

      if (role === "admin" || role === "audit") {
        row += `
          <div style="display:flex; gap:4px;">
            <input type="number" id="change-${doc.id}" value="1" min="1" style="width: 50px; padding: 4px;" />
            <button onclick="applyQty('${doc.id}', 'add')">➕</button>
            <button onclick="applyQty('${doc.id}', 'sub')">➖</button>
          </div>
        `;
      }

      if (role === "admin") {
        row += `<button onclick="deleteProduct('${doc.id}')" style="width:80px; padding:4px;">🗑️</button>`;
      }

      row += `</td></tr>`;
      table.innerHTML += row;
    });

  } catch (err) {
    console.error("❌ Error loading products:", err);
    table.innerHTML = `<tr><td colspan="6">Failed to load products.</td></tr>`;
  }
}

loadProducts();

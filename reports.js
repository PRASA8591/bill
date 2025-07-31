const role = sessionStorage.getItem("role");
if (!role || (role !== "admin" && role !== "manager")) {
  alert("Access Denied");
  window.location.href = "dashboard.html";
}
if (role !== "admin") {
  document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
}

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// Load item and user dropdowns
window.onload = () => {
  loadItems();
  loadUsers();
};

async function loadItems() {
  const itemSelect = document.getElementById("itemSelect");
  itemSelect.innerHTML = `<option value="">-- Select Item --</option>`;
  const snap = await db.collection("products").get();
  snap.forEach(doc => {
    const item = doc.data();
    // Only use item name for dropdown value (no code in value)
    itemSelect.innerHTML += `<option value="${item.name}">${item.name} (${item.code})</option>`;
  });
}

async function loadUsers() {
  const userSelect = document.getElementById("userSelect");
  userSelect.innerHTML = `<option value="">-- Select User --</option>`;
  const snap = await db.collection("users").get();
  snap.forEach(doc => {
    const user = doc.data();
    userSelect.innerHTML += `<option value="${user.username}">${user.username}</option>`;
  });
}

function toggleFilters() {
  const type = document.getElementById("reportType").value;
  document.getElementById("itemSelect").style.display =
    ["itemHistory", "priceHistory", "itemSales"].includes(type) ? "inline" : "none";
  document.getElementById("userSelect").style.display =
    type === "userSales" ? "inline" : "none";
}

async function loadReports() {
  const type = document.getElementById("reportType").value;
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);
  const item = document.getElementById("itemSelect").value;
  const user = document.getElementById("userSelect").value;

  const thead = document.getElementById("reportHeader");
  const tbody = document.getElementById("reportTableBody");
  const summary = document.getElementById("summaryText");

  tbody.innerHTML = "";
  summary.textContent = "";
  thead.innerHTML = "";

  if (isNaN(from) || isNaN(to)) {
    alert("Please select a valid date range.");
    return;
  }

  let total = 0;

  if (type === "itemSales") {
    if (!item) {
      alert("Please select an item.");
      return;
    }

    thead.innerHTML = "<tr><th>Date</th><th>Qty Sold</th><th>Revenue</th></tr>";
    let totalQty = 0;

    const snap = await db.collection("sales").get();
    snap.forEach(doc => {
      const data = doc.data();
      const d = new Date(data.date);
      if (d >= from && d <= to) {
        data.items.forEach(i => {
          // Match item name case-insensitively
          if (i.name.toLowerCase() === item.toLowerCase()) {
            tbody.innerHTML += `
              <tr>
                <td>${d.toLocaleDateString()}</td>
                <td>${i.qty}</td>
                <td>${(i.qty * i.price).toFixed(2)}</td>
              </tr>`;
            total += i.qty * i.price;
            totalQty += i.qty;
          }
        });
      }
    });

    summary.textContent = `Total Qty: ${totalQty}, Total Revenue: LKR ${total.toFixed(2)}`;
  }

  // Other reports (optional - only include if you need them)

  else if (type === "general") {
    thead.innerHTML = "<tr><th>Date</th><th>User</th><th>Items</th><th>Total (LKR)</th></tr>";
    const snap = await db.collection("sales").get();
    snap.forEach(doc => {
      const data = doc.data();
      const d = new Date(data.date);
      if (d >= from && d <= to) {
        const itemList = data.items.map(i => `${i.name} x${i.qty}`).join(", ");
        tbody.innerHTML += `
          <tr>
            <td>${d.toLocaleDateString()}</td>
            <td>${data.user}</td>
            <td>${itemList}</td>
            <td>${data.subtotal.toFixed(2)}</td>
          </tr>`;
        total += data.subtotal;
      }
    });
    summary.textContent = `Total Sales: LKR ${total.toFixed(2)}`;
  }

  else {
    tbody.innerHTML = `<tr><td colspan="3">This report type is not implemented in this version.</td></tr>`;
  }
}

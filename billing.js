// Patched billing.js

let cart = [];
let allItems = [];

const itemSelect = document.getElementById("itemSelect");
const qtyInput = document.getElementById("quantity");
const cartBody = document.getElementById("cartBody");
const subtotalText = document.getElementById("subtotal");

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

window.onload = async () => {
  const snapshot = await db.collection("products").get();
  allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  allItems.forEach(item => {
    const option = document.createElement("option");
    option.value = item.code;
    option.textContent = `${item.name} (${item.code}) - Stock: ${item.qty}`;
    itemSelect.appendChild(option);
  });
};

function addItem() {
  const code = itemSelect.value;
  const qty = parseInt(qtyInput.value);

  if (!code || qty <= 0) {
    alert("Please select an item and enter a valid quantity.");
    return;
  }

  const item = allItems.find(i => i.code === code);
  if (!item) {
    alert("Selected item not found.");
    return;
  }

  if (item.qty < qty) {
    alert("Insufficient stock available.");
    return;
  }

  const price = item.sellPrice ?? item.price ?? 0;
  const total = price * qty;
  cart.push({ id: item.id, name: item.name, code: item.code, price, qty, total });

  renderCart();
  itemSelect.value = "";
  qtyInput.value = 1;
}

function renderCart() {
  cartBody.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.total ?? 0;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${(item.price ?? 0).toFixed(2)}</td>
      <td>${(item.total ?? 0).toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">❌</button></td>
    `;
    cartBody.appendChild(row);
  });

  subtotalText.textContent = subtotal.toFixed(2);
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

function saveBill() {
  if (cart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const bill = {
    items: cart,
    subtotal: parseFloat(subtotalText.textContent),
    user: sessionStorage.getItem("username") || "unknown",
    date: new Date().toISOString()
  };

  db.collection("sales").add(bill)
    .then(async (docRef) => {
      for (const item of cart) {
        const productRef = db.collection("products").doc(item.id);
        await productRef.update({ qty: firebase.firestore.FieldValue.increment(-item.qty) });
      }
      alert("Bill saved successfully!");
      printBill(bill);
      cart = [];
      renderCart();
    })
    .catch(err => {
      console.error("Error saving bill:", err);
      alert("Failed to save bill.");
    });
}

// Enlarged logo patch in billing.js printBill()
function printBill(bill) {
  db.collection("settings").doc("main").get().then(doc => {
    const data = doc.exists ? doc.data() : {};
    const businessName = data.name || "My Business";
    const logo = data.logo || "";

    const printWindow = window.open("", "PrintBill", "width=600,height=700");
    printWindow.document.write(`
      <html><head><title>Print Bill</title></head><body>
      <div style="text-align:center">
        ${logo ? `<img src='${logo}' style='max-width:200px; height:auto;'><br>` : ""}
        <h1>${businessName}</h1>
      </div>
      <p>Date: ${new Date(bill.date).toLocaleString()}</p>
      <p>Cashier: ${bill.user}</p>
      <table border='1' width='100%' cellpadding='10' cellspacing='0'>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${bill.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${(i.price ?? 0).toFixed(2)}</td><td>${(i.total ?? 0).toFixed(2)}</td></tr>`).join('')}
      </table>
      <h3>Total: LKR ${bill.subtotal.toFixed(2)}</h3>
      <script>window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
  });
}

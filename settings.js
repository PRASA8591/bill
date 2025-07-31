// js/settings.js

const form = document.getElementById('settingsForm');
const nameInput = document.getElementById('businessName');
const taxInput = document.getElementById('taxPercent');
const logoInput = document.getElementById('logoUrl');
const preview = document.getElementById('preview');

const settingsRef = db.collection('settings').doc('main');

window.onload = loadSettings;

async function loadSettings() {
  try {
    const doc = await settingsRef.get();
    if (doc.exists) {
      const data = doc.data();
      nameInput.value = data.name || "";
      taxInput.value = data.tax || 0;
      logoInput.value = data.logo || "";

      if (data.logo) {
        preview.innerHTML = `<img src="${data.logo}" alt="Logo" height="80" />`;
      }
    }
  } catch (err) {
    console.error("Error loading settings:", err);
    alert("Failed to load settings.");
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const tax = parseFloat(taxInput.value);
  const logo = logoInput.value.trim();

  try {
    await settingsRef.set({ name, tax, logo });
    alert("Settings saved!");
    if (logo) {
      preview.innerHTML = `<img src="${logo}" alt="Logo" height="80" />`;
    }
  } catch (err) {
    console.error("Error saving settings:", err);
    alert("Failed to save.");
  }
});

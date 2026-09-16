/* ==========================================================
   UNFORM — script.js
   Plain JavaScript, no framework.
   This one file runs on every page — each section only does
   something if the matching element exists on the page.
   ========================================================== */

// ---------- Config (fill these in later) ----------
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxC-dU6g9q3QESC7MRgHp5oLGDz-a76H5juUE_Tyk3lBCb-G861Dgp8xIfFlQBA1Y9aBA/exec'; 
// Google Apps Script Web App URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7I1YG78GYK5XymweSs-fTnvPpgjF1GK7ICmujk3ulBcozUFDOustvcKg3T_qqw2LxeRkY9swPnWhA/pub?gid=0&single=true&output=csv';                 // Published Google Sheet CSV URL

const UNIT_PRICE = 499;

// ============================================================
// Mobile navigation toggle (runs on every page)
// ============================================================
(function initNav() {
  const toggleBtn = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
})();

// ============================================================
// Product data
// Loaded once from products.json and reused by every page
// that needs it (home, shop, order).
// ============================================================
function loadProducts() {
  return fetch('products.json')
    .then(function (res) {
      if (!res.ok) throw new Error('ไม่สามารถโหลด products.json ได้');
      return res.json();
    });
}

// Build one product card element
function buildProductCard(product, linkTarget) {
  const card = document.createElement('a');
  card.className = 'product-card';
  card.href = linkTarget + '?color=' + encodeURIComponent(product.id);

  card.innerHTML =
    '<figure><img src="' + product.image + '" alt="' + product.name + ' ' + product.color + '"></figure>' +
    '<figcaption>' +
      '<p class="product-name">' + product.name + '</p>' +
      '<p class="product-color">' + product.color + '</p>' +
      '<p class="product-price">' + product.price + ' บาท</p>' +
      '<span class="btn btn-outline">เลือกสินค้า</span>' +
    '</figcaption>';

  return card;
}

// ---------- Home page product grid ----------
(function renderHomeGrid() {
  const grid = document.getElementById('homeProductGrid');
  if (!grid) return;

  loadProducts()
    .then(function (products) {
      products.forEach(function (product) {
        grid.appendChild(buildProductCard(product, 'product.html'));
      });
    })
    .catch(function (err) {
      grid.textContent = 'ไม่สามารถโหลดสินค้าได้';
      console.error(err);
    });
})();

// ---------- Shop page product grid ----------
(function renderShopGrid() {
  const grid = document.getElementById('shopProductGrid');
  if (!grid) return;

  loadProducts()
    .then(function (products) {
      products.forEach(function (product) {
        grid.appendChild(buildProductCard(product, 'order.html'));
      });
    })
    .catch(function (err) {
      grid.textContent = 'ไม่สามารถโหลดสินค้าได้';
      console.error(err);
    });
})();

// ============================================================
// Order page
// ============================================================
(function initOrderPage() {
  const submitBtn = document.getElementById('submitOrderBtn');
  if (!submitBtn) return; // not the order page

  const orderImage = document.getElementById('orderImage');
  const orderProductName = document.getElementById('orderProductName');
  const orderColorLabel = document.getElementById('orderColorLabel');
  const orderUnitPrice = document.getElementById('orderUnitPrice');
  const colorOptions = document.getElementById('colorOptions');
  const sizeOptions = document.getElementById('sizeOptions');
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const orderTotal = document.getElementById('orderTotal');
  const orderMessage = document.getElementById('orderMessage');

  let products = [];
  let selectedProduct = null;
  let selectedSize = null;

  // ---- Product selection ----
  function getRequestedColorId() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('color');
    if (fromUrl) return fromUrl.toLowerCase();

    const fromStorage = window.localStorage.getItem('unform_selected_color');
    if (fromStorage) return fromStorage.toLowerCase();

    return null;
  }

  function selectProduct(product) {
    selectedProduct = product;
    window.localStorage.setItem('unform_selected_color', product.id);

    orderImage.src = product.image;
    orderImage.alt = product.name + ' ' + product.color;
    orderProductName.textContent = product.name;
    orderColorLabel.textContent = 'สี: ' + product.color;
    orderUnitPrice.textContent = product.price + ' บาท';

    // Update swatch highlight
    Array.prototype.forEach.call(colorOptions.children, function (btn) {
      btn.classList.toggle('selected', btn.dataset.colorId === product.id);
    });

    updateTotal();
  }

  function renderColorOptions() {
    colorOptions.innerHTML = '';
    products.forEach(function (product) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-option';
      btn.textContent = product.color;
      btn.dataset.colorId = product.id;
      btn.addEventListener('click', function () {
        selectProduct(product);
      });
      colorOptions.appendChild(btn);
    });
  }

  // ---- Size selection ----
  Array.prototype.forEach.call(sizeOptions.children, function (btn) {
    btn.addEventListener('click', function () {
      selectedSize = btn.dataset.size;
      Array.prototype.forEach.call(sizeOptions.children, function (b) {
        b.classList.toggle('selected', b === btn);
      });
    });
  });

  // ---- Quantity control ----
  function clampQty() {
    let qty = parseInt(qtyInput.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    qtyInput.value = qty;
    return qty;
  }

  qtyMinus.addEventListener('click', function () {
    qtyInput.value = Math.max(1, clampQty() - 1);
    updateTotal();
  });

  qtyPlus.addEventListener('click', function () {
    qtyInput.value = clampQty() + 1;
    updateTotal();
  });

  qtyInput.addEventListener('input', updateTotal);

  // ---- Order calculation ----
  function updateTotal() {
    const qty = clampQty();
    const total = UNIT_PRICE * qty;
    orderTotal.textContent = total.toLocaleString('th-TH') + ' บาท';
  }

  // ---- Message helper ----
  function showMessage(text, type) {
    orderMessage.textContent = text;
    orderMessage.className = 'form-message visible ' + (type || '');
  }

  // ---- Submit order ----
  function submitOrder() {
    const qty = clampQty();

    // Validate before sending
    if (!selectedProduct) {
      showMessage('กรุณาเลือกสี', 'error');
      return;
    }
    if (!selectedSize) {
      showMessage('กรุณาเลือกไซส์', 'error');
      return;
    }
    if (qty <= 0) {
      showMessage('กรุณาระบุจำนวนอย่างน้อย 1 ชิ้น', 'error');
      return;
    }

    // Total is always calculated here — never taken from the page
    const total = UNIT_PRICE * qty;

    const payload = {
      product: selectedProduct.name,
      color: selectedProduct.color,
      size: selectedSize,
      quantity: qty,
      total: total
    };

    submitBtn.disabled = true;
    showMessage('กำลังบันทึกรายการ...', 'info');

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('ส่งข้อมูลไม่สำเร็จ');
        window.location.href = 'thankyou.html';
      })
      .catch(function (err) {
        console.error(err);
        submitBtn.disabled = false;
        showMessage('ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง', 'error');
      });
  }

  submitBtn.addEventListener('click', submitOrder);

  // ---- Init ----
  loadProducts()
    .then(function (data) {
      products = data;
      renderColorOptions();

      const requestedId = getRequestedColorId();
      const initial = products.find(function (p) { return p.id === requestedId; }) || products[0];
      selectProduct(initial);
    })
    .catch(function (err) {
      console.error(err);
      showMessage('ไม่สามารถโหลดข้อมูลสินค้าได้', 'error');
    });
})();

// ============================================================
// Admin CSV
// ============================================================
(function initAdminPage() {
  const tableBody = document.getElementById('adminTableBody');
  const statusEl = document.getElementById('adminStatus');
  if (!tableBody || !statusEl) return; // not the admin page

  // Very small CSV parser — good enough for a simple Sheet export
  // without quoted commas inside fields.
  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    return lines.map(function (line) {
      return line.split(',').map(function (cell) {
        return cell.trim().replace(/^"|"$/g, '');
      });
    });
  }

  fetch(CSV_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('โหลด CSV ไม่สำเร็จ');
      return res.text();
    })
    .then(function (text) {
      const rows = parseCsv(text);
      const dataRows = rows.slice(1); // skip header row

      if (dataRows.length === 0) {
        statusEl.textContent = 'ยังไม่มีรายการ';
        return;
      }

      statusEl.textContent = 'ทั้งหมด ' + dataRows.length + ' รายการ';

      dataRows.forEach(function (row) {
        const tr = document.createElement('tr');
        row.forEach(function (cell) {
          const td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
    })
    .catch(function (err) {
      console.error(err);
      statusEl.textContent = 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ CSV URL';
      statusEl.classList.add('error');
    });
})();

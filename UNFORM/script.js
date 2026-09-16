/* ==========================================================
   UNFORM — script.js
   Plain JavaScript, no framework.
   ========================================================== */

// ---------- Config ----------
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxC-dU6g9q3QESC7MRgHp5oLGDz-a76H5juUE_Tyk3lBCb-G861Dgp8xIfFlQBA1Y9aBA/exec';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7I1YG78GYK5XymweSs-fTnvPpgjF1GK7ICmujk3ulBcozUFDOustvcKg3T_qqw2LxeRkY9swPnWhA/pub?gid=0&single=true&output=csv';

const UNIT_PRICE = 499;


// ============================================================
// Mobile navigation toggle
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
// ============================================================
function loadProducts() {
  return fetch('products.json')
    .then(function (res) {
      if (!res.ok) {
        throw new Error('ไม่สามารถโหลด products.json ได้');
      }

      return res.json();
    });
}


// ============================================================
// Build product card
// ============================================================
function buildProductCard(product, linkTarget) {
  const card = document.createElement('a');

  card.className = 'product-card';
  card.href = linkTarget + '?color=' + encodeURIComponent(product.id);

  card.innerHTML =
    '<figure>' +
      '<img src="' + product.image + '" alt="' +
      product.name + ' ' + product.color + '">' +
    '</figure>' +

    '<figcaption>' +
      '<p class="product-name">' + product.name + '</p>' +
      '<p class="product-color">' + product.color + '</p>' +
      '<p class="product-price">' + product.price + ' บาท</p>' +
      '<span class="btn btn-outline">เลือกสินค้า</span>' +
    '</figcaption>';

  return card;
}


// ============================================================
// Home page product grid
// ============================================================
(function renderHomeGrid() {
  const grid = document.getElementById('homeProductGrid');

  if (!grid) return;

  loadProducts()
    .then(function (products) {

      products.forEach(function (product) {
        grid.appendChild(
          buildProductCard(product, 'product.html')
        );
      });

    })
    .catch(function (err) {

      grid.textContent = 'ไม่สามารถโหลดสินค้าได้';

      console.error(err);

    });
})();


// ============================================================
// Shop page product grid
// ============================================================
(function renderShopGrid() {
  const grid = document.getElementById('shopProductGrid');

  if (!grid) return;

  loadProducts()
    .then(function (products) {

      products.forEach(function (product) {
        grid.appendChild(
          buildProductCard(product, 'order.html')
        );
      });

    })
    .catch(function (err) {

      grid.textContent = 'ไม่สามารถโหลดสินค้าได้';

      console.error(err);

    });
})();


// ============================================================
// ORDER PAGE
// ============================================================
(function initOrderPage() {

  const submitBtn = document.getElementById('submitOrderBtn');

  if (!submitBtn) return;


  // ---------- Elements ----------
  const orderImage =
    document.getElementById('orderImage');

  const orderProductName =
    document.getElementById('orderProductName');

  const orderColorLabel =
    document.getElementById('orderColorLabel');

  const orderUnitPrice =
    document.getElementById('orderUnitPrice');

  const colorOptions =
    document.getElementById('colorOptions');

  const sizeOptions =
    document.getElementById('sizeOptions');

  const qtyInput =
    document.getElementById('qtyInput');

  const qtyMinus =
    document.getElementById('qtyMinus');

  const qtyPlus =
    document.getElementById('qtyPlus');

  const orderTotal =
    document.getElementById('orderTotal');

  const orderMessage =
    document.getElementById('orderMessage');


  // ---------- State ----------
  let products = [];

  let selectedProduct = null;

  let selectedSize = null;


  // ==========================================================
  // Product selection
  // ==========================================================
  function getRequestedColorId() {

    const params =
      new URLSearchParams(window.location.search);

    const fromUrl =
      params.get('color');

    if (fromUrl) {
      return fromUrl.toLowerCase();
    }


    const fromStorage =
      window.localStorage.getItem(
        'unform_selected_color'
      );

    if (fromStorage) {
      return fromStorage.toLowerCase();
    }


    return null;
  }


  // ==========================================================
  // Select product
  // ==========================================================
  function selectProduct(product) {

    if (!product) return;

    selectedProduct = product;


    // Save selected color
    window.localStorage.setItem(
      'unform_selected_color',
      product.id
    );


    // Product image
    if (orderImage) {

      orderImage.src = product.image;

      orderImage.alt =
        product.name + ' ' + product.color;
    }


    // Product name
    if (orderProductName) {

      orderProductName.textContent =
        product.name;
    }


    // Color label
    if (orderColorLabel) {

      orderColorLabel.textContent =
        'สี: ' + product.color;
    }


    // Price
    if (orderUnitPrice) {

      orderUnitPrice.textContent =
        product.price + ' บาท';
    }


    // Highlight selected color
    if (colorOptions) {

      Array.prototype.forEach.call(
        colorOptions.children,
        function (btn) {

          btn.classList.toggle(
            'selected',
            btn.dataset.colorId === product.id
          );

        }
      );

    }


    updateTotal();
  }


  // ==========================================================
  // Render color buttons
  // ==========================================================
  function renderColorOptions() {

    if (!colorOptions) return;

    colorOptions.innerHTML = '';


    products.forEach(function (product) {

      const btn =
        document.createElement('button');

      btn.type = 'button';

      btn.className =
        'swatch-option';

      btn.textContent =
        product.color;

      btn.dataset.colorId =
        product.id;


      btn.addEventListener(
        'click',
        function () {

          selectProduct(product);

        }
      );


      colorOptions.appendChild(btn);

    });
  }


  // ==========================================================
  // Size selection
  // ==========================================================
  if (sizeOptions) {

    Array.prototype.forEach.call(
      sizeOptions.children,
      function (btn) {

        btn.addEventListener(
          'click',
          function () {

            selectedSize =
              btn.dataset.size;


            Array.prototype.forEach.call(
              sizeOptions.children,
              function (b) {

                b.classList.toggle(
                  'selected',
                  b === btn
                );

              }
            );

          }
        );

      }
    );

  }


  // ==========================================================
  // Quantity
  // ==========================================================
  function clampQty() {

    let qty =
      parseInt(qtyInput.value, 10);


    if (isNaN(qty) || qty < 1) {
      qty = 1;
    }


    qtyInput.value = qty;

    return qty;
  }


  // Minus
  if (qtyMinus) {

    qtyMinus.addEventListener(
      'click',
      function () {

        qtyInput.value =
          Math.max(
            1,
            clampQty() - 1
          );

        updateTotal();

      }
    );

  }


  // Plus
  if (qtyPlus) {

    qtyPlus.addEventListener(
      'click',
      function () {

        qtyInput.value =
          clampQty() + 1;

        updateTotal();

      }
    );

  }


  // Quantity input
  if (qtyInput) {

    qtyInput.addEventListener(
      'input',
      updateTotal
    );

  }


  // ==========================================================
  // Calculate total
  // ==========================================================
  function updateTotal() {

    if (!qtyInput || !orderTotal) {
      return;
    }


    const qty =
      clampQty();


    const total =
      UNIT_PRICE * qty;


    orderTotal.textContent =
      total.toLocaleString('th-TH') +
      ' บาท';
  }


  // ==========================================================
  // Message
  // ==========================================================
  function showMessage(text, type) {

    if (!orderMessage) return;


    orderMessage.textContent =
      text;


    orderMessage.className =
      'form-message visible ' +
      (type || '');
  }


  // ==========================================================
  // Submit order
  // ==========================================================
  function submitOrder() {

    const qty =
      clampQty();


    // Validate color
    if (!selectedProduct) {

      showMessage(
        'กรุณาเลือกสี',
        'error'
      );

      return;
    }


    // Validate size
    if (!selectedSize) {

      showMessage(
        'กรุณาเลือกไซส์',
        'error'
      );

      return;
    }


    // Validate quantity
    if (qty <= 0) {

      showMessage(
        'กรุณาระบุจำนวนอย่างน้อย 1 ชิ้น',
        'error'
      );

      return;
    }


    // Calculate total
    const total =
      UNIT_PRICE * qty;


    // Data sent to Google Sheet
    const payload = {

      product:
        selectedProduct.name,

      color:
        selectedProduct.color,

      size:
        selectedSize,

      quantity:
        qty,

      total:
        total

    };


    // Disable button
    submitBtn.disabled = true;


    showMessage(
      'กำลังบันทึกรายการ...',
      'info'
    );


    // Send to Google Apps Script
    fetch(
      APPS_SCRIPT_URL,
      {
        method: 'POST',

        body:
          JSON.stringify(payload)
      }
    )

      .then(function (res) {

        if (!res.ok) {

          throw new Error(
            'ส่งข้อมูลไม่สำเร็จ'
          );

        }


        // Success
        window.location.href =
          'thankyou.html';

      })

      .catch(function (err) {

        console.error(err);


        submitBtn.disabled =
          false;


        showMessage(
          'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง',
          'error'
        );

      });

  }


  // Submit button
  submitBtn.addEventListener(
    'click',
    submitOrder
  );


  // ==========================================================
  // Fallback products
  //
  // ใช้กรณี products.json โหลดไม่ได้
  // ==========================================================
  const fallbackProducts = [

    {
      id: 'base',
      name: 'UNFORM T-Shirt',
      color: 'Base',
      price: 499,
      image: 'images/UNFORM base.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'Regular Fit',
      material: 'Cotton 100%'
    },

    {
      id: 'pink',
      name: 'UNFORM T-Shirt',
      color: 'Pink',
      price: 499,
      image: 'images/UNFORM pink.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'Regular Fit',
      material: 'Cotton 100%'
    },

    {
      id: 'blue',
      name: 'UNFORM T-Shirt',
      color: 'Blue',
      price: 499,
      image: 'images/UNFORM blue.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'Regular Fit',
      material: 'Cotton 100%'
    },

    {
      id: 'green',
      name: 'UNFORM T-Shirt',
      color: 'Green',
      price: 499,
      image: 'images/UNFORM green.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'Regular Fit',
      material: 'Cotton 100%'
    }

  ];


  // ==========================================================
  // Init order page
  // ==========================================================
  loadProducts()

    .then(function (data) {

      // Make sure data is an array
      if (!Array.isArray(data) ||
          data.length === 0) {

        throw new Error(
          'products.json ไม่มีข้อมูลสินค้า'
        );

      }


      products = data;


      // Create color buttons
      renderColorOptions();


      // Get requested color
      const requestedId =
        getRequestedColorId();


      // Find selected color
      const initial =
        products.find(
          function (p) {

            return String(p.id)
              .toLowerCase() === requestedId;

          }
        ) || products[0];


      // Select first product
      selectProduct(initial);

    })


    .catch(function (err) {

      console.error(err);


      // ======================================================
      // IMPORTANT:
      // ถ้า products.json โหลดไม่ได้
      // ใช้ข้อมูลสำรองแทน
      // ======================================================
      products =
        fallbackProducts;


      // Create color buttons anyway
      renderColorOptions();


      // Get requested color
      const requestedId =
        getRequestedColorId();


      // Select requested color
      // or Base if none selected
      const initial =
        products.find(
          function (p) {

            return String(p.id)
              .toLowerCase() === requestedId;

          }
        ) || products[0];


      // Select product
      selectProduct(initial);


      // Show information
      showMessage(
        'เลือกสีและไซส์ได้เลย',
        'info'
      );

    });

})();


// ============================================================
// Admin CSV
// ============================================================
(function initAdminPage() {

  const tableBody =
    document.getElementById(
      'adminTableBody'
    );

  const statusEl =
    document.getElementById(
      'adminStatus'
    );


  if (!tableBody || !statusEl) {
    return;
  }


  // ==========================================================
  // Small CSV parser
  // ==========================================================
  function parseCsv(text) {

    const lines =
      text.trim().split(/\r?\n/);


    return lines.map(
      function (line) {

        return line.split(',').map(
          function (cell) {

            return cell
              .trim()
              .replace(/^"|"$/g, '');

          }
        );

      }
    );

  }


  // ==========================================================
  // Load CSV
  // ==========================================================
  fetch(CSV_URL)

    .then(function (res) {

      if (!res.ok) {

        throw new Error(
          'โหลด CSV ไม่สำเร็จ'
        );

      }


      return res.text();

    })


    .then(function (text) {

      const rows =
        parseCsv(text);


      // Remove header
      const dataRows =
        rows.slice(1);


      // No data
      if (dataRows.length === 0) {

        statusEl.textContent =
          'ยังไม่มีรายการ';

        return;
      }


      // Show count
      statusEl.textContent =
        'ทั้งหมด ' +
        dataRows.length +
        ' รายการ';


      // Render rows
      dataRows.forEach(
        function (row) {

          const tr =
            document.createElement('tr');


          row.forEach(
            function (cell) {

              const td =
                document.createElement('td');


              td.textContent =
                cell;


              tr.appendChild(td);

            }
          );


          tableBody.appendChild(tr);

        }
      );

    })


    .catch(function (err) {

      console.error(err);


      statusEl.textContent =
        'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ CSV URL';


      statusEl.classList.add(
        'error'
      );

    });

})();
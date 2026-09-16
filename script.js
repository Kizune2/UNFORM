/* ==========================================================
   UNFORM — script.js
   ========================================================== */


/* ==========================================================
   CONFIG
   ========================================================== */

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxC-dU6g9q3QESC7MRgHp5oLGDz-a76H5juUE_Tyk3lBCb-G861Dgp8xIfFlQBA1Y9aBA/exec';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7I1YG78GYK5XymweSs-fTnvPpgjF1GK7ICmujk3ulBcozUFDOustvcKg3T_qqw2LxeRkY9swPnWhA/pub?gid=0&single=true&output=csv';

const UNIT_PRICE = 499;


/* ==========================================================
   MOBILE NAVIGATION
   ========================================================== */

(function () {

  const toggleBtn =
    document.getElementById('navToggle');

  const navLinks =
    document.getElementById('navLinks');

  if (!toggleBtn || !navLinks) {
    return;
  }

  toggleBtn.addEventListener(
    'click',
    function () {

      navLinks.classList.toggle('open');

    }
  );

})();


/* ==========================================================
   FALLBACK PRODUCT DATA
   ========================================================== */

const UNFORM_PRODUCTS = [

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


/* ==========================================================
   LOAD PRODUCTS
   ========================================================== */

function loadProducts() {

  return fetch('products.json')

    .then(function (response) {

      if (!response.ok) {

        throw new Error(
          'ไม่สามารถโหลด products.json ได้'
        );

      }

      return response.json();

    });

}


/* ==========================================================
   PRODUCT CARD
   ========================================================== */

function buildProductCard(
  product,
  linkTarget
) {

  const card =
    document.createElement('a');

  card.className =
    'product-card';

  card.href =
    linkTarget +
    '?color=' +
    encodeURIComponent(product.id);


  card.innerHTML =

    '<figure>' +

      '<img src="' +
        product.image +
        '" alt="' +
        product.name +
        ' ' +
        product.color +
      '">' +

    '</figure>' +

    '<figcaption>' +

      '<p class="product-name">' +
        product.name +
      '</p>' +

      '<p class="product-color">' +
        product.color +
      '</p>' +

      '<p class="product-price">' +
        product.price +
        ' บาท' +
      '</p>' +

      '<span class="btn btn-outline">' +
        'เลือกสินค้า' +
      '</span>' +

    '</figcaption>';


  return card;

}


/* ==========================================================
   HOME PAGE
   ========================================================== */

(function () {

  const grid =
    document.getElementById(
      'homeProductGrid'
    );

  if (!grid) {
    return;
  }


  loadProducts()

    .then(function (products) {

      grid.innerHTML = '';

      products.forEach(
        function (product) {

          grid.appendChild(
            buildProductCard(
              product,
              'product.html'
            )
          );

        }
      );

    })

    .catch(function (error) {

      console.error(error);

      grid.innerHTML = '';

      UNFORM_PRODUCTS.forEach(
        function (product) {

          grid.appendChild(
            buildProductCard(
              product,
              'product.html'
            )
          );

        }
      );

    });

})();


/* ==========================================================
   SHOP PAGE
   ========================================================== */

(function () {

  const grid =
    document.getElementById(
      'shopProductGrid'
    );

  if (!grid) {
    return;
  }


  loadProducts()

    .then(function (products) {

      grid.innerHTML = '';

      products.forEach(
        function (product) {

          grid.appendChild(
            buildProductCard(
              product,
              'order.html'
            )
          );

        }
      );

    })

    .catch(function (error) {

      console.error(error);

      grid.innerHTML = '';

      UNFORM_PRODUCTS.forEach(
        function (product) {

          grid.appendChild(
            buildProductCard(
              product,
              'order.html'
            )
          );

        }
      );

    });

})();


/* ==========================================================
   ORDER PAGE
   ========================================================== */

(function () {

  const submitBtn =
    document.getElementById(
      'submitOrderBtn'
    );


  if (!submitBtn) {
    return;
  }


  /* ----------------------------------------------------------
     ELEMENTS
     ---------------------------------------------------------- */

  const orderImage =
    document.getElementById(
      'orderImage'
    );

  const orderProductName =
    document.getElementById(
      'orderProductName'
    );

  const orderColorLabel =
    document.getElementById(
      'orderColorLabel'
    );

  const orderUnitPrice =
    document.getElementById(
      'orderUnitPrice'
    );

  const colorOptions =
    document.getElementById(
      'colorOptions'
    );

  const sizeOptions =
    document.getElementById(
      'sizeOptions'
    );

  const qtyInput =
    document.getElementById(
      'qtyInput'
    );

  const qtyMinus =
    document.getElementById(
      'qtyMinus'
    );

  const qtyPlus =
    document.getElementById(
      'qtyPlus'
    );

  const orderTotal =
    document.getElementById(
      'orderTotal'
    );

  const orderMessage =
    document.getElementById(
      'orderMessage'
    );


  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */

  let products = [];

  let selectedProduct = null;

  let selectedSize = null;


  /* ==========================================================
     MESSAGE
     ========================================================== */

  function showMessage(
    message,
    type
  ) {

    if (!orderMessage) {
      return;
    }


    orderMessage.textContent =
      message;


    orderMessage.className =
      'form-message visible ' +
      (type || '');

  }


  /* ==========================================================
     GET COLOR FROM URL / STORAGE
     ========================================================== */

  function getRequestedColorId() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const urlColor =
      params.get('color');


    if (urlColor) {

      return urlColor.toLowerCase();

    }


    try {

      const savedColor =
        localStorage.getItem(
          'unform_selected_color'
        );


      if (savedColor) {

        return savedColor.toLowerCase();

      }

    } catch (error) {

      console.error(error);

    }


    return null;

  }


  /* ==========================================================
     SELECT PRODUCT
     ========================================================== */

  function selectProduct(product) {

    if (!product) {
      return;
    }


    selectedProduct =
      product;


    /* Save selected color */

    try {

      localStorage.setItem(
        'unform_selected_color',
        product.id
      );

    } catch (error) {

      console.error(error);

    }


    /* Product image */

    if (orderImage) {

      orderImage.src =
        product.image;

      orderImage.alt =
        product.name +
        ' ' +
        product.color;

    }


    /* Product name */

    if (orderProductName) {

      orderProductName.textContent =
        product.name;

    }


    /* Color */

    if (orderColorLabel) {

      orderColorLabel.textContent =
        'สี: ' +
        product.color;

    }


    /* Price */

    if (orderUnitPrice) {

      orderUnitPrice.textContent =
        product.price +
        ' บาท';

    }


    /* Highlight color */

    if (colorOptions) {

      Array.prototype.forEach.call(
        colorOptions.children,
        function (button) {

          button.classList.toggle(
            'selected',
            button.dataset.colorId ===
            product.id
          );

        }
      );

    }


    updateTotal();

  }


  /* ==========================================================
     RENDER COLOR BUTTONS
     ========================================================== */

  function renderColorOptions() {

    if (!colorOptions) {
      return;
    }


    colorOptions.innerHTML = '';


    products.forEach(
      function (product) {

        const button =
          document.createElement(
            'button'
          );


        button.type =
          'button';


        button.className =
          'swatch-option';


        button.textContent =
          product.color;


        button.dataset.colorId =
          product.id;


        button.addEventListener(
          'click',
          function () {

            selectProduct(
              product
            );

          }
        );


        colorOptions.appendChild(
          button
        );

      }
    );

  }


  /* ==========================================================
     SIZE BUTTONS
     ========================================================== */

  if (sizeOptions) {

    Array.prototype.forEach.call(
      sizeOptions.children,
      function (button) {

        button.addEventListener(
          'click',
          function () {

            selectedSize =
              button.dataset.size;


            Array.prototype.forEach.call(
              sizeOptions.children,
              function (item) {

                item.classList.toggle(
                  'selected',
                  item === button
                );

              }
            );

          }
        );

      }
    );

  }


  /* ==========================================================
     QUANTITY
     ========================================================== */

  function getQuantity() {

    if (!qtyInput) {
      return 1;
    }


    let quantity =
      parseInt(
        qtyInput.value,
        10
      );


    if (
      isNaN(quantity) ||
      quantity < 1
    ) {

      quantity = 1;

    }


    qtyInput.value =
      quantity;


    return quantity;

  }


  /* ----------------------------------------------------------
     MINUS
     ---------------------------------------------------------- */

  if (qtyMinus) {

    qtyMinus.addEventListener(
      'click',
      function () {

        const current =
          getQuantity();


        qtyInput.value =
          Math.max(
            1,
            current - 1
          );


        updateTotal();

      }
    );

  }


  /* ----------------------------------------------------------
     PLUS
     ---------------------------------------------------------- */

  if (qtyPlus) {

    qtyPlus.addEventListener(
      'click',
      function () {

        const current =
          getQuantity();


        qtyInput.value =
          current + 1;


        updateTotal();

      }
    );

  }


  /* ----------------------------------------------------------
     MANUAL QUANTITY
     ---------------------------------------------------------- */

  if (qtyInput) {

    qtyInput.addEventListener(
      'input',
      function () {

        updateTotal();

      }
    );

  }


  /* ==========================================================
     TOTAL
     ========================================================== */

  function updateTotal() {

    if (!orderTotal) {
      return;
    }


    const quantity =
      getQuantity();


    const total =
      UNIT_PRICE *
      quantity;


    orderTotal.textContent =
      total.toLocaleString(
        'th-TH'
      ) +
      ' บาท';

  }


  /* ==========================================================
     CREATE ORDER PAYLOAD
     ========================================================== */

  function createPayload() {

    const quantity =
      getQuantity();


    const total =
      UNIT_PRICE *
      quantity;


    return {

      product:
        selectedProduct.name,

      color:
        selectedProduct.color,

      size:
        selectedSize,

      quantity:
        quantity,

      total:
        total

    };

  }


  /* ==========================================================
     SEND ORDER
     ========================================================== */

  function sendOrder(payload) {

    return new Promise(
      function (resolve, reject) {


        /* ----------------------------------------------------
           METHOD 1: sendBeacon
           ---------------------------------------------------- */

        try {

          const blob =
            new Blob(
              [
                JSON.stringify(
                  payload
                )
              ],
              {
                type:
                  'text/plain;charset=UTF-8'
              }
            );


          const beaconSent =
            navigator.sendBeacon(
              APPS_SCRIPT_URL,
              blob
            );


          if (beaconSent) {

            resolve(
              'beacon'
            );

            return;

          }

        } catch (error) {

          console.error(
            'sendBeacon error:',
            error
          );

        }


        /* ----------------------------------------------------
           METHOD 2: fetch fallback
           ---------------------------------------------------- */

        fetch(
          APPS_SCRIPT_URL,
          {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(
              payload
            ),
            keepalive: true
          }
        )

        .then(function () {

          resolve(
            'fetch'
          );

        })

        .catch(function (error) {

          reject(error);

        });

      }
    );

  }


  /* ==========================================================
     SUBMIT ORDER
     ========================================================== */

  function submitOrder(event) {

    /* ป้องกัน form submit ถ้ามี form ครอบปุ่ม */

    if (event) {

      event.preventDefault();

    }


    /* --------------------------------------------------------
       Validate color
       -------------------------------------------------------- */

    if (!selectedProduct) {

      showMessage(
        'กรุณาเลือกสี',
        'error'
      );

      return;

    }


    /* --------------------------------------------------------
       Validate size
       -------------------------------------------------------- */

    if (!selectedSize) {

      showMessage(
        'กรุณาเลือกไซส์',
        'error'
      );

      return;

    }


    /* --------------------------------------------------------
       Quantity
       -------------------------------------------------------- */

    const quantity =
      getQuantity();


    if (quantity < 1) {

      showMessage(
        'กรุณาระบุจำนวนอย่างน้อย 1 ชิ้น',
        'error'
      );

      return;

    }


    /* --------------------------------------------------------
       Payload
       -------------------------------------------------------- */

    const payload =
      createPayload();


    console.log(
      'UNFORM order:',
      payload
    );


    /* --------------------------------------------------------
       Disable button
       -------------------------------------------------------- */

    submitBtn.disabled =
      true;


    submitBtn.style.opacity =
      '0.6';


    showMessage(
      'กำลังบันทึกรายการ...',
      'info'
    );


    /* --------------------------------------------------------
       Send
       -------------------------------------------------------- */

    sendOrder(payload)

      .then(function (method) {

        console.log(
          'ส่งคำสั่งซื้อแล้วด้วย:',
          method
        );


        /*
         * ให้เวลา browser ส่งข้อมูลออก
         * ก่อนเปลี่ยนหน้า
         */

        setTimeout(
          function () {

            window.location.href =
              'thankyou.html';

          },
          800
        );

      })

      .catch(function (error) {

        console.error(
          'ไม่สามารถส่งคำสั่งซื้อ:',
          error
        );


        /*
         * กรณีส่งไม่สำเร็จจริง ๆ
         */

        submitBtn.disabled =
          false;


        submitBtn.style.opacity =
          '1';


        showMessage(
          'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง',
          'error'
        );

      });

  }


  /* ==========================================================
     SUBMIT BUTTON
     ========================================================== */

  submitBtn.addEventListener(
    'click',
    submitOrder
  );


  /* ==========================================================
     INITIALIZE PRODUCTS
     ========================================================== */

  loadProducts()

    .then(function (data) {


      /* ตรวจสอบข้อมูล */

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {

        throw new Error(
          'products.json ไม่มีข้อมูลสินค้า'
        );

      }


      products =
        data;


      /* สร้างปุ่มสี */

      renderColorOptions();


      /* สีจาก URL */

      const requestedId =
        getRequestedColorId();


      /* เลือกสีที่ต้องการ */

      let initialProduct =
        products.find(
          function (product) {

            return String(
              product.id
            ).toLowerCase() ===
              requestedId;

          }
        );


      /* ถ้าไม่มี ให้เลือกตัวแรก */

      if (!initialProduct) {

        initialProduct =
          products[0];

      }


      selectProduct(
        initialProduct
      );


    })

    .catch(function (error) {

      console.error(
        'products.json error:',
        error
      );


      /*
       * ใช้ข้อมูลสำรอง
       * เพื่อให้หน้า Order ยังใช้งานได้
       */

      products =
        UNFORM_PRODUCTS;


      renderColorOptions();


      const requestedId =
        getRequestedColorId();


      let initialProduct =
        products.find(
          function (product) {

            return String(
              product.id
            ).toLowerCase() ===
              requestedId;

          }
        );


      if (!initialProduct) {

        initialProduct =
          products[0];

      }


      selectProduct(
        initialProduct
      );


      showMessage(
        'เลือกสีและไซส์ได้เลย',
        'info'
      );

    });

})();


/* ==========================================================
   ADMIN PAGE
   ========================================================== */

(function () {

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


  /* ========================================================
     CSV PARSER
     ======================================================== */

  function parseCSV(text) {

    const rows = [];

    let row = [];

    let cell = '';

    let insideQuotes =
      false;


    for (
      let i = 0;
      i < text.length;
      i++
    ) {

      const char =
        text[i];

      const next =
        text[i + 1];


      /* Quote */

      if (char === '"') {

        if (
          insideQuotes &&
          next === '"'
        ) {

          cell += '"';

          i++;

        } else {

          insideQuotes =
            !insideQuotes;

        }


        continue;

      }


      /* Comma */

      if (
        char === ',' &&
        !insideQuotes
      ) {

        row.push(cell);

        cell = '';

        continue;

      }


      /* New line */

      if (
        (
          char === '\n' ||
          char === '\r'
        ) &&
        !insideQuotes
      ) {

        if (
          char === '\r' &&
          next === '\n'
        ) {

          i++;

        }


        row.push(cell);

        rows.push(row);

        row = [];

        cell = '';

        continue;

      }


      cell += char;

    }


    /* Last cell */

    if (
      cell !== '' ||
      row.length > 0
    ) {

      row.push(cell);

      rows.push(row);

    }


    return rows;

  }


  /* ========================================================
     LOAD ADMIN CSV
     ======================================================== */

  fetch(CSV_URL)

    .then(function (response) {

      if (!response.ok) {

        throw new Error(
          'โหลด CSV ไม่สำเร็จ'
        );

      }


      return response.text();

    })


    .then(function (text) {

      const rows =
        parseCSV(text);


      /* ไม่มีข้อมูล */

      if (rows.length <= 1) {

        statusEl.textContent =
          'ยังไม่มีรายการ';

        return;

      }


      const dataRows =
        rows.slice(1);


      statusEl.textContent =
        'ทั้งหมด ' +
        dataRows.length +
        ' รายการ';


      dataRows.forEach(
        function (row) {

          const tr =
            document.createElement(
              'tr'
            );


          row.forEach(
            function (cell) {

              const td =
                document.createElement(
                  'td'
                );


              td.textContent =
                cell;


              tr.appendChild(td);

            }
          );


          tableBody.appendChild(
            tr
          );

        }
      );

    })


    .catch(function (error) {

      console.error(
        error
      );


      statusEl.textContent =
        'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบ CSV URL';


      statusEl.classList.add(
        'error'
      );

    });

})();
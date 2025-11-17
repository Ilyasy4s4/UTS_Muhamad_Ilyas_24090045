/* script.js
   Digunakan di index.html, dashboard.html, products.html
   Fitur:
   - Validasi login (simulasi) + redirect
   - Render dashboard summary
   - Render products table (from array / localStorage)
   - Edit modal (save to localStorage)
   - Delete (confirm) (save to localStorage)
*/

/* ========== Data awal ========== */
const summary = {
  totalProducts: 120,
  totalSales: 85,
  totalRevenue: 12500000
};

let products = [
  { id: 1, name: "Kopi Gayo", price: 25000, stock: 50 },
  { id: 2, name: "Teh Hitam", price: 18000, stock: 30 },
  { id: 3, name: "Coklat Aceh", price: 30000, stock: 20 }
];

// load dari localStorage jika ada
const saved = localStorage.getItem('productsData');
if (saved) {
  try { 
    products = JSON.parse(saved); 
  } catch(e){ 
    console.warn("Invalid saved products"); 
  }
}

function saveProducts(){ 
  localStorage.setItem('productsData', JSON.stringify(products)); 
}

/* ========== Utility ========== */
function formatRupiah(number){
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0}).format(number);
}

/* ========== DOM Ready ========== */
document.addEventListener('DOMContentLoaded', () => {
  // Login form (index.html)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const msg = document.getElementById('msg');
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const pwd = document.getElementById('password').value.trim();
      if (!email || !pwd) {
        msg.textContent = "Email dan password (NIM) tidak boleh kosong.";
        msg.style.color = '#dc2626';
        return;
      }
      // simulasi sukses
      msg.textContent = "Login berhasil — mengalihkan...";
      msg.style.color = '#16a34a';
      setTimeout(()=> {
        // window.LOGIN_REDIRECT didefinisikan di <script> index.html
        window.location.href = window.LOGIN_REDIRECT || "dashboard.html";
      }, 700);
    });
  }

  // Dashboard summary (dashboard.html)
  const summaryCards = document.getElementById('summaryCards');
  if (summaryCards) {
    summaryCards.innerHTML = '';
    const items = [
      {title: "Total Products", value: summary.totalProducts, icon: '📦'},
      {title: "Total Sales", value: summary.totalSales, icon: '🛒'},
      {title: "Total Revenue", value: formatRupiah(summary.totalRevenue), icon: '💰'}
    ];
    items.forEach(it => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<div style="font-size:24px">${it.icon}</div><h3>${it.title}</h3><p>${it.value}</p>`;
      summaryCards.appendChild(card);
    });

    // tombol lihat produk
    const btn = document.getElementById('btnViewProducts');
    if (btn) btn.addEventListener('click', ()=> window.location.href = "products.html");
  }

  // Products page logic
  if (document.getElementById('productsTable')) {
    renderProductsTable();

    // logout buttons
    document.getElementById('logoutBtn2')?.addEventListener('click', (e)=>{
      e.preventDefault();
      if (confirm("Yakin ingin logout?")) window.location.href = "index.html";
    });

    // modal save/close
    document.getElementById('saveEditBtn')?.addEventListener('click', onSaveEdit);
    document.getElementById('closeModalBtn')?.addEventListener('click', ()=> {
      document.getElementById('editModal').classList.add('hidden');
      document.getElementById('editModal').setAttribute('aria-hidden','true');
    });
  }

  // Logout on dashboard
  document.getElementById('logoutBtn')?.addEventListener('click', (e)=>{
    e.preventDefault();
    if (confirm("Yakin ingin logout?")) window.location.href = "index.html";
  });
});

/* ========== Products table render & actions ========== */
function renderProductsTable(){
  const tbody = document.querySelector('#productsTable tbody');
  tbody.innerHTML = '';
  products.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td>${p.name}</td>
      <td>${formatRupiah(p.price)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn" data-action="edit" data-id="${p.id}" title="Edit">✏️</button>
        <button class="btn outline" data-action="delete" data-id="${p.id}" title="Delete">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // event delegation
  tbody.onclick = (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    const product = products.find(x => x.id === id);
    if (!product) return;

    if (action === 'edit') {
      openEditModal(product);
    } else if (action === 'delete') {
      if (confirm(`Yakin hapus produk "${product.name}"?`)) {
        products = products.filter(x => x.id !== id);
        saveProducts();
        renderProductsTable();
      }
    }
  };
}

/* ========== Modal edit ========== */
let currentEditId = null;
function openEditModal(product){
  currentEditId = product.id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editStock').value = product.stock;
  document.getElementById('editModal').classList.remove('hidden');
  document.getElementById('editModal').setAttribute('aria-hidden','false');
}

function onSaveEdit(){
  const newName = document.getElementById('editName').value.trim();
  // Validasi input harga dan stok (wajib angka)
  const newPrice = Number(document.getElementById('editPrice').value) || 0;
  const newStock = Number(document.getElementById('editStock').value) || 0;
  
  const idx = products.findIndex(p => p.id === currentEditId);
  if (idx === -1) return alert("Produk tidak ditemukan");
  
  // Pastikan harga dan stok tidak negatif
  products[idx].name = newName || products[idx].name;
  products[idx].price = Math.max(0, newPrice);
  products[idx].stock = Math.max(0, newStock);
  
  saveProducts();
  renderProductsTable();
  document.getElementById('editModal').classList.add('hidden');
  document.getElementById('editModal').setAttribute('aria-hidden','true');
}
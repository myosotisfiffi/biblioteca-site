// Estado
let books = [];
let currentStatusFilter = 'all';
let currentGenreFilter = null;
let editingBookId = null;

const initialBooks = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", genre: "Fantasia", year: 1997, cover: "https://picsum.photos/id/1015/300/450", status: "Lido", rating: 5, description: "O início de uma saga mágica." },
  { id: 2, title: "O Senhor dos Anéis: A Sociedade do Anel", author: "J.R.R. Tolkien", genre: "Fantasia", year: 1954, cover: "https://picsum.photos/id/201/300/450", status: "Quero Ler", rating: 4, description: "A jornada épica pela Terra-média começa." },
  { id: 3, title: "1984", author: "George Orwell", genre: "Distopia", year: 1949, cover: "https://picsum.photos/id/29/300/450", status: "Lendo", rating: 5, description: "Clássico sobre vigilância e totalitarismo." },
  { id: 4, title: "Orgulho e Preconceito", author: "Jane Austen", genre: "Romance", year: 1813, cover: "https://picsum.photos/id/160/300/450", status: "Lido", rating: 4, description: "Um dos maiores romances da literatura inglesa." }
];

// LocalStorage
function loadBooks() {
  const saved = localStorage.getItem('bibliotecaEncantada');
  books = saved ? JSON.parse(saved) : [...initialBooks];
  saveBooks();
}

function saveBooks() {
  localStorage.setItem('bibliotecaEncantada', JSON.stringify(books));
}

// Renderização
function renderShelves() {
  const container = document.getElementById('shelves-container');
  container.innerHTML = '';

  const statuses = [
    { key: 'Quero Ler', emoji: '📚', label: 'Quero Ler' },
    { key: 'Lendo',    emoji: '📖', label: 'Lendo Agora' },
    { key: 'Lido',     emoji: '✅', label: 'Lidos' }
  ];

  statuses.forEach(status => {
    let filtered = books.filter(b => b.status === status.key);

    if (currentStatusFilter !== 'all' && currentStatusFilter !== status.key) {
      filtered = [];
    }
    if (currentGenreFilter) {
      filtered = filtered.filter(b => b.genre === currentGenreFilter);
    }

    // Ordenação
    const sort = document.getElementById('sort-select').value;
    filtered.sort((a,b) => {
      if (sort === 'title')  return a.title.localeCompare(b.title);
      if (sort === 'author') return a.author.localeCompare(b.author);
      if (sort === 'year')   return b.year - a.year;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

    const html = `
      <div class="shelf">
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
          <span style="font-size:2.8rem;">${status.emoji}</span>
          <div>
            <h2 style="font-size:2.2rem;">${status.label}</h2>
            <p style="opacity:0.85;">${filtered.length} livro${filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div class="book-grid">
          ${filtered.length === 0 ? `<div class="empty-shelf">Prateleira vazia...</div>` : ''}

          ${filtered.map(book => `
            <div class="book-card" onclick="showBookDetail(${book.id})">
              <div style="position:relative;">
                <img src="${book.cover || 'https://picsum.photos/300/420'}" class="book-cover" alt="${book.title}"/>
                <div class="rating-badge">${book.rating}★</div>
              </div>
              <div class="book-info">
                <div class="title">${book.title}</div>
                <div class="author">${book.author}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    container.innerHTML += html;
  });

  updateCounts();
}

function updateCounts() {
  document.querySelectorAll('.status-item .count').forEach(el => {
    const id = el.parentElement.id;
    const status = id.replace('status-', '');
    let count = 0;

    if (status === 'all') count = books.length;
    else count = books.filter(b => b.status === status.charAt(0).toUpperCase() + status.slice(1).replace('queroler','Quero Ler')).length;

    el.textContent = count;
  });
}

function renderGenres() {
  const container = document.getElementById('genre-list');
  const genres = [...new Set(books.map(b => b.genre))].sort();

  container.innerHTML = `
    <div onclick="filterByGenre(null)" class="${currentGenreFilter === null ? 'active' : ''}">Todos os gêneros</div>
  `;

  genres.forEach(g => {
    const div = document.createElement('div');
    div.textContent = g;
    div.onclick = () => filterByGenre(g);
    if (currentGenreFilter === g) div.className = 'active';
    container.appendChild(div);
  });
}

// Filtros
function filterByStatus(status) {
  currentStatusFilter = status;
  document.querySelectorAll('.status-item').forEach(el => {
    el.classList.toggle('active', el.id === `status-${status === 'all' ? 'all' : status.toLowerCase().replace(' ', '')}`);
  });
  renderShelves();
}

function filterByGenre(genre) {
  currentGenreFilter = genre;
  renderGenres();
  renderShelves();
}

function clearFilters() {
  currentStatusFilter = 'all';
  currentGenreFilter = null;
  document.getElementById('search-input').value = '';
  document.getElementById('sort-select').value = 'title';
  document.querySelectorAll('.status-item').forEach(el => el.classList.remove('active'));
  document.getElementById('status-all').classList.add('active');
  renderGenres();
  renderShelves();
}

// Eventos de busca e ordenação
document.getElementById('search-input').addEventListener('input', renderShelves);
document.getElementById('sort-select').addEventListener('change', renderShelves);

// Modais
function showBookDetail(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  editingBookId = id;

  document.getElementById('modal-book-title').textContent = book.title;
  document.getElementById('modal-author').textContent = book.author;
  document.getElementById('modal-genre').textContent = book.genre;
  document.getElementById('modal-year').textContent = book.year || '—';
  document.getElementById('modal-description').textContent = book.description || 'Sem descrição.';

  document.getElementById('modal-cover').innerHTML = `<img src="${book.cover || 'https://picsum.photos/300/450'}" alt="${book.title}"/>`;

  const statusDiv = document.getElementById('modal-status-buttons');
  statusDiv.innerHTML = `
    <button class="${book.status==='Quero Ler'?'active':''}" onclick="changeStatus(${id},'Quero Ler')">Quero Ler</button>
    <button class="${book.status==='Lendo'?'active':''}" onclick="changeStatus(${id},'Lendo')">Lendo</button>
    <button class="${book.status==='Lido'?'active':''}" onclick="changeStatus(${id},'Lido')">Lido</button>
  `;

  const starsDiv = document.getElementById('modal-stars');
  starsDiv.innerHTML = Array(5).fill('').map((_,i) => 
    `<span onclick="setRating(${id},${i+1}); event.stopPropagation()">${i < book.rating ? '★' : '☆'}</span>`
  ).join('');

  document.getElementById('detail-modal').classList.remove('hidden');
}

function hideDetailModal() {
  document.getElementById('detail-modal').classList.add('hidden');
}

function changeStatus(id, status) {
  const book = books.find(b => b.id === id);
  if (book) {
    book.status = status;
    saveBooks();
    hideDetailModal();
    renderShelves();
  }
}

function setRating(id, rating) {
  const book = books.find(b => b.id === id);
  if (book) {
    book.rating = rating;
    saveBooks();
    showBookDetail(id); // atualiza modal
  }
}

// Formulário
function showAddModal() {
  editingBookId = null;
  document.getElementById('form-modal-title').textContent = 'Adicionar Novo Livro';
  document.getElementById('book-form').reset();
  document.getElementById('book-id').value = '';
  document.getElementById('form-modal').classList.remove('hidden');
}

function hideFormModal() {
  document.getElementById('form-modal').classList.add('hidden');
}

function editCurrentBook() {
  hideDetailModal();
  const book = books.find(b => b.id === editingBookId);
  if (!book) return;

  document.getElementById('form-modal-title').textContent = 'Editar Livro';
  document.getElementById('book-id').value = book.id;
  document.getElementById('cover-url').value = book.cover || '';
  document.getElementById('title').value = book.title;
  document.getElementById('author').value = book.author;
  document.getElementById('genre').value = book.genre;
  document.getElementById('year').value = book.year || '';
  document.getElementById('rating').value = book.rating || 0;
  document.getElementById('description').value = book.description || '';

  document.querySelector(`input[name="status"][value="${book.status}"]`).checked = true;

  document.getElementById('form-modal').classList.remove('hidden');
}

function deleteCurrentBook() {
  if (!confirm('Deseja realmente excluir este livro?')) return;
  books = books.filter(b => b.id !== editingBookId);
  saveBooks();
  hideDetailModal();
  renderShelves();
  renderGenres();
}

// Formulário de adicionar/editar livro
document.getElementById('book-form').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const id = document.getElementById('book-id').value;
    const isEdit = !!id;
  
    const newBook = {
      id: isEdit ? Number(id) : Date.now(),
      title: document.getElementById('title').value.trim(),
      author: document.getElementById('author').value.trim(),
      genre: document.getElementById('genre').value.trim(),
      year: Number(document.getElementById('year').value) || new Date().getFullYear(),
      cover: document.getElementById('cover-url').value.trim() || `https://picsum.photos/id/${Math.floor(Math.random() * 200) + 800}/300/450`,
      status: document.querySelector('input[name="status"]:checked')?.value || 'Quero Ler',
      rating: Number(document.getElementById('rating').value) || 0,
      description: document.getElementById('description').value.trim()
    };
  
    if (isEdit) {
      const index = books.findIndex(b => b.id === newBook.id);
      if (index !== -1) books[index] = newBook;
    } else {
      books.push(newBook);
    }
  
    saveBooks();
    
    // Aqui está o que faltava: fechar o modal
    hideFormModal();
  
    // Atualizar visual
    renderShelves();
    renderGenres();
  
    // Opcional: feedback visual rápido
    alert("Livro salvo com sucesso! ✓");
    // ou use um toast/notification mais bonito no futuro
  });

// Inicialização
function init() {
  loadBooks();
  renderShelves();
  renderGenres();

  document.getElementById('btn-add-book').onclick = showAddModal;
  document.getElementById('btn-clear-filters').onclick = clearFilters;

  document.querySelectorAll('.status-item').forEach(el => {
    el.onclick = () => {
      const status = el.id === 'status-all' ? 'all' : 
                     el.id === 'status-queroler' ? 'Quero Ler' :
                     el.id === 'status-lendo' ? 'Lendo' : 'Lido';
      filterByStatus(status);
    };
  });
}

window.addEventListener('load', init);
function init() {
  loadBooks();
  renderShelves();
  renderGenres();

  // Botão novo livro
  document.getElementById('btn-add-book').onclick = showAddModal;

  // Limpar filtros
  document.getElementById('btn-clear-filters').onclick = clearFilters;

  // Status clicáveis
  document.querySelectorAll('.status-item').forEach(el => {
    el.addEventListener('click', () => {
      let status;
      if (el.id === 'status-all') status = 'all';
      else if (el.id === 'status-queroler') status = 'Quero Ler';
      else if (el.id === 'status-lendo')   status = 'Lendo';
      else status = 'Lido';

      filterByStatus(status);
    });
  });

  // Gêneros já são adicionados dinamicamente com .onclick no renderGenres()
}
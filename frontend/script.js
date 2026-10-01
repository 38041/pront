/**
 * Mini Sistema de Gerenciamento de Hardware
 * Frontend Vanilla JavaScript
 */

// ==========================================================================
// 1. Configuração e Constantes
// ==========================================================================
const DEFAULT_API_URL = 'http://localhost:3000/api/hardware';
const STORAGE_KEY_API = 'hardware_api_base_url';

function getApiUrl() {
  return localStorage.getItem(STORAGE_KEY_API) || DEFAULT_API_URL;
}

function setApiUrl(url) {
  if (!url || url.trim() === '') {
    localStorage.removeItem(STORAGE_KEY_API);
  } else {
    localStorage.setItem(STORAGE_KEY_API, url.trim().replace(/\/+$/, ''));
  }
}

// Placeholder SVG limpo e minimalista para quando o hardware não possuir foto
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23f8fafc"/><path d="M160 140h80v10h-80zm-20-40h120v35H140zm-10-15a10 10 0 0 1 10-10h140a10 10 0 0 1 10 10v70a10 10 0 0 1-10 10H140a10 10 0 0 1-10-10V85z" fill="%23cbd5e1"/><text x="50%" y="185" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle" font-weight="600">Sem Foto Cadastrada</text></svg>`;

// Estado local da aplicação
const state = {
  hardwares: [],
  filterQuery: '',
  isEditing: false,
  deleteTargetId: null,
  isApiOnline: false,
};

// ==========================================================================
// 2. Elementos do DOM
// ==========================================================================
const DOM = {
  // Status API
  apiStatusDot: document.getElementById('apiStatusDot'),
  apiStatusText: document.getElementById('apiStatusText'),
  btnConfigApi: document.getElementById('btnConfigApi'),
  modalApiConfig: document.getElementById('modalApiConfig'),
  btnCloseModalApi: document.getElementById('btnCloseModalApi'),
  inputApiUrl: document.getElementById('inputApiUrl'),
  btnSaveApiUrl: document.getElementById('btnSaveApiUrl'),
  btnResetApiUrl: document.getElementById('btnResetApiUrl'),

  // Formulário
  form: document.getElementById('hardwareForm'),
  formTitle: document.getElementById('formTitle'),
  formSubtitle: document.getElementById('formSubtitle'),
  hardwareId: document.getElementById('hardwareId'),
  hardwareInput: document.getElementById('hardwareInput'),
  marcaInput: document.getElementById('marcaInput'),
  modeloInput: document.getElementById('modeloInput'),
  precoInput: document.getElementById('precoInput'),
  fotoInput: document.getElementById('fotoInput'),
  fotoPreviewContainer: document.getElementById('fotoPreviewContainer'),
  fotoPreviewImg: document.getElementById('fotoPreviewImg'),
  btnSubmitForm: document.getElementById('btnSubmitForm'),
  btnCancelEdit: document.getElementById('btnCancelEdit'),

  // Erros de campos
  errorHardware: document.getElementById('errorHardware'),
  errorMarca: document.getElementById('errorMarca'),
  errorModelo: document.getElementById('errorModelo'),
  errorPreco: document.getElementById('errorPreco'),
  errorFoto: document.getElementById('errorFoto'),

  // Listagem e Controles
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  hardwareCountBadge: document.getElementById('hardwareCountBadge'),
  btnRefreshList: document.getElementById('btnRefreshList'),
  hardwareGrid: document.getElementById('hardwareGrid'),
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessageText: document.getElementById('errorMessageText'),
  btnRetryFetch: document.getElementById('btnRetryFetch'),
  emptyState: document.getElementById('emptyState'),
  emptyStateText: document.getElementById('emptyStateText'),

  // Modal de Exclusão
  modalConfirmDelete: document.getElementById('modalConfirmDelete'),
  deleteHardwareName: document.getElementById('deleteHardwareName'),
  btnCancelDelete: document.getElementById('btnCancelDelete'),
  btnConfirmDelete: document.getElementById('btnConfirmDelete'),
  btnCloseModalDelete: document.getElementById('btnCloseModalDelete'),

  // Toasts
  toastContainer: document.getElementById('toastContainer'),
};

// ==========================================================================
// 3. Utilitários e Notificações (Toasts)
// ==========================================================================
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function updateApiStatus(isOnline, message = '') {
  state.isApiOnline = isOnline;
  if (isOnline) {
    DOM.apiStatusDot.className = 'status-indicator online';
    DOM.apiStatusText.textContent = 'API Conectada';
  } else {
    DOM.apiStatusDot.className = 'status-indicator offline';
    DOM.apiStatusText.textContent = message || 'API Desconectada';
  }
}

// ==========================================================================
// 4. Consumo da API REST (Fetch)
// ==========================================================================
async function apiFetch(endpoint = '', options = {}) {
  const baseUrl = getApiUrl();
  const url = endpoint ? `${baseUrl}${endpoint}` : baseUrl;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    let data;

    try {
      data = await response.json();
    } catch (e) {
      data = { success: false, error: { message: `Erro de comunicação HTTP: ${response.status} ${response.statusText}` } };
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Falha na requisição (código ${response.status})`;
      throw new Error(errorMsg);
    }

    updateApiStatus(true);
    return data;
  } catch (error) {
    // Falha de conexão ou erro do backend
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      updateApiStatus(false, 'Servidor Indisponível');
      throw new Error('Não foi possível conectar à API. Verifique se o servidor backend está ligado.');
    }
    throw error;
  }
}

// ==========================================================================
// 5. Carregamento e Renderização de Dados
// ==========================================================================
async function loadHardwares() {
  DOM.loadingState.classList.remove('hidden');
  DOM.errorState.classList.add('hidden');
  DOM.emptyState.classList.add('hidden');
  DOM.hardwareGrid.innerHTML = '';

  try {
    const res = await apiFetch();
    state.hardwares = res.data || [];
    renderHardwares();
  } catch (error) {
    console.error('Erro ao carregar hardwares:', error);
    DOM.loadingState.classList.add('hidden');
    DOM.errorState.classList.remove('hidden');
    DOM.errorMessageText.textContent = error.message;
    DOM.hardwareCountBadge.textContent = '0 aparelhos';
  }
}

function renderHardwares() {
  DOM.loadingState.classList.add('hidden');
  DOM.hardwareGrid.innerHTML = '';

  const query = state.filterQuery.trim().toLowerCase();
  const filtered = state.hardwares.filter((item) => {
    if (!query) return true;
    return (
      (item.hardware && item.hardware.toLowerCase().includes(query)) ||
      (item.marca && item.marca.toLowerCase().includes(query)) ||
      (item.modelo && item.modelo.toLowerCase().includes(query))
    );
  });

  DOM.hardwareCountBadge.textContent = `${filtered.length} aparelho${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    DOM.emptyState.classList.remove('hidden');
    if (query) {
      DOM.emptyStateText.textContent = `Nenhum aparelho encontrado para o termo "${escapeHtml(query)}".`;
    } else {
      DOM.emptyStateText.textContent = 'Nenhum aparelho cadastrado ainda. Use o formulário ao lado para cadastrar.';
    }
    return;
  }

  DOM.emptyState.classList.add('hidden');

  filtered.forEach((item) => {
    const card = createHardwareCard(item);
    DOM.hardwareGrid.appendChild(card);
  });
}

function createHardwareCard(item) {
  const card = document.createElement('article');
  card.className = 'hardware-card';
  card.setAttribute('data-id', item.id);

  const imageUrl = item.foto && item.foto.trim() !== '' ? escapeHtml(item.foto) : PLACEHOLDER_SVG;

  card.innerHTML = `
    <div class="card-img-wrapper">
      <img 
        src="${imageUrl}" 
        alt="${escapeHtml(item.hardware)} - ${escapeHtml(item.modelo)}" 
        loading="lazy" 
        onerror="this.onerror=null; this.src='${PLACEHOLDER_SVG}';"
      />
    </div>
    <div class="card-content">
      <span class="card-tag">${escapeHtml(item.hardware)}</span>
      <h3 class="card-title">${escapeHtml(item.modelo)}</h3>
      <div class="card-meta-brand">
        Marca: <strong>${escapeHtml(item.marca)}</strong>
      </div>
      <div class="card-price-row">
        <span class="price-label">Preço</span>
        <span class="price-value">${formatCurrency(item.preco)}</span>
      </div>
      <div class="card-footer-actions">
        <button class="btn-card btn-card-edit" data-action="edit" data-id="${item.id}" title="Editar este aparelho">
          ✏️ <span>Editar</span>
        </button>
        <button class="btn-card btn-card-delete" data-action="delete" data-id="${item.id}" title="Excluir este aparelho">
          🗑️ <span>Excluir</span>
        </button>
      </div>
    </div>
  `;

  return card;
}

// ==========================================================================
// 6. Formulário: Validações, Cadastro e Edição
// ==========================================================================
function clearFieldErrors() {
  DOM.errorHardware.textContent = '';
  DOM.errorMarca.textContent = '';
  DOM.errorModelo.textContent = '';
  DOM.errorPreco.textContent = '';
  DOM.errorFoto.textContent = '';
}

function validateForm(data) {
  clearFieldErrors();
  let isValid = true;

  if (!data.hardware || data.hardware.trim().length < 2) {
    DOM.errorHardware.textContent = 'Informe o nome do hardware (mín. 2 caracteres).';
    isValid = false;
  }

  if (!data.marca || data.marca.trim().length < 2) {
    DOM.errorMarca.textContent = 'Informe o fabricante/marca (mín. 2 caracteres).';
    isValid = false;
  }

  if (!data.modelo || data.modelo.trim().length < 1) {
    DOM.errorModelo.textContent = 'Informe o modelo do aparelho.';
    isValid = false;
  }

  if (data.preco === '' || isNaN(Number(data.preco)) || Number(data.preco) < 0) {
    DOM.errorPreco.textContent = 'Informe um preço válido (não pode ser negativo).';
    isValid = false;
  }

  if (data.foto && data.foto.trim() !== '') {
    const urlPattern = /^(https?:\/\/|data:image\/|\/)[^\s]+$/i;
    if (!urlPattern.test(data.foto.trim())) {
      DOM.errorFoto.textContent = 'A foto deve ser uma URL válida (ex: http:// ou https://).';
      isValid = false;
    }
  }

  return isValid;
}

function setFormLoading(isLoading) {
  const btnText = DOM.btnSubmitForm.querySelector('.btn-text');
  const spinner = DOM.btnSubmitForm.querySelector('.btn-spinner');

  if (isLoading) {
    DOM.btnSubmitForm.disabled = true;
    spinner.classList.remove('hidden');
    btnText.textContent = state.isEditing ? 'Atualizando...' : 'Salvando...';
  } else {
    DOM.btnSubmitForm.disabled = false;
    spinner.classList.add('hidden');
    btnText.textContent = state.isEditing ? 'Atualizar Aparelho' : 'Salvar Aparelho';
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = {
    hardware: DOM.hardwareInput.value.trim(),
    marca: DOM.marcaInput.value.trim(),
    modelo: DOM.modeloInput.value.trim(),
    preco: DOM.precoInput.value,
    foto: DOM.fotoInput.value.trim(),
  };

  if (!validateForm(formData)) {
    return;
  }

  const payload = {
    ...formData,
    preco: parseFloat(formData.preco),
  };

  setFormLoading(true);

  try {
    if (state.isEditing) {
      const id = DOM.hardwareId.value;
      await apiFetch(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('Aparelho atualizado com sucesso!', 'success');
    } else {
      await apiFetch('', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Aparelho cadastrado com sucesso!', 'success');
    }

    resetForm();
    await loadHardwares();
  } catch (error) {
    console.error('Erro ao salvar formulário:', error);
    showToast(error.message, 'error');
  } finally {
    setFormLoading(false);
  }
}

function startEditHardware(item) {
  state.isEditing = true;
  DOM.hardwareId.value = item.id;
  DOM.hardwareInput.value = item.hardware || '';
  DOM.marcaInput.value = item.marca || '';
  DOM.modeloInput.value = item.modelo || '';
  DOM.precoInput.value = item.preco !== undefined ? item.preco : '';
  DOM.fotoInput.value = item.foto || '';

  updateFotoPreview(item.foto);

  DOM.formTitle.textContent = 'Editar Aparelho';
  DOM.formSubtitle.textContent = `Atualizando informações de ${item.hardware} (${item.modelo}).`;
  DOM.btnSubmitForm.querySelector('.btn-text').textContent = 'Atualizar Aparelho';
  DOM.btnCancelEdit.classList.remove('hidden');

  clearFieldErrors();

  // Scroll suave até o formulário no mobile
  DOM.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  state.isEditing = false;
  DOM.form.reset();
  DOM.hardwareId.value = '';
  DOM.formTitle.textContent = 'Cadastrar Novo Aparelho';
  DOM.formSubtitle.textContent = 'Preencha os dados do hardware para adicionar ao catálogo.';
  DOM.btnSubmitForm.querySelector('.btn-text').textContent = 'Salvar Aparelho';
  DOM.btnCancelEdit.classList.add('hidden');
  clearFieldErrors();
  DOM.fotoPreviewContainer.classList.add('hidden');
  DOM.fotoPreviewImg.src = '';
}

function updateFotoPreview(url) {
  if (url && url.trim() !== '') {
    DOM.fotoPreviewImg.src = url.trim();
    DOM.fotoPreviewContainer.classList.remove('hidden');
  } else {
    DOM.fotoPreviewContainer.classList.add('hidden');
    DOM.fotoPreviewImg.src = '';
  }
}

// ==========================================================================
// 7. Exclusão de Aparelho (com Modal de Confirmação)
// ==========================================================================
function openDeleteModal(id, name) {
  state.deleteTargetId = id;
  DOM.deleteHardwareName.textContent = name;
  DOM.modalConfirmDelete.classList.remove('hidden');
}

function closeDeleteModal() {
  state.deleteTargetId = null;
  DOM.modalConfirmDelete.classList.add('hidden');
}

async function confirmDeleteHardware() {
  const id = state.deleteTargetId;
  if (!id) return;

  DOM.btnConfirmDelete.disabled = true;
  DOM.btnConfirmDelete.textContent = 'Excluindo...';

  try {
    await apiFetch(`/${id}`, { method: 'DELETE' });
    showToast('Aparelho excluído com sucesso.', 'success');
    closeDeleteModal();

    // Se o aparelho excluído estava sendo editado, reseta o formulário
    if (state.isEditing && DOM.hardwareId.value === id) {
      resetForm();
    }

    await loadHardwares();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    DOM.btnConfirmDelete.disabled = false;
    DOM.btnConfirmDelete.textContent = 'Sim, Excluir';
  }
}

// ==========================================================================
// 8. Event Listeners e Inicialização
// ==========================================================================
function setupEventListeners() {
  // Submissão e cancelamento do formulário
  DOM.form.addEventListener('submit', handleFormSubmit);
  DOM.btnCancelEdit.addEventListener('click', resetForm);

  // Prévia da foto em tempo real
  DOM.fotoInput.addEventListener('input', (e) => {
    updateFotoPreview(e.target.value);
  });

  // Ações nos Cards da Grid (Delegação de Eventos)
  DOM.hardwareGrid.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-action="edit"]');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const item = state.hardwares.find((h) => h.id === id);
      if (item) startEditHardware(item);
    } else if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      const item = state.hardwares.find((h) => h.id === id);
      const name = item ? `${item.hardware} - ${item.modelo}` : 'este aparelho';
      openDeleteModal(id, name);
    }
  });

  // Modal de Exclusão
  DOM.btnCancelDelete.addEventListener('click', closeDeleteModal);
  DOM.btnCloseModalDelete.addEventListener('click', closeDeleteModal);
  DOM.btnConfirmDelete.addEventListener('click', confirmDeleteHardware);

  // Busca em tempo real com debounce simples
  DOM.searchInput.addEventListener('input', (e) => {
    state.filterQuery = e.target.value;
    if (state.filterQuery.trim()) {
      DOM.btnClearSearch.classList.remove('hidden');
    } else {
      DOM.btnClearSearch.classList.add('hidden');
    }
    renderHardwares();
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.filterQuery = '';
    DOM.btnClearSearch.classList.add('hidden');
    renderHardwares();
    DOM.searchInput.focus();
  });

  // Botões de Recarregar e Tentar Novamente
  DOM.btnRefreshList.addEventListener('click', loadHardwares);
  DOM.btnRetryFetch.addEventListener('click', loadHardwares);

  // Modal de Configuração de URL da API
  DOM.btnConfigApi.addEventListener('click', () => {
    DOM.inputApiUrl.value = getApiUrl();
    DOM.modalApiConfig.classList.remove('hidden');
  });

  DOM.btnCloseModalApi.addEventListener('click', () => {
    DOM.modalApiConfig.classList.add('hidden');
  });

  DOM.btnResetApiUrl.addEventListener('click', () => {
    DOM.inputApiUrl.value = DEFAULT_API_URL;
  });

  DOM.btnSaveApiUrl.addEventListener('click', () => {
    const newUrl = DOM.inputApiUrl.value.trim();
    setApiUrl(newUrl);
    DOM.modalApiConfig.classList.add('hidden');
    showToast('URL da API atualizada.', 'info');
    loadHardwares();
  });

  // Fechar modais ao clicar no overlay escuro ou apertar Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDeleteModal();
      DOM.modalApiConfig.classList.add('hidden');
    }
  });

  DOM.modalConfirmDelete.addEventListener('click', (e) => {
    if (e.target === DOM.modalConfirmDelete) closeDeleteModal();
  });

  DOM.modalApiConfig.addEventListener('click', (e) => {
    if (e.target === DOM.modalApiConfig) DOM.modalApiConfig.classList.add('hidden');
  });
}

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadHardwares();
});

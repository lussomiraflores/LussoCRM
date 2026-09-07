/**
 * Lusso Beauty Salón - CRM & Administration Controller
 * Manages Appointments & Agenda, Client Directory, Service POS, Inventory, Expenses, and Analytics.
 * Optimized for Desktop and 11" Tablets with Role-based Access Control (Stylist vs Dueña)
 */

class LussoCRM {
  constructor() {
    this.currentTab = 'sales'; // Default landing view: POS & Daily Sales Checkout
    this.selectedClient = null;
    this.salesFilterDate = 'today';
    this.salesHistorySearchQuery = '';
    this.salesHistoryFilterDate = '';
    this.salesHistoryQuickDate = 'month';
    this.salesHistoryFilterSpec = 'all';
    this.salesHistoryFilterPayment = 'all';
    this.clientFilterType = 'all';
    this.inventoryFilterCategory = 'all';
    this.appointmentFilterSpec = 'all';
    this.appointmentFilterDate = 'all';
    this.appointmentFilterStatus = 'all';
    this.appointmentSearchQuery = '';
    this.pendingTab = null;
    this.posItems = []; // Multi-service checkout cart
    this.posTipRecipient = 'Ambas'; // Default tip recipient on mixed specialist sales
    this.init();
  }

  init() {
    try { this.bindEvents(); } catch (e) { console.error('Error in bindEvents:', e); }
    try { this.updateRoleUI(); } catch (e) { console.error('Error in updateRoleUI:', e); }
    try { this.renderPOSQuickServices('all'); } catch (e) { console.error('Error in renderPOSQuickServices:', e); }
    try { this.renderSales(); } catch (e) { console.error('Error in renderSales:', e); }
    try { this.renderSalesHistory(); } catch (e) { console.error('Error in renderSalesHistory:', e); }
    try { this.renderDashboard(); } catch (e) { console.error('Error in renderDashboard:', e); }
    try { this.renderAppointments(); } catch (e) { console.error('Error in renderAppointments:', e); }
    try { this.renderClients(); } catch (e) { console.error('Error in renderClients:', e); }
    try { this.renderInventory(); } catch (e) { console.error('Error in renderInventory:', e); }
    try { this.renderCaja(); } catch (e) { console.error('Error in renderCaja:', e); }
    try { this.renderExpenses(); } catch (e) { console.error('Error in renderExpenses:', e); }
    try { this.renderPayroll(); } catch (e) { console.error('Error in renderPayroll:', e); }
    try { this.populateSelects(); } catch (e) { console.error('Error in populateSelects:', e); }
    try { this.updateAppointmentBadges(); } catch (e) { console.error('Error in updateAppointmentBadges:', e); }
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.crm-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Payroll Filters & Forms
    const payrollMonthSelect = document.getElementById('payroll-month-selector');
    if (payrollMonthSelect) {
      payrollMonthSelect.addEventListener('change', () => this.renderPayroll());
    }

    const payrollSpecFilter = document.getElementById('payroll-specialist-filter');
    if (payrollSpecFilter) {
      payrollSpecFilter.addEventListener('change', () => this.renderPayroll());
    }

    const absenceForm = document.getElementById('form-absence-register');
    if (absenceForm) {
      absenceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveAbsence();
      });
    }

    const staffSalaryForm = document.getElementById('form-staff-salary');
    if (staffSalaryForm) {
      staffSalaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveStaffSalary();
      });
    }

    const kiaraSalaryInput = document.getElementById('salary-kiara-input');
    if (kiaraSalaryInput) {
      kiaraSalaryInput.addEventListener('input', (e) => {
        const val = Number(e.target.value) || 0;
        const el = document.getElementById('kiara-daily-calc');
        if (el) el.textContent = (val / 30).toFixed(2);
      });
    }

    const cieloSalaryInput = document.getElementById('salary-cielo-input');
    if (cieloSalaryInput) {
      cieloSalaryInput.addEventListener('input', (e) => {
        const val = Number(e.target.value) || 0;
        const el = document.getElementById('cielo-daily-calc');
        if (el) el.textContent = (val / 30).toFixed(2);
      });
    }

    // Admin PIN Form Submit (if form element used)
    const adminPinForm = document.getElementById('form-admin-pin');
    if (adminPinForm) {
      adminPinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('input-admin-pin')?.value.trim();
        if (window.lussoDB.verifyAdminPin(pin)) {
          this.setRole('admin');
          document.getElementById('modal-admin-pin')?.classList.remove('open');
          if (document.getElementById('input-admin-pin')) document.getElementById('input-admin-pin').value = '';
          document.getElementById('pin-error-msg')?.classList.add('hidden');
          this.showToast('Acceso desbloqueado: Modo Dueña / Administración activo.', 'success');
          if (this.pendingTab) {
            this.switchTab(this.pendingTab);
            this.pendingTab = null;
          }
        } else {
          document.getElementById('pin-error-msg')?.classList.remove('hidden');
        }
      });
    }

    // Appointment Filters & Search
    const aptSearchInput = document.getElementById('appointment-search-input');
    if (aptSearchInput) {
      aptSearchInput.addEventListener('input', (e) => {
        this.appointmentSearchQuery = e.target.value.toLowerCase().trim();
        this.renderAppointments();
      });
    }

    document.querySelectorAll('.apt-spec-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.apt-spec-filter').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.appointmentFilterSpec = e.currentTarget.getAttribute('data-spec');
        this.renderAppointments();
      });
    });

    document.querySelectorAll('.apt-date-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.apt-date-filter').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.appointmentFilterDate = e.currentTarget.getAttribute('data-date');
        this.renderAppointments();
      });
    });

    const aptStatusSelect = document.getElementById('appointment-status-filter') || document.getElementById('appointment-status-select-filter');
    if (aptStatusSelect) {
      aptStatusSelect.addEventListener('change', (e) => {
        this.appointmentFilterStatus = e.target.value;
        this.renderAppointments();
      });
    }

    // Manual Appointment Form Submit
    const manualAptForm = document.getElementById('form-manual-appointment');
    if (manualAptForm) {
      manualAptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveManualAppointment();
      });
    }

    // Client Search & Filters
    const clientSearchInput = document.getElementById('client-search-input');
    if (clientSearchInput) {
      clientSearchInput.addEventListener('input', () => this.renderClients());
    }

    document.querySelectorAll('.client-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.client-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.clientFilterType = e.currentTarget.getAttribute('data-filter');
        this.renderClients();
      });
    });

    // POS Client Input Change -> Show Last Service Card
    const saleClientInput = document.getElementById('pos-client-input') || document.getElementById('sale-client-input');
    if (saleClientInput) {
      saleClientInput.addEventListener('input', (e) => this.handlePOSClientInputChange(e.target.value));
      saleClientInput.addEventListener('change', (e) => this.handlePOSClientInputChange(e.target.value));
    }

    // Sales Filters (POS Today)
    const salesDateFilter = document.getElementById('sales-filter-date') || document.getElementById('sales-date-filter');
    if (salesDateFilter) {
      salesDateFilter.addEventListener('change', (e) => {
        this.salesFilterDate = e.target.value;
        this.renderSales();
      });
    }

    // Sales History Filters (General Search & Date/Time)
    const salesHistorySearch = document.getElementById('sales-history-search');
    if (salesHistorySearch) {
      salesHistorySearch.addEventListener('input', (e) => {
        this.salesHistorySearchQuery = e.target.value.trim();
        this.renderSalesHistory();
      });
    }

    const salesHistoryDate = document.getElementById('sales-history-date');
    if (salesHistoryDate) {
      salesHistoryDate.addEventListener('change', (e) => {
        this.salesHistoryFilterDate = e.target.value;
        const quickSelect = document.getElementById('sales-history-quick-date');
        if (quickSelect && e.target.value) quickSelect.value = 'all';
        this.renderSalesHistory();
      });
    }

    const salesHistoryQuickDate = document.getElementById('sales-history-quick-date');
    if (salesHistoryQuickDate) {
      salesHistoryQuickDate.addEventListener('change', (e) => {
        this.salesHistoryQuickDate = e.target.value;
        const dateEl = document.getElementById('sales-history-date');
        if (dateEl && e.target.value !== 'all') dateEl.value = '';
        this.salesHistoryFilterDate = '';
        this.renderSalesHistory();
      });
    }

    const salesHistorySpec = document.getElementById('sales-history-specialist');
    if (salesHistorySpec) {
      salesHistorySpec.addEventListener('change', (e) => {
        this.salesHistoryFilterSpec = e.target.value;
        this.renderSalesHistory();
      });
    }

    const salesHistoryPayment = document.getElementById('sales-history-payment');
    if (salesHistoryPayment) {
      salesHistoryPayment.addEventListener('change', (e) => {
        this.salesHistoryFilterPayment = e.target.value;
        this.renderSalesHistory();
      });
    }

    // Inventory Search & Filters
    const inventorySearchInput = document.getElementById('inventory-search-input');
    if (inventorySearchInput) {
      inventorySearchInput.addEventListener('input', () => this.renderInventory());
    }

    const inventoryCategoryFilter = document.getElementById('inventory-category-filter');
    if (inventoryCategoryFilter) {
      inventoryCategoryFilter.addEventListener('change', (e) => {
        this.inventoryFilterCategory = e.target.value;
        this.renderInventory();
      });
    }

    // Caja Chica & Cuadre listeners
    const cajaDateInput = document.getElementById('caja-date-input');
    if (cajaDateInput) {
      cajaDateInput.addEventListener('change', () => this.renderCaja());
    }

    const btnSetInitialBase = document.getElementById('btn-set-initial-base');
    if (btnSetInitialBase) {
      btnSetInitialBase.addEventListener('click', () => this.handlePromptInitialCashBase());
    }

    document.querySelectorAll('.denom-input').forEach(input => {
      input.addEventListener('input', () => this.handleCuadreInput());
    });

    document.querySelectorAll('.petty-cash-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const desc = e.currentTarget.getAttribute('data-desc');
        const descInput = document.getElementById('caja-desc-input');
        if (descInput && desc) {
          descInput.value = desc;
          document.getElementById('caja-amount-input')?.focus();
        }
      });
    });

    // Expenses & Balance Filters (Dueña)
    const expensesMonthFilter = document.getElementById('expenses-month-filter');
    if (expensesMonthFilter) {
      expensesMonthFilter.addEventListener('change', () => this.renderExpenses());
    }

    const factFilterCategory = document.getElementById('fact-filter-category');
    if (factFilterCategory) {
      factFilterCategory.addEventListener('change', () => this.renderExpenses());
    }

    // Form Submissions
    const posSaleForm = document.getElementById('form-pos-sale') || document.getElementById('form-new-sale');
    if (posSaleForm) {
      posSaleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateSale();
      });
    }

    const newClientForm = document.getElementById('form-new-client');
    if (newClientForm) {
      newClientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveClient();
      });
    }

    const newInvForm = document.getElementById('form-new-inventory');
    if (newInvForm) {
      newInvForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveInventory();
      });
    }

    const adjustStockForm = document.getElementById('form-adjust-stock');
    if (adjustStockForm) {
      adjustStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAdjustStockSubmit();
      });
    }

    const pettyCashForm = document.getElementById('form-petty-cash');
    if (pettyCashForm) {
      pettyCashForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSavePettyCash();
      });
    }

    const invoiceForm = document.getElementById('form-invoice');
    if (invoiceForm) {
      invoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveInvoice();
      });
    }



    // Backup & Restore
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExportBackup());
    }

    const importInput = document.getElementById('input-import-backup');
    if (importInput) {
      importInput.addEventListener('change', (e) => this.handleImportBackup(e));
    }

    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!window.lussoDB.isPrivilegedAdmin()) {
          this.handleRoleClick();
          this.showToast('Esta acción requiere PIN de Dueña / Administración.', 'warning');
          return;
        }
        if (confirm('¿Estás segura de reiniciar los datos a la versión consolidada 2026?')) {
          window.lussoDB.resetToDefaults();
          this.refreshAll();
          this.showToast('Datos reiniciados con éxito.', 'success');
        }
      });
    }

    // Global keyboard listener for PIN modal (Desktop & Bluetooth Tablet Keyboards)
    window.addEventListener('keydown', (e) => {
      const pinModal = document.getElementById('modal-admin-pin');
      if (!pinModal || !pinModal.classList.contains('open')) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        this.handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        this.handleKeypadBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.validateKeypadPin();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        pinModal.classList.remove('open');
        this.pinBuffer = '';
        this.updateKeypadDotsUI();
      }
    });
  }

  handleRoleClick() {
    if (window.lussoDB.isPrivilegedAdmin()) {
      // Toggle back to Stylist mode immediately
      this.setRole('stylist');
      this.showToast('🔒 Modo Estilista activo: Métricas financieras protegidas.', 'info');
    } else {
      // Open PIN modal with keypad
      this.pinBuffer = '';
      this.updateKeypadDotsUI();
      document.getElementById('pin-error-msg')?.classList.add('hidden');
      document.getElementById('modal-admin-pin')?.classList.add('open');
    }
  }

  handleKeypadPress(digit) {
    if (!this.pinBuffer) this.pinBuffer = '';
    if (this.pinBuffer.length >= 4) return;

    this.pinBuffer += String(digit);
    this.updateKeypadDotsUI();
    document.getElementById('pin-error-msg')?.classList.add('hidden');

    if (this.pinBuffer.length === 4) {
      setTimeout(() => this.validateKeypadPin(), 100);
    }
  }

  handleKeypadBackspace() {
    if (!this.pinBuffer || this.pinBuffer.length === 0) return;
    this.pinBuffer = this.pinBuffer.slice(0, -1);
    this.updateKeypadDotsUI();
    document.getElementById('pin-error-msg')?.classList.add('hidden');
  }

  handleKeypadClear() {
    this.pinBuffer = '';
    this.updateKeypadDotsUI();
    document.getElementById('pin-error-msg')?.classList.add('hidden');
  }

  updateKeypadDotsUI() {
    const len = this.pinBuffer ? this.pinBuffer.length : 0;
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`pin-dot-${i}`);
      if (dot) {
        dot.classList.toggle('filled', i <= len);
      }
    }
  }

  validateKeypadPin() {
    if (window.lussoDB.verifyAdminPin(this.pinBuffer)) {
      this.setRole('admin');
      document.getElementById('modal-admin-pin')?.classList.remove('open');
      this.pinBuffer = '';
      this.updateKeypadDotsUI();
      document.getElementById('pin-error-msg')?.classList.add('hidden');
      this.showToast('✨ Acceso Dueña Desbloqueado: Métricas y nómina habilitadas.', 'success');
      if (this.pendingTab) {
        this.switchTab(this.pendingTab);
        this.pendingTab = null;
      }
    } else {
      const errorEl = document.getElementById('pin-error-msg');
      if (errorEl) errorEl.classList.remove('hidden');
      // Shake dots
      const dotsBox = document.querySelector('.pin-dots-display');
      if (dotsBox) {
        dotsBox.classList.add('pin-shake');
        setTimeout(() => dotsBox.classList.remove('pin-shake'), 500);
      }
      setTimeout(() => {
        this.pinBuffer = '';
        this.updateKeypadDotsUI();
      }, 700);
    }
  }

  setRole(role) {
    window.lussoDB.setAuthRole(role);
    this.updateRoleUI();
    this.refreshAll();
  }

  updateRoleUI() {
    const isAdmin = window.lussoDB.isPrivilegedAdmin();

    // Top Bar Switcher
    const btn = document.getElementById('btn-top-role-toggle');
    const icon = document.getElementById('top-role-icon');
    const label = document.getElementById('top-role-label');
    const actionBadge = document.getElementById('top-role-action-badge');

    if (btn) {
      btn.className = `role-switcher-btn ${isAdmin ? 'role-admin' : 'role-stylist'}`;
    }
    if (icon) icon.textContent = isAdmin ? '👑' : '💅';
    if (label) label.textContent = isAdmin ? 'Modo Dueña' : 'Modo Estilista';
    if (actionBadge) actionBadge.textContent = isAdmin ? '🔓 Salir a Estilistas' : '🔒 Desbloquear Dueña';

    // Sidebar role indicator
    const sidebarRoleText = document.getElementById('sidebar-role-text');
    if (sidebarRoleText) {
      sidebarRoleText.textContent = isAdmin ? '👑 Administración: Dueña' : '👩‍🎨 Personal: Kiara & Cielo';
    }

    // Sidebar locked indicators
    const expensesItem = document.querySelector('.crm-nav-item[data-tab="expenses"]');
    const payrollItem = document.querySelector('.crm-nav-item[data-tab="payroll"]');
    const backupItem = document.querySelector('.crm-nav-item[data-tab="backup"]');
    if (expensesItem) {
      expensesItem.classList.toggle('nav-item-locked', !isAdmin);
    }
    if (payrollItem) {
      payrollItem.classList.toggle('nav-item-locked', !isAdmin);
    }
    if (backupItem) {
      backupItem.classList.toggle('nav-item-locked', !isAdmin);
    }
  }

  switchTab(tab) {
    if ((tab === 'expenses' || tab === 'backup' || tab === 'payroll') && !window.lussoDB.isPrivilegedAdmin()) {
      this.pendingTab = tab;
      this.handleRoleClick();
      this.showToast('🔒 Esta sección contiene pagos y balances salariales. Ingresa el PIN de Dueña para acceder.', 'warning');
      return;
    }

    this.currentTab = tab;
    document.querySelectorAll('.crm-nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tab);
    });

    document.querySelectorAll('.crm-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tab}`);
    });

    if (tab === 'dashboard') this.renderDashboard();
    if (tab === 'appointments') this.renderAppointments();
    if (tab === 'clients') this.renderClients();
    if (tab === 'sales') {
      this.renderSales();
      this.renderPOSQuickServices('all');
    }
    if (tab === 'sales-history') this.renderSalesHistory();
    if (tab === 'inventory') this.renderInventory();
    if (tab === 'caja') this.renderCaja();
    if (tab === 'expenses') this.renderExpenses();
    if (tab === 'payroll') this.renderPayroll();
  }

  refreshAll() {
    this.updateRoleUI();
    this.renderSales();
    this.renderSalesHistory();
    this.renderDashboard();
    this.renderAppointments();
    this.renderClients();
    this.renderInventory();
    this.renderCaja();
    this.renderExpenses();
    this.renderPayroll();
    this.populateSelects();
    this.updateAppointmentBadges();
  }

  refreshAppointments() {
    this.renderAppointments();
    this.renderDashboard();
    this.updateAppointmentBadges();
  }

  updateAppointmentBadges() {
    if (!window.lussoDB) return;
    const appointments = window.lussoDB.getAppointments();
    const todayStr = new Date().toISOString().split('T')[0];

    const todayCount = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;

    const elToday = document.getElementById('apt-stat-today-count');
    const elPending = document.getElementById('apt-stat-pending-count');
    const elConfirmed = document.getElementById('apt-stat-confirmed-count');
    const elCompleted = document.getElementById('apt-stat-completed-count');

    if (elToday) elToday.textContent = todayCount;
    if (elPending) elPending.textContent = pendingCount;
    if (elConfirmed) elConfirmed.textContent = confirmedCount;
    if (elCompleted) elCompleted.textContent = completedCount;

    const sidebarBadge = document.getElementById('crm-sidebar-pending-badge');
    if (sidebarBadge) {
      if (pendingCount > 0) {
        sidebarBadge.textContent = pendingCount;
        sidebarBadge.classList.remove('hidden');
      } else {
        sidebarBadge.classList.add('hidden');
      }
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `lusso-toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✨' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="toast-msg">${message}</span>
    `;
    const container = document.getElementById('toast-container') || document.body;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ================= DASHBOARD =================
  setDashboardPeriod(period) {
    const selector = document.getElementById('dashboard-month-selector');
    if (selector) {
      selector.value = period;
    }
    // Update active state on quick buttons
    const btnSep = document.getElementById('btn-period-sep');
    const btnAug = document.getElementById('btn-period-aug');
    const btnJul = document.getElementById('btn-period-jul');
    const btnAll = document.getElementById('btn-period-all');
    [btnSep, btnAug, btnJul, btnAll].forEach(b => b && b.classList.remove('active'));
    if (period === '2026-09' && btnSep) btnSep.classList.add('active');
    else if (period === '2026-08' && btnAug) btnAug.classList.add('active');
    else if (period === '2026-07' && btnJul) btnJul.classList.add('active');
    else if (period === 'all' && btnAll) btnAll.classList.add('active');

    this.renderDashboard();
  }

  renderDashboard() {
    const selector = document.getElementById('dashboard-month-selector');
    const selectedMonth = selector ? selector.value : '2026-09';
    const stats = window.lussoDB.getDashboardStats(selectedMonth);
    const isAdmin = window.lussoDB.isPrivilegedAdmin();
    
    const elRevTitle = document.getElementById('kpi-revenue-title');
    const elRevSub = document.getElementById('kpi-revenue-subtitle');
    const elRevenue = document.getElementById('kpi-total-revenue');
    const elExpenses = document.getElementById('kpi-total-expenses');
    const elExpensesSub = document.getElementById('kpi-expenses-subtitle');
    const elNetProfit = document.getElementById('kpi-net-profit');
    const elProfitMargin = document.getElementById('kpi-profit-margin');
    const elAvgTicket = document.getElementById('kpi-avg-ticket');
    const elSalesSub = document.getElementById('kpi-sales-subtitle');
    const elPeriodLabel = document.getElementById('dashboard-active-period-label');

    const diagBestMonth = document.getElementById('diag-best-month');
    const diagAvgMonthly = document.getElementById('diag-avg-monthly');
    const diagClients = document.getElementById('diag-clients-stat');

    const badgeSpec = document.getElementById('badge-spec-period');
    const badgePay = document.getElementById('badge-payment-period');
    const badgeServ = document.getElementById('badge-services-period');

    if (elRevTitle) elRevTitle.textContent = `💰 Facturación ${stats.periodLabel}`;
    if (elRevSub) {
      elRevSub.textContent = selectedMonth === 'all' 
        ? `Facturación acumulada 2026 (${stats.grandTotalTransactions} servicios)`
        : `Ingresos por servicios en ${stats.periodLabel}`;
    }
    if (elExpensesSub) {
      elExpensesSub.textContent = `Alquiler S/ ${stats.fixedRent.toFixed(0)} + Nómina S/ ${stats.totalPayroll.toFixed(0)} + Insumos`;
    }
    if (elSalesSub) {
      elSalesSub.textContent = `${stats.totalTransactions} atenciones registradas`;
    }

    if (elPeriodLabel) elPeriodLabel.textContent = `Periodo Activo: ${stats.periodLabel}`;
    if (badgeSpec) badgeSpec.textContent = stats.periodLabel;
    if (badgePay) badgePay.textContent = stats.periodLabel;
    if (badgeServ) badgeServ.textContent = stats.periodLabel;

    // Update Diagnostics Strip
    if (diagBestMonth && stats.bestMonth) {
      diagBestMonth.textContent = `${stats.bestMonth.label} (S/ ${stats.bestMonth.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })})`;
    }
    if (diagAvgMonthly) {
      diagAvgMonthly.textContent = `S/ ${stats.avgMonthlyRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })} / mes`;
    }
    if (diagClients) {
      diagClients.textContent = `${stats.totalClients} clientas en directorio`;
    }

    if (elRevenue) {
      if (isAdmin) {
        elRevenue.textContent = `S/ ${stats.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        elRevenue.classList.remove('text-masked');
      } else {
        elRevenue.innerHTML = `<span class="masked-revenue">••••••</span> <span class="lock-tag-sm">🔒 Solo Dueña</span>`;
        elRevenue.classList.add('text-masked');
      }
    }

    if (elExpenses) {
      if (isAdmin) {
        elExpenses.textContent = `S/ ${stats.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        elExpenses.classList.remove('text-masked');
      } else {
        elExpenses.innerHTML = `<span class="masked-revenue">••••••</span>`;
        elExpenses.classList.add('text-masked');
      }
    }

    if (elNetProfit) {
      if (isAdmin) {
        elNetProfit.textContent = `S/ ${stats.netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        elNetProfit.className = `fin-hero-val ${stats.netProfit >= 0 ? 'text-glow-green' : 'text-red'}`;
      } else {
        elNetProfit.innerHTML = `<span class="masked-revenue">••••••</span>`;
        elNetProfit.className = 'fin-hero-val text-muted';
      }
    }

    if (elProfitMargin) {
      if (isAdmin) {
        elProfitMargin.textContent = `${stats.profitMargin.toFixed(1)}% de margen operativo neto`;
      } else {
        elProfitMargin.textContent = '🔒 Requiere PIN Dueña';
      }
    }

    if (elAvgTicket) {
      elAvgTicket.textContent = `S/ ${stats.avgTicket.toFixed(2)}`;
    }

    this.renderDashboardMonthlyHistory(stats.monthlyHistory, selectedMonth);
    this.renderDashboardTodayAppointments(stats.todayAppointments || []);
    this.renderSpecialistChart(stats.specialists);
    this.renderPaymentMethodChart(stats.paymentMethods);
    this.renderTopServicesList(stats.topServices);
    this.renderLowStockAlerts(stats.lowStockItems);
  }

  renderDashboardMonthlyHistory(historyList, activeMonth) {
    const tableBody = document.getElementById('dashboard-monthly-table-body');
    const barsContainer = document.getElementById('dashboard-monthly-bars-container');
    const cardsGrid = document.getElementById('dashboard-monthly-cards-grid');
    if (!historyList || historyList.length === 0) return;

    const maxRev = Math.max(...historyList.map(h => h.totalRevenue), 1);

    // 1. Visual Monthly Trend Bars
    if (barsContainer) {
      barsContainer.innerHTML = `
        <div class="monthly-bars-track">
          ${historyList.slice().reverse().map(h => {
            const pct = Math.round((h.totalRevenue / maxRev) * 100);
            const isSelected = h.month === activeMonth;
            return `
              <div class="monthly-bar-col ${isSelected ? 'active' : ''}" onclick="window.lussoCRM.setDashboardPeriod('${h.month}')" title="${h.label}: S/ ${h.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })} • Utilidad: S/ ${h.netProfit.toFixed(2)} (${h.salesCount} servicios)">
                <div class="bar-fill-wrap">
                  <div class="bar-fill-fill" style="height: ${Math.max(14, pct)}%;">
                    <span class="bar-fill-val">S/ ${Math.round(h.totalRevenue)}</span>
                  </div>
                </div>
                <div class="bar-month-tag">${h.label.split(' ')[0].substring(0, 3)}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 2. Month Cards Grid (Detailed Month-by-Month Story)
    if (cardsGrid) {
      cardsGrid.innerHTML = historyList.map(h => {
        const isSelected = h.month === activeMonth;
        const growthBadge = h.growthPct > 0 
          ? `<span class="month-trend-badge trend-up">▲ +${h.growthPct}%</span>`
          : (h.growthPct < 0 && h.month !== '2026-09' ? `<span class="month-trend-badge trend-down">▼ ${h.growthPct}%</span>` : '');

        return `
          <div class="monthly-story-card ${isSelected ? 'active-card' : ''}">
            <div class="msc-header">
              <div>
                <div class="msc-title-row">
                  <h4 class="msc-month-title">${h.label}</h4>
                  ${h.month === '2026-09' ? '<span class="badge-tag status-confirmed text-2xs">Mes en Curso</span>' : growthBadge}
                </div>
                <div class="msc-revenue-big">S/ ${h.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              </div>
              <div class="msc-sub-stats">
                <span class="msc-stat-pill">🧾 ${h.salesCount} atenciones</span>
                <span class="msc-stat-pill">🎯 Ticket S/ ${h.avgTicket.toFixed(2)}</span>
              </div>
            </div>

            <!-- Resumen Financiero del Mes -->
            <div class="msc-section">
              <div class="msc-section-label">⚖️ Balance Financiero Real:</div>
              <div class="msc-payment-bars">
                <div class="msc-expenses-row">
                  <span>🏢 Alquiler Fijo:</span>
                  <strong>S/ ${h.fixedRent.toFixed(2)}</strong>
                </div>
                <div class="msc-expenses-row">
                  <span>👥 Nómina (Kiara & Cielo):</span>
                  <strong>S/ ${h.payrollTotal.toFixed(2)}</strong>
                </div>
                <div class="msc-expenses-row">
                  <span>📉 Gastos Totales:</span>
                  <strong class="text-red">S/ ${h.totalExpenses.toFixed(2)}</strong>
                </div>
                <div class="msc-profit-badge ${h.netProfit >= 0 ? 'is-pos' : 'is-neg'} mt-1">
                  <span>💎 Utilidad Neta Real:</span>
                  <strong>${h.netProfit >= 0 ? '+' : ''}S/ ${h.netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })} (${h.profitMargin}%)</strong>
                </div>
              </div>
            </div>

            <!-- Canales de Pago (Cómo se cobró) -->
            <div class="msc-section">
              <div class="msc-section-label">💳 Canales de Ingreso:</div>
              <div class="msc-payment-bars">
                <div class="msc-pay-item" title="POS / Tarjeta: S/ ${h.payment.pos.amount.toFixed(2)}">
                  <span class="msc-pay-label">💳 POS / Tarjetas</span>
                  <span class="msc-pay-val">S/ ${h.payment.pos.amount.toFixed(2)} (${h.payment.pos.pct}%)</span>
                </div>
                <div class="msc-pay-item" title="Yape / Billeteras: S/ ${h.payment.yape.amount.toFixed(2)}">
                  <span class="msc-pay-label">📱 Yape / Plin</span>
                  <span class="msc-pay-val">S/ ${h.payment.yape.amount.toFixed(2)} (${h.payment.yape.pct}%)</span>
                </div>
                <div class="msc-pay-item" title="Efectivo: S/ ${h.payment.cash.amount.toFixed(2)}">
                  <span class="msc-pay-label">💵 Efectivo</span>
                  <span class="msc-pay-val">S/ ${h.payment.cash.amount.toFixed(2)} (${h.payment.cash.pct}%)</span>
                </div>
              </div>
            </div>

            <!-- Desglose Especialista -->
            <div class="msc-section">
              <div class="msc-section-label">👥 Rendimiento por Colaboradora:</div>
              <div class="msc-spec-row">
                <div class="msc-spec-box">
                  <span class="msc-spec-name">💇‍♀️ Kiara</span>
                  <strong>S/ ${h.specialists.kiara.amount.toFixed(2)}</strong>
                  <span class="text-2xs text-muted">(${h.specialists.kiara.count} serv • ${h.specialists.kiara.pct}%)</span>
                </div>
                <div class="msc-spec-box">
                  <span class="msc-spec-name">💅 Cielo</span>
                  <strong>S/ ${h.specialists.cielo.amount.toFixed(2)}</strong>
                  <span class="text-2xs text-muted">(${h.specialists.cielo.count} serv • ${h.specialists.cielo.pct}%)</span>
                </div>
              </div>
            </div>

            <!-- Top Servicios -->
            <div class="msc-section">
              <div class="msc-section-label">✨ Servicios Estrella:</div>
              <div class="msc-top-tags">
                ${h.topServices.map(s => `<span class="top-srv-tag">${s}</span>`).join('')}
              </div>
            </div>

            <!-- Actions -->
            <div class="msc-footer-row">
              <button type="button" class="btn-xs ${isSelected ? 'btn-primary' : 'btn-outline'} flex-1" onclick="window.lussoCRM.setDashboardPeriod('${h.month}')">
                ${isSelected ? '✓ Viendo en Dashboard' : '📊 Analizar Mes'}
              </button>
              <button type="button" class="btn-xs btn-outline" onclick="window.lussoCRM.viewSalesHistoryForMonth('${h.month}')" title="Ver lista completa de cobros de este mes">
                🔍 Ver Cobros ↗
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Consolidated Table
    if (tableBody) {
      tableBody.innerHTML = historyList.map(h => {
        const isSelected = h.month === activeMonth;
        const profitBadge = h.netProfit >= 0 
          ? `<span class="badge-profit-pos">▲ +S/ ${h.netProfit.toFixed(0)}</span>`
          : `<span class="badge-profit-neg">▼ S/ ${h.netProfit.toFixed(0)}</span>`;

        return `
          <tr class="${isSelected ? 'row-highlight-active' : ''}" style="${isSelected ? 'background: #fffbeb; font-weight: 600;' : ''}">
            <td>
              <strong>${h.label}</strong>
              ${h.month === '2026-09' ? '<span class="badge-tag status-confirmed ml-1" style="font-size: 0.65rem; padding: 2px 6px;">Mes Actual</span>' : ''}
            </td>
            <td>
              <strong class="text-primary font-bold">S/ ${h.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
            </td>
            <td class="text-xs">S/ ${h.fixedRent.toFixed(2)}</td>
            <td class="text-xs">S/ ${h.payrollTotal.toFixed(2)}</td>
            <td>
              <span class="text-xs text-red font-bold">S/ ${h.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </td>
            <td>${profitBadge}</td>
            <td>
              <span class="font-bold ${h.profitMargin >= 0 ? 'text-emerald' : 'text-red'}">${h.profitMargin.toFixed(1)}%</span>
            </td>
            <td>${h.salesCount} serv.</td>
            <td>S/ ${h.avgTicket.toFixed(2)}</td>
            <td>
              <span class="text-xs font-bold">💇‍♀️ S/ ${h.kiaraRevenue.toFixed(0)}</span>
            </td>
            <td>
              <span class="text-xs font-bold">💅 S/ ${h.cieloRevenue.toFixed(0)}</span>
            </td>
            <td class="text-xs">
              💳 ${h.payment.pos.pct}% • 📱 ${h.payment.yape.pct}% • 💵 ${h.payment.cash.pct}%
            </td>
            <td>
              <button type="button" class="btn-xs ${isSelected ? 'btn-primary' : 'btn-outline'}" onclick="window.lussoCRM.setDashboardPeriod('${h.month}')">
                ${isSelected ? '✓ Seleccionado' : '🔍 Ver Mes'}
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  viewSalesHistoryForMonth(month) {
    this.switchTab('sales-history');
    const select = document.getElementById('sales-history-quick-date');
    if (select) {
      select.value = month;
      this.salesHistoryQuickDate = month;
      const dateEl = document.getElementById('sales-history-date');
      if (dateEl) dateEl.value = '';
      this.salesHistoryFilterDate = '';
      this.renderSalesHistory();
    }
  }

  renderDashboardTodayAppointments(appointments) {
    const container = document.getElementById('dashboard-today-appointments-list');
    if (!container) return;

    if (!appointments || appointments.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card py-3">
          <p class="text-sm text-muted">No hay citas programadas para hoy. ¡Puedes agendar una desde la Agenda de Citas o esperar reservas de la web!</p>
          <button class="btn-sm btn-outline mt-2" onclick="window.lussoCRM.openNewAppointmentModal()">+ Agendar Cita Manual</button>
        </div>
      `;
      return;
    }

    let html = '<div class="dashboard-apt-grid">';
    appointments.forEach(apt => {
      const isKiara = (apt.specialist || '').toLowerCase().includes('kiara');
      const specAvatar = isKiara ? '💇‍♀️' : '💅';
      const statusMap = {
        'pending': '<span class="status-badge status-pending">⏳ Pendiente</span>',
        'confirmed': '<span class="status-badge status-confirmed">✅ Confirmada</span>',
        'completed': '<span class="status-badge status-completed">💅 Atendida</span>',
        'cancelled': '<span class="status-badge status-cancelled">❌ Cancelada</span>'
      };

      html += `
        <div class="dash-apt-card">
          <div class="dash-apt-time-box">
            <span class="apt-time-txt">${apt.time}</span>
            <span class="apt-spec-txt">${specAvatar} ${apt.specialist}</span>
          </div>
          <div class="dash-apt-info">
            <div class="dash-apt-client">${apt.clientName} ${apt.clientPhone ? `<span class="text-xs text-muted">(${apt.clientPhone})</span>` : ''}</div>
            <div class="dash-apt-service">${apt.service} • <strong>S/ ${apt.amount || 0}</strong></div>
          </div>
          <div class="dash-apt-status">
            ${statusMap[apt.status] || statusMap['pending']}
          </div>
          <div class="dash-apt-actions">
            ${apt.clientPhone ? `
              <button class="btn-xs btn-outline text-emerald" onclick="window.lussoCRM.handleConfirmAppointmentWhatsApp('${apt.id}')" title="Enviar Confirmación por WhatsApp">
                💬 WhatsApp
              </button>
            ` : ''}
            <button class="btn-xs btn-primary" onclick="window.lussoCRM.handleConvertAppointmentToSale('${apt.id}')" title="Pasar a Caja y Registrar Cobro">
              💳 Cobrar
            </button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  renderSpecialistChart(specialists) {
    const container = document.getElementById('chart-specialists');
    if (!container) return;

    const isAdmin = window.lussoDB.isPrivilegedAdmin();
    const sales = window.lussoDB.getSales();

    // Count services by specialist
    const counts = { 'Kiara': 0, 'Cielo': 0 };
    sales.forEach(s => {
      const spec = (s.specialist || '').toLowerCase().includes('kiara') ? 'Kiara' : 'Cielo';
      counts[spec] = (counts[spec] || 0) + 1;
    });

    const entries = Object.entries(specialists).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);
    const maxCount = Math.max(counts['Kiara'] || 1, counts['Cielo'] || 1);

    let html = '<div class="bar-chart-list">';
    if (isAdmin) {
      entries.forEach(([name, amount]) => {
        const pct = Math.round((amount / maxVal) * 100);
        html += `
          <div class="bar-chart-row">
            <div class="bar-label">
              <span class="font-medium">${name}</span>
              <span class="text-muted font-bold">S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 0 })} (${counts[name] || 0} serv.)</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      });
    } else {
      // Stylist Mode: Only show number of clients/services without monetary Soles!
      ['Kiara', 'Cielo'].forEach(name => {
        const cnt = counts[name] || 0;
        const pct = Math.round((cnt / maxCount) * 100);
        html += `
          <div class="bar-chart-row">
            <div class="bar-label">
              <span class="font-medium">${name === 'Kiara' ? '💇‍♀️ Kiara (Estilista)' : '💅 Cielo (Nail Artist)'}</span>
              <span class="text-primary font-bold">${cnt} clientas atendidas</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      });
      html += `<div class="chart-discreet-note text-xs text-muted mt-2 text-right">🔒 Cifras en S/ restringidas para Administración</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  renderPaymentMethodChart(paymentMethods) {
    const container = document.getElementById('chart-payment-methods') || document.getElementById('chart-payments');
    if (!container) return;

    const isAdmin = window.lussoDB.isPrivilegedAdmin();
    const total = Object.values(paymentMethods).reduce((a, b) => a + b, 0);
    const colors = {
      'TARJETA': '#d48b96',
      'EFECTIVO': '#10b981',
      'QR': '#8b5cf6',
      'YAPE/PLIN': '#ec4899',
      'TRANSFERENCIA': '#3b82f6'
    };

    let html = '<div class="payment-pills-list">';
    Object.entries(paymentMethods).forEach(([method, amount]) => {
      if (amount <= 0 || method.includes('.')) return;
      const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
      const color = colors[method] || '#94a3b8';

      html += `
        <div class="payment-method-row">
          <div class="pay-method-header">
            <span class="pay-dot" style="background-color: ${color}"></span>
            <span class="pay-name">${method}</span>
            <span class="pay-val">${isAdmin ? `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })} (${pct}%)` : `${pct}% de cobros`}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }


  renderTopServicesList(topServices) {
    const container = document.getElementById('dashboard-top-services-list') || document.getElementById('list-top-services');
    if (!container) return;

    if (!topServices || topServices.length === 0) {
      container.innerHTML = '<p class="text-muted">No hay datos registrados aún.</p>';
      return;
    }

    let html = '<div class="top-services-grid">';
    topServices.forEach(([service, count], idx) => {
      html += `
        <div class="top-service-item">
          <span class="service-rank">#${idx + 1}</span>
          <div class="service-name-box">
            <span class="service-title">${service}</span>
            <span class="service-count">${count} servicios realizados</span>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  renderLowStockAlerts(items) {
    const container = document.getElementById('dashboard-low-stock-list');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = '<div class="empty-state-card"><p class="text-emerald">✨ ¡Todo el stock está en niveles óptimos!</p></div>';
      return;
    }

    let html = '<div class="stock-alerts-list">';
    items.slice(0, 5).forEach(item => {
      html += `
        <div class="stock-alert-item">
          <div class="alert-info">
            <span class="alert-name">${item.name}</span>
            <span class="alert-detail">${item.category} • ${item.unit}</span>
          </div>
          <div class="alert-stock">
            <span class="stock-badge badge-critical">Stock: ${item.stock}</span>
            <button class="btn-sm btn-outline" onclick="window.lussoCRM.openAdjustStockModal('${item.id}')">+ Reponer</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  // ================= APPOINTMENTS & AGENDA MANAGEMENT =================
  renderAppointments() {
    const container = document.getElementById('appointments-list-container');
    if (!container) return;

    const appointments = window.lussoDB.getAppointments();
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Compute start and end of this week
    const now = new Date();
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0];
    const lastDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7)).toISOString().split('T')[0];

    // Compute KPI counters
    const todayCount = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;

    const elToday = document.getElementById('apt-stat-today-count');
    const elPending = document.getElementById('apt-stat-pending-count');
    const elConfirmed = document.getElementById('apt-stat-confirmed-count');
    const elCompleted = document.getElementById('apt-stat-completed-count');

    if (elToday) elToday.textContent = todayCount;
    if (elPending) elPending.textContent = pendingCount;
    if (elConfirmed) elConfirmed.textContent = confirmedCount;
    if (elCompleted) elCompleted.textContent = completedCount;

    // Filter appointments
    const filtered = appointments.filter(a => {
      // Specialist filter
      if (this.appointmentFilterSpec !== 'all') {
        const specName = (a.specialist || '').toLowerCase();
        if (!specName.includes(this.appointmentFilterSpec.toLowerCase())) return false;
      }

      // Date filter
      if (this.appointmentFilterDate === 'today' && a.date !== todayStr) return false;
      if (this.appointmentFilterDate === 'tomorrow' && a.date !== tomorrowStr) return false;
      if (this.appointmentFilterDate === 'week') {
        if (a.date < firstDayOfWeek || a.date > lastDayOfWeek) return false;
      }

      // Status filter
      if (this.appointmentFilterStatus !== 'all' && a.status !== this.appointmentFilterStatus) return false;

      // Search Query
      if (this.appointmentSearchQuery) {
        const q = this.appointmentSearchQuery;
        const match = (a.clientName || '').toLowerCase().includes(q) ||
          (a.clientPhone || '').includes(q) ||
          (a.service || '').toLowerCase().includes(q) ||
          (a.notes || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-full py-8 text-center">
          <p class="text-muted text-base mb-2">No se encontraron citas con los filtros actuales.</p>
          <button class="btn-sm btn-primary" onclick="window.lussoCRM.openNewAppointmentModal()">+ Registrar Cita Manual</button>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(apt => {
      const isKiara = (apt.specialist || '').toLowerCase().includes('kiara');
      const specTag = isKiara 
        ? '<span class="badge-specialist badge-kiara">💇‍♀️ Kiara (Estilista)</span>' 
        : '<span class="badge-specialist badge-cielo">💅 Cielo (Nail Artist)</span>';

      const statusMap = {
        'pending': '<span class="status-badge status-pending">⏳ Pendiente</span>',
        'confirmed': '<span class="status-badge status-confirmed">✅ Confirmada</span>',
        'completed': '<span class="status-badge status-completed">💅 Atendida</span>',
        'cancelled': '<span class="status-badge status-cancelled">❌ Cancelada</span>'
      };

      const isToday = apt.date === todayStr;

      html += `
        <div class="apt-card ${apt.status === 'pending' ? 'is-pending' : ''} ${isToday ? 'is-today' : ''}">
          <div class="apt-card-header">
            <div>
              <div class="apt-client-name">${apt.clientName}</div>
              <div class="apt-client-phone">${apt.clientPhone ? `📱 ${apt.clientPhone}` : 'Sin teléfono'}</div>
            </div>
            <div class="apt-status-box">
              ${statusMap[apt.status] || statusMap['pending']}
            </div>
          </div>

          <div class="apt-card-body">
            <div class="apt-service-line">
              <span class="apt-service-name">✨ ${apt.service}</span>
              ${apt.amount ? `<span class="apt-amount-tag">S/ ${apt.amount}</span>` : ''}
            </div>

            <div class="apt-meta-row">
              <div class="apt-meta-item">
                <span>📅</span> <strong>${apt.date}</strong> (${apt.time})
              </div>
              <div class="apt-meta-item">
                ${specTag}
              </div>
            </div>

            ${apt.notes ? `<div class="apt-notes-snippet">📝 ${apt.notes}</div>` : ''}
          </div>

          <div class="apt-card-actions">
            <button class="btn-xs btn-outline" onclick="window.lussoCRM.handleAddToGoogleCalendar('${apt.id}')" title="Crear evento en Google Calendar">
              📅 Google Cal
            </button>

            ${apt.clientPhone ? `
              <button class="btn-xs btn-wa-action" onclick="window.lussoCRM.handleConfirmAppointmentWhatsApp('${apt.id}')" title="Enviar confirmación oficial por WhatsApp a la clienta">
                💬 Confirmar WhatsApp
              </button>
              <button class="btn-xs btn-outline" onclick="window.lussoCRM.handleReminderWhatsApp('${apt.id}')" title="Enviar recordatorio 24h por WhatsApp">
                ⏰ Recordar
              </button>
            ` : ''}

            <button class="btn-xs btn-primary-soft" onclick="window.lussoCRM.handleConvertAppointmentToSale('${apt.id}')" title="Cobrar y transferir al Punto de Venta">
              💳 Cobrar / POS
            </button>

            <select class="form-select select-xs" onchange="window.lussoCRM.handleUpdateAppointmentStatus('${apt.id}', this.value)" title="Cambiar estado">
              <option value="pending" ${apt.status === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
              <option value="confirmed" ${apt.status === 'confirmed' ? 'selected' : ''}>✅ Confirmada</option>
              <option value="completed" ${apt.status === 'completed' ? 'selected' : ''}>💅 Atendida</option>
              <option value="cancelled" ${apt.status === 'cancelled' ? 'selected' : ''}>❌ Cancelada</option>
            </select>

            <button class="btn-icon text-muted" onclick="window.lussoCRM.handleDeleteAppointment('${apt.id}')" title="Eliminar cita">
              🗑️
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  openManualAppointmentModal(aptData = null) {
    this.openNewAppointmentModal(aptData);
  }

  setAppointmentDateFilter(dateVal) {
    this.appointmentFilterDate = dateVal;
    document.querySelectorAll('.apt-date-filter, .apt-stat-box').forEach(btn => {
      if (btn.getAttribute('data-date') === dateVal) {
        btn.classList.add('active');
      } else if (dateVal === 'today' && btn.querySelector('#apt-stat-today-count')) {
        btn.classList.add('active');
      } else if (btn.getAttribute('data-date')) {
        btn.classList.remove('active');
      }
    });
    const dateSelect = document.getElementById('appointment-date-filter');
    if (dateSelect) dateSelect.value = dateVal;
    this.renderAppointments();
  }

  filterAppointmentsByDate(dateVal) {
    this.setAppointmentDateFilter(dateVal);
  }

  setAppointmentStatusFilter(statusVal) {
    this.appointmentFilterStatus = statusVal;
    document.querySelectorAll('.apt-stat-box').forEach(box => {
      box.classList.remove('active');
      if (statusVal === 'pending' && box.querySelector('#apt-stat-pending-count')) box.classList.add('active');
      else if (statusVal === 'confirmed' && box.querySelector('#apt-stat-confirmed-count')) box.classList.add('active');
      else if (statusVal === 'completed' && box.querySelector('#apt-stat-completed-count')) box.classList.add('active');
    });
    const select = document.getElementById('appointment-status-filter') || document.getElementById('appointment-status-select-filter');
    if (select) select.value = statusVal;
    this.renderAppointments();
  }

  filterAppointmentsByStatus(statusVal) {
    this.setAppointmentStatusFilter(statusVal);
  }

  setAppointmentSpecFilter(specVal) {
    this.appointmentFilterSpec = specVal;
    const select = document.getElementById('appointment-spec-filter');
    if (select) select.value = specVal;
    this.renderAppointments();
  }

  filterInventoryByCategory(category) {
    this.inventoryFilterCategory = category;
    const catSelect = document.getElementById('inventory-category-filter');
    if (catSelect) catSelect.value = category;
    this.renderInventory();
  }

  openNewAppointmentModal(aptData = null) {
    const modal = document.getElementById('modal-appointment-manual');
    if (!modal) return;

    const idInput = document.getElementById('manual-apt-id');
    const nameInput = document.getElementById('manual-apt-name');
    const phoneInput = document.getElementById('manual-apt-phone');
    const srvInput = document.getElementById('manual-apt-service');
    const specSelect = document.getElementById('manual-apt-specialist');
    const dateInput = document.getElementById('manual-apt-date');
    const timeSelect = document.getElementById('manual-apt-time');
    const statusSelect = document.getElementById('manual-apt-status');
    const amtInput = document.getElementById('manual-apt-amount');
    const notesInput = document.getElementById('manual-apt-notes');
    const titleEl = document.getElementById('modal-manual-apt-title');

    if (aptData) {
      if (titleEl) titleEl.textContent = 'Editar Cita';
      if (idInput) idInput.value = aptData.id || '';
      if (nameInput) nameInput.value = aptData.clientName || '';
      if (phoneInput) phoneInput.value = aptData.clientPhone || '';
      if (srvInput) srvInput.value = aptData.service || '';
      if (specSelect) specSelect.value = aptData.specialist || 'Kiara';
      if (dateInput) dateInput.value = aptData.date || new Date().toISOString().split('T')[0];
      if (timeSelect) timeSelect.value = aptData.time || '10:00 AM';
      if (statusSelect) statusSelect.value = aptData.status || 'confirmed';
      if (amtInput) amtInput.value = aptData.amount || '';
      if (notesInput) notesInput.value = aptData.notes || '';
    } else {
      if (titleEl) titleEl.textContent = 'Registrar Cita Manual';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (srvInput) srvInput.value = '';
      if (specSelect) specSelect.value = 'Kiara';
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (timeSelect) timeSelect.value = '10:00 AM';
      if (statusSelect) statusSelect.value = 'confirmed';
      if (amtInput) amtInput.value = '';
      if (notesInput) notesInput.value = '';
    }

    modal.classList.add('open');
  }

  handleSaveManualAppointment() {
    const id = document.getElementById('manual-apt-id')?.value;
    const clientName = document.getElementById('manual-apt-name')?.value.trim();
    const clientPhone = document.getElementById('manual-apt-phone')?.value.trim();
    const service = document.getElementById('manual-apt-service')?.value.trim();
    const specialist = document.getElementById('manual-apt-specialist')?.value;
    const date = document.getElementById('manual-apt-date')?.value;
    const time = document.getElementById('manual-apt-time')?.value;
    const status = document.getElementById('manual-apt-status')?.value || 'confirmed';
    const amount = parseFloat(document.getElementById('manual-apt-amount')?.value) || 0;
    const notes = document.getElementById('manual-apt-notes')?.value.trim();

    if (!clientName || !service || !date || !time) {
      this.showToast('Por favor completa todos los campos requeridos (*)', 'warning');
      return;
    }

    const aptData = {
      id: id || undefined,
      clientName,
      clientPhone,
      service,
      specialist,
      date,
      time,
      status,
      amount,
      notes
    };

    window.lussoDB.saveAppointment(aptData);
    document.getElementById('modal-appointment-manual')?.classList.remove('open');
    this.refreshAppointments();
    this.showToast(`Cita de ${clientName} guardada con éxito en la agenda.`, 'success');
  }

  handleConfirmAppointmentWhatsApp(id) {
    const apt = window.lussoDB.getAppointmentById(id);
    if (!apt) return;

    let phone = (apt.clientPhone || '').trim();
    if (!phone) {
      const client = window.lussoDB.getClientByName(apt.clientName);
      if (client && client.phone) phone = client.phone.trim();
    }

    if (!phone) {
      this.showToast(`La clienta ${apt.clientName} no tiene teléfono registrado. Edita la ficha para agregarlo.`, 'warning');
      return;
    }

    // Format professional confirmation message
    let msg = `¡Hola *${apt.clientName}*! 💖✨\n\n`;
    msg += `Te confirmamos con mucha alegría tu cita en *Lusso Beauty Salón*:\n\n`;
    msg += `💅 *Servicio:* ${apt.service}\n`;
    msg += `👩‍🦰 *Especialista:* ${apt.specialist}\n`;
    msg += `📅 *Fecha:* ${apt.date}\n`;
    msg += `⏰ *Hora:* ${apt.time}\n`;
    msg += `📍 *Ubicación:* Calle Berlín 481, Miraflores (Ref: a 4 cuadras del Parque Kennedy)\n`;
    msg += `📞 *WhatsApp Salón:* +51 971 988 386\n\n`;
    msg += `Si necesitas reprogramar o tienes alguna consulta, avísanos con anticipación. ¡Te esperamos para consentirte! 🌸💅`;

    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');

    // Mark as confirmed
    window.lussoDB.updateAppointmentStatus(id, 'confirmed');
    this.refreshAppointments();
    this.showToast(`WhatsApp abierto para ${apt.clientName}. Cita marcada como Confirmada.`, 'success');
  }

  handleReminderWhatsApp(id) {
    const apt = window.lussoDB.getAppointmentById(id);
    if (!apt) return;

    let phone = (apt.clientPhone || '').trim();
    if (!phone) {
      const client = window.lussoDB.getClientByName(apt.clientName);
      if (client && client.phone) phone = client.phone.trim();
    }

    if (!phone) {
      this.showToast(`La clienta ${apt.clientName} no tiene teléfono registrado.`, 'warning');
      return;
    }

    let msg = `¡Hola *${apt.clientName}*! ✨🌸\n\n`;
    msg += `Te saludamos de *Lusso Beauty Salón* para recordarte tu cita programada:\n\n`;
    msg += `💅 *Servicio:* ${apt.service}\n`;
    msg += `👩‍🦰 *Especialista:* ${apt.specialist}\n`;
    msg += `📅 *Fecha:* ${apt.date}\n`;
    msg += `⏰ *Hora:* ${apt.time}\n`;
    msg += `📍 *Ubicación:* Calle Berlín 481, Miraflores\n`;
    msg += `📞 *WhatsApp Salón:* +51 971 988 386\n\n`;
    msg += `¿Nos confirmas tu asistencia? ¡Nos vemos pronto para consentirte! 💖`;

    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
    this.showToast(`Recordatorio de WhatsApp abierto para ${apt.clientName}.`, 'success');
  }

  createGoogleCalendarUrl(apt) {
    if (!apt) return 'https://calendar.google.com';
    const dateStr = apt.date || new Date().toISOString().split('T')[0];
    let hours = 11;
    let minutes = 0;
    if (apt.time) {
      const timeClean = apt.time.trim();
      const isPM = /pm/i.test(timeClean);
      const isAM = /am/i.test(timeClean);
      const match = timeClean.match(/(\d+):?(\d+)?/);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = match[2] ? parseInt(match[2], 10) : 0;
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }
    }

    const pad = n => String(n).padStart(2, '0');
    // Peru is UTC-5
    let utcHours = (hours + 5) % 24;
    let [y, m, d] = dateStr.split('-');
    
    const startIso = `${y}${m}${d}T${pad(utcHours)}${pad(minutes)}00Z`;
    let endUtcHours = (utcHours + 1) % 24;
    const endIso = `${y}${m}${d}T${pad(endUtcHours)}${pad(minutes)}00Z`;

    const title = encodeURIComponent(`💅 ${apt.service} - ${apt.clientName} (${apt.specialist})`);
    const details = encodeURIComponent(
      `✨ Cita en Lusso Beauty Salón\n\n` +
      `👤 Clienta: ${apt.clientName}\n` +
      `📱 Teléfono: ${apt.clientPhone || 'Sin teléfono'}\n` +
      `👩‍🎨 Especialista: ${apt.specialist}\n` +
      `💅 Servicio: ${apt.service}\n` +
      (apt.amount ? `💰 Monto estimado: S/ ${apt.amount}\n` : '') +
      (apt.notes ? `📝 Notas: ${apt.notes}\n` : '') +
      `📍 Ubicación: Calle Berlín 481, Miraflores\n` +
      `📞 WhatsApp Salón: +51 971 988 386`
    );
    const location = encodeURIComponent('Calle Berlín 481, Miraflores, Lima - Lusso Beauty Salón');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  }

  handleAddToGoogleCalendar(id) {
    const apt = window.lussoDB.getAppointmentById(id);
    if (!apt) return;
    const url = this.createGoogleCalendarUrl(apt);
    window.open(url, '_blank');
    this.showToast(`Abriendo Google Calendar para la cita de ${apt.clientName}... 📅`, 'info');
  }

  handleExportICalendar() {
    const appointments = window.lussoDB.getAppointments().filter(a => a.status !== 'cancelled');
    if (appointments.length === 0) {
      this.showToast('No hay citas registradas para exportar.', 'warning');
      return;
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lusso Beauty Salon//Agenda CRM v1.0//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Lusso Beauty Salón - Citas'
    ];

    appointments.forEach(apt => {
      const dateStr = (apt.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
      let hours = '110000';
      if (apt.time) {
        const timeClean = apt.time.trim();
        const isPM = /pm/i.test(timeClean);
        const match = timeClean.match(/(\d+):?(\d+)?/);
        if (match) {
          let h = parseInt(match[1], 10);
          let m = match[2] ? parseInt(match[2], 10) : 0;
          if (isPM && h < 12) h += 12;
          hours = `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
        }
      }

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:apt-${apt.id || Date.now()}@lussosalon.pe`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART;TZID=America/Lima:${dateStr}T${hours}`);
      icsContent.push(`SUMMARY:💅 ${apt.service} - ${apt.clientName} (${apt.specialist})`);
      icsContent.push(`DESCRIPTION:Clienta: ${apt.clientName} | Celular: ${apt.clientPhone || 'N/A'} | Especialista: ${apt.specialist} | Salón: Lusso (+51 971 988 386)`);
      icsContent.push('LOCATION:Calle Berlín 481\\, Miraflores\\, Lima');
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Lusso_Agenda_Google_Calendar_${new Date().toISOString().split('T')[0]}.ics`;
    link.click();
    this.showToast('Archivo .ics descargado. Puedes importarlo directamente en Google Calendar 📅', 'success');
  }

  // ================= GOOGLE CALENDAR API INTEGRATION =================
  openGoogleCalendarConfigModal() {
    const modal = document.getElementById('modal-gcalendar-config');
    if (!modal) return;

    if (window.lussoGCalendar) {
      const config = window.lussoGCalendar.config;
      const calInput = document.getElementById('gcal-input-calendar-id');
      const apiInput = document.getElementById('gcal-input-api-key');
      const autoInput = document.getElementById('gcal-input-auto-sync');
      const resultEl = document.getElementById('gcal-test-result');

      if (calInput) calInput.value = config.calendarId || '';
      if (apiInput) apiInput.value = config.apiKey || '';
      if (autoInput) autoInput.checked = config.autoSync !== false;
      if (resultEl) resultEl.style.display = 'none';
    }

    modal.classList.add('open');
  }

  async testGoogleCalendarConnection() {
    const calId = document.getElementById('gcal-input-calendar-id')?.value.trim();
    const apiKey = document.getElementById('gcal-input-api-key')?.value.trim();
    const resultEl = document.getElementById('gcal-test-result');
    if (!resultEl) return;

    resultEl.style.display = 'block';
    resultEl.style.background = '#eff6ff';
    resultEl.style.color = '#1e40af';
    resultEl.textContent = '🔄 Probando conexión con Google Calendar...';

    if (window.lussoGCalendar) {
      const res = await window.lussoGCalendar.testConnection(apiKey, calId);
      if (res.success) {
        resultEl.style.background = '#f0fdf4';
        resultEl.style.color = '#166534';
        resultEl.textContent = `✅ ${res.message}`;
        this.showToast('Conexión con Google Calendar verificada con éxito 📅', 'success');
      } else {
        resultEl.style.background = '#fef2f2';
        resultEl.style.color = '#991b1b';
        resultEl.textContent = `❌ ${res.message}`;
      }
    }
  }

  async saveGoogleCalendarConfig() {
    const calId = document.getElementById('gcal-input-calendar-id')?.value.trim();
    const apiKey = document.getElementById('gcal-input-api-key')?.value.trim();
    const autoSync = document.getElementById('gcal-input-auto-sync')?.checked;
    const modal = document.getElementById('modal-gcalendar-config');

    if (window.lussoGCalendar) {
      window.lussoGCalendar.saveConfig({
        calendarId: calId,
        apiKey: apiKey,
        autoSync: autoSync
      });

      if (modal) modal.classList.remove('open');
      this.showToast('Configuración de Google Calendar guardada con éxito.', 'success');

      if (apiKey && calId) {
        this.syncGoogleCalendarNow();
      }
    }
  }

  async syncGoogleCalendarNow() {
    if (!window.lussoGCalendar) return;

    if (!window.lussoGCalendar.isConfigured()) {
      this.openGoogleCalendarConfigModal();
      this.showToast('Por favor ingresa tu API Key y correo de Gmail para conectar Google Calendar.', 'info');
      return;
    }

    this.showToast('Sincronizando citas con Google Calendar... 🔄', 'info');
    const res = await window.lussoGCalendar.syncFromGoogle();

    if (res.success) {
      this.renderAppointments();
      this.showToast(res.message, 'success');
    } else {
      this.showToast(res.message, 'warning');
    }
  }

  handleConvertAppointmentToSale(id) {
    const apt = window.lussoDB.getAppointmentById(id);
    if (!apt) return;

    // Switch to POS Tab
    this.switchTab('sales');

    // Pre-fill POS fields
    const dateInput = document.getElementById('pos-date-input') || document.getElementById('sale-date-input');
    const clientInput = document.getElementById('pos-client-input') || document.getElementById('sale-client-input');
    const specSelect = document.getElementById('pos-specialist-select') || document.getElementById('sale-specialist-select');
    const srvInput = document.getElementById('pos-service-input') || document.getElementById('sale-service-input');
    const amtInput = document.getElementById('pos-amount-input') || document.getElementById('sale-amount-input');
    const notesInput = document.getElementById('pos-notes-input') || document.getElementById('sale-notes-input');
    const phoneInput = document.getElementById('pos-phone-input');

    if (dateInput) dateInput.value = apt.date || new Date().toISOString().split('T')[0];
    if (clientInput) {
      clientInput.value = apt.clientName;
      this.handlePOSClientInputChange(apt.clientName);
    }
    if (phoneInput && apt.clientPhone) {
      phoneInput.value = apt.clientPhone;
    }
    if (specSelect) {
      // Find matching specialist option
      const isKiara = (apt.specialist || '').toLowerCase().includes('kiara');
      specSelect.value = isKiara ? 'Kiara' : 'Cielo';
    }
    if (srvInput) srvInput.value = apt.service;
    if (amtInput) amtInput.value = apt.amount || '';
    if (notesInput) notesInput.value = `Proveniente de cita agendada (${apt.time})`;

    // Mark appointment as completed
    window.lussoDB.updateAppointmentStatus(id, 'completed');
    this.refreshAppointments();

    this.showToast(`Datos de la cita de ${apt.clientName} transferidos al Punto de Venta. Cita marcada como Atendida.`, 'success');
  }

  handleUpdateAppointmentStatus(id, newStatus) {
    window.lussoDB.updateAppointmentStatus(id, newStatus);
    this.refreshAppointments();
    this.showToast('Estado de la cita actualizado.', 'success');
  }

  handleDeleteAppointment(id) {
    if (confirm('¿Estás segura de eliminar esta cita de la agenda?')) {
      window.lussoDB.deleteAppointment(id);
      this.refreshAppointments();
      this.showToast('Cita eliminada.', 'info');
    }
  }

  // ================= POS CLIENT HISTORY QUICK INSIGHT =================
  handlePOSClientInputChange(name) {
    const box = document.getElementById('pos-client-history-preview');
    if (!box) return;

    if (!name || name.trim().length < 2) {
      box.style.display = 'none';
      return;
    }

    const profile = window.lussoDB.getClientProfile(name.trim());
    if (!profile || profile.totalVisits === 0) {
      box.style.display = 'block';
      box.innerHTML = `
        <div class="pos-insight-card is-new">
          <div class="pos-insight-header">
            <span>🟢 Clienta Nueva / Primera Visita</span>
            <span class="text-xs text-muted">0 visitas anteriores</span>
          </div>
          <p class="text-xs text-muted mt-1">Al guardar el cobro se creará su ficha automáticamente en el directorio.</p>
        </div>
      `;
      return;
    }

    const last = profile.lastService;
    const client = window.lussoDB.getClientByName(name.trim());
    const formula = client?.technicalNotes || client?.notes || 'Sin notas técnicas';

    box.style.display = 'block';
    box.innerHTML = `
      <div class="pos-insight-card is-recurrent">
        <div class="pos-insight-header">
          <div>
            <strong>🟣 ${profile.name}</strong> 
            <span class="badge-specialist ml-1">${profile.totalVisits} visitas</span>
            <span class="text-xs text-muted ml-1">Ticket Prom: S/ ${profile.avgTicket.toFixed(0)}</span>
          </div>
          <button type="button" class="btn-xs btn-outline" onclick="window.lussoCRM.openClientProfile('${encodeURIComponent(profile.name)}')">
            🔍 Ver Ficha 360°
          </button>
        </div>

        <div class="pos-insight-body">
          <div class="pos-last-service-info">
            <span class="text-xs text-muted">Último servicio (${last?.date || '-'}):</span>
            <span class="font-bold text-burgundy">${last?.service || '-'}</span>
            <span class="font-bold text-primary">S/ ${Number(last?.amount || 0).toFixed(2)}</span>
            <span class="text-xs text-secondary">(${last?.specialist || '-'})</span>
          </div>
          
          ${formula !== 'Sin notas técnicas' ? `<div class="pos-formula-snippet">📝 <strong>Fórmula/Notas:</strong> ${formula}</div>` : ''}

          <div class="pos-insight-actions">
            <button type="button" class="btn-sm btn-primary-soft" onclick="window.lussoCRM.replicateServiceInPOS('${encodeURIComponent(last?.service || '')}', ${last?.amount || 0}, '${last?.specialist || 'Kiara'}')">
              ⚡ Repetir Servicio Anterior (S/ ${Number(last?.amount || 0).toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    `;
  }

  replicateServiceInPOS(serviceEncoded, amount, specialist) {
    const service = decodeURIComponent(serviceEncoded);
    this.posItems = [];
    if (service && service.includes(' + ')) {
      const parts = service.split(' + ');
      const totalAmt = parseFloat(amount) || 0;
      const approxPrice = Math.round((totalAmt / parts.length) * 100) / 100;
      parts.forEach((p, idx) => {
        const itemPrice = idx === parts.length - 1 ? (totalAmt - (approxPrice * (parts.length - 1))) : approxPrice;
        this.addPOSItem(p.trim(), itemPrice, specialist);
      });
    } else {
      this.addPOSItem(service, amount, specialist);
    }
    this.renderPOSTicket();
    this.showToast(`Servicio "${service}" precargado en la cuenta (S/ ${amount}).`, 'success');
  }

  // ================= CLIENT DIRECTORY & 360 =================
  renderClients() {
    const clients = window.lussoDB.getClients();
    const normalizeStr = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const searchVal = normalizeStr(document.getElementById('client-search-input')?.value || '');
    const tableBody = document.getElementById('clients-table-body');
    const countBadge = document.getElementById('client-count-badge') || document.getElementById('clients-count-badge');
    
    if (!tableBody) return;

    let filtered = clients.filter(c => {
      const matchSearch = !searchVal ||
        normalizeStr(c.name).includes(searchVal) ||
        (c.phone && c.phone.includes(searchVal)) ||
        normalizeStr(c.notes).includes(searchVal) ||
        normalizeStr(c.technicalNotes).includes(searchVal);

      if (!matchSearch) return false;

      const profile = window.lussoDB.getClientProfile(c.name);
      if (this.clientFilterType === 'new') return profile.totalVisits <= 1;
      if (this.clientFilterType === 'recurrent') return profile.totalVisits > 1;
      return true;
    });

    if (countBadge) countBadge.textContent = `${filtered.length} clientas`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-muted">
            No se encontraron clientas con el criterio de búsqueda.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.slice(0, 100).forEach(c => {
      const profile = window.lussoDB.getClientProfile(c.name);
      const isNew = profile.totalVisits <= 1;
      const lastServ = profile.lastService;
      
      html += `
        <tr class="client-row" onclick="window.lussoCRM.openClientProfile('${encodeURIComponent(c.name)}')">
          <td>
            <div class="client-name-cell">
              <div class="client-avatar">${(c.name || '?').charAt(0).toUpperCase()}</div>
              <div>
                <div class="font-bold text-dark">${c.name}</div>
                <div class="text-xs text-muted">${c.email || (c.phone ? '📱 ' + c.phone : 'Sin contacto')}</div>
              </div>
            </div>
          </td>
          <td>
            ${c.phone ? `<a href="https://wa.me/51${c.phone}" target="_blank" class="phone-link" onclick="event.stopPropagation();">📱 ${c.phone}</a>` : '<span class="text-muted">-</span>'}
          </td>
          <td>
            <span class="status-pill ${isNew ? 'pill-new' : 'pill-recurrent'}">
              ${isNew ? '🟢 Nueva (1)' : `🟣 Frecuente (${profile.totalVisits})`}
            </span>
          </td>
          <td>
            <span class="font-bold text-burgundy">S/ ${profile.totalSpent.toLocaleString('es-PE', { minimumFractionDigits: 0 })}</span>
          </td>
          <td>
            <div class="text-xs">📅 ${profile.lastVisit}</div>
            <div class="text-xs text-muted truncate max-w-150">${lastServ?.service || '-'}</div>
          </td>
          <td>
            <span class="text-sm font-medium text-secondary">${profile.topSpecialist}</span>
          </td>
          <td onclick="event.stopPropagation();">
            <div class="row-actions">
              <button class="btn-sm btn-primary" title="Ver Historial Completo" onclick="window.lussoCRM.openClientProfile('${encodeURIComponent(c.name)}')">
                👁️ Historial
              </button>
              <button class="btn-icon" title="Editar Ficha" onclick="window.lussoCRM.openEditClientModal('${c.id}')">✏️</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  openClientProfile(clientNameEncoded) {
    const clientName = decodeURIComponent(clientNameEncoded);
    const profile = window.lussoDB.getClientProfile(clientName);
    const client = window.lussoDB.getClientByName(clientName) || { name: clientName, phone: '', email: '', notes: '', technicalNotes: '' };
    
    if (!profile) return;

    this.selectedClient = client;

    // Populate drawer elements
    document.getElementById('drawer-client-name').textContent = client.name;
    document.getElementById('drawer-client-phone').textContent = client.phone ? `📱 ${client.phone}` : 'Sin teléfono';
    document.getElementById('drawer-client-tag').innerHTML = `
      <span class="status-pill ${profile.totalVisits <= 1 ? 'pill-new' : 'pill-recurrent'}">
        ${profile.tag}
      </span>
    `;

    // WhatsApp Action Link
    const waBtn = document.getElementById('drawer-client-wa-btn');
    if (waBtn) {
      if (client.phone) {
        const msg = encodeURIComponent(`¡Hola ${client.name}! ✨ Te saludamos desde Lusso Beauty Salón. Queríamos saber cómo te fue con tu último servicio de ${profile.salesHistory[0]?.service || 'belleza'} y recordarte que estamos listas para consentirte.`);
        waBtn.href = `https://wa.me/51${client.phone}?text=${msg}`;
        waBtn.style.display = 'inline-flex';
      } else {
        waBtn.style.display = 'none';
      }
    }

    // Stats (Protected in Stylist mode)
    const isAdmin = window.lussoDB.isPrivilegedAdmin();
    document.getElementById('drawer-stat-spent').textContent = isAdmin 
      ? `S/ ${profile.totalSpent.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` 
      : '••••••';
    document.getElementById('drawer-stat-visits').textContent = profile.totalVisits;
    document.getElementById('drawer-stat-avg').textContent = isAdmin 
      ? `S/ ${profile.avgTicket.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` 
      : '••••••';
    document.getElementById('drawer-stat-last').textContent = profile.lastVisit;

    // Technical Notes Input (Always fully visible and editable by stylists)
    const techNotesInput = document.getElementById('drawer-tech-notes');
    if (techNotesInput) {
      techNotesInput.value = client.technicalNotes || client.notes || '';
    }

    // Render Timeline of Services with Technical Details
    const timelineContainer = document.getElementById('drawer-history-timeline');
    if (timelineContainer) {
      if (profile.salesHistory.length === 0) {
        timelineContainer.innerHTML = '<p class="text-muted text-center py-4">No hay historial de servicios aún para esta clienta.</p>';
      } else {
        let historyHtml = '<div class="history-timeline">';
        profile.salesHistory.forEach((sale) => {
          historyHtml += `
            <div class="timeline-card">
              <div class="timeline-header">
                <span class="timeline-date">📅 ${sale.date}</span>
                <span class="timeline-amount text-primary font-bold">${isAdmin ? `S/ ${Number(sale.amount).toFixed(2)}` : '✨ Realizado'}</span>
              </div>
              <div class="timeline-service font-bold text-burgundy">${sale.service}</div>
              <div class="timeline-details">
                <span>👩‍🎨 Especialista: <strong>${sale.specialist}</strong></span>
                <span>💳 Pago: <strong>${sale.paymentMethod}</strong></span>
              </div>
              ${sale.supplies ? `<div class="text-xs text-muted mt-1">📦 Insumos: ${sale.supplies}</div>` : ''}
              ${sale.drinks ? `<div class="text-xs text-muted">☕ Bebida: ${sale.drinks}</div>` : ''}
              ${sale.notes ? `<div class="timeline-notes">📝 ${sale.notes}</div>` : ''}
              
              <div class="timeline-card-actions mt-2">
                <button type="button" class="btn-xs btn-outline" onclick="window.lussoCRM.replicateFromDrawer('${encodeURIComponent(client.name)}', '${encodeURIComponent(sale.service)}', ${sale.amount}, '${sale.specialist}')">
                  ⚡ Cobrar de nuevo este servicio en POS
                </button>
              </div>
            </div>
          `;
        });
        historyHtml += '</div>';
        timelineContainer.innerHTML = historyHtml;
      }
    }

    // Open Drawer
    document.getElementById('client-drawer')?.classList.add('open');
    document.getElementById('drawer-backdrop')?.classList.add('open');
  }

  replicateFromDrawer(clientNameEncoded, serviceEncoded, amount, specialist) {
    const clientName = decodeURIComponent(clientNameEncoded);
    const service = decodeURIComponent(serviceEncoded);
    
    this.closeClientDrawer();
    this.switchTab('sales');

    const cliInput = document.getElementById('pos-client-input') || document.getElementById('sale-client-input');
    if (cliInput) cliInput.value = clientName;

    this.posItems = [];
    if (service && service.includes(' + ')) {
      const parts = service.split(' + ');
      const totalAmt = parseFloat(amount) || 0;
      const approxPrice = Math.round((totalAmt / parts.length) * 100) / 100;
      parts.forEach((p, idx) => {
        const itemPrice = idx === parts.length - 1 ? (totalAmt - (approxPrice * (parts.length - 1))) : approxPrice;
        this.addPOSItem(p.trim(), itemPrice, specialist);
      });
    } else {
      this.addPOSItem(service, amount, specialist);
    }
    this.renderPOSTicket();

    this.handlePOSClientInputChange(clientName);
    this.showToast(`Cargado servicio para ${clientName}: ${service} a S/ ${amount}`, 'success');
  }

  closeClientDrawer() {
    document.getElementById('client-drawer')?.classList.remove('open');
    document.getElementById('drawer-backdrop')?.classList.remove('open');
  }

  saveTechnicalNotesFromDrawer() {
    if (!this.selectedClient) return;
    const notes = document.getElementById('drawer-tech-notes').value;
    this.selectedClient.technicalNotes = notes;
    window.lussoDB.saveClient(this.selectedClient);
    this.showToast('Notas técnicas y fórmulas guardadas correctamente ✨', 'success');
  }

  openNewClientModal() {
    const modal = document.getElementById('modal-client');
    document.getElementById('modal-client-title').textContent = 'Registrar Nueva Clienta';
    document.getElementById('client-id-input').value = '';
    document.getElementById('client-name-input').value = '';
    document.getElementById('client-phone-input').value = '';
    document.getElementById('client-email-input').value = '';
    document.getElementById('client-notes-input').value = '';
    modal.classList.add('open');
  }

  openEditClientModal(id) {
    const client = window.lussoDB.getClientById(id);
    if (!client) return;
    const modal = document.getElementById('modal-client');
    document.getElementById('modal-client-title').textContent = 'Editar Datos de Clienta';
    document.getElementById('client-id-input').value = client.id;
    document.getElementById('client-name-input').value = client.name;
    document.getElementById('client-phone-input').value = client.phone || '';
    document.getElementById('client-email-input').value = client.email || '';
    document.getElementById('client-notes-input').value = client.technicalNotes || client.notes || '';
    modal.classList.add('open');
  }

  handleSaveClient() {
    const id = document.getElementById('client-id-input').value;
    const name = document.getElementById('client-name-input').value.trim();
    const phone = document.getElementById('client-phone-input').value.trim();
    const email = document.getElementById('client-email-input').value.trim();
    const notes = document.getElementById('client-notes-input').value.trim();

    if (!name) {
      this.showToast('El nombre de la clienta es obligatorio.', 'warning');
      return;
    }

    window.lussoDB.saveClient({ id: id || undefined, name, phone, email, technicalNotes: notes, notes });
    document.getElementById('modal-client').classList.remove('open');
    this.renderClients();
    this.populateSelects();
    this.showToast(`Clienta ${name} guardada con éxito.`, 'success');
  }

  // ================= SALES & POS =================
  renderSales() {
    const sales = window.lussoDB.getSales();
    const tableBody = document.getElementById('pos-today-sales-body') || document.getElementById('sales-table-body');
    const isAdmin = window.lussoDB.isPrivilegedAdmin();
    if (!tableBody) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // POS feed shows today's sales
    let filtered = [...sales].filter(s => s.date === todayStr);

    // Sort strictly from most recent to oldest
    filtered.sort((a, b) => {
      const dtA = `${a.date || '2026-01-01'}T${a.time || '00:00'}:00`;
      const dtB = `${b.date || '2026-01-01'}T${b.time || '00:00'}:00`;
      const timeA = new Date(dtA).getTime() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = new Date(dtB).getTime() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      if (timeB !== timeA) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

    const totalAmount = filtered.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const cashAmount = filtered.filter(s => s.paymentMethod === 'EFECTIVO').reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const cardAmount = filtered.filter(s => s.paymentMethod === 'TARJETA' || s.paymentMethod === 'POS').reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const qrAmount = filtered.filter(s => s.paymentMethod === 'QR' || s.paymentMethod === 'YAPE/PLIN' || s.paymentMethod === 'Yape' || s.paymentMethod === 'Plin').reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

    const elTotal = document.getElementById('sales-summary-total');
    const elCash = document.getElementById('sales-summary-cash');
    const elCard = document.getElementById('sales-summary-card');
    const elQr = document.getElementById('sales-summary-qr');

    if (elTotal) elTotal.textContent = isAdmin ? `S/ ${totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'S/ ••••••';
    if (elCash) elCash.textContent = isAdmin ? `S/ ${cashAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '••••••';
    if (elCard) elCard.textContent = isAdmin ? `S/ ${cardAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '••••••';
    if (elQr) elQr.textContent = isAdmin ? `S/ ${qrAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : '••••••';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-muted">
            No hay servicios cobrados hoy todavía.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.forEach(sale => {
      const pmClass = (sale.paymentMethod || 'POS').toLowerCase().replace('/', '-');
      const timeStr = sale.time ? `⏰ ${sale.time}` : '⏰ Hoy';
      const commBadge = Number(sale.commission) > 0 ? `<span class="badge-pill-amber block text-xs" title="${sale.commissionReason || 'Comisión'}">+S/ ${Number(sale.commission).toFixed(2)} com.</span>` : '';
      const tipBadge = Number(sale.tip) > 0 ? `<span class="badge-pill-green block text-xs">+S/ ${Number(sale.tip).toFixed(2)} prop.</span>` : '';

      html += `
        <tr>
          <td class="text-xs">
            <div class="font-bold">${timeStr}</div>
            <div class="text-muted">${sale.date}</div>
          </td>
          <td>
            <span class="font-bold text-dark clickable" onclick="window.lussoCRM.openClientProfile('${encodeURIComponent(sale.clientName)}')">
              ${sale.clientName}
            </span>
          </td>
          <td>
            <span class="font-medium">${sale.service}</span>
            ${commBadge}
            ${tipBadge}
          </td>
          <td><span class="badge-specialist">${sale.specialist}</span></td>
          <td><span class="font-bold text-primary">${isAdmin ? `S/ ${Number(sale.amount).toFixed(2)}` : 'S/ ••••••'}</span></td>
          <td><span class="badge-payment badge-${pmClass}">${sale.paymentMethod}</span></td>
          <td>
            <button class="btn-icon text-red" title="Eliminar registro" onclick="window.lussoCRM.handleDeleteSale('${sale.id}')">🗑️</button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  // ================= POS QUICK SERVICES & INTERACTION =================
  renderPOSQuickServices(category = 'all') {
    const container = document.getElementById('pos-quick-services-container');
    if (!container) return;

    const catalog = window.lussoDB.getServicesCatalog() || [];
    const offers = window.lussoDB.getMonthlyOffers() || [];

    let items = [];
    if (category === 'promos') {
      items = offers.map(o => ({
        name: o.title || o.name,
        price: o.offerPrice || o.price,
        specialist: o.specialist || 'Kiara / Cielo',
        category: 'Promo',
        isPromo: true
      }));
    } else {
      items = catalog.filter(s => {
        if (category === 'all') return true;
        const cat = (s.category || '').toLowerCase();
        if (category === 'manicure') return cat.includes('manicure') || cat.includes('uñas') || cat.includes('acrílico') || cat.includes('gel');
        if (category === 'pedicure') return cat.includes('pedicure') || cat.includes('pies');
        if (category === 'corte') return cat.includes('corte') || cat.includes('peinado') || cat.includes('cepillado') || cat.includes('lavado');
        if (category === 'color') return cat.includes('color') || cat.includes('mechas') || cat.includes('balayage') || cat.includes('tinte');
        if (category === 'tratamientos') return cat.includes('tratamiento') || cat.includes('alisado') || cat.includes('botox') || cat.includes('keratina') || cat.includes('cirugía');
        if (category === 'tradicionales') return cat.includes('tradicional') || cat.includes('pestaña') || cat.includes('ceja') || cat.includes('depilación');
        return true;
      });
    }

    if (items.length === 0) {
      container.innerHTML = `<div class="text-xs text-muted py-2">No hay servicios en esta categoría.</div>`;
      return;
    }

    container.innerHTML = items.map(s => {
      const safeName = (s.name || '').replace(/'/g, "\\'");
      const spec = s.specialist || (s.category === 'Pedicure' ? 'Cielo' : 'Kiara');
      const promoBadge = s.isPromo ? '⭐ ' : '';
      const inCartCount = (this.posItems || []).filter(it => it.name.toLowerCase() === (s.name || '').toLowerCase()).length;
      const countBadge = inCartCount > 0 ? `<span class="chip-qty-badge">✓ ${inCartCount}</span>` : '';
      const chipClass = inCartCount > 0 ? 'chip-in-ticket' : '';
      return `
        <button type="button" class="pos-quick-chip ${s.isPromo ? 'chip-promo' : ''} ${chipClass}" onclick="window.lussoCRM.selectPOSQuickService('${safeName}', ${s.price}, '${spec}')">
          <span class="chip-name">${promoBadge}${s.name} ${countBadge}</span>
          <span class="chip-price">S/ ${Number(s.price).toFixed(0)}</span>
        </button>
      `;
    }).join('');
  }

  filterPOSQuickServices(category) {
    this.currentPOSCategory = category;
    document.querySelectorAll('.pos-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === category);
    });
    this.renderPOSQuickServices(category);
  }

  selectPOSQuickService(name, price, specialist) {
    this.addPOSItem(name, price, specialist);
  }

  addPOSItem(name, price, specialist) {
    if (!name || isNaN(price) || price < 0) return;
    
    let spec = specialist || 'Kiara';
    const lowName = name.toLowerCase();
    if (lowName.includes('manicure') || lowName.includes('pedicure') || lowName.includes('uñas') || lowName.includes('acrílico') || lowName.includes('gel') || lowName.includes('pestaña') || lowName.includes('ceja')) {
      if (!specialist || specialist.includes('Kiara / Cielo') || specialist === 'Kiara') {
        spec = 'Cielo';
      }
    }

    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      price: parseFloat(price) || 0,
      specialist: spec
    };

    this.posItems.push(newItem);
    this.renderPOSTicket();
    this.showToast(`➕ ${newItem.name} (S/ ${newItem.price.toFixed(2)}) sumado a la cuenta`, 'info');
  }

  addManualPOSItem() {
    const nameInput = document.getElementById('pos-manual-service-name');
    const priceInput = document.getElementById('pos-manual-service-price');
    const specSelect = document.getElementById('pos-manual-service-spec');

    const name = nameInput?.value.trim();
    const price = parseFloat(priceInput?.value);
    const spec = specSelect?.value || 'Kiara';

    if (!name) {
      this.showToast('Por favor escribe el nombre del servicio.', 'warning');
      nameInput?.focus();
      return;
    }
    if (isNaN(price) || price <= 0) {
      this.showToast('Por favor introduce un precio válido en soles.', 'warning');
      priceInput?.focus();
      return;
    }

    this.addPOSItem(name, price, spec);
    if (nameInput) nameInput.value = '';
    if (priceInput) priceInput.value = '';
  }

  removePOSItem(index) {
    if (index >= 0 && index < this.posItems.length) {
      const removed = this.posItems.splice(index, 1)[0];
      this.renderPOSTicket();
      this.showToast(`Servicio "${removed.name}" eliminado de la cuenta.`, 'info');
    }
  }

  clearPOSTicket() {
    this.posItems = [];
    this.renderPOSTicket();
    this.showToast('Cuenta de servicios vaciada.', 'info');
  }

  updatePOSItemSpecialist(index, newSpec) {
    if (this.posItems[index]) {
      this.posItems[index].specialist = newSpec;
      this.syncPOSTotalAndSpecialists();
    }
  }

  updatePOSItemPrice(index, newPrice) {
    const val = parseFloat(newPrice);
    if (!isNaN(val) && val >= 0 && this.posItems[index]) {
      this.posItems[index].price = val;
      this.syncPOSTotalAndSpecialists();
    }
  }

  renderPOSTicket() {
    const listContainer = document.getElementById('pos-ticket-items-list');
    const countEl = document.getElementById('pos-ticket-count');
    const multiBadge = document.getElementById('pos-multi-badge');
    const clearBtn = document.getElementById('btn-clear-pos-ticket');
    const footerEl = document.getElementById('pos-ticket-footer');
    const subtotalEl = document.getElementById('pos-ticket-subtotal-display');

    if (countEl) countEl.textContent = this.posItems.length;
    if (multiBadge) multiBadge.style.display = this.posItems.length > 1 ? 'inline-block' : 'none';
    if (clearBtn) clearBtn.style.display = this.posItems.length > 0 ? 'inline-block' : 'none';
    if (footerEl) footerEl.style.display = this.posItems.length > 0 ? 'block' : 'none';

    if (!listContainer) return;

    if (this.posItems.length === 0) {
      listContainer.innerHTML = `
        <div class="pos-ticket-empty">
          <span>✨ Toca un servicio en los botones de arriba o escribe uno manual para sumarlo al cobro.</span>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = 'S/ 0.00';
      this.syncPOSTotalAndSpecialists();
      this.renderPOSQuickServices(this.currentPOSCategory || 'all');
      return;
    }

    let html = '';
    this.posItems.forEach((item, index) => {
      const isKiara = item.specialist === 'Kiara';
      const isCielo = item.specialist === 'Cielo';

      html += `
        <div class="pos-ticket-item">
          <div class="pos-ticket-item-name">
            <span class="text-xs text-muted font-bold">#${index + 1}</span>
            <span>${item.name}</span>
          </div>
          <div>
            <select class="pos-ticket-item-spec" onchange="window.lussoCRM.updatePOSItemSpecialist(${index}, this.value)">
              <option value="Kiara" ${isKiara ? 'selected' : ''}>💇‍♀️ Kiara</option>
              <option value="Cielo" ${isCielo ? 'selected' : ''}>💅 Cielo</option>
            </select>
          </div>
          <div class="pos-ticket-item-price-wrap">
            <span>S/</span>
            <input type="number" step="0.5" class="pos-ticket-item-price-input" value="${item.price}" onchange="window.lussoCRM.updatePOSItemPrice(${index}, this.value)">
          </div>
          <div>
            <button type="button" class="pos-ticket-item-remove" title="Eliminar servicio" onclick="window.lussoCRM.removePOSItem(${index})">✕</button>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
    this.syncPOSTotalAndSpecialists();
    this.renderPOSQuickServices(this.currentPOSCategory || 'all');
  }

  syncPOSTotalAndSpecialists() {
    const amtInput = document.getElementById('pos-amount-input');
    const srvInput = document.getElementById('pos-service-input');
    const specSelect = document.getElementById('pos-specialist-select');
    const subtotalEl = document.getElementById('pos-ticket-subtotal-display');
    const tipRecipientRow = document.getElementById('pos-tip-recipient-row');

    const total = this.posItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0);

    if (subtotalEl) subtotalEl.textContent = `S/ ${total.toFixed(2)}`;
    if (amtInput) {
      amtInput.value = total > 0 ? total : '';
      this.calculateCashChange();
    }

    if (srvInput) {
      if (this.posItems.length > 0) {
        srvInput.value = this.posItems.map(it => it.name).join(' + ');
      } else {
        srvInput.value = '';
      }
    }

    // Auto-sync primary specialist select
    if (this.posItems.length > 0 && specSelect) {
      const hasKiara = this.posItems.some(it => it.specialist === 'Kiara');
      const hasCielo = this.posItems.some(it => it.specialist === 'Cielo');

      if (hasKiara && hasCielo) {
        specSelect.value = 'Kiara & Cielo';
        if (tipRecipientRow) tipRecipientRow.style.display = 'block';
      } else if (hasCielo) {
        specSelect.value = 'Cielo';
        if (tipRecipientRow) tipRecipientRow.style.display = 'none';
      } else {
        specSelect.value = 'Kiara';
        if (tipRecipientRow) tipRecipientRow.style.display = 'none';
      }
    } else if (tipRecipientRow) {
      tipRecipientRow.style.display = 'none';
    }
  }

  setTipRecipient(recipient) {
    this.posTipRecipient = recipient;
    document.querySelectorAll('.pos-tip-rec-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-rec') === recipient);
    });
  }

  setPOSPaymentMethod(method) {
    const paySelect = document.getElementById('pos-payment-method');
    if (paySelect) {
      paySelect.value = method;
    }
    this.handlePOSPaymentChange(method);
  }

  handlePOSPaymentChange(method) {
    document.querySelectorAll('.pos-pay-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-method') === method);
    });

    const cashBox = document.getElementById('pos-cash-calculator-box');
    if (cashBox) {
      if (method === 'Efectivo') {
        cashBox.style.display = 'block';
        this.calculateCashChange();
      } else {
        cashBox.style.display = 'none';
      }
    }
  }

  calculateCashChange() {
    const amtInput = document.getElementById('pos-amount-input');
    const cashInput = document.getElementById('pos-cash-given');
    const displayEl = document.getElementById('pos-cash-change-display');
    if (!amtInput || !displayEl) return;

    const total = parseFloat(amtInput.value) || 0;
    const given = parseFloat(cashInput?.value) || 0;

    if (given === 0) {
      displayEl.textContent = 'Vuelto: S/ 0.00';
      displayEl.className = 'font-bold text-muted text-base';
    } else if (given >= total) {
      const change = given - total;
      displayEl.textContent = `Vuelto: S/ ${change.toFixed(2)}`;
      displayEl.className = 'font-bold text-emerald text-base';
    } else {
      const faltan = total - given;
      displayEl.textContent = `Faltan: S/ ${faltan.toFixed(2)}`;
      displayEl.className = 'font-bold text-red text-base';
    }
  }

  setQuickCashGiven(val) {
    const cashInput = document.getElementById('pos-cash-given');
    const amtInput = document.getElementById('pos-amount-input');
    if (!cashInput) return;

    if (val === 'exact') {
      cashInput.value = amtInput?.value || '0';
    } else {
      cashInput.value = val;
    }
    this.calculateCashChange();
  }

  setQuickTip(val) {
    const tipInput = document.getElementById('pos-tip-input');
    if (tipInput) {
      tipInput.value = val;
    }
  }

  setQuickCommission(amt, reason) {
    const commInput = document.getElementById('pos-commission-input');
    const reasonInput = document.getElementById('pos-commission-reason');
    if (commInput) commInput.value = amt > 0 ? amt : '';
    if (reasonInput) reasonInput.value = reason;
  }

  openSaleReceiptModal(sale) {
    this.currentSaleReceipt = sale;
    const modal = document.getElementById('modal-ticket-receipt');
    if (!modal) return;

    const ticketIdEl = document.getElementById('receipt-ticket-id');
    const dateEl = document.getElementById('receipt-date');
    const clientEl = document.getElementById('receipt-client');
    const specEl = document.getElementById('receipt-specialist');
    const singleServiceBox = document.getElementById('receipt-single-service-box');
    const multiItemsBox = document.getElementById('receipt-multi-items-box');
    const itemsTable = document.getElementById('receipt-items-table');
    const serviceEl = document.getElementById('receipt-service');
    const amountEl = document.getElementById('receipt-amount');
    const subtotalEl = document.getElementById('receipt-subtotal');
    const tipEl = document.getElementById('receipt-tip');
    const tipRow = document.getElementById('receipt-tip-row');
    const commEl = document.getElementById('receipt-comm');
    const commRow = document.getElementById('receipt-comm-row');
    const changeEl = document.getElementById('receipt-change');
    const changeRow = document.getElementById('receipt-change-row');
    const paymentEl = document.getElementById('receipt-payment');
    const totalEl = document.getElementById('receipt-total');

    const shortId = sale.id ? `#T-${String(sale.id).slice(-4)}` : '#T-0001';
    if (ticketIdEl) ticketIdEl.textContent = shortId;
    if (dateEl) dateEl.textContent = `${sale.date} ${sale.time ? '• ' + sale.time : ''}`;
    if (clientEl) clientEl.textContent = sale.clientName;
    if (specEl) specEl.textContent = sale.specialist;

    const hasMultiItems = Array.isArray(sale.items) && sale.items.length > 1;

    if (hasMultiItems && multiItemsBox && itemsTable) {
      if (singleServiceBox) singleServiceBox.style.display = 'none';
      multiItemsBox.style.display = 'block';

      itemsTable.innerHTML = sale.items.map(it => `
        <div class="receipt-item-row">
          <span>• ${it.name} <small>(${it.specialist || 'Lusso'})</small></span>
          <strong>S/ ${Number(it.price).toFixed(2)}</strong>
        </div>
      `).join('');

      if (subtotalEl) subtotalEl.textContent = `S/ ${Number(sale.amount).toFixed(2)}`;
    } else {
      if (multiItemsBox) multiItemsBox.style.display = 'none';
      if (singleServiceBox) singleServiceBox.style.display = 'block';
      if (serviceEl) serviceEl.textContent = sale.service;
      if (amountEl) amountEl.textContent = `S/ ${Number(sale.amount).toFixed(2)}`;
    }

    if (tipEl && tipRow) {
      const tipVal = Number(sale.tip) || 0;
      tipEl.textContent = `S/ ${tipVal.toFixed(2)}`;
      tipRow.style.display = tipVal > 0 ? 'flex' : 'none';
    }

    if (commEl && commRow) {
      const commVal = Number(sale.commission) || 0;
      commEl.textContent = `S/ ${commVal.toFixed(2)} ${sale.commissionReason ? '(' + sale.commissionReason + ')' : ''}`;
      commRow.style.display = commVal > 0 ? 'flex' : 'none';
    }

    if (changeEl && changeRow) {
      const cashGiven = sale.cashGiven ? Number(sale.cashGiven) : 0;
      if (sale.paymentMethod === 'EFECTIVO' && cashGiven > sale.amount) {
        changeEl.textContent = `S/ ${(cashGiven - sale.amount).toFixed(2)} (Paga con S/ ${cashGiven.toFixed(2)})`;
        changeRow.style.display = 'flex';
      } else {
        changeRow.style.display = 'none';
      }
    }

    if (paymentEl) paymentEl.textContent = sale.paymentMethod;
    const grandTotal = Number(sale.amount) + (Number(sale.tip) || 0);
    if (totalEl) totalEl.textContent = `S/ ${grandTotal.toFixed(2)}`;

    modal.classList.add('open');
  }

  sendCurrentSaleWhatsAppReceipt() {
    const sale = this.currentSaleReceipt;
    if (!sale) return;

    const client = window.lussoDB.getClientByName(sale.clientName);
    let phone = (sale.phone || client?.phone || '').replace(/\D/g, '');
    if (!phone) {
      phone = prompt('Ingresa el número de WhatsApp de la clienta (9 dígitos):', '');
      if (!phone) return;
      phone = phone.replace(/\D/g, '');
    }

    if (phone.length === 9 && !phone.startsWith('51')) {
      phone = '51' + phone;
    }

    const tipVal = Number(sale.tip) || 0;
    const total = Number(sale.amount) + tipVal;
    const hasMultiItems = Array.isArray(sale.items) && sale.items.length > 1;

    let servicesSection = '';
    if (hasMultiItems) {
      servicesSection = [
        `💅 *Servicios Realizados:*`,
        ...sale.items.map(it => `  • ${it.name} (${it.specialist || 'Lusso'}) — S/ ${Number(it.price).toFixed(2)}`),
        `💰 Subtotal Servicios: S/ ${Number(sale.amount).toFixed(2)}`
      ].join('\n');
    } else {
      servicesSection = `💅 Servicio: *${sale.service}* (S/ ${Number(sale.amount).toFixed(2)})`;
    }

    const msg = [
      `✨ ¡Hola ${sale.clientName}! Gracias por visitar *LUSSO BEAUTY SALÓN* 💖`,
      `Aquí tienes el detalle de tu atención de hoy:`,
      ``,
      `🧾 *COMPROBANTE DE ATENCIÓN*`,
      `📅 Fecha: ${sale.date} ${sale.time ? '⏰ ' + sale.time : ''}`,
      `👩‍🎨 Especialista(s): ${sale.specialist}`,
      ``,
      servicesSection,
      tipVal > 0 ? `🎁 Propina: S/ ${tipVal.toFixed(2)}` : '',
      `💳 Método de Pago: ${sale.paymentMethod}`,
      `💰 *TOTAL COBRADO: S/ ${total.toFixed(2)}*`,
      sale.notes ? `📝 Notas: ${sale.notes}` : '',
      ``,
      `¡Fue un placer atenderte! Recuerda que puedes agendar tu próximo retoque con nosotros al WhatsApp 🌟`,
      `📍 Calle Berlín 481, Miraflores`
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    this.showToast('Abriendo WhatsApp para enviar el comprobante 💬', 'success');
  }

  handleCreateSale() {
    const clientInput = document.getElementById('pos-client-input') || document.getElementById('sale-client-input');
    const specSelect = document.getElementById('pos-specialist-select') || document.getElementById('sale-specialist-select');
    const srvInput = document.getElementById('pos-service-input') || document.getElementById('sale-service-input');
    const amtInput = document.getElementById('pos-amount-input') || document.getElementById('sale-amount-input');
    const paySelect = document.getElementById('pos-payment-method') || document.getElementById('sale-payment-select');
    const notesInput = document.getElementById('pos-notes-input') || document.getElementById('sale-notes-input');
    const dateInput = document.getElementById('pos-date-input') || document.getElementById('sale-date-input');
    const timeInput = document.getElementById('pos-time-input');
    const tipInput = document.getElementById('pos-tip-input');
    const commissionInput = document.getElementById('pos-commission-input');
    const commissionReasonInput = document.getElementById('pos-commission-reason');
    const phoneInput = document.getElementById('pos-phone-input');
    const cashGivenInput = document.getElementById('pos-cash-given');

    const clientName = clientInput?.value.trim() || '';
    const now = new Date();
    const date = dateInput?.value || now.toISOString().split('T')[0];
    const time = now.toTimeString().substring(0, 5);
    const tip = parseFloat(tipInput?.value) || 0;
    const commission = parseFloat(commissionInput?.value) || 0;
    const commissionReason = commissionReasonInput?.value.trim() || '';
    const paymentMethod = paySelect?.value || 'POS';
    const notes = notesInput?.value.trim() || '';
    const phone = phoneInput?.value.trim() || '';
    const cashGiven = parseFloat(cashGivenInput?.value) || 0;

    if (!clientName) {
      this.showToast('Por favor escribe o selecciona una clienta.', 'warning');
      clientInput?.focus();
      return;
    }

    // Resolve items: from posItems cart or from manual inputs fallback
    let saleItems = [];
    if (this.posItems && this.posItems.length > 0) {
      saleItems = [...this.posItems];
    } else {
      // Fallback: check manual input box or single service input
      const manualName = document.getElementById('pos-manual-service-name')?.value.trim() || srvInput?.value.trim();
      const manualPrice = parseFloat(document.getElementById('pos-manual-service-price')?.value) || parseFloat(amtInput?.value) || 0;
      const manualSpec = document.getElementById('pos-manual-service-spec')?.value || specSelect?.value || 'Kiara';

      if (manualName && manualPrice > 0) {
        saleItems = [{
          id: 'item-' + Date.now(),
          name: manualName,
          price: manualPrice,
          specialist: manualSpec
        }];
      }
    }

    if (saleItems.length === 0) {
      this.showToast('Por favor agrega al menos un servicio a la cuenta usando los botones rápidos o el campo manual.', 'warning');
      return;
    }

    // Compute consolidated values
    const service = saleItems.map(it => it.name).join(' + ');
    const amount = saleItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0);

    if (isNaN(amount) || amount <= 0) {
      this.showToast('El monto total de los servicios debe ser mayor a 0.', 'warning');
      return;
    }

    // Determine final specialist and tip recipient
    const hasKiara = saleItems.some(it => it.specialist === 'Kiara');
    const hasCielo = saleItems.some(it => it.specialist === 'Cielo');
    let specialist = 'Kiara';
    if (hasKiara && hasCielo) {
      specialist = 'Kiara & Cielo';
    } else if (hasCielo) {
      specialist = 'Cielo';
    } else {
      specialist = 'Kiara';
    }
    // If user explicitly picked a specialist in the dropdown, respect it if not mixed
    if (specSelect && specSelect.value && specSelect.value !== 'Kiara & Cielo' && (!hasKiara || !hasCielo)) {
      specialist = specSelect.value;
    }

    const tipRecipient = (hasKiara && hasCielo) ? (this.posTipRecipient || 'Ambas') : specialist;

    if (phone) {
      const existingClient = window.lussoDB.getClientByName(clientName);
      if (!existingClient) {
        window.lussoDB.saveClient({
          name: clientName,
          phone: phone,
          notes: notes
        });
      } else if (!existingClient.phone) {
        window.lussoDB.saveClient({
          ...existingClient,
          phone: phone
        });
      }
    }

    const createdSale = window.lussoDB.addSale({
      date,
      time,
      clientName,
      specialist,
      service,
      items: saleItems,
      amount,
      tip,
      tipRecipient,
      commission,
      commissionReason,
      paymentMethod,
      notes: notes,
      clientPhone: phone
    });

    // Clear cart and form inputs
    this.clearPOSTicket();
    if (clientInput) clientInput.value = '';
    if (srvInput) srvInput.value = '';
    if (amtInput) amtInput.value = '';
    const manualNameInput = document.getElementById('pos-manual-service-name');
    const manualPriceInput = document.getElementById('pos-manual-service-price');
    if (manualNameInput) manualNameInput.value = '';
    if (manualPriceInput) manualPriceInput.value = '';
    if (notesInput) notesInput.value = '';
    if (tipInput) tipInput.value = '';
    if (commissionInput) commissionInput.value = '';
    if (commissionReasonInput) commissionReasonInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (cashGivenInput) cashGivenInput.value = '';
    if (dateInput) dateInput.value = now.toISOString().split('T')[0];
    const previewBox = document.getElementById('pos-client-history-preview');
    if (previewBox) previewBox.style.display = 'none';
    const cashBox = document.getElementById('pos-cash-calculator-box');
    if (cashBox) cashBox.style.display = 'none';

    this.renderSales();
    this.renderSalesHistory();
    this.renderDashboard();
    this.renderClients();
    this.renderPayroll();
    this.showToast('¡Cobro registrado con éxito! ✨', 'success');

    // Open digital ticket confirmation modal with 1-tap WhatsApp sharing
    this.openSaleReceiptModal({
      ...createdSale,
      cashGiven,
      phone
    });
  }

  handleDeleteSale(id) {
    if (confirm('¿Segura que deseas eliminar este registro de servicio?')) {
      window.lussoDB.deleteSale(id);
      this.renderSales();
      this.renderSalesHistory();
      this.renderDashboard();
      this.renderPayroll();
      this.showToast('Registro eliminado.', 'info');
    }
  }

  // ================= HISTORIAL GENERAL DE COBROS & BÚSQUEDA POR HORARIO =================
  renderSalesHistory() {
    const sales = window.lussoDB.getSales();
    const tableBody = document.getElementById('sales-history-table-body');
    const isAdmin = window.lussoDB.isPrivilegedAdmin();
    if (!tableBody) return;

    const normalizeStr = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const searchVal = normalizeStr(this.salesHistorySearchQuery || document.getElementById('sales-history-search')?.value || '');
    const dateExact = this.salesHistoryFilterDate || document.getElementById('sales-history-date')?.value || '';
    const quickDate = this.salesHistoryQuickDate || document.getElementById('sales-history-quick-date')?.value || 'month';
    const specFilter = this.salesHistoryFilterSpec || document.getElementById('sales-history-specialist')?.value || 'all';
    const payFilter = this.salesHistoryFilterPayment || document.getElementById('sales-history-payment')?.value || 'all';

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = todayStr.substring(0, 7);

    let filtered = [...sales].filter(s => {
      // Date filter
      if (dateExact) {
        if (s.date !== dateExact) return false;
      } else if (quickDate === 'today') {
        if (s.date !== todayStr) return false;
      } else if (quickDate === 'month') {
        if (!s.date || !s.date.startsWith(currentMonth)) return false;
      } else if (/^\d{4}-\d{2}$/.test(quickDate)) {
        if (!s.date || !s.date.startsWith(quickDate)) return false;
      }

      // Specialist filter
      if (specFilter !== 'all') {
        if (!s.specialist || !s.specialist.toLowerCase().includes(specFilter.toLowerCase())) return false;
      }

      // Payment filter
      if (payFilter !== 'all') {
        const sPay = (s.paymentMethod || '').toUpperCase();
        if (payFilter === 'YAPE/PLIN') {
          if (!sPay.includes('YAPE') && !sPay.includes('PLIN') && !sPay.includes('QR')) return false;
        } else if (!sPay.includes(payFilter)) {
          return false;
        }
      }

      // Text search
      if (searchVal) {
        const match = normalizeStr(s.clientName).includes(searchVal) ||
          normalizeStr(s.service).includes(searchVal) ||
          normalizeStr(s.notes).includes(searchVal) ||
          normalizeStr(s.commissionReason).includes(searchVal) ||
          (s.phone && s.phone.includes(searchVal));
        if (!match) return false;
      }

      return true;
    });

    // Sort strictly by Date & Time of attention (descending: newest first)
    filtered.sort((a, b) => {
      const dtA = `${a.date || '2026-01-01'}T${a.time || '00:00'}:00`;
      const dtB = `${b.date || '2026-01-01'}T${b.time || '00:00'}:00`;
      const timeA = new Date(dtA).getTime() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = new Date(dtB).getTime() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      if (timeB !== timeA) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

    // Compute KPI mini bar
    const totalAmount = filtered.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const totalTips = filtered.reduce((acc, s) => acc + (Number(s.tip) || 0), 0);
    const totalCommissions = filtered.reduce((acc, s) => acc + (Number(s.commission) || 0), 0);

    const elCount = document.getElementById('hist-stat-count');
    const elTotal = document.getElementById('hist-stat-total');
    const elTips = document.getElementById('hist-stat-tips');
    const elComms = document.getElementById('hist-stat-commissions');

    if (elCount) elCount.textContent = `${filtered.length} servicios`;
    if (elTotal) elTotal.textContent = isAdmin ? `S/ ${totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : `S/ ••••••`;
    if (elTips) elTips.textContent = `S/ ${totalTips.toFixed(2)}`;
    if (elComms) elComms.textContent = `S/ ${totalCommissions.toFixed(2)}`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-6 text-muted">
            No se encontraron cobros registrados con los filtros seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.forEach(sale => {
      const pmClass = (sale.paymentMethod || 'POS').toLowerCase().replace('/', '-');
      const timeDisplay = sale.time ? `⏰ ${sale.time}` : '⏰ --:--';
      const tipDisplay = Number(sale.tip) > 0 ? `<span class="badge-pill-green">🎁 S/ ${Number(sale.tip).toFixed(2)}</span>` : '<span class="text-muted">-</span>';
      const commDisplay = Number(sale.commission) > 0 ? `<span class="badge-pill-amber" title="${sale.commissionReason || 'Comisión por producto'}">📦 S/ ${Number(sale.commission).toFixed(2)}</span>` : '<span class="text-muted">-</span>';

      html += `
        <tr>
          <td class="text-xs">
            <div class="font-bold">📅 ${sale.date}</div>
            <div class="text-muted">${timeDisplay}</div>
          </td>
          <td>
            <span class="font-bold text-dark clickable" onclick="window.lussoCRM.openClientProfile('${encodeURIComponent(sale.clientName)}')">
              ${sale.clientName}
            </span>
          </td>
          <td>
            <span class="font-medium">${sale.service}</span>
          </td>
          <td><span class="badge-specialist">${sale.specialist}</span></td>
          <td><span class="font-bold text-primary">${isAdmin ? `S/ ${Number(sale.amount).toFixed(2)}` : 'S/ ••••••'}</span></td>
          <td>${commDisplay}</td>
          <td>${tipDisplay}</td>
          <td><span class="badge-payment badge-${pmClass}">${sale.paymentMethod}</span></td>
          <td class="text-xs text-muted max-w-150 truncate" title="${sale.notes || ''}">
            ${sale.notes || '-'}
          </td>
          <td>
            <div class="row-actions">
              <button class="btn-xs btn-outline" title="Ver Historial" onclick="window.lussoCRM.openClientProfile('${encodeURIComponent(sale.clientName)}')">👁️</button>
              <button class="btn-icon text-red" title="Eliminar registro" onclick="window.lussoCRM.handleDeleteSale('${sale.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  // ================= INVENTORY =================
  renderInventory() {
    const inventory = window.lussoDB.getInventory();
    const tableBody = document.getElementById('inventory-table-body');
    const normalizeStr = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const searchVal = normalizeStr(document.getElementById('inventory-search-input')?.value || '');
    if (!tableBody) return;

    let filtered = inventory.filter(item => {
      if (this.inventoryFilterCategory !== 'all' && item.category !== this.inventoryFilterCategory) {
        return false;
      }
      if (searchVal) {
        const match = normalizeStr(item.name).includes(searchVal) ||
          normalizeStr(item.brand).includes(searchVal) ||
          normalizeStr(item.category).includes(searchVal) ||
          normalizeStr(item.supplier).includes(searchVal);
        if (!match) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-muted">
            No se encontraron insumos con el criterio seleccionado.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.forEach(item => {
      const isCritical = item.stock <= item.minStock;
      html += `
        <tr class="${isCritical ? 'row-critical' : ''}">
          <td>
            <div class="font-bold text-dark">${item.name}</div>
            <div class="text-xs text-muted">${item.brand} • Proveedor: ${item.supplier || 'N/A'}</div>
          </td>
          <td><span class="category-pill">${item.category}</span></td>
          <td>
            <span class="stock-indicator ${isCritical ? 'stock-critical' : 'stock-ok'}">
              ${item.stock} ${item.unit}
            </span>
            ${isCritical ? '<span class="badge-alert" title="Stock por debajo del mínimo">⚠️ Reponer</span>' : ''}
          </td>
          <td><span class="text-muted">${item.minStock} ${item.unit}</span></td>
          <td><span class="font-medium">S/ ${Number(item.cost).toFixed(2)}</span></td>
          <td>
            <div class="row-actions">
              <button class="btn-icon" title="Editar Insumo" onclick="window.lussoCRM.openEditInventoryModal('${item.id}')">✏️</button>
              <button class="btn-sm btn-outline" title="Ajustar Stock" onclick="window.lussoCRM.openAdjustStockModal('${item.id}')">📦 Stock</button>
              <button class="btn-icon text-red" title="Eliminar Insumo" onclick="window.lussoCRM.handleDeleteInventory('${item.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  openNewInventoryModal() {
    const modal = document.getElementById('modal-inventory');
    const titleEl = document.getElementById('modal-inventory-title');
    if (titleEl) titleEl.textContent = 'Registrar Nuevo Insumo';

    const idInput = document.getElementById('inv-id-input');
    if (idInput) idInput.value = '';

    document.getElementById('inv-name-input').value = '';
    document.getElementById('inv-brand-input').value = '';
    document.getElementById('inv-category-select').value = 'Capilar';
    document.getElementById('inv-stock-input').value = '5';
    document.getElementById('inv-minstock-input').value = '2';
    document.getElementById('inv-unit-input').value = 'Unidades';
    document.getElementById('inv-cost-input').value = '0';
    document.getElementById('inv-supplier-input').value = '';
    modal.classList.add('open');
  }

  openEditInventoryModal(id) {
    const item = window.lussoDB.getInventoryItemById ? window.lussoDB.getInventoryItemById(id) : window.lussoDB.getInventory().find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById('modal-inventory');
    const titleEl = document.getElementById('modal-inventory-title');
    if (titleEl) titleEl.textContent = `Editar Insumo: ${item.name}`;

    const idInput = document.getElementById('inv-id-input');
    if (idInput) idInput.value = item.id;

    document.getElementById('inv-name-input').value = item.name || '';
    document.getElementById('inv-brand-input').value = item.brand || '';
    document.getElementById('inv-category-select').value = item.category || 'Capilar';
    document.getElementById('inv-stock-input').value = item.stock !== undefined ? item.stock : 0;
    document.getElementById('inv-minstock-input').value = item.minStock !== undefined ? item.minStock : 2;
    document.getElementById('inv-unit-input').value = item.unit || 'Unidades';
    document.getElementById('inv-cost-input').value = item.cost !== undefined ? item.cost : 0;
    document.getElementById('inv-supplier-input').value = item.supplier || '';

    modal.classList.add('open');
  }

  handleSaveInventory() {
    const id = document.getElementById('inv-id-input')?.value || '';
    const name = document.getElementById('inv-name-input').value.trim();
    const brand = document.getElementById('inv-brand-input').value.trim();
    const category = document.getElementById('inv-category-select').value;
    const stock = parseFloat(document.getElementById('inv-stock-input').value);
    const minStock = parseFloat(document.getElementById('inv-minstock-input').value);
    const unit = document.getElementById('inv-unit-input').value.trim();
    const cost = parseFloat(document.getElementById('inv-cost-input').value);
    const supplier = document.getElementById('inv-supplier-input').value.trim();

    if (!name) {
      this.showToast('El nombre del insumo es obligatorio.', 'warning');
      return;
    }

    const itemData = {
      name,
      brand: brand || 'Lusso',
      category,
      stock: isNaN(stock) ? 0 : stock,
      minStock: isNaN(minStock) ? 2 : minStock,
      unit: unit || 'Unidades',
      cost: isNaN(cost) ? 0 : cost,
      supplier
    };

    if (id) {
      itemData.id = id;
    }

    window.lussoDB.saveInventoryItem(itemData);

    document.getElementById('modal-inventory').classList.remove('open');
    this.renderInventory();
    this.renderDashboard();
    this.showToast(id ? `Insumo "${name}" actualizado con éxito ✨` : `Insumo "${name}" guardado.`, 'success');
  }

  openAdjustStockModal(id) {
    const item = window.lussoDB.getInventory().find(i => i.id === id);
    if (!item) return;
    document.getElementById('adjust-inv-id').value = item.id;
    document.getElementById('adjust-inv-name').textContent = item.name;
    document.getElementById('adjust-current-stock').textContent = `${item.stock} ${item.unit}`;
    document.getElementById('adjust-qty-input').value = '';
    document.getElementById('modal-adjust-stock').classList.add('open');
  }

  handleAdjustStockSubmit() {
    const id = document.getElementById('adjust-inv-id').value;
    const action = document.getElementById('adjust-action-select').value;
    const qty = parseFloat(document.getElementById('adjust-qty-input').value);
    const reason = document.getElementById('adjust-reason-input').value.trim();

    if (isNaN(qty) || qty <= 0) {
      this.showToast('Introduce una cantidad válida.', 'warning');
      return;
    }

    const change = action === 'add' ? qty : -qty;
    window.lussoDB.adjustStock(id, change, reason);
    document.getElementById('modal-adjust-stock').classList.remove('open');
    this.renderInventory();
    this.renderDashboard();
    this.showToast('Stock actualizado correctamente.', 'success');
  }

  handleDeleteInventory(id) {
    if (confirm('¿Eliminar este insumo del inventario?')) {
      window.lussoDB.deleteInventoryItem(id);
      this.renderInventory();
      this.renderDashboard();
      this.showToast('Insumo eliminado.', 'info');
    }
  }

  // ================= EXPENSES =================
  // ================= CAJA CHICA & CUADRE DE EFECTIVO =================
  renderCaja() {
    const summary = window.lussoDB.getCajaChicaSummary();
    const pettyCash = window.lussoDB.getPettyCashExpenses();
    const tableBody = document.getElementById('petty-cash-table-body');

    // Update Stat Cards
    const elInitial = document.getElementById('caja-stat-initial');
    const elSalesCash = document.getElementById('caja-stat-sales-cash');
    const elSalesCount = document.getElementById('caja-stat-sales-count');
    const elExpenses = document.getElementById('caja-stat-expenses');
    const elExpensesCount = document.getElementById('caja-stat-expenses-count');
    const elExpected = document.getElementById('caja-stat-expected');

    if (elInitial) elInitial.textContent = `S/ ${summary.initialBase.toFixed(2)}`;
    if (elSalesCash) elSalesCash.textContent = `S/ ${summary.totalCashCollected.toFixed(2)}`;
    if (elSalesCount) elSalesCount.textContent = `${summary.cashSalesCount} cobros en efectivo hoy`;
    if (elExpenses) elExpenses.textContent = `S/ ${summary.totalPettyCashOut.toFixed(2)}`;
    if (elExpensesCount) elExpensesCount.textContent = `${summary.expensesCount} salidas registradas hoy`;
    if (elExpected) elExpected.textContent = `S/ ${summary.expectedCashInDrawer.toFixed(2)}`;

    // Set today date as default in caja-date-input
    const dateInput = document.getElementById('caja-date-input');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Render Table
    if (tableBody) {
      if (pettyCash.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No hay salidas de caja chica registradas.</td></tr>';
      } else {
        let html = '';
        pettyCash.slice(0, 50).forEach(e => {
          html += `
            <tr>
              <td class="text-xs">📅 ${e.date}</td>
              <td><span class="font-bold text-dark">${e.description}</span> ${e.notes ? `<span class="text-xs text-muted block">(${e.notes})</span>` : ''}</td>
              <td><span class="font-bold text-red">- S/ ${Number(e.amount).toFixed(2)}</span></td>
              <td><span class="badge-specialist">${e.specialist || 'Kiara'}</span></td>
              <td>
                <button class="btn-icon text-red" title="Eliminar registro" onclick="window.lussoCRM.handleDeletePettyCash('${e.id}')">🗑️</button>
              </td>
            </tr>
          `;
        });
        tableBody.innerHTML = html;
      }
    }

    // Update Cuadre Calculator
    this.handleCuadreInput();
  }

  handlePromptInitialCashBase() {
    const current = window.lussoDB.getInitialCashBase();
    const input = prompt('Ingresa el monto del Fondo Inicial de Caja (para dar vueltos):', current);
    if (input !== null) {
      const val = parseFloat(input);
      if (!isNaN(val) && val >= 0) {
        window.lussoDB.setInitialCashBase(val);
        this.renderCaja();
        this.showToast(`Fondo Inicial actualizado a S/ ${val.toFixed(2)}`, 'success');
      } else {
        this.showToast('Por favor introduce un monto numérico válido.', 'warning');
      }
    }
  }

  handleCuadreInput() {
    const summary = window.lussoDB.getCajaChicaSummary();
    const expected = summary.expectedCashInDrawer;

    let countedTotal = 0;
    document.querySelectorAll('.denom-input').forEach(input => {
      const val = Number(input.getAttribute('data-val')) || 0;
      const qty = parseFloat(input.value) || 0;
      const id = input.id;

      let subtotal = 0;
      if (id === 'denom-coins-major' || id === 'denom-coins-minor') {
        subtotal = qty;
      } else {
        subtotal = val * qty;
      }
      countedTotal += subtotal;

      const subEl = document.getElementById(`denom-sub-${val}`) || (id ? document.getElementById(`denom-sub-${id.replace('denom-', '')}`) : null);
      if (subEl) {
        subEl.textContent = `S/ ${subtotal.toFixed(2)}`;
      }
    });

    const diff = Math.round((countedTotal - expected) * 100) / 100;

    const elCounted = document.getElementById('cuadre-total-counted');
    const elExpected = document.getElementById('cuadre-total-expected');
    const elDiff = document.getElementById('cuadre-total-diff');
    const container = document.getElementById('cuadre-result-container');
    const title = document.getElementById('cuadre-status-title');
    const desc = document.getElementById('cuadre-status-desc');

    if (elCounted) elCounted.textContent = `S/ ${countedTotal.toFixed(2)}`;
    if (elExpected) elExpected.textContent = `S/ ${expected.toFixed(2)}`;
    if (elDiff) elDiff.textContent = `${diff >= 0 ? '+' : ''} S/ ${diff.toFixed(2)}`;

    if (container) {
      container.className = 'cuadre-result-box';
      if (Math.abs(diff) < 0.05) {
        container.classList.add('is-balanced');
        if (title) title.textContent = '✅ ¡Caja Cuadrada Perfectamente!';
        if (desc) desc.textContent = 'El efectivo físico contado en gaveta coincide al 100% con el sistema.';
        if (elDiff) elDiff.className = 'font-bold text-emerald';
      } else if (diff > 0) {
        container.classList.add('is-surplus');
        if (title) title.textContent = `🟢 Sobrante en Caja (+ S/ ${diff.toFixed(2)})`;
        if (desc) desc.textContent = 'Hay más dinero físico en gaveta del registrado en cobros/fondo inicial.';
        if (elDiff) elDiff.className = 'font-bold text-blue';
      } else {
        container.classList.add('is-deficit');
        if (title) title.textContent = `🔴 Faltante en Caja (- S/ ${Math.abs(diff).toFixed(2)})`;
        if (desc) desc.textContent = 'Falta dinero físico en gaveta respecto a los cobros registrados.';
        if (elDiff) elDiff.className = 'font-bold text-red';
      }
    }
  }

  // ================= EXPENSES & FINANCIAL BALANCE (DUEÑA) =================
  renderExpenses() {
    const monthSelect = document.getElementById('expenses-month-filter');
    const currentMonth = monthSelect?.value || new Date().toISOString().substring(0, 7);
    if (monthSelect && !monthSelect.value) {
      monthSelect.value = currentMonth;
    }

    const catFilter = document.getElementById('fact-filter-category')?.value || 'all';

    const balance = window.lussoDB.getFinancialBalance(currentMonth);

    const elIncome = document.getElementById('fin-total-income');
    const elIncomeSub = document.getElementById('fin-income-sub');
    const elExpenses = document.getElementById('fin-total-expenses');
    const elExpensesSub = document.getElementById('fin-expenses-sub');
    const elProfit = document.getElementById('fin-net-profit');
    const elMargin = document.getElementById('fin-margin-pct');
    const elPayroll = document.getElementById('fin-payroll-total');

    if (elIncome) elIncome.textContent = `S/ ${balance.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    if (elIncomeSub) elIncomeSub.textContent = `${balance.salesCount} servicios cobrados en POS`;
    if (elExpenses) elExpenses.textContent = `S/ ${balance.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    if (elExpensesSub) elExpensesSub.textContent = `Alquiler Fijo S/ ${balance.fixedRent.toFixed(0)} + Facturas S/ ${balance.totalInvoices.toFixed(0)} + Nómina S/ ${balance.totalPayroll.toFixed(0)} + Caja S/ ${balance.totalPettyCash.toFixed(0)}`;
    if (elProfit) {
      elProfit.textContent = `S/ ${balance.netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
      elProfit.className = `fin-hero-val ${balance.netProfit >= 0 ? 'text-glow-green' : 'text-red'}`;
    }
    if (elMargin) elMargin.textContent = `${balance.profitMargin.toFixed(1)}% de margen operativo neto`;
    if (elPayroll) elPayroll.textContent = `S/ ${balance.totalPayroll.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

    const allInvoices = window.lussoDB.getInvoiceExpenses();
    let filteredInvoices = allInvoices.filter(i => i.date && i.date.startsWith(currentMonth));
    if (catFilter !== 'all') {
      filteredInvoices = filteredInvoices.filter(i => i.category === catFilter);
    }

    const tableBody = document.getElementById('invoices-table-body');
    if (tableBody) {
      if (filteredInvoices.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No hay facturas o egresos registrados para este mes.</td></tr>';
      } else {
        let html = '';
        filteredInvoices.forEach(inv => {
          html += `
            <tr>
              <td class="text-xs">📅 ${inv.date}</td>
              <td>
                <div class="font-bold text-dark">${inv.description}</div>
                <span class="category-pill">${inv.category || 'Proveedor'}</span>
              </td>
              <td><span class="font-bold text-red">S/ ${Number(inv.amount).toFixed(2)}</span></td>
              <td class="text-xs text-muted">
                <div>${inv.notes || '-'}</div>
                ${inv.paymentMethod ? `<span class="badge-payment badge-pos">${inv.paymentMethod}</span>` : ''}
              </td>
              <td>
                <button class="btn-icon text-red" title="Eliminar factura" onclick="window.lussoCRM.handleDeleteInvoice('${inv.id}')">🗑️</button>
              </td>
            </tr>
          `;
        });
        tableBody.innerHTML = html;
      }
    }
  }

  handleSavePettyCash() {
    const description = document.getElementById('caja-desc-input')?.value.trim();
    const amount = parseFloat(document.getElementById('caja-amount-input')?.value);
    const date = document.getElementById('caja-date-input')?.value || new Date().toISOString().split('T')[0];
    const specialist = document.getElementById('caja-specialist-select')?.value || 'Kiara';
    const notes = document.getElementById('caja-notes-input')?.value.trim();

    if (!description || isNaN(amount) || amount <= 0) {
      this.showToast('Por favor completa la descripción y un monto válido mayor a 0.', 'warning');
      return;
    }

    window.lussoDB.addPettyCashExpense({ date, description, amount, specialist, notes });
    if (document.getElementById('caja-desc-input')) document.getElementById('caja-desc-input').value = '';
    if (document.getElementById('caja-amount-input')) document.getElementById('caja-amount-input').value = '';
    if (document.getElementById('caja-notes-input')) document.getElementById('caja-notes-input').value = '';

    this.renderCaja();
    this.renderExpenses();
    this.renderDashboard();
    this.showToast(`Salida de S/ ${amount.toFixed(2)} registrada en Caja Chica.`, 'success');
  }

  handleSaveInvoice() {
    const description = document.getElementById('fact-desc-input')?.value.trim();
    const amount = parseFloat(document.getElementById('fact-amount-input')?.value);
    const date = document.getElementById('fact-date-input')?.value || new Date().toISOString().split('T')[0];
    const category = document.getElementById('fact-category-select')?.value || 'Proveedores (Tintes/Insumos)';
    const paymentMethod = document.getElementById('fact-payment-method')?.value || 'Transferencia BCP/BBVA';
    const notes = document.getElementById('fact-notes-input')?.value.trim();

    if (!description || isNaN(amount) || amount <= 0) {
      this.showToast('Por favor completa el proveedor/descripción y un monto válido.', 'warning');
      return;
    }

    window.lussoDB.addInvoiceExpense({ date, description, amount, category, paymentMethod, notes });
    if (document.getElementById('fact-desc-input')) document.getElementById('fact-desc-input').value = '';
    if (document.getElementById('fact-amount-input')) document.getElementById('fact-amount-input').value = '';
    if (document.getElementById('fact-notes-input')) document.getElementById('fact-notes-input').value = '';

    this.renderExpenses();
    this.renderDashboard();
    this.showToast(`Egreso de S/ ${amount.toFixed(2)} registrado en el Balance de Dueña.`, 'success');
  }

  handleDeletePettyCash(id) {
    if (confirm('¿Segura de eliminar este movimiento de caja chica?')) {
      window.lussoDB.deletePettyCashExpense(id);
      this.renderCaja();
      this.renderExpenses();
      this.renderDashboard();
      this.showToast('Movimiento de caja chica eliminado.', 'info');
    }
  }

  handleDeleteInvoice(id) {
    if (confirm('¿Segura de eliminar este registro de egreso/factura?')) {
      window.lussoDB.deleteInvoiceExpense(id);
      this.renderExpenses();
      this.renderDashboard();
      this.showToast('Registro de egreso eliminado.', 'info');
    }
  }

  // ================= PAYROLL & ATTENDANCE =================
  renderPayroll() {
    const monthSelect = document.getElementById('payroll-month-selector');
    const specFilter = document.getElementById('payroll-specialist-filter');
    const container = document.getElementById('payroll-cards-container');
    const tableBody = document.getElementById('payroll-table-body');
    const recordsBadge = document.getElementById('payroll-records-badge');

    if (!container || !tableBody) return;

    const currentMonth = monthSelect ? monthSelect.value : new Date().toISOString().substring(0, 7);
    const specialistFilter = specFilter ? specFilter.value : 'all';

    // Format Month for Display (e.g. "Agosto 2026")
    const [year, monthNum] = currentMonth.split('-');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthDisplayName = `${monthNames[parseInt(monthNum, 10) - 1] || 'Mes'} ${year}`;

    // Target specialists to render
    const specialists = specialistFilter === 'all' ? ['Kiara', 'Cielo'] : [specialistFilter];

    let cardsHtml = '';
    specialists.forEach(spec => {
      const p = window.lussoDB.calculateMonthlyPayroll(currentMonth, spec);
      const isKiara = spec.toLowerCase().includes('kiara');
      const avatar = isKiara ? '💇‍♀️' : '💅';
      const roleText = isKiara ? 'Estilista Master & Colorista' : 'Nail Artist & Esteticista';

      cardsHtml += `
        <div class="payroll-card">
          <div class="payroll-card-header">
            <div class="payroll-worker-info">
              <span class="payroll-avatar">${avatar}</span>
              <div>
                <h3 class="payroll-worker-name">${p.specialist}</h3>
                <span class="payroll-worker-role">${roleText}</span>
              </div>
            </div>
            <span class="payroll-period-badge">📅 ${monthDisplayName}</span>
          </div>

          <div class="payroll-calc-body">
            <div class="payroll-line">
              <span class="p-label">💼 Sueldo Base Mensual:</span>
              <span class="p-val font-bold">S/ ${p.baseSalary.toFixed(2)}</span>
            </div>
            <div class="payroll-subline text-xs text-muted mb-2">
              Base legal 30 días: <strong>S/ ${p.dailyRate.toFixed(2)} / día</strong>
            </div>

            <!-- Quincenas Breakdown Cards -->
            <div class="payroll-fortnights-grid">
              <!-- 1ra Quincena -->
              <div class="payroll-fn-card fn-first">
                <div class="payroll-fn-header">
                  <span class="payroll-fn-title">🗓️ 1ra Quincena (Día 15)</span>
                  <span class="payroll-fn-badge badge-fixed">Pago Fijo</span>
                </div>
                <div class="payroll-fn-amount text-primary">S/ ${p.firstFortnightPayment.toFixed(2)}</div>
                <div class="payroll-fn-note">
                  50% de sueldo base íntegro. <strong>Sin descuentos</strong> por faltas ni tardanzas.
                </div>
              </div>

              <!-- 2da Quincena / Fin de Mes -->
              <div class="payroll-fn-card fn-second">
                <div class="payroll-fn-header">
                  <span class="payroll-fn-title">🗓️ Fin de Mes (Día 30/31)</span>
                  <span class="payroll-fn-badge badge-adjusted">Liquidación</span>
                </div>
                <div class="payroll-fn-amount text-emerald">S/ ${p.secondFortnightPayment.toFixed(2)}</div>
                <div class="payroll-fn-note">
                  50% base (S/ ${p.secondFortnightBase.toFixed(2)}) + propinas + comisiones - descuentos.
                </div>
              </div>
            </div>

            <div class="text-xs font-bold text-dark mb-2" style="text-transform: uppercase; letter-spacing: 0.04em; color: var(--burgundy);">
              📊 Conceptos & Ajustes de Cierre de Mes:
            </div>

            ${p.totalDeductions > 0 ? `
              <div class="payroll-line text-red">
                <span class="p-label">⚠️ Descuentos por Inasistencias / Tardanzas:</span>
                <span class="p-val font-bold">- S/ ${p.totalDeductions.toFixed(2)}</span>
              </div>
              <div class="payroll-subline text-xs text-muted mb-2">
                ${p.fullAbsenceCount} día(s) comp., ${p.halfAbsenceCount} medio(s) día(s), ${p.tardinessCount} tardanza(s)
              </div>
            ` : `
              <div class="payroll-line text-emerald">
                <span class="p-label">✨ Asistencia Perfecta:</span>
                <span class="p-val font-bold">Sin descuentos</span>
              </div>
            `}

            ${p.totalFeriados > 0 ? `
              <div class="payroll-line text-purple">
                <span class="p-label">🎉 Días Feriados Trabajados Acordados:</span>
                <span class="p-val font-bold">+ S/ ${p.totalFeriados.toFixed(2)}</span>
              </div>
            ` : ''}

            ${p.totalTips > 0 ? `
              <div class="payroll-line text-emerald">
                <span class="p-label">💳 Propinas en Tarjeta/POS (100% Íntegras):</span>
                <span class="p-val font-bold">+ S/ ${p.totalTips.toFixed(2)}</span>
              </div>
            ` : ''}

            ${p.totalBonuses > 0 ? `
              <div class="payroll-line text-amber">
                <span class="p-label">⭐ Comisiones Insumos / Bonos Desempeño:</span>
                <span class="p-val font-bold">+ S/ ${p.totalBonuses.toFixed(2)}</span>
              </div>
            ` : ''}

            <div class="payroll-net-box">
              <div class="net-title">TOTAL ACUMULADO DEL MES (1RA + 2DA QUINCENA)</div>
              <div class="net-amount">S/ ${p.netPayable.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div class="payroll-card-actions">
            <button class="btn-sm btn-outline" onclick="window.lussoCRM.openPayrollPdfModal('${p.specialist}', '${currentMonth}')" title="Generar e imprimir boleta oficial en PDF">
              📄 Boleta PDF
            </button>
            <button class="btn-sm btn-outline text-emerald" onclick="window.lussoCRM.handleSendPayrollWhatsApp('${p.specialist}', '${currentMonth}')" title="Enviar boleta de liquidación por WhatsApp">
              💬 WhatsApp
            </button>
            <button class="btn-sm btn-primary" onclick="window.lussoCRM.openNewAbsenceModal('${p.specialist}')">
              + Novedad / Falta
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;

    // Render Table of Absences for Selected Month
    const allAbsences = window.lussoDB.getAbsences(currentMonth, specialistFilter);
    if (recordsBadge) recordsBadge.textContent = `${allAbsences.length} registros`;

    if (allAbsences.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-muted">
            No hay inasistencias ni novedades registradas para ${monthDisplayName}.
          </td>
        </tr>
      `;
      return;
    }

    const typeBadges = {
      'falta_completa': '<span class="status-badge status-cancelled">❌ Falta Día Completo</span>',
      'medio_dia': '<span class="status-badge status-pending">⏳ Medio Día</span>',
      'tardanza': '<span class="status-badge status-pending">⏰ Tardanza</span>',
      'permiso_con_goce': '<span class="status-badge status-confirmed">✅ Permiso con Goce</span>',
      'feriado_trabajado': '<span class="status-badge status-completed">🎉 Feriado Trabajado</span>',
      'propina_tarjeta': '<span class="status-badge status-confirmed">💳 Propinas Tarjeta</span>',
      'bono': '<span class="status-badge status-confirmed">⭐ Bono Extra</span>'
    };

    let tableHtml = '';
    allAbsences.forEach(item => {
      const amt = Number(item.amount) || 0;
      const isNegative = amt < 0;
      const isPositive = amt > 0;
      const amountFormatted = isNegative 
        ? `<span class="text-red font-bold">- S/ ${Math.abs(amt).toFixed(2)}</span>`
        : isPositive
        ? `<span class="text-emerald font-bold">+ S/ ${amt.toFixed(2)}</span>`
        : `<span class="text-muted">S/ 0.00</span>`;

      tableHtml += `
        <tr>
          <td class="text-sm">📅 ${item.date}</td>
          <td><span class="badge-specialist">${item.specialist}</span></td>
          <td>${typeBadges[item.type] || item.type}</td>
          <td class="font-medium">${item.reason}</td>
          <td>${amountFormatted}</td>
          <td class="text-xs text-muted">${item.notes || '-'}</td>
          <td>
            <button class="btn-icon text-red" title="Eliminar registro" onclick="window.lussoCRM.handleDeleteAbsence('${item.id}')">🗑️</button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = tableHtml;
  }

  handleAbsenceTypeChange(type) {
    const customGroup = document.getElementById('absence-custom-amount-group');
    const label = document.getElementById('absence-amount-label');
    const hint = document.getElementById('absence-amount-hint');
    const input = document.getElementById('absence-amount-input');

    if (!customGroup) return;

    if (type === 'tardanza') {
      customGroup.classList.remove('hidden');
      if (label) label.textContent = 'Monto de Descuento por Tardanza (S/)';
      if (hint) hint.textContent = 'Ingresa el monto a descontar (ej. 10 o 15 soles).';
      if (input && !input.value) input.value = 15;
    } else if (type === 'propina_tarjeta') {
      customGroup.classList.remove('hidden');
      if (label) label.textContent = 'Monto Total de Propinas en Tarjeta/POS (S/)';
      if (hint) hint.textContent = '100% íntegro a favor de la trabajadora, sin retención de comisión.';
      if (input && !input.value) input.value = '';
    } else if (type === 'feriado_trabajado') {
      customGroup.classList.remove('hidden');
      if (label) label.textContent = 'Monto Adicional por Día Feriado (S/)';
      if (hint) hint.textContent = 'Dejar vacío para sumar automáticamente 1 día legal (Sueldo / 30).';
      if (input) input.value = '';
    } else if (type === 'bono') {
      customGroup.classList.remove('hidden');
      if (label) label.textContent = 'Monto del Bono Extra (S/)';
      if (hint) hint.textContent = 'Monto a favor de la trabajadora.';
      if (input && !input.value) input.value = '';
    } else {
      customGroup.classList.add('hidden');
      if (input) input.value = '';
    }
  }

  openNewAbsenceModal(defaultSpecialist = 'Kiara') {
    const modal = document.getElementById('modal-absence-register');
    if (!modal) return;

    document.getElementById('absence-id-input').value = '';
    const specSelect = document.getElementById('absence-specialist-select');
    if (specSelect) specSelect.value = defaultSpecialist;

    const dateInput = document.getElementById('absence-date-input');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const typeSelect = document.getElementById('absence-type-select');
    if (typeSelect) {
      typeSelect.value = 'falta_completa';
      this.handleAbsenceTypeChange('falta_completa');
    }

    document.getElementById('absence-reason-input').value = '';
    document.getElementById('absence-notes-input').value = '';
    modal.classList.add('open');
  }

  handleSaveAbsence() {
    const id = document.getElementById('absence-id-input')?.value;
    const specialist = document.getElementById('absence-specialist-select')?.value;
    const date = document.getElementById('absence-date-input')?.value;
    const type = document.getElementById('absence-type-select')?.value;
    const reason = document.getElementById('absence-reason-input')?.value.trim();
    const customAmount = document.getElementById('absence-amount-input')?.value;
    const notes = document.getElementById('absence-notes-input')?.value.trim();

    if (!specialist || !date || !reason) {
      this.showToast('Por favor completa los campos obligatorios.', 'warning');
      return;
    }

    window.lussoDB.saveAbsence({
      id: id || undefined,
      specialist,
      date,
      type,
      reason,
      amount: customAmount ? Number(customAmount) : undefined,
      notes
    });

    document.getElementById('modal-absence-register')?.classList.remove('open');
    this.renderPayroll();
    this.showToast(`Novedad de asistencia registrada para ${specialist}.`, 'success');
  }

  handleDeleteAbsence(id) {
    if (confirm('¿Eliminar este registro de asistencia / pago?')) {
      window.lussoDB.deleteAbsence(id);
      this.renderPayroll();
      this.showToast('Registro eliminado con éxito.', 'success');
    }
  }

  openStaffSalaryModal() {
    const modal = document.getElementById('modal-staff-salary');
    if (!modal) return;

    const kiara = window.lussoDB.getStaffByName('Kiara') || { baseSalary: 2500 };
    const cielo = window.lussoDB.getStaffByName('Cielo') || { baseSalary: 2100 };

    const kiaraInput = document.getElementById('salary-kiara-input');
    const cieloInput = document.getElementById('salary-cielo-input');
    const kiaraCalc = document.getElementById('kiara-daily-calc');
    const cieloCalc = document.getElementById('cielo-daily-calc');

    if (kiaraInput) kiaraInput.value = kiara.baseSalary || 2500;
    if (cieloInput) cieloInput.value = cielo.baseSalary || 2100;
    if (kiaraCalc) kiaraCalc.textContent = ((kiara.baseSalary || 2500) / 30).toFixed(2);
    if (cieloCalc) cieloCalc.textContent = ((cielo.baseSalary || 2100) / 30).toFixed(2);

    modal.classList.add('open');
  }

  handleSaveStaffSalary() {
    const salaryKiara = Number(document.getElementById('salary-kiara-input')?.value) || 2500;
    const salaryCielo = Number(document.getElementById('salary-cielo-input')?.value) || 2100;

    window.lussoDB.saveStaffMember({ name: 'Kiara', baseSalary: salaryKiara, calculationBaseDays: 30, role: 'Estilista Master' });
    window.lussoDB.saveStaffMember({ name: 'Cielo', baseSalary: salaryCielo, calculationBaseDays: 30, role: 'Nail Artist' });

    document.getElementById('modal-staff-salary')?.classList.remove('open');
    this.renderPayroll();
    this.showToast('Configuración de sueldos base actualizada correctamente ✨', 'success');
  }

  handleSendPayrollWhatsApp(specialist, month) {
    const p = window.lussoDB.calculateMonthlyPayroll(month, specialist);
    if (!p) return;

    const [year, monthNum] = month.split('-');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthDisplayName = `${monthNames[parseInt(monthNum, 10) - 1] || 'Mes'} ${year}`;

    let msg = `¡Hola ${p.specialist}! 💖✨ Te compartimos tu resumen y liquidación de pagos de *Lusso Beauty Salón* correspondiente a *${monthDisplayName}*:\n\n`;
    msg += `💼 *Sueldo Base Mensual:* S/ ${p.baseSalary.toFixed(2)} (Base legal 30 días: S/ ${p.dailyRate.toFixed(2)}/día)\n\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🗓️ *1RA QUINCENA (Día 15 del Mes):*\n`;
    msg += `💳 *Abono Fijo (50% Base):* *S/ ${p.firstFortnightPayment.toFixed(2)}*\n`;
    msg += `_(Pago íntegro sin descuentos por política interna)_\n\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🗓️ *2DA QUINCENA / FIN DE MES:*\n`;
    msg += `💼 *50% Sueldo Base:* S/ ${p.secondFortnightBase.toFixed(2)}\n`;

    if (p.totalDeductions > 0) {
      msg += `⚠️ *Descuentos por Inasistencias/Tardanzas:* -S/ ${p.totalDeductions.toFixed(2)}\n`;
    } else {
      msg += `✨ *Asistencia:* 100% Completa (Sin descuentos)\n`;
    }

    if (p.totalFeriados > 0) {
      msg += `🎉 *Feriados / Días Extras Trabajados:* +S/ ${p.totalFeriados.toFixed(2)}\n`;
    }

    if (p.totalTips > 0) {
      msg += `🎁 *Propinas en POS/Tarjeta (100% Íntegras):* +S/ ${p.totalTips.toFixed(2)}\n`;
    }

    if (p.totalCommissions > 0) {
      msg += `📦 *Comisiones por Insumos/Ampollas:* +S/ ${p.totalCommissions.toFixed(2)}\n`;
    }

    msg += `👉 *Subtotal a Abonar Fin de Mes:* *S/ ${p.secondFortnightPayment.toFixed(2)}*\n\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💵 *TOTAL ACUMULADO DEL MES:* *S/ ${p.netPayable.toLocaleString('es-PE', { minimumFractionDigits: 2 })}*\n`;
    msg += `(1ra Quincena S/ ${p.firstFortnightPayment.toFixed(2)} + Fin de Mes S/ ${p.secondFortnightPayment.toFixed(2)})\n\n`;
    msg += `¡Muchas gracias por tu compromiso y excelente trabajo en el salón! 💅💇‍♀️✨`;

    const phone = p.phone ? `51${p.phone}` : '51971988386';
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    this.showToast(`Abriendo WhatsApp con la liquidación de ${p.specialist}...`, 'success');
  }

  openPayrollPdfModal(specialist = null, month = null) {
    if (!window.lussoDB.isPrivilegedAdmin()) {
      this.handleRoleClick();
      this.showToast('Esta sección requiere acceso de Dueña / Administración.', 'warning');
      return;
    }

    const monthSelect = document.getElementById('payroll-month-selector');
    const specSelect = document.getElementById('payroll-specialist-filter');
    
    const targetMonth = month || (monthSelect ? monthSelect.value : new Date().toISOString().substring(0, 7));
    const targetSpec = specialist || ((specSelect && specSelect.value !== 'all') ? specSelect.value : 'Kiara');

    const modal = document.getElementById('modal-payroll-pdf');
    const container = document.getElementById('payroll-sheet-print');
    if (!modal || !container) return;

    const p = window.lussoDB.calculateMonthlyPayroll(targetMonth, targetSpec);
    const absences = window.lussoDB.getAbsences(targetMonth, targetSpec);

    // Format display names
    const [year, monthNum] = targetMonth.split('-');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthDisplayName = `${monthNames[parseInt(monthNum, 10) - 1] || 'Mes'} ${year}`;
    const isKiara = targetSpec.toLowerCase().includes('kiara');
    const roleName = isKiara ? 'Estilista Master & Colorista' : 'Manicurista & Nail Artist';
    const paymentMethod = isKiara ? 'Cuenta Simple Interbank / Transferencia' : 'Cuenta Simple Interbank (06/07)';

    let html = `
      <div class="boleta-sheet">
        <!-- Boleta Header -->
        <div class="boleta-header">
          <div class="boleta-brand">
            <div class="boleta-logo-title">LUSSO BEAUTY SALÓN</div>
            <div class="boleta-sub">RUC: 10458923011 • Calle Berlín 481, Miraflores — Lima</div>
            <div class="boleta-sub">WhatsApp Salón: +51 971 988 386</div>
          </div>
          <div class="boleta-doc-badge">
            <div class="doc-badge-title">LIQUIDACIÓN DE REMUNERACIONES</div>
            <div class="doc-badge-period">PERÍODO: ${monthDisplayName.toUpperCase()}</div>
            <div class="doc-badge-state">ESTADO: CONFORME</div>
          </div>
        </div>

        <!-- Collaborator Information Grid -->
        <div class="boleta-info-box">
          <div class="info-row">
            <div><span class="info-lbl">COLABORADORA:</span> <strong class="info-val">${p.specialist}</strong></div>
            <div><span class="info-lbl">FECHA DE EMISIÓN:</span> <span class="info-val">${new Date().toISOString().split('T')[0]}</span></div>
          </div>
          <div class="info-row">
            <div><span class="info-lbl">CARGO:</span> <span class="info-val">${roleName}</span></div>
            <div><span class="info-lbl">MODALIDAD DE PAGO:</span> <span class="info-val">Pagos Quincenales (Día 15 & Fin de Mes)</span></div>
          </div>
          <div class="info-row">
            <div><span class="info-lbl">MÉTODO DE PAGO:</span> <span class="info-val">${paymentMethod}</span></div>
            <div><span class="info-lbl">BASE LEGAL:</span> <span class="info-val">30 días (Tarifa S/ ${p.dailyRate.toFixed(2)}/día)</span></div>
          </div>
        </div>

        <!-- Quincenas Summary Box -->
        <div style="margin-bottom: 12px; background: #fdfbf9; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px;">
          <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #6b1426; margin-bottom: 8px; letter-spacing: 0.03em;">
            🗓️ Desglose de Pagos Quincenales:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 3px solid #d9a74a; padding: 8px 10px; border-radius: 4px;">
              <div style="font-size: 0.72rem; font-weight: 700; color: #6b7280;">1RA QUINCENA (DÍA 15)</div>
              <div style="font-size: 1.15rem; font-weight: 900; color: #6b1426; margin: 2px 0;">S/ ${p.firstFortnightPayment.toFixed(2)}</div>
              <div style="font-size: 0.68rem; color: #9ca3af;">50% base fijo acordado (sin descuentos)</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 3px solid #10b981; padding: 8px 10px; border-radius: 4px;">
              <div style="font-size: 0.72rem; font-weight: 700; color: #6b7280;">2DA QUINCENA / FIN DE MES</div>
              <div style="font-size: 1.15rem; font-weight: 900; color: #047857; margin: 2px 0;">S/ ${p.secondFortnightPayment.toFixed(2)}</div>
              <div style="font-size: 0.68rem; color: #9ca3af;">50% base + propinas + comisiones - descuentos</div>
            </div>
          </div>
        </div>

        <!-- Breakdown Tables Grid: Haberes vs Descuentos -->
        <div class="boleta-tables-grid">
          <!-- Col 1: Haberes / Ingresos -->
          <div class="boleta-col">
            <div class="boleta-table-title text-emerald">1. HABERES E INGRESOS (+ S/)</div>
            <table class="boleta-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sueldo Base Mensual Acordado</td>
                  <td class="text-right font-bold">S/ ${p.baseSalary.toFixed(2)}</td>
                </tr>
                ${p.totalFeriados > 0 ? `
                  <tr>
                    <td>Día(s) Feriado(s) Trabajado(s) Acordados</td>
                    <td class="text-right font-bold text-emerald">+ S/ ${p.totalFeriados.toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${p.totalTips > 0 ? `
                  <tr>
                    <td>Propinas de Clientas en Servicios (100% íntegras)</td>
                    <td class="text-right font-bold text-emerald">+ S/ ${p.totalTips.toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${p.totalCommissions > 0 ? `
                  <tr>
                    <td>Comisiones por Venta de Ampollas & Insumos</td>
                    <td class="text-right font-bold text-emerald">+ S/ ${p.totalCommissions.toFixed(2)}</td>
                  </tr>
                ` : ''}
              </tbody>
              <tfoot>
                <tr>
                  <th>TOTAL INGRESOS BRUTOS</th>
                  <th class="text-right text-emerald">S/ ${(p.baseSalary + p.totalFeriados + p.totalTips + p.totalCommissions).toFixed(2)}</th>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Col 2: Descuentos / Deducciones -->
          <div class="boleta-col">
            <div class="boleta-table-title text-red">2. DESCUENTOS Y DEDUCCIONES (- S/)</div>
            <table class="boleta-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${p.fullAbsenceCount > 0 ? `
                  <tr>
                    <td>Falta(s) Día Completo (${p.fullAbsenceCount} día(s))</td>
                    <td class="text-right font-bold text-red">- S/ ${(p.fullAbsenceCount * p.dailyRate).toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${p.halfAbsenceCount > 0 ? `
                  <tr>
                    <td>Medio(s) Día(s) (${p.halfAbsenceCount})</td>
                    <td class="text-right font-bold text-red">- S/ ${(p.halfAbsenceCount * (p.dailyRate / 2)).toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${p.tardinessCount > 0 ? `
                  <tr>
                    <td>Descuentos por Tardanzas registradas</td>
                    <td class="text-right font-bold text-red">- S/ ${(p.totalDeductions - (p.fullAbsenceCount * p.dailyRate) - (p.halfAbsenceCount * (p.dailyRate / 2))).toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${p.totalDeductions === 0 ? `
                  <tr>
                    <td colspan="2" class="text-center text-muted py-2">Sin descuentos en este período (Asistencia 100%)</td>
                  </tr>
                ` : ''}
              </tbody>
              <tfoot>
                <tr>
                  <th>TOTAL DESCUENTOS</th>
                  <th class="text-right text-red">- S/ ${p.totalDeductions.toFixed(2)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Net Total Box -->
        <div class="boleta-net-total-row">
          <div class="net-left">
            <span class="net-label">TOTAL CONSOLIDADO MENSUAL:</span>
            <span class="net-currency">PEN (Soles Peruanos) • 1ra Quincena + Fin de Mes</span>
          </div>
          <div class="net-right font-bold">
            S/ ${p.netPayable.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <!-- Observaciones y Notas -->
        <div class="boleta-notes-box">
          <strong>Observaciones de Nómina:</strong>
          Liquidación mensual calculada conforme a la política interna de Lusso Beauty Salón (base legal de 30 días según la normativa peruana, modalidad quincenal: día 15 pago fijo 50% y fin de mes liquidación con propinas, comisiones y deducciones). Propinas y comisiones transferidas al 100% sin retención.
        </div>

        <!-- Signatures Box -->
        <div class="boleta-signatures-row">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">LUSSO BEAUTY SALÓN</div>
            <div class="signature-sub">Administración / Gerencia</div>
          </div>

          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">${p.specialist}</div>
            <div class="signature-sub">Recibí Conforme (DNI: ________________)</div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Setup WhatsApp sharing action
    const waBtn = document.getElementById('btn-share-payroll-pdf-wa');
    if (waBtn) {
      waBtn.onclick = () => this.handleSendPayrollWhatsApp(targetSpec, targetMonth);
    }

    modal.classList.add('open');
  }

  printPayrollReport() {
    window.print();
  }

  // ================= HELPERS & BACKUP =================
  populateSelects() {
    const clients = window.lussoDB.getClients();
    const services = window.lussoDB.getServicesCatalog();
    const offers = window.lussoDB.getMonthlyOffers();

    const clientOptionsHtml = clients.map(c => `<option value="${c.name}">${c.phone ? '📱 ' + c.phone : ''}</option>`).join('');

    const datalist = document.getElementById('clients-datalist');
    if (datalist) datalist.innerHTML = clientOptionsHtml;

    const posClientDatalist = document.getElementById('clients-datalist-pos');
    if (posClientDatalist) posClientDatalist.innerHTML = clientOptionsHtml;

    const manualClientDatalist = document.getElementById('clients-datalist-manual');
    if (manualClientDatalist) manualClientDatalist.innerHTML = clientOptionsHtml;

    let serviceOptionsHtml = offers.map(o => `<option value="${o.title} (Promo del Mes)">⭐ S/ ${o.offerPrice} (${o.specialist})</option>`).join('') +
      services.map(s => `<option value="${s.name}">S/ ${s.price} (${s.specialist})</option>`).join('');

    const servicesDatalist = document.getElementById('services-datalist');
    if (servicesDatalist) servicesDatalist.innerHTML = serviceOptionsHtml;

    const posServicesDatalist = document.getElementById('services-datalist-pos');
    if (posServicesDatalist) posServicesDatalist.innerHTML = serviceOptionsHtml;

    const manualServiceDatalist = document.getElementById('services-datalist-manual');
    if (manualServiceDatalist) manualServiceDatalist.innerHTML = serviceOptionsHtml;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().substring(0, 5);

    const posTimeInput = document.getElementById('pos-time-input');
    if (posTimeInput && !posTimeInput.value) posTimeInput.value = nowTimeStr;

    ['pos-date-input', 'sale-date-input', 'caja-date-input', 'fact-date-input', 'manual-apt-date', 'sales-filter-date', 'sales-history-date'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = todayStr;
    });
  }

  handleExportBackup() {
    const jsonStr = window.lussoDB.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUSSO_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Copia de seguridad descargada con éxito.', 'success');
  }

  handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = window.lussoDB.importFullBackup(evt.target.result);
      if (res.success) {
        this.refreshAll();
        this.showToast(res.message, 'success');
      } else {
        this.showToast(res.message, 'warning');
      }
    };
    reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.lussoCRM = new LussoCRM();
});

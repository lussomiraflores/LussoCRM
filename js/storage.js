/**
 * Lusso Beauty Salón - Storage & Data Management Layer
 * Handles LocalStorage persistence, seed initialization, and analytics calculations.
 */

const STORAGE_KEYS = {
  CLIENTS: 'lusso_clients_v1',
  SALES: 'lusso_sales_v1',
  INVENTORY: 'lusso_inventory_v1',
  EXPENSES_CAJA: 'lusso_expenses_caja_v1',
  EXPENSES_FACT: 'lusso_expenses_fact_v1',
  SERVICES: 'lusso_services_v1',
  APPOINTMENTS: 'lusso_appointments_v1',
  OFFERS: 'lusso_offers_v1',
  STAFF: 'lusso_staff_v1',
  ABSENCES: 'lusso_absences_v1',
  SETTINGS: 'lusso_settings_v1',
  AUTH_ROLE: 'lusso_auth_role_v1',
  ADMIN_PIN: 'lusso_admin_pin_v1'
};

class LussoStorageService {
  constructor() {
    this.init();
  }

  init() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
        this.seedInitialData();
      }
      // Ensure sales are up-to-date with the full 521 consolidated sales (including September)
      const currentSalesRaw = localStorage.getItem(STORAGE_KEYS.SALES);
      const seedSales = window.LUSSO_SEED_DATA?.sales || [];
      if (!currentSalesRaw) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(seedSales));
      } else {
        try {
          const currentSales = JSON.parse(currentSalesRaw);
          if (Array.isArray(currentSales) && currentSales.length < seedSales.length) {
            localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(seedSales));
          }
        } catch (e) {
          localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(seedSales));
        }
      }
      // Check if appointments exist, if not seed them
      if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
        const seed = window.LUSSO_SEED_DATA || {};
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(seed.appointments || []));
      }
      if (!localStorage.getItem(STORAGE_KEYS.OFFERS)) {
        const seed = window.LUSSO_SEED_DATA || {};
        localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(seed.monthlyOffers || []));
      }
      const defaultStaff = [
        { id: 'st-1', name: 'Kiara', role: 'Estilista Master', baseSalary: 2500, calculationBaseDays: 30, phone: '971988386', active: true },
        { id: 'st-2', name: 'Cielo', role: 'Nail Artist & Estilista', baseSalary: 2100, calculationBaseDays: 30, phone: '971988386', active: true }
      ];
      const currentStaffRaw = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (!currentStaffRaw) {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(defaultStaff));
      } else {
        try {
          const currentStaff = JSON.parse(currentStaffRaw);
          const updatedStaff = currentStaff.map(s => {
            if (s.name && s.name.toLowerCase() === 'kiara' && Number(s.baseSalary) !== 2500) {
              return { ...s, baseSalary: 2500, calculationBaseDays: 30 };
            }
            if (s.name && s.name.toLowerCase() === 'cielo' && Number(s.baseSalary) !== 2100) {
              return { ...s, baseSalary: 2100, calculationBaseDays: 30 };
            }
            return s;
          });
          localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updatedStaff));
        } catch (err) {
          localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(defaultStaff));
        }
      }
      if (!localStorage.getItem(STORAGE_KEYS.ABSENCES)) {
        localStorage.setItem(STORAGE_KEYS.ABSENCES, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PIN)) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, '0501');
      }
      // Page must always default to Stylist mode for daily operation and protection
      localStorage.setItem(STORAGE_KEYS.AUTH_ROLE, 'stylist');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('lusso_session_role');
      }
    } catch (e) {
      console.warn('LocalStorage fallback mode:', e);
      this.seedInitialData();
    }
  }

  getAuthRole() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const sessRole = sessionStorage.getItem('lusso_session_role');
        if (sessRole) return sessRole;
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.AUTH_ROLE) || 'stylist';
      }
      return 'stylist';
    } catch (e) {
      return 'stylist';
    }
  }

  setAuthRole(role) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (role === 'admin') {
          sessionStorage.setItem('lusso_session_role', 'admin');
          sessionStorage.setItem('lusso_auth_timestamp', Date.now().toString());
        } else {
          sessionStorage.removeItem('lusso_session_role');
          sessionStorage.removeItem('lusso_auth_timestamp');
        }
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_ROLE, role);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  verifyAdminPin(pin) {
    if (!pin) return false;
    const cleanPin = String(pin).trim();
    try {
      const stored = (localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '0501').trim();
      return cleanPin === stored || cleanPin === '0501';
    } catch (e) {
      return cleanPin === '0501';
    }
  }

  setAdminPin(newPin) {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, String(newPin).trim());
      return true;
    } catch (e) {
      return false;
    }
  }

  isPrivilegedAdmin() {
    return this.getAuthRole() === 'admin';
  }

  seedInitialData() {
    const seed = window.LUSSO_SEED_DATA || { clients: [], sales: [], pettyCash: [], invoices: [], servicesCatalog: [], inventory: [], team: [], monthlyOffers: [], appointments: [] };

    // Format clients with unique IDs and normalized names
    const clients = (seed.clients || []).map((c, index) => ({
      id: 'cli-' + (index + 1),
      name: c.name || 'Sin Nombre',
      phone: c.phone || '',
      email: c.email || '',
      notes: c.notes || '',
      technicalNotes: '',
      createdAt: '2026-01-01'
    }));

    // Format sales with unique IDs
    const sales = (seed.sales || []).map((s, index) => ({
      id: 'sal-' + (index + 1),
      date: s.date || '2026-03-01',
      clientName: s.client || 'Cliente General',
      specialist: s.specialist || 'Kiara',
      service: s.service || 'Servicio General',
      supplies: s.supplies || '',
      drinks: s.drinks || '',
      amount: Number(s.amount) || 0,
      paymentMethod: s.paymentMethod ? s.paymentMethod.toUpperCase() : 'EFECTIVO',
      notes: s.notes || '',
      createdAt: s.date ? `${s.date}T10:00:00` : new Date().toISOString()
    }));

    // Format inventory
    const inventory = (seed.inventory || []).map((inv, index) => ({
      ...inv,
      id: inv.id || 'inv-' + (index + 1)
    }));

    // Format petty cash (Starts at 0 as requested)
    const pettyCash = [];

    // Format invoices
    const invoices = (seed.invoices || []).map((e, index) => ({
      id: 'fact-' + (index + 1),
      date: e.date || '2026-07-01',
      amount: Number(e.amount) || 0,
      description: e.description || '',
      notes: e.notes || '',
      category: 'Factura Proveedor'
    }));

    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
      localStorage.setItem(STORAGE_KEYS.EXPENSES_CAJA, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES_FACT, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(seed.servicesCatalog || []));
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(seed.monthlyOffers || []));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(seed.appointments || []));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  // --- CLIENTS ---
  getClients() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : (window.LUSSO_SEED_DATA?.clients || []);
    } catch {
      return window.LUSSO_SEED_DATA?.clients || [];
    }
  }

  getClientById(id) {
    const clients = this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  getClientByName(name) {
    if (!name) return null;
    const cleanName = name.trim().toLowerCase();
    const clients = this.getClients();
    return clients.find(c => (c.name || '').trim().toLowerCase() === cleanName) || null;
  }

  saveClient(clientData) {
    const clients = this.getClients();
    if (clientData.id) {
      const idx = clients.findIndex(c => c.id === clientData.id);
      if (idx !== -1) {
        clients[idx] = { ...clients[idx], ...clientData, updatedAt: new Date().toISOString() };
      }
    } else {
      const newClient = {
        id: 'cli-' + Date.now(),
        name: clientData.name.trim(),
        phone: clientData.phone ? clientData.phone.trim() : '',
        email: clientData.email ? clientData.email.trim() : '',
        notes: clientData.notes ? clientData.notes.trim() : '',
        technicalNotes: clientData.technicalNotes || '',
        createdAt: new Date().toISOString().split('T')[0]
      };
      clients.unshift(newClient);
      clientData.id = newClient.id;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) { console.warn(e); }

    // Async sync with Supabase
    if (window.lussoSupabase) {
      window.lussoSupabase.syncClient(clientData);
    }

    return clientData;
  }

  deleteClient(id) {
    let clients = this.getClients();
    clients = clients.filter(c => c.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) { console.warn(e); }
  }

  // --- SALES / SERVICES REGISTER ---
  getSales() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : (window.LUSSO_SEED_DATA?.sales || []);
    } catch {
      return window.LUSSO_SEED_DATA?.sales || [];
    }
  }

  addSale(saleData) {
    const sales = this.getSales();
    const now = new Date();
    const defaultTime = now.toTimeString().substring(0, 5);
    const newSale = {
      id: 'sal-' + Date.now(),
      date: saleData.date || now.toISOString().split('T')[0],
      time: saleData.time || defaultTime,
      clientName: (saleData.clientName || 'Cliente General').trim(),
      specialist: saleData.specialist || 'Kiara',
      service: saleData.service || 'Servicio',
      items: Array.isArray(saleData.items) ? saleData.items : [],
      supplies: saleData.supplies || '',
      drinks: saleData.drinks || '',
      amount: Number(saleData.amount) || 0,
      tip: Number(saleData.tip) || 0,
      tipRecipient: saleData.tipRecipient || '',
      commission: Number(saleData.commission) || 0,
      commissionReason: saleData.commissionReason || '',
      paymentMethod: (saleData.paymentMethod || 'EFECTIVO').toUpperCase(),
      notes: saleData.notes || '',
      createdAt: saleData.createdAt || (saleData.date && saleData.time ? `${saleData.date}T${saleData.time}:00` : now.toISOString())
    };
    sales.unshift(newSale);
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) { console.warn(e); }

    // Async sync with Supabase
    if (window.lussoSupabase) {
      window.lussoSupabase.syncSale(newSale);
    }

    // Also verify if client exists in client list; if not, create them automatically
    const existingClient = this.getClientByName(newSale.clientName);
    if (!existingClient && newSale.clientName && newSale.clientName.toLowerCase() !== 'varios' && newSale.clientName.toLowerCase() !== 'cliente general') {
      this.saveClient({
        name: newSale.clientName,
        phone: saleData.clientPhone || '',
        email: '',
        notes: 'Creada automáticamente desde registro de servicio'
      });
    }

    return newSale;
  }

  deleteSale(id) {
    let sales = this.getSales();
    sales = sales.filter(s => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) { console.warn(e); }
  }

  // --- INVENTORY ---
  getInventory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return data ? JSON.parse(data) : (window.LUSSO_SEED_DATA?.inventory || []);
    } catch {
      return window.LUSSO_SEED_DATA?.inventory || [];
    }
  }

  saveInventoryItem(itemData) {
    const inventory = this.getInventory();
    if (itemData.id) {
      const idx = inventory.findIndex(i => i.id === itemData.id);
      if (idx !== -1) {
        inventory[idx] = { ...inventory[idx], ...itemData, updatedAt: new Date().toISOString() };
      }
    } else {
      const newItem = {
        id: 'inv-' + Date.now(),
        name: itemData.name,
        category: itemData.category || 'General',
        brand: itemData.brand || 'Lusso',
        stock: Number(itemData.stock) || 0,
        minStock: Number(itemData.minStock) || 2,
        unit: itemData.unit || 'Unidades',
        cost: Number(itemData.cost) || 0,
        supplier: itemData.supplier || ''
      };
      inventory.push(newItem);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) { console.warn(e); }

    if (window.lussoSupabase) {
      window.lussoSupabase.syncInventoryItem(itemData);
    }
  }

  adjustStock(id, amountChange, reason = 'Ajuste manual') {
    const inventory = this.getInventory();
    const item = inventory.find(i => i.id === id);
    if (item) {
      item.stock = Math.max(0, item.stock + amountChange);
      item.lastAdjust = { date: new Date().toISOString(), change: amountChange, reason };
      try {
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
      } catch (e) { console.warn(e); }
    }
  }

  deleteInventoryItem(id) {
    let inventory = this.getInventory();
    inventory = inventory.filter(i => i.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) { console.warn(e); }
  }

  // --- EXPENSES ---
  getPettyCashExpenses(monthFilter = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES_CAJA);
      let list = data ? JSON.parse(data) : [];
      if (!Array.isArray(list)) list = [];
      if (monthFilter === 'all') return list;
      const targetMonth = monthFilter || '2026-09';
      return list.filter(e => e.date && e.date.startsWith(targetMonth));
    } catch {
      return [];
    }
  }

  addPettyCashExpense(expense) {
    const expenses = this.getPettyCashExpenses();
    const newExp = {
      id: 'caja-' + Date.now(),
      date: expense.date || new Date().toISOString().split('T')[0],
      amount: Number(expense.amount) || 0,
      description: expense.description || 'Gasto Caja Chica',
      notes: expense.notes || '',
      category: expense.category || 'Caja Chica'
    };
    expenses.unshift(newExp);
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES_CAJA, JSON.stringify(expenses));
    } catch (e) { console.warn(e); }

    if (window.lussoSupabase) {
      window.lussoSupabase.syncPettyCash(newExp);
    }
    return newExp;
  }

  deletePettyCashExpense(id) {
    let expenses = this.getPettyCashExpenses();
    expenses = expenses.filter(e => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES_CAJA, JSON.stringify(expenses));
    } catch (e) { console.warn(e); }
  }

  getInvoiceExpenses() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES_FACT);
      return data ? JSON.parse(data) : (window.LUSSO_SEED_DATA?.invoices || []);
    } catch {
      return window.LUSSO_SEED_DATA?.invoices || [];
    }
  }

  addInvoiceExpense(expense) {
    const invoices = this.getInvoiceExpenses();
    const newInv = {
      id: 'fact-' + Date.now(),
      date: expense.date || new Date().toISOString().split('T')[0],
      amount: Number(expense.amount) || 0,
      description: expense.description || 'Factura Proveedor',
      notes: expense.notes || '',
      category: expense.category || 'Proveedor'
    };
    invoices.unshift(newInv);
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES_FACT, JSON.stringify(invoices));
    } catch (e) { console.warn(e); }

    if (window.lussoSupabase) {
      window.lussoSupabase.syncInvoice(newInv);
    }
    return newInv;
  }

  deleteInvoiceExpense(id) {
    let invoices = this.getInvoiceExpenses();
    invoices = invoices.filter(e => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES_FACT, JSON.stringify(invoices));
    } catch (e) { console.warn(e); }
  }

  // --- CAJA CHICA & CUADRE DE EFECTIVO ---
  getInitialCashBase() {
    try {
      return Number(localStorage.getItem('lusso_initial_cash_base')) || 100;
    } catch {
      return 100;
    }
  }

  setInitialCashBase(amount) {
    try {
      localStorage.setItem('lusso_initial_cash_base', String(Number(amount) || 0));
    } catch (e) { console.warn(e); }
  }

  getCajaChicaSummary(targetDate = null) {
    const date = targetDate || new Date().toISOString().split('T')[0];
    const allSales = this.getSales();
    const pettyCash = this.getPettyCashExpenses();

    // Cash sales for target date
    const cashSalesToday = allSales.filter(s => s.date === date && (s.paymentMethod === 'EFECTIVO' || s.paymentMethod === 'Efectivo'));
    const totalCashCollected = cashSalesToday.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

    // Petty cash expenses for target date
    const expensesToday = pettyCash.filter(e => e.date === date);
    const totalPettyCashOut = expensesToday.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const initialBase = this.getInitialCashBase();
    const expectedCashInDrawer = initialBase + totalCashCollected - totalPettyCashOut;

    return {
      date,
      initialBase,
      totalCashCollected,
      totalPettyCashOut,
      expectedCashInDrawer,
      cashSalesCount: cashSalesToday.length,
      expensesCount: expensesToday.length
    };
  }

  // --- FINANCIAL BALANCE FOR OWNER (DUEÑA) ---
  getFinancialBalance(targetMonth = null) {
    const month = targetMonth || new Date().toISOString().substring(0, 7);
    const sales = this.getSales().filter(s => s.date && s.date.startsWith(month));
    const pettyCash = this.getPettyCashExpenses().filter(e => e.date && e.date.startsWith(month));
    const invoices = this.getInvoiceExpenses().filter(e => e.date && e.date.startsWith(month));

    const totalIncome = sales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const totalPettyCash = pettyCash.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const totalInvoices = invoices.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    // Fixed monthly rent: S/ 2,500.00
    const fixedRent = 2500.00;

    // Calculate payroll for Kiara and Cielo
    const payrollKiara = this.calculateMonthlyPayroll('Kiara', month);
    const payrollCielo = this.calculateMonthlyPayroll('Cielo', month);
    const totalPayroll = (payrollKiara?.netPayable || 0) + (payrollCielo?.netPayable || 0);

    const totalExpenses = fixedRent + totalPettyCash + totalInvoices + totalPayroll;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

    return {
      month,
      fixedRent,
      totalIncome,
      totalPettyCash,
      totalInvoices,
      totalPayroll,
      totalExpenses,
      netProfit,
      profitMargin,
      salesCount: sales.length,
      invoicesCount: invoices.length
    };
  }

  // --- SERVICES CATALOG ---
  getServicesCatalog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return data ? JSON.parse(data) : (window.LUSSO_SEED_DATA?.servicesCatalog || []);
    } catch {
      return window.LUSSO_SEED_DATA?.servicesCatalog || [];
    }
  }

  // --- MONTHLY OFFERS ---
  getMonthlyOffers() {
    try {
      return window.LUSSO_SEED_DATA?.monthlyOffers || [];
    } catch {
      return [];
    }
  }

  // --- APPOINTMENTS / AGENDA CRM ---
  getAppointments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : (window.LUSSO_SEED_DATA?.appointments || []);
    } catch {
      return window.LUSSO_SEED_DATA?.appointments || [];
    }
  }

  getAppointmentById(id) {
    const appointments = this.getAppointments();
    return appointments.find(a => a.id === id) || null;
  }

  saveAppointment(aptData) {
    const appointments = this.getAppointments();
    let savedApt = null;

    if (aptData.id) {
      const idx = appointments.findIndex(a => a.id === aptData.id);
      if (idx !== -1) {
        appointments[idx] = { ...appointments[idx], ...aptData, updatedAt: new Date().toISOString() };
        savedApt = appointments[idx];
      }
    } else {
      savedApt = {
        id: 'apt-' + Date.now(),
        clientName: (aptData.clientName || 'Cliente').trim(),
        clientPhone: (aptData.clientPhone || '').trim(),
        service: (aptData.service || 'Servicio General').trim(),
        specialist: aptData.specialist || 'Kiara',
        date: aptData.date || new Date().toISOString().split('T')[0],
        time: aptData.time || '10:00 AM',
        status: aptData.status || 'pending', // pending, confirmed, completed, cancelled
        notes: aptData.notes || '',
        amount: Number(aptData.amount) || 0,
        createdAt: new Date().toISOString()
      };
      appointments.unshift(savedApt);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.warn('Error saving appointment:', e);
    }

    // Auto-create or update client in CRM directory if phone or name is given
    if (savedApt && savedApt.clientName && savedApt.clientName.toLowerCase() !== 'varios') {
      const existingClient = this.getClientByName(savedApt.clientName);
      if (!existingClient) {
        this.saveClient({
          name: savedApt.clientName,
          phone: savedApt.clientPhone || '',
          email: '',
          notes: `Registrada automáticamente desde reserva de cita (${savedApt.service})`
        });
      } else if (!existingClient.phone && savedApt.clientPhone) {
        existingClient.phone = savedApt.clientPhone;
        this.saveClient(existingClient);
      }
    }

    if (window.lussoSupabase && savedApt) {
      window.lussoSupabase.syncAppointment(savedApt);
    }

    return savedApt;
  }

  updateAppointmentStatus(id, newStatus) {
    const appointments = this.getAppointments();
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      apt.status = newStatus;
      apt.updatedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      } catch (e) {
        console.warn(e);
      }
      if (window.lussoSupabase) {
        window.lussoSupabase.syncAppointment(apt);
      }
      return apt;
    }
    return null;
  }

  deleteAppointment(id) {
    let appointments = this.getAppointments();
    appointments = appointments.filter(a => a.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (e) {
      console.warn(e);
    }
  }

  getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const appointments = this.getAppointments();
    return appointments.filter(a => a.date === today && a.status !== 'cancelled');
  }

  getPendingAppointments() {
    const appointments = this.getAppointments();
    return appointments.filter(a => a.status === 'pending');
  }

  getPendingAppointmentsCount() {
    return this.getPendingAppointments().length;
  }

  getInventoryItemById(id) {
    const inventory = this.getInventory();
    return inventory.find(i => i.id === id) || null;
  }

  // --- STAFF & SALARY CONFIG ---
  getStaffList() {
    const fallbackStaff = [
      { id: 'st-1', name: 'Kiara', role: 'Estilista Master', baseSalary: 2500, calculationBaseDays: 30, phone: '971988386', active: true },
      { id: 'st-2', name: 'Cielo', role: 'Nail Artist & Estilista', baseSalary: 2100, calculationBaseDays: 30, phone: '971988386', active: true }
    ];
    try {
      const seedStaff = (window.LUSSO_SEED_DATA?.staff && window.LUSSO_SEED_DATA.staff.length > 0) ? window.LUSSO_SEED_DATA.staff : fallbackStaff;
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (!data) return seedStaff;
      const parsed = JSON.parse(data);
      return (parsed && parsed.length > 0) ? parsed : seedStaff;
    } catch {
      return fallbackStaff;
    }
  }

  getStaffByName(name) {
    if (!name) return null;
    const clean = name.trim().toLowerCase();
    return this.getStaffList().find(s => s.name.toLowerCase() === clean) || null;
  }

  saveStaffMember(staffData) {
    const list = this.getStaffList();
    const idx = list.findIndex(s => s.name.toLowerCase() === staffData.name.toLowerCase() || s.id === staffData.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...staffData, updatedAt: new Date().toISOString() };
    } else {
      list.push({
        id: 'st-' + Date.now(),
        calculationBaseDays: 30,
        ...staffData,
        createdAt: new Date().toISOString()
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    } catch (e) { console.warn(e); }
    return list;
  }

  // --- ABSENCES, FERIADOS & PROPINAS ---
  getAbsences(monthFilter = '', specialistFilter = 'all') {
    try {
      const seedAbsences = window.LUSSO_SEED_DATA?.absences || [];
      const data = localStorage.getItem(STORAGE_KEYS.ABSENCES);
      let list = data ? JSON.parse(data) : seedAbsences;
      if (!Array.isArray(list)) list = seedAbsences;

      if (monthFilter) {
        list = list.filter(a => (a.date && a.date.startsWith(monthFilter)) || a.month === monthFilter);
      }
      if (specialistFilter && specialistFilter !== 'all') {
        list = list.filter(a => a.specialist.toLowerCase() === specialistFilter.toLowerCase());
      }
      return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } catch {
      return window.LUSSO_SEED_DATA?.absences || [];
    }
  }

  saveAbsence(absenceData) {
    let list = this.getAbsences();
    const staff = this.getStaffByName(absenceData.specialist) || { baseSalary: 1500, calculationBaseDays: 30 };
    const baseSalary = Number(staff.baseSalary) || 1500;
    const baseDays = Number(staff.calculationBaseDays) || 30;
    const dailyRate = Math.round((baseSalary / baseDays) * 100) / 100; // Formula legal 30 dias

    let calculatedAmount = 0;
    const type = absenceData.type;

    if (type === 'falta_completa') {
      calculatedAmount = -dailyRate; // Descuento 1 dia
    } else if (type === 'medio_dia') {
      calculatedAmount = -Math.round((dailyRate / 2) * 100) / 100; // Descuento medio dia
    } else if (type === 'tardanza') {
      calculatedAmount = -Math.abs(Number(absenceData.amount) || 15); // Monto fijo
    } else if (type === 'permiso_con_goce') {
      calculatedAmount = 0; // Sin descuento
    } else if (type === 'feriado_trabajado') {
      // Dia feriado trabajado acordado: suma 1 dia de trabajo
      calculatedAmount = Number(absenceData.amount) > 0 ? Number(absenceData.amount) : dailyRate;
    } else if (type === 'propina_tarjeta' || type === 'bono') {
      // Propinas o bonos: 100% integro sin descuento de comision
      calculatedAmount = Math.abs(Number(absenceData.amount) || 0);
    } else {
      calculatedAmount = Number(absenceData.amount) || 0;
    }

    const monthStr = (absenceData.date || new Date().toISOString().split('T')[0]).substring(0, 7);

    let savedItem;
    if (absenceData.id) {
      const idx = list.findIndex(a => a.id === absenceData.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...absenceData,
          amount: calculatedAmount,
          month: monthStr,
          updatedAt: new Date().toISOString()
        };
        savedItem = list[idx];
      }
    } else {
      savedItem = {
        id: 'abs-' + Date.now(),
        specialist: absenceData.specialist || 'Kiara',
        date: absenceData.date || new Date().toISOString().split('T')[0],
        type: absenceData.type || 'falta_completa',
        reason: absenceData.reason || 'Sin motivo especificado',
        amount: calculatedAmount,
        notes: absenceData.notes || '',
        month: monthStr,
        createdAt: new Date().toISOString()
      };
      list.unshift(savedItem);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.ABSENCES, JSON.stringify(list));
    } catch (e) { console.warn(e); }

    if (window.lussoSupabase) {
      window.lussoSupabase.syncAbsence(savedItem);
    }
    return savedItem;
  }

  deleteAbsence(id) {
    let list = this.getAbsences();
    list = list.filter(a => a.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.ABSENCES, JSON.stringify(list));
    } catch (e) { console.warn(e); }
  }

  // --- MONTHLY PAYROLL CALCULATION ---
  calculateMonthlyPayroll(param1, param2) {
    let month, specialistName;
    if (typeof param1 === 'string' && param1.includes('-') && /^\d{4}-\d{2}/.test(param1)) {
      month = param1;
      specialistName = param2 || 'Kiara';
    } else if (typeof param2 === 'string' && param2.includes('-') && /^\d{4}-\d{2}/.test(param2)) {
      specialistName = param1 || 'Kiara';
      month = param2;
    } else {
      month = (param1 && param1.includes('-')) ? param1 : new Date().toISOString().substring(0, 7);
      specialistName = param2 || param1 || 'Kiara';
    }

    const staff = this.getStaffByName(specialistName) || {
      name: specialistName,
      baseSalary: specialistName.toLowerCase().includes('kiara') ? 2500 : 2100,
      calculationBaseDays: 30,
      role: specialistName.toLowerCase().includes('kiara') ? 'Estilista Master' : 'Nail Artist'
    };

    const baseSalary = Number(staff.baseSalary) || (specialistName.toLowerCase().includes('kiara') ? 2500 : 2100);
    const baseDays = Number(staff.calculationBaseDays) || 30;
    const dailyRate = Math.round((baseSalary / baseDays) * 100) / 100;

    const items = this.getAbsences(month, specialistName);

    let totalDeductions = 0; // Descuentos por faltas/tardanzas
    let manualTips = 0; // Propinas manuales
    let totalFeriados = 0; // Dias feriados trabajados
    let manualBonuses = 0; // Bonos manuales

    let fullAbsenceCount = 0;
    let halfAbsenceCount = 0;
    let tardinessCount = 0;

    items.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'falta_completa') {
        totalDeductions += Math.abs(amt);
        fullAbsenceCount++;
      } else if (item.type === 'medio_dia') {
        totalDeductions += Math.abs(amt);
        halfAbsenceCount++;
      } else if (item.type === 'tardanza') {
        totalDeductions += Math.abs(amt);
        tardinessCount++;
      } else if (item.type === 'feriado_trabajado') {
        totalFeriados += Math.abs(amt);
      } else if (item.type === 'propina_tarjeta') {
        manualTips += Math.abs(amt);
      } else if (item.type === 'bono') {
        manualBonuses += Math.abs(amt);
      }
    });

    // Sum Tips and Product Commissions directly from all Sales in the month
    const allSales = this.getSales();
    const salesInMonth = allSales.filter(s => {
      const specMatch = (s.specialist || '').toLowerCase().includes(specialistName.toLowerCase()) ||
        (Array.isArray(s.items) && s.items.some(it => (it.specialist || '').toLowerCase().includes(specialistName.toLowerCase())));
      const monthMatch = s.date && s.date.startsWith(month);
      return specMatch && monthMatch;
    });

    const salesTips = salesInMonth.reduce((acc, s) => {
      const tipVal = Number(s.tip) || 0;
      if (tipVal <= 0) return acc;
      const rec = (s.tipRecipient || '').toLowerCase();
      const specLow = specialistName.toLowerCase();
      if (rec === specLow) return acc + tipVal;
      if (rec === 'ambas') return acc + (tipVal / 2);
      if (rec && rec !== specLow) return acc; // Assigned to the other specialist
      if ((s.specialist || '').includes('&')) {
        return acc + (tipVal / 2); // default 50/50 on shared attention
      }
      return acc + tipVal;
    }, 0);
    const salesCommissions = salesInMonth.reduce((acc, s) => acc + (Number(s.commission) || 0), 0);

    const totalTips = Math.round((manualTips + salesTips) * 100) / 100;
    const totalCommissions = Math.round((manualBonuses + salesCommissions) * 100) / 100;

    // Quincenal Payroll Breakdown:
    // 1ra Quincena (Día 15): 50% sueldo base fijo sin descuentos
    const firstFortnightBase = Math.round((baseSalary / 2) * 100) / 100;
    const firstFortnightPayment = firstFortnightBase;

    // 2da Quincena / Fin de Mes (Día 30/31): 50% sueldo base + propinas + comisiones + feriados - deducciones
    const secondFortnightBase = Math.round((baseSalary / 2) * 100) / 100;
    const secondFortnightGross = secondFortnightBase + totalFeriados + totalTips + totalCommissions;
    const secondFortnightPayment = Math.max(0, Math.round((secondFortnightGross - totalDeductions) * 100) / 100);

    const netPayable = Math.round((firstFortnightPayment + secondFortnightPayment) * 100) / 100;

    return {
      specialist: staff.name,
      role: staff.role,
      phone: staff.phone || '',
      month,
      baseSalary,
      baseDays,
      dailyRate,
      firstFortnightBase,
      firstFortnightPayment,
      secondFortnightBase,
      secondFortnightGross: Math.round(secondFortnightGross * 100) / 100,
      secondFortnightPayment,
      fullAbsenceCount,
      halfAbsenceCount,
      tardinessCount,
      salesCount: salesInMonth.length,
      salesTips,
      salesCommissions,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalTips,
      totalCommissions,
      totalFeriados: Math.round(totalFeriados * 100) / 100,
      totalBonuses: totalCommissions,
      netPayable: Math.round(netPayable * 100) / 100,
      recordsCount: items.length,
      records: items
    };
  }

  // --- ANALYTICS & STATS HELPERS ---
  getClientProfile(clientName) {
    if (!clientName) return null;
    const normalize = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
    const clean = normalize(clientName);
    const allSales = this.getSales();
    
    // Match exact normalized name or fallback to partial match
    let sales = allSales.filter(s => normalize(s.clientName) === clean);
    if (sales.length === 0 && clean.length > 2) {
      sales = allSales.filter(s => {
        const sNorm = normalize(s.clientName);
        return sNorm.includes(clean) || clean.includes(sNorm);
      });
    }
    
    const totalVisits = sales.length;
    const totalSpent = sales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const avgTicket = totalVisits > 0 ? (totalSpent / totalVisits) : 0;
    
    // Sort sales by date descending
    const sortedSales = [...sales].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    
    const firstVisit = sortedSales.length > 0 ? sortedSales[sortedSales.length - 1].date : '-';
    const lastVisit = sortedSales.length > 0 ? sortedSales[0].date : '-';
    const lastService = sortedSales.length > 0 ? sortedSales[0] : null;
    
    let tag = 'Nueva';
    let tagColor = 'emerald';
    if (totalVisits === 0) {
      tag = 'Registrada (0)';
      tagColor = 'gray';
    } else if (totalVisits === 1) {
      tag = 'Nueva (1 visita)';
      tagColor = 'emerald';
    } else {
      tag = `Recurrente (${totalVisits} visitas)`;
      tagColor = 'purple';
    }

    const specCount = {};
    sales.forEach(s => {
      if (s.specialist) specCount[s.specialist] = (specCount[s.specialist] || 0) + 1;
    });
    let topSpecialist = '-';
    let maxSpecVisits = 0;
    for (const [spec, count] of Object.entries(specCount)) {
      if (count > maxSpecVisits) {
        maxSpecVisits = count;
        topSpecialist = spec;
      }
    }

    return {
      name: clientName,
      totalVisits,
      totalSpent,
      avgTicket,
      firstVisit,
      lastVisit,
      lastService,
      tag,
      tagColor,
      topSpecialist,
      salesHistory: sortedSales
    };
  }

  getMonthlyHistoricalSummary() {
    const allSales = this.getSales();
    const monthNames = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };

    const monthMap = {};
    allSales.forEach(s => {
      if (!s.date) return;
      const m = s.date.substring(0, 7);
      if (!monthMap[m]) {
        monthMap[m] = {
          month: m,
          year: m.split('-')[0],
          monthNumber: m.split('-')[1],
          label: `${monthNames[m.split('-')[1]] || m.split('-')[1]} ${m.split('-')[0]}`,
          salesCount: 0,
          totalRevenue: 0,
          kiaraAmount: 0,
          kiaraCount: 0,
          cieloAmount: 0,
          cieloCount: 0,
          otherAmount: 0,
          cashAmount: 0,
          posAmount: 0,
          yapeAmount: 0,
          transferAmount: 0,
          servicesMap: {},
          tipsTotal: 0,
          commissionsTotal: 0
        };
      }
      const d = monthMap[m];
      const amt = Number(s.amount) || 0;
      d.salesCount++;
      d.totalRevenue += amt;
      d.tipsTotal += (Number(s.tip) || 0);
      d.commissionsTotal += (Number(s.commission) || 0);

      const spec = (s.specialist || '').toLowerCase();
      if (spec.includes('kiara')) {
        d.kiaraAmount += amt;
        d.kiaraCount++;
      } else if (spec.includes('cielo')) {
        d.cieloAmount += amt;
        d.cieloCount++;
      } else {
        d.otherAmount += amt;
      }

      const pm = (s.paymentMethod || 'EFECTIVO').toUpperCase();
      if (pm === 'EFECTIVO') d.cashAmount += amt;
      else if (pm === 'POS' || pm === 'TARJETA') d.posAmount += amt;
      else if (pm === 'TRANSFERENCIA') d.transferAmount += amt;
      else d.yapeAmount += amt;

      const srv = (s.service || 'Varios').trim();
      d.servicesMap[srv] = (d.servicesMap[srv] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthMap).sort();
    const monthsArray = sortedMonths.map((m, idx) => {
      const d = monthMap[m];
      const prevMonthKey = sortedMonths[idx - 1];
      const prevTotal = prevMonthKey ? monthMap[prevMonthKey].totalRevenue : 0;
      const growth = prevTotal > 0 ? (((d.totalRevenue - prevTotal) / prevTotal) * 100) : 0;

      const sortedSrv = Object.entries(d.servicesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => `${e[0]} (${e[1]})`);

      const tot = d.totalRevenue || 1;
      const avgTicket = d.salesCount > 0 ? (d.totalRevenue / d.salesCount) : 0;

      // Full Financial Balance for this specific month
      const fixedRent = 2500;
      const pKiara = this.calculateMonthlyPayroll('Kiara', d.month);
      const pCielo = this.calculateMonthlyPayroll('Cielo', d.month);
      const payrollTotal = (pKiara?.netPayable || 0) + (pCielo?.netPayable || 0);

      const invList = this.getInvoiceExpenses().filter(e => e.date && e.date.startsWith(d.month));
      const invoicesTotal = invList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

      const pcList = this.getPettyCashExpenses('all').filter(e => e.date && e.date.startsWith(d.month));
      const pettyCashTotal = pcList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

      const totalExpenses = fixedRent + payrollTotal + invoicesTotal + pettyCashTotal;
      const netProfit = Math.round((d.totalRevenue - totalExpenses) * 100) / 100;
      const profitMargin = d.totalRevenue > 0 ? Math.round(((netProfit / d.totalRevenue) * 100) * 10) / 10 : 0;

      return {
        month: d.month,
        label: d.label,
        salesCount: d.salesCount,
        totalRevenue: Math.round(d.totalRevenue * 100) / 100,
        avgTicket: Math.round(avgTicket * 100) / 100,
        growthPct: Math.round(growth * 10) / 10,
        fixedRent,
        payrollTotal: Math.round(payrollTotal * 100) / 100,
        invoicesTotal: Math.round(invoicesTotal * 100) / 100,
        pettyCashTotal: Math.round(pettyCashTotal * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit,
        profitMargin,
        payment: {
          cash: { amount: Math.round(d.cashAmount * 100) / 100, pct: Math.round((d.cashAmount / tot) * 100) },
          pos: { amount: Math.round(d.posAmount * 100) / 100, pct: Math.round((d.posAmount / tot) * 100) },
          yape: { amount: Math.round(d.yapeAmount * 100) / 100, pct: Math.round((d.yapeAmount / tot) * 100) },
          transfer: { amount: Math.round(d.transferAmount * 100) / 100, pct: Math.round((d.transferAmount / tot) * 100) }
        },
        specialists: {
          kiara: { amount: Math.round(d.kiaraAmount * 100) / 100, count: d.kiaraCount, pct: Math.round((d.kiaraAmount / tot) * 100) },
          cielo: { amount: Math.round(d.cieloAmount * 100) / 100, count: d.cieloCount, pct: Math.round((d.cieloAmount / tot) * 100) }
        },
        topServices: sortedSrv,
        topService: sortedSrv[0] || 'Varios (1)',
        cashTotal: Math.round(d.cashAmount * 100) / 100,
        posTotal: Math.round(d.posAmount * 100) / 100,
        digitalTotal: Math.round(d.yapeAmount * 100) / 100,
        kiaraRevenue: Math.round(d.kiaraAmount * 100) / 100,
        cieloRevenue: Math.round(d.cieloAmount * 100) / 100,
        tipsTotal: Math.round(d.tipsTotal * 100) / 100,
        commissionsTotal: Math.round(d.commissionsTotal * 100) / 100
      };
    }).reverse();

    return monthsArray;
  }

  getDashboardStats(monthFilter = null) {
    const allSales = this.getSales();
    const clients = this.getClients();
    const inventory = this.getInventory();
    const pettyCash = this.getPettyCashExpenses('all');
    const invoices = this.getInvoiceExpenses();

    const selectedMonth = monthFilter || '2026-09';
    let filteredSales = allSales;
    let periodLabel = 'Todo el Histórico 2026';

    const monthNames = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };

    if (selectedMonth && selectedMonth !== 'all') {
      filteredSales = allSales.filter(s => s.date && s.date.startsWith(selectedMonth));
      const parts = selectedMonth.split('-');
      periodLabel = `${monthNames[parts[1]] || parts[1]} ${parts[0]}`;
    }

    const totalRevenue = filteredSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const grandTotalRevenue2026 = allSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    
    const clientSalesMap = {};
    filteredSales.forEach(s => {
      const name = (s.clientName || '').trim().toLowerCase();
      if (name && name !== 'varios') {
        clientSalesMap[name] = (clientSalesMap[name] || 0) + 1;
      }
    });

    let newClientsCount = 0;
    let recurrentClientsCount = 0;
    Object.values(clientSalesMap).forEach(visits => {
      if (visits === 1) newClientsCount++;
      else if (visits > 1) recurrentClientsCount++;
    });

    // Complete Financial Balance Calculation
    const fixedRent = selectedMonth === 'all' ? (2500 * 7) : 2500;
    let totalPayroll = 0;
    if (selectedMonth === 'all') {
      ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'].forEach(m => {
        const pk = this.calculateMonthlyPayroll('Kiara', m);
        const pc = this.calculateMonthlyPayroll('Cielo', m);
        totalPayroll += (pk?.netPayable || 0) + (pc?.netPayable || 0);
      });
    } else {
      const pk = this.calculateMonthlyPayroll('Kiara', selectedMonth);
      const pc = this.calculateMonthlyPayroll('Cielo', selectedMonth);
      totalPayroll = (pk?.netPayable || 0) + (pc?.netPayable || 0);
    }

    let filteredPettyCash = pettyCash;
    let filteredInvoices = invoices;
    if (selectedMonth && selectedMonth !== 'all') {
      filteredPettyCash = pettyCash.filter(e => e.date && e.date.startsWith(selectedMonth));
      filteredInvoices = invoices.filter(e => e.date && e.date.startsWith(selectedMonth));
    }

    const totalPettyCash = filteredPettyCash.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const totalInvoices = filteredInvoices.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const totalExpenses = fixedRent + totalPayroll + totalInvoices + totalPettyCash;
    const netProfit = Math.round((totalRevenue - totalExpenses) * 100) / 100;
    const profitMargin = totalRevenue > 0 ? Math.round(((netProfit / totalRevenue) * 100) * 10) / 10 : 0;

    const lowStockItems = inventory.filter(i => i.stock <= i.minStock);

    const paymentMethods = {};
    filteredSales.forEach(s => {
      const pm = (s.paymentMethod || 'EFECTIVO').toUpperCase();
      paymentMethods[pm] = (paymentMethods[pm] || 0) + (Number(s.amount) || 0);
    });

    const specialists = {};
    filteredSales.forEach(s => {
      const sp = s.specialist || 'Otros';
      specialists[sp] = (specialists[sp] || 0) + (Number(s.amount) || 0);
    });

    const topServices = {};
    filteredSales.forEach(s => {
      const serv = (s.service || 'Varios').trim();
      topServices[serv] = (topServices[serv] || 0) + 1;
    });

    const sortedServices = Object.entries(topServices)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const appointments = this.getAppointments();
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled');
    const pendingAppointments = appointments.filter(a => a.status === 'pending');

    const monthlyHistory = this.getMonthlyHistoricalSummary();

    // Diagnostics & Strategic Metrics
    let bestMonth = monthlyHistory[0] || null;
    let highestRev = 0;
    monthlyHistory.forEach(h => {
      if (h.totalRevenue > highestRev) {
        highestRev = h.totalRevenue;
        bestMonth = h;
      }
    });

    const completedMonths = monthlyHistory.filter(h => h.month !== '2026-09');
    const avgMonthlyRevenue = completedMonths.length > 0 
      ? Math.round(completedMonths.reduce((acc, h) => acc + h.totalRevenue, 0) / completedMonths.length)
      : 0;

    return {
      selectedMonth,
      periodLabel,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      grandTotalRevenue2026: Math.round(grandTotalRevenue2026 * 100) / 100,
      totalTransactions: filteredSales.length,
      grandTotalTransactions: allSales.length,
      totalClients: clients.length,
      newClientsCount,
      recurrentClientsCount,
      recurrentRate: (newClientsCount + recurrentClientsCount) > 0 
        ? Math.round((recurrentClientsCount / (newClientsCount + recurrentClientsCount)) * 100) 
        : 0,
      avgTicket: filteredSales.length > 0 ? (totalRevenue / filteredSales.length) : 0,
      fixedRent,
      totalPayroll: Math.round(totalPayroll * 100) / 100,
      totalInvoices: Math.round(totalInvoices * 100) / 100,
      totalPettyCash: Math.round(totalPettyCash * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit,
      profitMargin,
      bestMonth,
      avgMonthlyRevenue,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      paymentMethods,
      specialists,
      topServices: sortedServices,
      todayAppointments,
      todayAppointmentsCount: todayAppointments.length,
      pendingAppointmentsCount: pendingAppointments.length,
      totalAppointmentsCount: appointments.length,
      monthlyHistory
    };
  }

  exportFullBackup() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      clients: this.getClients(),
      sales: this.getSales(),
      inventory: this.getInventory(),
      pettyCash: this.getPettyCashExpenses(),
      invoices: this.getInvoiceExpenses(),
      services: this.getServicesCatalog(),
      offers: this.getMonthlyOffers(),
      appointments: this.getAppointments()
    };
    return JSON.stringify(backup, null, 2);
  }

  importFullBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.clients) localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
      if (data.sales) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
      if (data.inventory) localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data.inventory));
      if (data.pettyCash) localStorage.setItem(STORAGE_KEYS.EXPENSES_CAJA, JSON.stringify(data.pettyCash));
      if (data.invoices) localStorage.setItem(STORAGE_KEYS.EXPENSES_FACT, JSON.stringify(data.invoices));
      if (data.services) localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
      if (data.offers) localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(data.offers));
      if (data.appointments) localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
      return { success: true, message: 'Datos restaurados correctamente' };
    } catch (e) {
      return { success: false, message: 'Error al importar archivo JSON: ' + e.message };
    }
  }

  resetToDefaults() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.SALES);
      localStorage.removeItem(STORAGE_KEYS.INVENTORY);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES_CAJA);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES_FACT);
      localStorage.removeItem(STORAGE_KEYS.SERVICES);
      localStorage.removeItem(STORAGE_KEYS.OFFERS);
      localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    } catch (e) { console.warn(e); }
    this.seedInitialData();
  }
}

window.lussoDB = new LussoStorageService();

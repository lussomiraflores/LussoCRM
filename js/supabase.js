/**
 * Lusso Beauty Salón - Supabase Cloud Synchronization Module
 * Connects local Offline-First CRM with Supabase PostgreSQL Database.
 */

const SUPABASE_CONFIG = {
  url: 'https://crwohdkuwygjgoyvmywh.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd29oZGt1d3lnamdveXZteXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0ODIzNzMsImV4cCI6MjEwNDA1ODM3M30.wykKMQPVN8dHeo2ECekVsfpouGUdj6G4s-gE7A14b6c'
};

class LussoSupabase {
  constructor() {
    this.client = null;
    this.isOnline = false;
    this.isSyncing = false;
    this.init();
  }

  init() {
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this.isOnline = true;
        this.updateStatusUI('online', '☁️ Supabase Conectado');
        console.log('✅ Supabase Client initialized successfully');
      } else {
        console.warn('⚠️ Supabase SDK not loaded via CDN, operating in Local Storage mode');
        this.updateStatusUI('offline', '💾 Modo Local (Sin Red)');
      }
    } catch (e) {
      console.warn('Supabase init error:', e);
      this.updateStatusUI('offline', '💾 Modo Local');
    }
  }

  updateStatusUI(status, text) {
    const el = document.getElementById('cloud-sync-status');
    const textEl = document.getElementById('cloud-sync-text');
    if (el) {
      el.className = 'cloud-status-pill ' + status;
    }
    if (textEl) {
      textEl.textContent = text;
    }
  }

  // --- RECORD SYNCS (Async Fire-and-Forget / Non-blocking) ---
  async syncClient(client) {
    if (!this.client || !client) return;
    try {
      await this.client.from('clients').upsert({
        id: client.id,
        name: client.name,
        phone: client.phone || '',
        email: client.email || '',
        notes: client.notes || '',
        technical_notes: client.technicalNotes || '',
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase syncClient error:', e);
    }
  }

  async syncSale(sale) {
    if (!this.client || !sale) return;
    try {
      await this.client.from('sales').upsert({
        id: sale.id,
        date: sale.date,
        time: sale.time || '12:00',
        client_name: sale.clientName,
        specialist: sale.specialist,
        service: sale.service,
        supplies: sale.supplies || '',
        drinks: sale.drinks || '',
        amount: Number(sale.amount) || 0,
        tip: Number(sale.tip) || 0,
        commission: Number(sale.commission) || 0,
        commission_reason: sale.commissionReason || '',
        payment_method: sale.paymentMethod,
        notes: sale.notes || '',
        created_at: sale.createdAt || new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase syncSale error:', e);
    }
  }

  async syncAppointment(apt) {
    if (!this.client || !apt) return;
    try {
      await this.client.from('appointments').upsert({
        id: apt.id,
        client_name: apt.clientName,
        client_phone: apt.clientPhone || '',
        service: apt.service,
        specialist: apt.specialist,
        date: apt.date,
        time: apt.time,
        status: apt.status || 'pending',
        amount: Number(apt.amount) || 0,
        notes: apt.notes || '',
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase syncAppointment error:', e);
    }
  }

  async syncInventoryItem(item) {
    if (!this.client || !item) return;
    try {
      await this.client.from('inventory').upsert({
        id: item.id,
        name: item.name,
        brand: item.brand || 'Lusso',
        category: item.category || 'General',
        stock: Number(item.stock) || 0,
        min_stock: Number(item.minStock) || 2,
        unit: item.unit || 'Unidades',
        cost: Number(item.cost) || 0,
        supplier: item.supplier || '',
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase syncInventoryItem error:', e);
    }
  }

  async syncAbsence(absence) {
    if (!this.client || !absence) return;
    try {
      await this.client.from('absences').upsert({
        id: absence.id,
        specialist: absence.specialist,
        date: absence.date,
        type: absence.type,
        reason: absence.reason,
        amount: Number(absence.amount) || 0,
        notes: absence.notes || '',
        created_at: absence.createdAt || new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase syncAbsence error:', e);
    }
  }

  async syncPettyCash(item) {
    if (!this.client || !item) return;
    try {
      await this.client.from('petty_cash').upsert({
        id: item.id,
        date: item.date,
        description: item.description,
        amount: Number(item.amount) || 0,
        notes: item.notes || '',
        created_at: item.createdAt || new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase syncPettyCash error:', e);
    }
  }

  async syncInvoice(item) {
    if (!this.client || !item) return;
    try {
      await this.client.from('invoices').upsert({
        id: item.id,
        date: item.date,
        description: item.description,
        amount: Number(item.amount) || 0,
        notes: item.notes || '',
        created_at: item.createdAt || new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase syncInvoice error:', e);
    }
  }

  // --- FULL CLOUD BACKUP & RESTORE ---
  async syncAllToCloud() {
    if (!this.client) {
      if (window.lussoCRM) window.lussoCRM.showToast('Supabase aún no está conectado. Verifica tu conexión.', 'warning');
      return;
    }

    if (this.isSyncing) return;
    this.isSyncing = true;
    this.updateStatusUI('syncing', '⏳ Sincronizando datos...');
    if (window.lussoCRM) window.lussoCRM.showToast('Iniciando respaldo completo a Supabase...', 'info');

    try {
      const clients = window.lussoDB.getClients();
      const sales = window.lussoDB.getSales();
      const appointments = window.lussoDB.getAppointments();
      const inventory = window.lussoDB.getInventory();
      const pettyCash = window.lussoDB.getPettyCashExpenses();
      const invoices = window.lussoDB.getInvoiceExpenses();
      const absences = window.lussoDB.getAbsences();

      // Batch Upsert Clients
      if (clients.length > 0) {
        const clientRows = clients.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          notes: c.notes || '',
          technical_notes: c.technicalNotes || '',
          updated_at: new Date().toISOString()
        }));
        await this.client.from('clients').upsert(clientRows);
      }

      // Batch Upsert Sales
      if (sales.length > 0) {
        const saleRows = sales.map(s => ({
          id: s.id,
          date: s.date,
          client_name: s.clientName,
          specialist: s.specialist,
          service: s.service,
          supplies: s.supplies || '',
          drinks: s.drinks || '',
          amount: Number(s.amount) || 0,
          payment_method: s.paymentMethod,
          notes: s.notes || '',
          created_at: s.createdAt || new Date().toISOString()
        }));
        await this.client.from('sales').upsert(saleRows);
      }

      // Batch Upsert Appointments
      if (appointments.length > 0) {
        const aptRows = appointments.map(a => ({
          id: a.id,
          client_name: a.clientName,
          client_phone: a.clientPhone || '',
          service: a.service,
          specialist: a.specialist,
          date: a.date,
          time: a.time,
          status: a.status || 'pending',
          amount: Number(a.amount) || 0,
          notes: a.notes || '',
          updated_at: new Date().toISOString()
        }));
        await this.client.from('appointments').upsert(aptRows);
      }

      // Batch Upsert Inventory
      if (inventory.length > 0) {
        const invRows = inventory.map(i => ({
          id: i.id,
          name: i.name,
          brand: i.brand || 'Lusso',
          category: i.category || 'General',
          stock: Number(i.stock) || 0,
          min_stock: Number(i.minStock) || 2,
          unit: i.unit || 'Unidades',
          cost: Number(i.cost) || 0,
          supplier: i.supplier || '',
          updated_at: new Date().toISOString()
        }));
        await this.client.from('inventory').upsert(invRows);
      }

      this.updateStatusUI('online', '☁️ Sincronizado con Supabase');
      if (window.lussoCRM) window.lussoCRM.showToast('¡Respaldo a Supabase completado con éxito! ✨', 'success');
    } catch (err) {
      console.error('Full cloud sync error:', err);
      this.updateStatusUI('online', '☁️ Error en Sincronización');
      if (window.lussoCRM) window.lussoCRM.showToast('Error al respaldar en Supabase: ' + err.message, 'warning');
    } finally {
      this.isSyncing = false;
    }
  }

  async pullAllFromCloud() {
    if (!this.client) return;
    this.updateStatusUI('syncing', '⏳ Descargando de Supabase...');
    try {
      const { data: clients } = await this.client.from('clients').select('*');
      const { data: sales } = await this.client.from('sales').select('*');
      const { data: appointments } = await this.client.from('appointments').select('*');
      const { data: inventory } = await this.client.from('inventory').select('*');

      if (clients && clients.length > 0) {
        const localClients = clients.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          notes: c.notes || '',
          technicalNotes: c.technical_notes || '',
          createdAt: c.created_at || new Date().toISOString().split('T')[0]
        }));
        localStorage.setItem('lusso_clients_v1', JSON.stringify(localClients));
      }

      if (sales && sales.length > 0) {
        const localSales = sales.map(s => ({
          id: s.id,
          date: s.date,
          clientName: s.client_name,
          specialist: s.specialist,
          service: s.service,
          supplies: s.supplies || '',
          drinks: s.drinks || '',
          amount: Number(s.amount) || 0,
          paymentMethod: s.payment_method,
          notes: s.notes || '',
          createdAt: s.created_at
        }));
        localStorage.setItem('lusso_sales_v1', JSON.stringify(localSales));
      }

      if (appointments && appointments.length > 0) {
        const localApts = appointments.map(a => ({
          id: a.id,
          clientName: a.client_name,
          clientPhone: a.client_phone,
          service: a.service,
          specialist: a.specialist,
          date: a.date,
          time: a.time,
          status: a.status,
          amount: Number(a.amount) || 0,
          notes: a.notes || ''
        }));
        localStorage.setItem('lusso_appointments_v1', JSON.stringify(localApts));
      }

      if (inventory && inventory.length > 0) {
        const localInv = inventory.map(i => ({
          id: i.id,
          name: i.name,
          brand: i.brand,
          category: i.category,
          stock: Number(i.stock) || 0,
          minStock: Number(i.min_stock) || 2,
          unit: i.unit,
          cost: Number(i.cost) || 0,
          supplier: i.supplier
        }));
        localStorage.setItem('lusso_inventory_v1', JSON.stringify(localInv));
      }

      this.updateStatusUI('online', '☁️ Datos actualizados');
      if (window.lussoCRM) {
        window.lussoCRM.refreshAll();
        window.lussoCRM.showToast('Datos sincronizados desde Supabase correctamente ✨', 'success');
      }
    } catch (err) {
      console.error('Pull error:', err);
      this.updateStatusUI('online', '☁️ Supabase Conectado');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.lussoSupabase = new LussoSupabase();
});

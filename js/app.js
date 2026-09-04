/**
 * Lusso Beauty Salón - Core CRM Application Initializer
 */

class LussoApp {
  constructor() {
    this.init();
  }

  init() {
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.lusso-modal');
        if (modal) modal.classList.remove('open');
      });
    });

    // Close modals on clicking overlay backdrop
    document.querySelectorAll('.lusso-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });

    // Client Drawer Backdrop Closer
    document.getElementById('drawer-backdrop')?.addEventListener('click', () => {
      window.lussoCRM?.closeClientDrawer();
    });

    document.getElementById('btn-close-client-drawer')?.addEventListener('click', () => {
      window.lussoCRM?.closeClientDrawer();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.lussoApp = new LussoApp();
});


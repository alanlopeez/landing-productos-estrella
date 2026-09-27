/**
 * CONVERTSTAR CRO LAB - APPLICATION LOGIC
 * High-Performance Vanilla JS · Security Hardened · Zero Dependencies
 */

(function () {
  'use strict';

  // Constants & Config
  const WHATSAPP_PHONE = '5491127887093';

  // DOM Elements
  const form = document.getElementById('qualifier-form');
  const leadNameInput = document.getElementById('lead-name');
  const businessNameInput = document.getElementById('business-name');
  const starProductInput = document.getElementById('star-product');
  const adBudgetRadios = document.querySelectorAll('input[name="adBudget"]');
  const launchTimelineRadios = document.querySelectorAll('input[name="launchTimeline"]');
  const educationalNotice = document.getElementById('educational-notice');
  const previewBox = document.getElementById('whatsapp-preview-text');
  const mobileStickyCta = document.getElementById('mobile-sticky-cta');
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAcceptAll = document.getElementById('cookie-accept-all');
  const cookieEssential = document.getElementById('cookie-essential');

  // Input Sanitizer to prevent XSS or injection attacks
  function sanitizeInput(str) {
    if (!str) return '';
    return str
      .trim()
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
  }

  // -------------------------------------------------------------
  // 1. DYNAMIC PREVIEW & MESSAGE BUILDER
  // -------------------------------------------------------------
  function getFormData() {
    const name = sanitizeInput(leadNameInput ? leadNameInput.value : '');
    const business = sanitizeInput(businessNameInput ? businessNameInput.value : '');
    const product = sanitizeInput(starProductInput ? starProductInput.value : '');

    let adBudget = '';
    const selectedBudget = document.querySelector('input[name="adBudget"]:checked');
    if (selectedBudget) {
      adBudget = selectedBudget.value;
    }

    let timeline = '';
    const selectedTimeline = document.querySelector('input[name="launchTimeline"]:checked');
    if (selectedTimeline) {
      timeline = selectedTimeline.value;
    }

    return { name, business, product, adBudget, timeline };
  }

  function updateWhatsAppPreview() {
    const data = getFormData();

    const nameText = data.name || '[Completa tu nombre arriba]';
    const businessText = data.business || '[Completa tu negocio arriba]';
    const productText = data.product || '[Completa tu producto arriba]';
    const budgetText = data.adBudget || '[Selecciona una opción]';
    const timelineText = data.timeline || '[Selecciona una opción]';

    const formattedMessage = `¡Hola! Estuve viendo el servicio de landings individuales y quiero consultar por mi producto:

* Nombre: ${nameText}
* Negocio / Rubro: ${businessText}
* Producto estrella: ${productText}
* Estado de pauta: ${budgetText}
* Plazo estimado: ${timelineText}

Me gustaría coordinar para evaluar el proyecto.`;

    if (previewBox) {
      previewBox.textContent = formattedMessage;
    }
  }

  // -------------------------------------------------------------
  // 2. EDUCATIONAL NOTICE TRIGGER FOR "SIN PRESUPUESTO"
  // -------------------------------------------------------------
  function handleBudgetChange(e) {
    const selectedValue = e.target.value;
    if (selectedValue === 'Solo estoy explorando precios / Sin presupuesto definido') {
      if (educationalNotice) {
        educationalNotice.classList.remove('hidden');
      }
    } else {
      if (educationalNotice) {
        educationalNotice.classList.add('hidden');
      }
    }
    updateWhatsAppPreview();
  }

  // -------------------------------------------------------------
  // 3. FORM VALIDATION & SUBMISSION
  // -------------------------------------------------------------
  function clearErrors() {
    const errorContainers = document.querySelectorAll('.input-error-msg');
    errorContainers.forEach(container => {
      container.textContent = '';
    });
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
    });
  }

  function showError(fieldId, errorId, message) {
    const errorContainer = document.getElementById(errorId);
    if (errorContainer) {
      errorContainer.textContent = message;
    }
    const inputElement = document.getElementById(fieldId);
    if (inputElement) {
      inputElement.classList.add('has-error');
      inputElement.setAttribute('aria-invalid', 'true');
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    clearErrors();

    const data = getFormData();
    let hasError = false;
    let firstErrorElement = null;

    if (!data.name) {
      showError('lead-name', 'lead-name-error', 'Por favor ingresa tu nombre');
      hasError = true;
      if (!firstErrorElement) firstErrorElement = leadNameInput;
    }

    if (!data.business) {
      showError('business-name', 'business-name-error', 'Por favor ingresa el nombre de tu marca o rubro');
      hasError = true;
      if (!firstErrorElement) firstErrorElement = businessNameInput;
    }

    if (!data.product) {
      showError('star-product', 'star-product-error', 'Por favor indica cuál es tu producto o servicio estrella');
      hasError = true;
      if (!firstErrorElement) firstErrorElement = starProductInput;
    }

    if (!data.adBudget) {
      const budgetError = document.getElementById('ad-budget-error');
      if (budgetError) {
        budgetError.textContent = 'Selecciona tu situación actual respecto a la pauta';
      }
      hasError = true;
      if (!firstErrorElement) {
        const firstBudgetRadio = document.getElementById('budget-active');
        if (firstBudgetRadio) firstErrorElement = firstBudgetRadio;
      }
    }

    if (!data.timeline) {
      const timelineError = document.getElementById('launch-timeline-error');
      if (timelineError) {
        timelineError.textContent = 'Selecciona el plazo estimado de lanzamiento';
      }
      hasError = true;
      if (!firstErrorElement) {
        const firstTimelineRadio = document.getElementById('timeline-immediate');
        if (firstTimelineRadio) firstErrorElement = firstTimelineRadio;
      }
    }

    if (hasError) {
      if (firstErrorElement) {
        firstErrorElement.focus();
      }
      return;
    }

    // Build the final message exact string
    const finalMessage = `¡Hola! Estuve viendo el servicio de landings individuales y quiero consultar por mi producto:

* Nombre: ${data.name}
* Negocio / Rubro: ${data.business}
* Producto estrella: ${data.product}
* Estado de pauta: ${data.adBudget}
* Plazo estimado: ${data.timeline}

Me gustaría coordinar para evaluar el proyecto.`;

    const encodedText = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;

    // Redirect / open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  // -------------------------------------------------------------
  // 4. ACCESSIBLE FAQ ACCORDION
  // -------------------------------------------------------------
  function setupAccordion() {
    const triggers = document.querySelectorAll('.faq-trigger');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', function () {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const targetId = this.getAttribute('aria-controls');
        const content = document.getElementById(targetId);

        // Close other items (exclusive accordion)
        triggers.forEach(otherTrigger => {
          if (otherTrigger !== this) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            const otherTargetId = otherTrigger.getAttribute('aria-controls');
            const otherContent = document.getElementById(otherTargetId);
            if (otherContent) {
              otherContent.hidden = true;
            }
          }
        });

        // Toggle current
        this.setAttribute('aria-expanded', !isExpanded);
        if (content) {
          content.hidden = isExpanded;
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 5. LEGAL & LEAD MODALS & FOCUS MANAGEMENT
  // -------------------------------------------------------------
  let lastActiveElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    lastActiveElement = document.activeElement;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Auto-focus first input for qualifier modal, otherwise focus close button
    if (modalId === 'modal-qualifier' && leadNameInput) {
      setTimeout(() => leadNameInput.focus(), 60);
    } else {
      const closeBtn = modal.querySelector('.modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  }

  function setupModals() {
    // Generic open modal triggers (including all CTA buttons with data-open-modal)
    const openModalBtns = document.querySelectorAll('[data-open-modal]');
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const modalId = this.getAttribute('data-open-modal');
        if (modalId) {
          openModal(modalId);
        }
      });
    });

    const openPrivacyBtn = document.getElementById('open-privacy-btn');
    const openTermsBtn = document.getElementById('open-terms-btn');
    const openCookieSettingsBtn = document.getElementById('open-cookies-settings-btn');

    if (openPrivacyBtn) {
      openPrivacyBtn.addEventListener('click', () => openModal('modal-privacy'));
    }

    if (openTermsBtn) {
      openTermsBtn.addEventListener('click', () => openModal('modal-terms'));
    }

    if (openCookieSettingsBtn) {
      openCookieSettingsBtn.addEventListener('click', () => {
        if (cookieBanner) {
          cookieBanner.classList.remove('hidden');
          cookieBanner.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Close buttons
    const closeBtns = document.querySelectorAll('[data-close-modal]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const modalId = this.getAttribute('data-close-modal');
        const modal = document.getElementById(modalId);
        closeModal(modal);
      });
    });

    // Close on backdrop click
    const modals = document.querySelectorAll('.modal-backdrop');
    modals.forEach(modal => {
      modal.addEventListener('click', function (e) {
        if (e.target === this) {
          closeModal(this);
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop:not(.hidden)');
        if (activeModal) {
          closeModal(activeModal);
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 6. COOKIE CONSENT BANNER
  // -------------------------------------------------------------
  function setupCookieConsent() {
    const consent = localStorage.getItem('convertstar_cookie_consent');
    if (!consent && cookieBanner) {
      setTimeout(() => {
        cookieBanner.classList.remove('hidden');
      }, 1000);
    }

    if (cookieAcceptAll) {
      cookieAcceptAll.addEventListener('click', () => {
        localStorage.setItem('convertstar_cookie_consent', 'all');
        if (cookieBanner) cookieBanner.classList.add('hidden');
      });
    }

    if (cookieEssential) {
      cookieEssential.addEventListener('click', () => {
        localStorage.setItem('convertstar_cookie_consent', 'essential');
        if (cookieBanner) cookieBanner.classList.add('hidden');
      });
    }
  }

  // -------------------------------------------------------------
  // 7. MOBILE STICKY CTA (SHOW ON SCROLL)
  // -------------------------------------------------------------
  function setupMobileStickyBar() {
    if (!mobileStickyCta) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Show after scrolling past 350px, but hide when inside the qualifier section
          const scrollPos = window.scrollY || window.pageYOffset;
          const qualifierSection = document.getElementById('calificador');
          let isInQualifier = false;

          if (qualifierSection) {
            const rect = qualifierSection.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
              isInQualifier = true;
            }
          }

          if (scrollPos > 350 && !isInQualifier) {
            mobileStickyCta.classList.add('visible');
          } else {
            mobileStickyCta.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // -------------------------------------------------------------
  // 8. EVENT LISTENERS ATTACHMENT & INIT
  // -------------------------------------------------------------
  function init() {
    // Live preview updates
    if (leadNameInput) leadNameInput.addEventListener('input', updateWhatsAppPreview);
    if (businessNameInput) businessNameInput.addEventListener('input', updateWhatsAppPreview);
    if (starProductInput) starProductInput.addEventListener('input', updateWhatsAppPreview);

    adBudgetRadios.forEach(radio => {
      radio.addEventListener('change', handleBudgetChange);
    });

    launchTimelineRadios.forEach(radio => {
      radio.addEventListener('change', updateWhatsAppPreview);
    });

    // Form submission
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }

    // Component inits
    setupAccordion();
    setupModals();
    setupCookieConsent();
    setupMobileStickyBar();
    updateWhatsAppPreview();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const faqItems = document.querySelectorAll('.faq-item');
const form = document.getElementById('quote-form');
const quickQuoteForm = document.getElementById('quick-quote');
const yearNode = document.getElementById('year');
const mobileActions = document.querySelector('.mobile-actions');
const heroActions = document.querySelector('.hero-actions');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const mobileCallViewport = window.matchMedia('(max-width: 760px)');
document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!mobileCallViewport.matches) {
      event.preventDefault();
    }
  });
});

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (mobileActions && heroActions) {
  const mobileViewport = window.matchMedia('(max-width: 760px)');
  const quoteAreas = [quickQuoteForm, form].filter((area) => area instanceof HTMLElement);
  const nearbyQuoteAreas = new Set();
  let heroActionsVisible = false;

  const updateMobileActions = () => {
    const activeElement = document.activeElement;
    const isEditingForm = activeElement instanceof HTMLElement
      && activeElement.matches('input, select, textarea');
    const isMenuOpen = mobileMenu?.classList.contains('is-open') ?? false;
    const shouldShow = mobileViewport.matches
      && !heroActionsVisible
      && nearbyQuoteAreas.size === 0
      && !isMenuOpen
      && !isEditingForm;

    mobileActions.classList.toggle('is-visible', shouldShow);
    document.body.classList.toggle('mobile-actions-active', shouldShow);
  };

  if ('IntersectionObserver' in window) {
    const heroActionsObserver = new IntersectionObserver(
      ([entry]) => {
        heroActionsVisible = entry.isIntersecting && entry.intersectionRatio >= 0.9;
        updateMobileActions();
      },
      { threshold: [0, 0.9, 1] }
    );
    heroActionsObserver.observe(heroActions);

    const quoteAreasObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            nearbyQuoteAreas.add(entry.target);
          } else {
            nearbyQuoteAreas.delete(entry.target);
          }
        });
        updateMobileActions();
      },
      { rootMargin: '180px 0px' }
    );
    quoteAreas.forEach((area) => quoteAreasObserver.observe(area));
  } else {
    const updateHeroActionsVisibility = () => {
      const bounds = heroActions.getBoundingClientRect();
      heroActionsVisible = bounds.top >= 0 && bounds.bottom <= window.innerHeight;
      nearbyQuoteAreas.clear();
      quoteAreas.forEach((area) => {
        const quoteBounds = area.getBoundingClientRect();
        if (quoteBounds.bottom >= -180 && quoteBounds.top <= window.innerHeight + 180) {
          nearbyQuoteAreas.add(area);
        }
      });
      updateMobileActions();
    };
    window.addEventListener('scroll', updateHeroActionsVisibility, { passive: true });
    window.addEventListener('resize', updateHeroActionsVisibility);
    updateHeroActionsVisibility();
  }

  document.addEventListener('focusin', updateMobileActions);
  document.addEventListener('focusout', () => window.requestAnimationFrame(updateMobileActions));
  mobileViewport.addEventListener('change', updateMobileActions);
  navToggle?.addEventListener('click', () => window.setTimeout(updateMobileActions));
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => window.setTimeout(updateMobileActions));
  });
  updateMobileActions();
}

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');

  if (!button) return;

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    faqItems.forEach((faqItem) => {
      faqItem.classList.remove('is-open');
      const nextButton = faqItem.querySelector('.faq-question');
      if (nextButton) {
        nextButton.setAttribute('aria-expanded', 'false');
      }
    });

    if (!isOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

document.querySelectorAll('.story-accordion').forEach((accordion) => {
  accordion.querySelectorAll('details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      accordion.querySelectorAll('details').forEach((otherDetail) => {
        if (otherDetail !== detail) {
          otherDetail.open = false;
        }
      });
    });
  });
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

function setFieldError(field, message) {
  const errorNode = field.parentElement.querySelector('.error-message');
  field.classList.toggle('invalid', Boolean(message));
  if (errorNode) {
    errorNode.textContent = message || '';
  }
}

function sanitizeText(value) {
  return value.trim();
}

if (quickQuoteForm && form) {
  quickQuoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const quickFields = [
      ['#quick-move-type', '#move-type'],
      ['#quick-move-date', '#move-date'],
      ['#quick-from', '#moving-from'],
      ['#quick-to', '#moving-to']
    ];

    quickFields.forEach(([quickSelector, fullSelector]) => {
      const quickField = document.querySelector(quickSelector);
      const fullField = document.querySelector(fullSelector);
      if (quickField && fullField && quickField.value.trim()) {
        fullField.value = quickField.value.trim();
        setFieldError(fullField, '');
      }
    });

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const firstNameField = document.querySelector('#first-name');
      if (firstNameField) firstNameField.focus({ preventScroll: true });
    }, 400);
  });
}

if (form) {
  const requiredFields = [
    { name: 'firstName', selector: '#first-name', message: 'Please enter your first name.' },
    { name: 'lastName', selector: '#last-name', message: 'Please enter your last name.' },
    { name: 'email', selector: '#email', message: 'Please enter a valid email address.' },
    { name: 'phone', selector: '#phone', message: 'Please enter a valid phone number.' },
    { name: 'movingFrom', selector: '#moving-from', message: 'Please provide the pickup location.' },
    { name: 'movingTo', selector: '#moving-to', message: 'Please provide the destination location.' },
    { name: 'moveType', selector: '#move-type', message: 'Please select a move type.' },
    { name: 'moveDate', selector: '#move-date', message: 'Please select a move date.' },
    { name: 'propertyType', selector: '#property-type', message: 'Please select a property type.' },
    { name: 'bedrooms', selector: '#bedrooms', message: 'Please select the number of bedrooms.' }
  ];

  requiredFields.forEach(({ selector }) => {
    const field = document.querySelector(selector);
    if (field) {
      field.addEventListener('input', () => {
        if (field.value.trim() !== '') {
          setFieldError(field, '');
        }
      });
      field.addEventListener('change', () => {
        setFieldError(field, '');
      });
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formStatus = document.querySelector('.form-status');
    let isValid = true;

    requiredFields.forEach(({ selector, message }) => {
      const field = document.querySelector(selector);
      if (!field) return;

      const value = sanitizeText(field.value);
      if (!value) {
        setFieldError(field, message);
        isValid = false;
        return;
      }

      if (field.id === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          setFieldError(field, 'Please enter a valid email address.');
          isValid = false;
          return;
        }
      }

      if (field.id === 'phone') {
        const phonePattern = /^[\d\s()+-]{7,}$/;
        if (!phonePattern.test(value)) {
          setFieldError(field, 'Please enter a valid phone number.');
          isValid = false;
          return;
        }
      }

      setFieldError(field, '');
    });

    if (!isValid) {
      if (formStatus) {
        formStatus.textContent = 'Please fix the highlighted fields and try again.';
        formStatus.className = 'form-status error';
      }
      return;
    }

    if (formStatus) {
    // Here put the code for the form integration with the backend, e.g., sending the form data to a server.
      formStatus.textContent = 'Thanks! Your request has been prepared. A quote request will be sent once your backend is connected.';
      formStatus.className = 'form-status success';
    }

    form.reset();
    document.querySelectorAll('.error-message').forEach((message) => {
      message.textContent = '';
    });
    document.querySelectorAll('input, select, textarea').forEach((field) => {
      field.classList.remove('invalid');
    });
  });
}

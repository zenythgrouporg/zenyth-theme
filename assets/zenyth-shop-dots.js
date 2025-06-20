/**
 * Complex Focus Management System for Shop Dots
 * 
 * This script handles sophisticated focus and interaction management for shop dots:
 * - Manages keyboard navigation (Enter, Space, Escape)
 * - Handles hover states with debouncing
 * - Implements focus trapping and proper ARIA attributes
 * - Manages card positioning based on available viewport space
 * - Handles click-outside behavior
 * - Maintains accessibility compliance
 * - Uses Shopify's function-based approach for customize compatibility
 */

// Global state management
let shopDotsState = {
  activeButton: null,
  hoverTimeout: null,
  escPressedDots: new Set(),
  initialized: false
};

// Function to position card
function positionCard(dot) {
  const card = dot.querySelector('.znt-shopdots_card');
  const container = dot.closest('.znt-shopdots');
  const dotRect = dot.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const tokenSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--znt-shopdots-token-size')) || 60;

  // Reset any previous positioning
  card.style.left = '';
  card.style.right = '';
  card.style.top = '';
  card.style.bottom = '';

  // Check if we're on a smaller screen (mobile/tablet)
  const isSmallScreen = window.innerWidth <= 768;

  if (isSmallScreen) {
    // Mobile positioning: always position below the dot
    card.style.top = '100%';
    
    // Calculate horizontal positioning to avoid hitting edges
    const spaceRight = containerRect.right - dotRect.left;
    const spaceLeft = dotRect.right - containerRect.left;
    
    if (spaceRight >= cardRect.width) {
      card.style.left = '0';
    } else if (spaceLeft >= cardRect.width) {
      card.style.right = '0';
    } else {
      // If not enough space on either side, position based on available space
      if (spaceRight > spaceLeft) {
        card.style.left = '0';
      } else {
        card.style.right = '0';
      }
    }
  } else {
    // Desktop positioning
    const spaceRight = containerRect.right - dotRect.right;
    const spaceLeft = dotRect.left - containerRect.left;
    const spaceTop = dotRect.top - containerRect.top;
    const spaceBottom = containerRect.bottom - dotRect.bottom;

    // Position horizontally
    if (spaceRight >= cardRect.width) {
      card.style.left = tokenSize + 'px';
    } else if (spaceLeft >= cardRect.width) {
      card.style.right = tokenSize + 'px';
    } else {
      if (spaceRight > spaceLeft) {
        card.style.left = tokenSize + 'px';
      } else {
        card.style.right = tokenSize + 'px';
      }
    }

    // Position vertically
    if (spaceBottom >= cardRect.height) {
      card.style.top = '0';
    } else if (spaceTop >= cardRect.height) {
      card.style.bottom = '0';
    } else {
      if (spaceBottom > spaceTop) {
        card.style.top = '0';
      } else {
        card.style.bottom = '0';
      }
    }
  }
}

// Function to close all cards
function closeAllCards() {
  const dots = document.querySelectorAll('.znt-shopdots_dot');
  dots.forEach(dot => {
    const button = dot.querySelector('.znt-shopdots_token');
    if (button) {
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

// Function to handle card toggle
function toggleCard(dot, button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  closeAllCards();
  if (!isExpanded) {
    button.setAttribute('aria-expanded', 'true');
    positionCard(dot);
    shopDotsState.activeButton = button;
  } else {
    shopDotsState.activeButton = null;
  }
}

// Function to handle hover state
function handleHover(dot, button, isEnter) {
  if (shopDotsState.hoverTimeout) {
    clearTimeout(shopDotsState.hoverTimeout);
    shopDotsState.hoverTimeout = null;
  }

  if (isEnter) {
    if (!shopDotsState.activeButton && !shopDotsState.escPressedDots.has(dot)) {
      button.setAttribute('aria-expanded', 'true');
      positionCard(dot);
    }
  } else {
    if (button !== shopDotsState.activeButton) {
      button.setAttribute('aria-expanded', 'false');
    }
    shopDotsState.escPressedDots.delete(dot);
  }
}

// Function to initialize a single dot
function initializeDot(dot) {
  // Check if already initialized
  if (dot.dataset.shopDotsInitialized === 'true') {
    return;
  }

  // Convert token to button if not already done
  const token = dot.querySelector('.znt-shopdots_token');
  if (token && token.tagName !== 'BUTTON') {
    const button = document.createElement('button');
    button.className = token.className;
    
    // Copy all attributes from token to button
    Array.from(token.attributes).forEach(attr => {
      button.setAttribute(attr.name, attr.value);
    });
    
    token.parentNode.replaceChild(button, token);
  }

  const button = dot.querySelector('.znt-shopdots_token');
  if (!button) return;

  // Store event handlers as properties so we can remove them later
  const clickHandler = (e) => {
    e.preventDefault();
    toggleCard(dot, button);
  };

  const keydownHandler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard(dot, button);
    }
  };

  const mouseenterHandler = () => handleHover(dot, button, true);
  const mouseleaveHandler = () => handleHover(dot, button, false);
  const focusHandler = () => positionCard(dot);
  
  const focusoutHandler = (e) => {
    if (!dot.contains(e.relatedTarget)) {
      button.setAttribute('aria-expanded', 'false');
      shopDotsState.activeButton = null;
    }
  };

  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      button.setAttribute('aria-expanded', 'false');
      shopDotsState.activeButton = null;
      button.focus();
    }
  };

  // Store handlers on the element for later removal
  button._shopDotsHandlers = {
    click: clickHandler,
    keydown: keydownHandler,
    focus: focusHandler
  };

  dot._shopDotsHandlers = {
    mouseenter: mouseenterHandler,
    mouseleave: mouseleaveHandler,
    focusout: focusoutHandler,
    keydown: escapeHandler
  };

  // Add click handler
  button.addEventListener('click', clickHandler);

  // Add keydown handler for Enter key
  button.addEventListener('keydown', keydownHandler);

  // Add hover handlers
  dot.addEventListener('mouseenter', mouseenterHandler);
  dot.addEventListener('mouseleave', mouseleaveHandler);

  // Add focus handler for positioning
  button.addEventListener('focus', focusHandler);

  // Add focusout handler to close when focus leaves the dot
  dot.addEventListener('focusout', focusoutHandler);

  // Add keydown handler for ESC key
  dot.addEventListener('keydown', escapeHandler);

  // Mark as initialized
  dot.dataset.shopDotsInitialized = 'true';
  if (!dot.dataset.shopDotsId) {
    dot.dataset.shopDotsId = 'shop-dots-' + Math.random().toString(36).substr(2, 9);
  }
}

// Function to remove event listeners from a dot
function removeDotEventListeners(dot) {
  const button = dot.querySelector('.znt-shopdots_token');
  
  if (button && button._shopDotsHandlers) {
    Object.entries(button._shopDotsHandlers).forEach(([event, handler]) => {
      button.removeEventListener(event, handler);
    });
    delete button._shopDotsHandlers;
  }

  if (dot._shopDotsHandlers) {
    Object.entries(dot._shopDotsHandlers).forEach(([event, handler]) => {
      dot.removeEventListener(event, handler);
    });
    delete dot._shopDotsHandlers;
  }

  // Remove initialization flag
  delete dot.dataset.shopDotsInitialized;
}

// Function to initialize all shop dots
function initializeShopDots() {
  const dots = document.querySelectorAll('.znt-shopdots_dot');
  
  dots.forEach((dot, index) => {
    if (!dot.dataset.shopDotsId) {
      dot.dataset.shopDotsId = 'shop-dots-' + index + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    // Remove any existing event listeners first
    removeDotEventListeners(dot);
    
    // Initialize the dot
    initializeDot(dot);
  });

  // Position cards initially
  dots.forEach(positionCard);
}

// Function to handle global events
function setupGlobalEvents() {
  // Remove existing listeners to prevent duplicates
  document.removeEventListener('keydown', handleGlobalKeydown);
  document.removeEventListener('click', handleGlobalClick);
  window.removeEventListener('resize', handleResize);

  // Handle ESC key globally
  document.addEventListener('keydown', handleGlobalKeydown);

  // Handle clicks outside
  document.addEventListener('click', handleGlobalClick);

  // Position cards on window resize
  window.addEventListener('resize', handleResize);
}

function handleGlobalKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    const hoveredDot = document.querySelector('.znt-shopdots_dot:hover');
    if (hoveredDot) {
      const button = hoveredDot.querySelector('.znt-shopdots_token');
      if (button) {
        button.setAttribute('aria-expanded', 'false');
        shopDotsState.escPressedDots.add(hoveredDot);
      }
    }
    if (shopDotsState.activeButton) {
      shopDotsState.activeButton.setAttribute('aria-expanded', 'false');
      shopDotsState.activeButton.focus();
      shopDotsState.activeButton = null;
    }
  }
}

function handleGlobalClick(e) {
  if (!e.target.closest('.znt-shopdots_dot')) {
    closeAllCards();
    shopDotsState.activeButton = null;
  }
}

function handleResize() {
  const dots = document.querySelectorAll('.znt-shopdots_dot');
  dots.forEach(positionCard);
}

// Main initialization function (Shopify-style)
function initShopDots() {
  // Reset state
  shopDotsState.activeButton = null;
  shopDotsState.hoverTimeout = null;
  shopDotsState.escPressedDots.clear();

  // Initialize shop dots
  initializeShopDots();
  
  // Setup global events
  setupGlobalEvents();

  shopDotsState.initialized = true;
}

// Initialize viewport detection
function initViewportDetection() {
  const shopDotsSections = document.querySelectorAll('.znt-shopdots');

  // Create an Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('znt-in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Start observing all shop dots sections
  shopDotsSections.forEach(section => {
    observer.observe(section);
  });
}

// Initialize everything
function init() {
  initShopDots();
  initViewportDetection();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-initialize on Shopify section updates (for customize mode)
if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    // Only re-init if the section contains shop dots
    if (event.target.querySelector && event.target.querySelector('.znt-shopdots')) {
      setTimeout(init, 50);
    }
  });
  
  document.addEventListener('shopify:section:reorder', () => {
    setTimeout(init, 50);
  });
  
  document.addEventListener('shopify:block:select', (event) => {
    // Only re-init if the block is related to shop dots
    if (event.target.querySelector && event.target.querySelector('.znt-shopdots')) {
      setTimeout(init, 50);
    }
  });
  
  // Also listen for section unload to clean up
  document.addEventListener('shopify:section:unload', (event) => {
    const dots = event.target.querySelectorAll('.znt-shopdots_dot');
    dots.forEach(removeDotEventListeners);
  });
}

// Also listen for general DOM changes that might indicate customize updates
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    let shouldReinit = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check added nodes
        for (let node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList && node.classList.contains('znt-shopdots')) {
              shouldReinit = true;
              break;
            }
            if (node.querySelector && node.querySelector('.znt-shopdots')) {
              shouldReinit = true;
              break;
            }
          }
        }
        
        // Check removed nodes
        for (let node of mutation.removedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList && node.classList.contains('znt-shopdots')) {
              shouldReinit = true;
              break;
            }
            if (node.querySelector && node.querySelector('.znt-shopdots')) {
              shouldReinit = true;
              break;
            }
          }
        }
      }
    });
    
    if (shouldReinit) {
      // Debounce re-initialization
      clearTimeout(window.shopDotsReinitTimeout);
      window.shopDotsReinitTimeout = setTimeout(init, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Export for potential external use
if (typeof window !== 'undefined') {
  window.initShopDots = initShopDots;
  window.initViewportDetection = initViewportDetection;
} 
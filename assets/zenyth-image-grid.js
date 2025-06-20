/**
 * ZenythADK Dialog Component
 * Implements accessible dialogs according to WAI-ARIA guidelines
 * Based on: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/
 */

class ZntDialog {
  constructor() {
    this.initialized = false;
    this.activeTrigger = null;
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    this.moveDialogsToBodyEnd();
    this.setupTriggers();
    this.initialized = true;
  } 
  
  moveDialogsToBodyEnd() {
    const backdrops = document.querySelectorAll('.znt-dialog_backdrop');
    const containers = document.querySelectorAll('.znt-dialog_container');
    
    backdrops.forEach(backdrop => {
      if (!document.body.contains(backdrop)) {
        document.body.appendChild(backdrop);
      }
    });
    
    containers.forEach(container => {
      if (!document.body.contains(container)) {
        document.body.appendChild(container);
      }
    });
  }
  
  setupTriggers() {
    const triggers = document.querySelectorAll('.znt-dialog_trigger');
    
    triggers.forEach(trigger => {
      if (trigger.hasAttribute('data-znt-dialog-initialized')) return;
      
      const sectionId = trigger.getAttribute('data-section');
      const backdrop = document.querySelector(`.znt-dialog_backdrop[data-section="${sectionId}"]`);
      const container = document.querySelector(`.znt-dialog_container[data-section="${sectionId}"]`);
      const closeBtn = container ? container.querySelector('.znt-dialog_close') : null;
      
      if (!backdrop || !container) return;
      
      const dialogData = {
        backdrop,
        container,
        closeBtn,
        trigger: trigger
      };
      
      trigger.setAttribute('data-znt-dialog-initialized', 'true');
      
      const openDialogHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.activeTrigger = trigger;
        this.openDialog(trigger, dialogData);
      };
      
      trigger.addEventListener('click', openDialogHandler);
      
      if (closeBtn) {
        const closeDialogHandler = () => {
          this.closeDialog(trigger, dialogData);
        };
        closeBtn.addEventListener('click', closeDialogHandler);
      }
      
      const backdropClickHandler = () => {
        this.closeDialog(trigger, dialogData);
      };
      backdrop.addEventListener('click', backdropClickHandler);
      
      const containerClickHandler = (e) => {
        e.stopPropagation();
      };
      container.addEventListener('click', containerClickHandler);
    });
    
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        const openContainer = document.querySelector('.znt-dialog_container.znt--open');
        if (openContainer && this.activeTrigger) {
          // Immediately focus the specific trigger that opened this dialog
          this.activeTrigger.focus();
          
          const dialogData = {
            backdrop: document.querySelector(`.znt-dialog_backdrop[data-section="${this.activeTrigger.getAttribute('data-section')}"]`),
            container: openContainer,
            trigger: this.activeTrigger
          };
          this.closeDialog(this.activeTrigger, dialogData);
        }
      }
    };
    
    document.removeEventListener('keydown', this._escHandler);
    document.addEventListener('keydown', escHandler);
    this._escHandler = escHandler;
  }
  
  openDialog(trigger, dialogData) {
    const { backdrop, container } = dialogData;
    
    if (!backdrop || !container) return;
    
    backdrop.classList.add('znt--open');
    container.classList.add('znt--open');
    document.body.classList.add('znt-dialog-open');
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length) {
      focusableElements[0].focus();
    }
    
    const trapFocusHandler = this.trapFocus.bind(this, container);
    container.removeEventListener('keydown', container._trapFocusHandler);
    container.addEventListener('keydown', trapFocusHandler);
    container._trapFocusHandler = trapFocusHandler;
  }
  
  closeDialog(trigger, dialogData) {
    const { backdrop, container } = dialogData;
    
    if (!backdrop || !container) return;
    
    backdrop.classList.remove('znt--open');
    container.classList.remove('znt--open');
    document.body.classList.remove('znt-dialog-open');
    
    if (this.activeTrigger) {
      this.activeTrigger.focus();
      this.activeTrigger = null;
    }
    
    container.removeEventListener('keydown', container._trapFocusHandler);
  }
  
  trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
}

try {
  window.zntDialog = new ZntDialog();
} catch (e) {
  console.error('Error initializing ZntDialog:', e);
} 


 /**
   * Zenyth Image Grid - Maintains aspect ratio for image wrappers
   */
 document.addEventListener('DOMContentLoaded', function() {
  var imageGrid = {
    imageWrappers: document.querySelectorAll('.znt-image-grid__image-wrapper'),
    aspectRatio: '{{ section.settings.aspect_ratio }}',
    
    init: function() {
      // Set initial dimensions
      this.setSquareHeight();

      // Re-adjust on resize
      var self = this;
      window.addEventListener('resize', function() {
        clearTimeout(self.resizeTimer);
        self.resizeTimer = setTimeout(function() {
          self.setSquareHeight();
        }, 250);
      });
    },

    setSquareHeight: function() {
      // Make sure we have wrapper elements
      if (this.imageWrappers.length === 0) {
        this.imageWrappers = document.querySelectorAll('.znt-image-grid__image-wrapper');
        if (this.imageWrappers.length === 0) return;
      }
      
      var self = this;
      for (var i = 0; i < this.imageWrappers.length; i++) {
        var wrapper = this.imageWrappers[i];
        var width = wrapper.offsetWidth;
        
        // Only set height if we have a valid width
        if (width > 0) {
          if (self.aspectRatio === 'landscape') {
            // 4:3 aspect ratio (75% of width)
            wrapper.style.height = width * 0.75 + 'px';
          } else {
            // 1:1 square aspect ratio
            wrapper.style.height = width + 'px';
          }
        }
      }
    }
  };

  // Initialize
  imageGrid.init();
  
  // Run again after a small delay to ensure elements are fully rendered
  setTimeout(function() {
    imageGrid.setSquareHeight();
  }, 300);
});

// Initialize immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  var imageWrappers = document.querySelectorAll('.znt-image-grid__image-wrapper');
  var aspectRatio = '{{ section.settings.aspect_ratio }}';
  
  // Apply height to all image wrappers
  if (imageWrappers.length > 0) {
    for (var i = 0; i < imageWrappers.length; i++) {
      var wrapper = imageWrappers[i];
      var width = wrapper.offsetWidth;
      
      // Only set height if we have a valid width
      if (width > 0) {
        if (aspectRatio === 'landscape') {
          // 4:3 aspect ratio (75% of width)
          wrapper.style.height = width * 0.75 + 'px';
        } else {
          // 1:1 square aspect ratio
          wrapper.style.height = width + 'px';
        }
      }
    }
  }
}

/**
 * Dialog Carousel - Enhance ZntDialog with carousel functionality
 */

  // This code will run after the ZntDialog component is initialized
  if (window.zntDialog) {
    // Store the original openDialog function
    const originalOpenDialog = window.zntDialog.openDialog;
    
    // Override the openDialog function to add carousel functionality
    window.zntDialog.openDialog = function(trigger, dialogData) {
      // Call the original function first
      originalOpenDialog.call(this, trigger, dialogData);
      
      // Get the slide index from the trigger
      const slideIndex = parseInt(trigger.getAttribute('data-slide-index'), 10);
      const container = dialogData.container;
      
      // Initialize slider controls with the correct slide index
      initializeDialogSliderControls(container, slideIndex);
    };
  }

function initializeDialogSliderControls(container, initialSlideIndex = 0) {
  const sliderComponent = container.querySelector('slider-component');
  if (!sliderComponent) return;
  
  const prevButton = container.querySelector('.slider-button--prev');
  const nextButton = container.querySelector('.slider-button--next');
  const slider = container.querySelector('.slider');
  const liveRegion = container.querySelector('.znt-dialog-live-region');
  const slides = slider.querySelectorAll('.znt-dialog-slide');
  const totalSlides = slides.length;
  
  if (!prevButton || !nextButton || !slider) return;
  
  // Clear any existing listeners to prevent duplicates
  prevButton.replaceWith(prevButton.cloneNode(true));
  nextButton.replaceWith(nextButton.cloneNode(true));
  
  // Get the fresh references
  const newPrevButton = container.querySelector('.slider-button--prev');
  const newNextButton = container.querySelector('.slider-button--next');

  // Function to get current slide index
  function getCurrentSlideIndex() {
    return Math.round(slider.scrollLeft / slider.clientWidth);
  }

  // Function to scroll to a specific slide
  function scrollToSlide(index, behavior = 'smooth') {
    const targetScroll = index * slider.clientWidth;
    slider.scrollTo({
      left: targetScroll,
      behavior: behavior
    });
  }

  // Function to update button states
  function updateButtonStates() {
    const currentIndex = getCurrentSlideIndex();
    const isAtStart = currentIndex === 0;
    const isAtEnd = currentIndex === totalSlides - 1;
    
    // Handle previous button
    if (isAtStart) {
      if (document.activeElement === newPrevButton) {
        newNextButton.focus();
      }
      setTimeout(() => {
        newPrevButton.disabled = true;
        newPrevButton.style.opacity = '0.5';
        newPrevButton.style.cursor = 'not-allowed';
      }, 1000);
    } else {
      newPrevButton.disabled = false;
      newPrevButton.style.opacity = '1';
      newPrevButton.style.cursor = 'pointer';
    }
    
    // Handle next button
    if (isAtEnd) {
      if (document.activeElement === newNextButton) {
        newPrevButton.focus();
      }
      setTimeout(() => {
        newNextButton.disabled = true;
        newNextButton.style.opacity = '0.5';
        newNextButton.style.cursor = 'not-allowed';
      }, 1000);
    } else {
      newNextButton.disabled = false;
      newNextButton.style.opacity = '1';
      newNextButton.style.cursor = 'pointer';
    }

    // Update live region with current slide position
    liveRegion.textContent = `Slide ${currentIndex + 1} of ${totalSlides}`;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  // Initialize the slider position and update button states
  requestAnimationFrame(() => {
    // Use instant behavior for initial positioning
    scrollToSlide(initialSlideIndex, 'instant');
    updateButtonStates();
  });
  
  // Add click event listeners for navigation
  newPrevButton.addEventListener('click', () => {
    if (!newPrevButton.disabled) {
      const currentIndex = getCurrentSlideIndex();
      scrollToSlide(currentIndex - 1);
      setTimeout(() => {
        updateButtonStates();
      }, 500);
    }
  });
  
  newNextButton.addEventListener('click', () => {
    if (!newNextButton.disabled) {
      const currentIndex = getCurrentSlideIndex();
      scrollToSlide(currentIndex + 1);
      setTimeout(() => {
        updateButtonStates();
      }, 500);
    }
  });

  // Add scroll event listener to update button states
  let scrollTimeout;
  slider.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      updateButtonStates();
    }, 50);
  });

  // Add resize observer to handle window resizing
  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(() => {
      const currentIndex = getCurrentSlideIndex();
      scrollToSlide(currentIndex, 'instant');
      updateButtonStates();
    });
  });
  resizeObserver.observe(slider);
}
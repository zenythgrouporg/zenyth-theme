document.addEventListener("DOMContentLoaded", function () {

  // Add the trapFocusZenyth function at the beginning of the DOMContentLoaded event handler
  // Function to get focusable elements inside a container
  function getZenythFocusableElements(container) {
    const elements = Array.from(
      container.querySelectorAll(
        "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
      )
    );
    return elements;
  }

  // Object to store trap focus event handlers
  const zenythTrapFocusHandlers = {};

  // Function to remove trap focus handlers
  function removeZenythTrapFocus(elementToFocus = null) {
    document.removeEventListener("focusin", zenythTrapFocusHandlers.focusin);
    document.removeEventListener("focusout", zenythTrapFocusHandlers.focusout);
    document.removeEventListener("keydown", zenythTrapFocusHandlers.keydown);

    if (elementToFocus) elementToFocus.focus();
  }

  // Function to trap focus within a container
  function trapZenythFocus(container, elementToFocus = container) {
    var elements = getZenythFocusableElements(container);

    // Check if we have focusable elements
    if (!elements || elements.length === 0) {
      return;
    }

    var first = elements[0];
    var last = elements[elements.length - 1];

    // Remove any existing trap focus before setting up a new one
    removeZenythTrapFocus();

    // Set a data attribute to mark this container as having an active focus trap
    container.setAttribute('data-znt-focus-trapped', 'true');

    zenythTrapFocusHandlers.focusin = (event) => {
      try {
        // Always attach keydown handler when focus is inside the container
        if (container.contains(event.target)) {
          document.addEventListener("keydown", zenythTrapFocusHandlers.keydown);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    zenythTrapFocusHandlers.focusout = function (event) {
      try {
        // Check if the new focus target is still inside the container
        const stillInContainer = event.relatedTarget && container.contains(event.relatedTarget);

        if (!stillInContainer) {
          document.removeEventListener("keydown", zenythTrapFocusHandlers.keydown);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    zenythTrapFocusHandlers.keydown = function (event) {
      try {
        if (event.code.toUpperCase() !== "TAB") {
          return; // If not TAB key
        }

        // Re-query the focusable elements to ensure we have the latest
        var updatedElements = getZenythFocusableElements(container);

        // Check if we still have focusable elements
        if (!updatedElements || updatedElements.length === 0) {
          return;
        }

        var updatedFirst = updatedElements[0];
        var updatedLast = updatedElements[updatedElements.length - 1];

        // On the last focusable element and tab forward, focus the first element.
        if (event.target === updatedLast && !event.shiftKey) {
          event.preventDefault();
          updatedFirst.focus();
          return;
        }

        //  On the first focusable element and tab backward, focus the last element.
        if (event.target === updatedFirst && event.shiftKey) {
          event.preventDefault();
          updatedLast.focus();
          return;
        }

        // If focus is on the container itself and tabbing backward, go to last element
        if (event.target === container && event.shiftKey) {
          event.preventDefault();
          updatedLast.focus();
          return;
        }
      } catch (error) {
        // If there's an error, release the focus trap to prevent locking user
        document.removeEventListener("keydown", zenythTrapFocusHandlers.keydown);
      }
    };

    // Always attach the event listeners
    document.addEventListener("focusout", zenythTrapFocusHandlers.focusout);
    document.addEventListener("focusin", zenythTrapFocusHandlers.focusin);
    // Immediately attach the keydown listener since we're starting with focus in the container
    document.addEventListener("keydown", zenythTrapFocusHandlers.keydown);

    if (elementToFocus) {
      try {
        elementToFocus.focus();

        if (
          elementToFocus.tagName === "INPUT" &&
          ["search", "text", "email", "url"].includes(elementToFocus.type) &&
          elementToFocus.value
        ) {
          elementToFocus.setSelectionRange(0, elementToFocus.value.length);
        }
      } catch (error) {
        // Silent error handling
      }
    }
  }

  // Function to set up the focus trap for elements with znt-focus-trap class
  function setupZenythFocusTrap() {
    const trapElements = document.querySelectorAll('.znt-focus-trap');

    // Create a direct event listener to track the ESC key for closing popups
    document.addEventListener('keydown', function (event) {
      try {
        if (event.key === 'Escape' || event.key === 'Esc') {
          const activeTrap = document.querySelector('[data-znt-focus-trapped="true"]');
          if (activeTrap) {
            // Find a close button if available
            const closeButton = activeTrap.querySelector('.znt-disclosure_close, [aria-label="Close"]');
            if (closeButton) {
              closeButton.click();
            }
          }
        }
      } catch (error) {
        // Silent error handling
      }
    });

    // Watch for class changes on body to detect when modals/panels might be opened
    const bodyObserver = new MutationObserver(function (mutations) {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Check for any visible trap elements
          trapElements.forEach(container => {
            const isVisible = window.getComputedStyle(container).display !== 'none' &&
              window.getComputedStyle(container).visibility !== 'hidden';

            if (isVisible && !container.hasAttribute('data-znt-focus-trapped')) {
              trapZenythFocus(container);
            }
          });
        }
      });
    });

    // Start observing body class changes
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    trapElements.forEach(container => {
      try {
        // Create a Mutation Observer to detect both class changes and content changes
        const observer = new MutationObserver(mutations => {
          try {
            // Check if the element has the open class or is visible
            const hasOpenClass = container.classList.contains('znt--open');
            const isVisible = window.getComputedStyle(container).display !== 'none' &&
              window.getComputedStyle(container).visibility !== 'hidden';

            if (hasOpenClass || isVisible) {
              // Reapply the focus trap with the new content
              trapZenythFocus(container);
            } else {
              container.removeAttribute('data-znt-focus-trapped');
              removeZenythTrapFocus();
            }
          } catch (error) {
            // Silent error handling
          }
        });

        // Start observing the element for class changes AND content changes
        observer.observe(container, {
          attributes: true,
          attributeFilter: ['class', 'style', 'aria-hidden'],
          childList: true,
          subtree: true
        });

        // Also check initial state
        const isVisible = window.getComputedStyle(container).display !== 'none' &&
          window.getComputedStyle(container).visibility !== 'hidden';

        if (isVisible) {
          trapZenythFocus(container);
        }

        // Also listen for clicks on any buttons that might open the panel
        document.querySelectorAll('.znt-disclosure_button').forEach(button => {
          if (button.getAttribute('aria-controls') === container.id) {
            button.addEventListener('click', function () {
              // Use setTimeout to allow the panel to become visible first
              setTimeout(function () {
                const isNowVisible = window.getComputedStyle(container).display !== 'none';
                if (isNowVisible) {
                  trapZenythFocus(container);
                }
              }, 50);
            });
          }
        });

        // Listen for the panel being added to the tabindex (which often happens when panels open)
        if (container.getAttribute('tabindex') === '-1') {
          container.addEventListener('focus', function () {
            trapZenythFocus(container);
          });
        }

        // Add event listener for when the panel opens (if it's a disclosure panel)
        container.addEventListener('transitionend', function (event) {
          try {
            const isOpen = container.classList.contains('znt--open') ||
              !!container.closest('.znt--open') ||
              window.getComputedStyle(container).display !== 'none';

            if (isOpen) {
              trapZenythFocus(container);
            } else {
              container.removeAttribute('data-znt-focus-trapped');
              removeZenythTrapFocus();
            }
          } catch (error) {
            // Silent error handling
          }
        });
      } catch (error) {
        // Silent error handling
      }
    });
  }

  // Call setupZenythFocusTrap on DOMContentLoaded
  setupZenythFocusTrap();

  // Base aria-expanded toggler
  document.querySelectorAll(".znt-disclosure_button").forEach(function (button) {
    button.addEventListener("click", function () {
      let expanded = button.getAttribute("aria-expanded") === "true";
      let togglePanel = button.closest(".znt-disclosure").querySelector(".znt-disclosure_panel");

      button.setAttribute("aria-expanded", !expanded);
      togglePanel.classList.toggle("znt--open", !expanded);

      // Add search focus management
      if (button.closest(".znt-disclosure").hasAttribute("manage-search-focus") && !expanded) {
        setTimeout(() => {
          const searchInput = togglePanel.querySelector("#Search-In-Modal");
          if (searchInput) {
            searchInput.focus();
          }
        }, 300);
      }
    });
  });

  // ESC Key implementation
  document.addEventListener("keyup", function (e) {
    if (e.key === "Escape") {
      let activeElement = document.activeElement;
      let focusedWithinPanel = [...document.querySelectorAll(".znt-disclosure_panel")].some(panel => panel.contains(activeElement));

      if (focusedWithinPanel) {
        let panel = activeElement.closest(".znt-disclosure_panel");
        let button = panel.previousElementSibling;

        if (button && button.classList.contains("znt-disclosure_button")) {
          button.setAttribute("aria-expanded", "false");
          panel.classList.remove("znt--open");
          button.focus();
        }
      } else {
        document.querySelectorAll(".znt-disclosure_button").forEach(function (button) {
          if (button === document.activeElement && button.getAttribute("aria-expanded") === "true") {
            button.setAttribute("aria-expanded", "false");
            let panel = button.closest(".znt-disclosure").querySelector(".znt-disclosure_panel");
            if (panel) {
              panel.classList.remove("znt--open");
            }
            button.focus();
          }
        });
      }
    }
  });

  // Closes with focus out handler
  function applyFocusOutBehavior(selector = "[znt-disclosure-focusout]") {
    document.querySelectorAll(selector).forEach(function (element) {
      element.addEventListener("focusout", function (e) {
        if (!element.contains(e.relatedTarget)) {
          let toggleButton = element.querySelector(".znt-disclosure_button");
          let panel = element.querySelector(".znt-disclosure_panel");
          if (toggleButton) {
            toggleButton.setAttribute("aria-expanded", "false");
            if (panel) {
              panel.classList.remove("znt--open");
            }
          }
        }
      });
    });
  }

  applyFocusOutBehavior();

  // Open the panel on hover
  document.querySelectorAll("[znt-disclosure-hoverable]").forEach(function (element) {
    element.addEventListener("mouseenter", function () {
      let button = element.querySelector(".znt-disclosure_button");
      let panel = element.querySelector(".znt-disclosure_panel");
      button.setAttribute("aria-expanded", "true");
      panel.classList.add("znt--open");
    });

    element.addEventListener("mouseleave", function () {
      let button = element.querySelector(".znt-disclosure_button");
      let panel = element.querySelector(".znt-disclosure_panel");
      button.setAttribute("aria-expanded", "false");
      panel.classList.remove("znt--open");
    });
  });

  // Dynamic ID
  document.querySelectorAll(".znt-disclosure_button").forEach(function (button) {
    let uniqueId = "znt-disclosure_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
    if (!button.hasAttribute("aria-expanded")) {
      button.setAttribute("aria-expanded", "false");
    }

    let togglePanel = button.closest(".znt-disclosure").querySelector(".znt-disclosure_panel");
    if (togglePanel) {
      togglePanel.setAttribute("id", uniqueId);
      button.setAttribute("aria-controls", uniqueId);
    }
  });

  // aria-expanded observer
  document.querySelectorAll("ul").forEach(function (ul) {
    if (ul.querySelector("[znt-disclosure-hoverable]")) {
      let observerZntDisclosure = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === "attributes" && mutation.attributeName === "aria-expanded") {
            let target = mutation.target;
            if (target.getAttribute("aria-expanded") === "true") {
              ul.querySelectorAll(".znt-disclosure_button[aria-expanded='true']").forEach(function (btn) {
                if (btn !== target) {
                  btn.setAttribute("aria-expanded", "false");
                }
              });
            }
          }
        });
      });

      observerZntDisclosure.observe(ul, { attributes: true, subtree: true, attributeFilter: ["aria-expanded"] });
    }
  });

  // Close button behavior
  document.querySelectorAll(".znt-disclosure_close").forEach(function (closeBtn) {
    closeBtn.addEventListener("click", function () {
      let disclosure = closeBtn.closest(".znt-disclosure");
      if (!disclosure) return;

      let button = disclosure.querySelector(".znt-disclosure_button");
      let panel = disclosure.querySelector(".znt-disclosure_panel");

      if (button) {
        button.setAttribute("aria-expanded", "false");
        button.focus();
      }

      if (panel) {
        panel.classList.remove("znt--open");
      }
    });
  });
});

// MEGA MENU

document.addEventListener("DOMContentLoaded", function () {







  // Based on Zenyth Disclosure - V 1.0.0







  function toggleDisclosure(event) {
    // Prevent any default behavior
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const megaMenu = button.closest(".znt-adk-megamenu");
    const panel = megaMenu.querySelector(".znt-adk-megamenu_panel");
    
    // Get current state
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    
    // Update state
    button.setAttribute("aria-expanded", !isExpanded);
    panel.classList.toggle("znt--open", !isExpanded);

    // If opening, focus the first focusable element in the panel
    if (!isExpanded) {
      const focusableElements = panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }



  function closeOnEscape(event) {

    if (event.key === "Escape") {

      const focusedElement = document.activeElement;

      if (focusedElement.classList.contains("znt-adk-megamenu_button")) {

        focusedElement.setAttribute("aria-expanded", "false");

        focusedElement.focus();

      } else if (focusedElement.closest(".znt-adk-megamenu_panel")) {

        const panel = focusedElement.closest(".znt-adk-megamenu_panel");

        const button = panel.previousElementSibling;

        if (button && button.classList.contains("znt-adk-megamenu_button")) {

          button.setAttribute("aria-expanded", "false");

          button.focus();

        }

      }

    }

  }



  function applyFocusOutBehavior() {
    document.querySelectorAll(".znt-adk-megamenu").forEach(function (element) {
      // Skip if inside mobile menu
      if (element.closest('.znt-mobile-menu')) {
        return;
      }

      let focusTimeout;
      
      element.addEventListener("focusout", function (event) {
        // Clear any existing timeout
        if (focusTimeout) {
          clearTimeout(focusTimeout);
        }
        
        // Set a new timeout
        focusTimeout = setTimeout(() => {
          const button = element.querySelector(".znt-adk-megamenu_button");
          const panel = element.querySelector(".znt-adk-megamenu_panel");
          
          // Only close if focus is not within the mega menu
          if (!element.contains(document.activeElement)) {
            if (button && panel) {
              button.setAttribute("aria-expanded", "false");
              panel.classList.remove("znt--open");
            }
          }
        }, 300);
      });
    });
  }






  function setupHoverBehavior() {

    document.querySelectorAll("[znt-adk-megamenu-hoverable]").forEach(function (element) {

      element.addEventListener("mouseenter", function () {

        const button = element.querySelector(".znt-adk-megamenu_button");

        const panel = element.querySelector(".znt-adk-megamenu_panel");

        button.setAttribute("aria-expanded", "true");

        panel.classList.add("znt--open");

      });

      element.addEventListener("mouseleave", function () {

        const button = element.querySelector(".znt-adk-megamenu_button");

        const panel = element.querySelector(".znt-adk-megamenu_panel");

        button.setAttribute("aria-expanded", "false");

        panel.classList.remove("znt--open");

      });

    });

  }



  function setupDynamicIDs() {

    document.querySelectorAll(".znt-adk-megamenu_button").forEach(function (button) {

      if (!button.hasAttribute("aria-expanded")) {

        button.setAttribute("aria-expanded", "false");

      }

      const uniqueId = "znt-adk-megamenu_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);

      const panel = button.closest(".znt-adk-megamenu").querySelector(".znt-adk-megamenu_panel");

      if (panel) {

        panel.setAttribute("id", uniqueId);

        button.setAttribute("aria-controls", uniqueId);

      }

    });

  }



  function observeAriaExpanded() {

    document.querySelectorAll("ul").forEach(function (ul) {

      if (ul.querySelector(".mega-menu.znt-adk-megamenu")) {

        const observer = new MutationObserver(function (mutations) {

          mutations.forEach(function (mutation) {

            if (mutation.type === "attributes" && mutation.attributeName === "aria-expanded") {

              const target = mutation.target;

              if (target.getAttribute("aria-expanded") === "true") {

                ul.querySelectorAll(".mega-menu .znt-adk-megamenu_button[aria-expanded='true']").forEach(function (button) {

                  if (button !== target) {

                    button.setAttribute("aria-expanded", "false");

                  }

                });

              }

            }

          });

        });

        observer.observe(ul, { attributes: true, subtree: true, attributeFilter: ["aria-expanded"] });

      }

    });

  }



  // Initialize buttons

  document.addEventListener("DOMContentLoaded", function() {
    // Remove any existing event listeners
    document.querySelectorAll(".znt-adk-megamenu_button").forEach(function (button) {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });

    // Add event listeners
    document.querySelectorAll(".znt-adk-megamenu_button").forEach(function (button) {
      button.addEventListener("click", toggleDisclosure);
    });

    document.addEventListener("keyup", closeOnEscape);
    applyFocusOutBehavior();
    setupDynamicIDs();
    observeAriaExpanded();
  });







  function toggleDisclosureMobileMenu(event) {
    console.log('Toggle clicked');
    console.log('Event target:', event.target);
    console.log('Current expanded state:', event.currentTarget.getAttribute("aria-expanded"));
    
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    const panel = button.closest(".znt-mobile-menu").querySelector(".znt-mobile-menu_panel");

    console.log('Panel found:', !!panel);
    console.log('Current panel classes:', panel ? panel.className : 'no panel');

    if (expanded) {
      console.log('Closing menu');
      button.setAttribute("aria-expanded", "false");
      panel.classList.remove("znt--open");
    } else {
      console.log('Opening menu');
      button.setAttribute("aria-expanded", "true");
      panel.classList.add("znt--open");
    }

    console.log('New expanded state:', button.getAttribute("aria-expanded"));
    console.log('New panel classes:', panel.className);
  }



  function closeOnEscapeMobileMenu(event) {
    if (event.key === "Escape") {
      const mobileMenu = document.querySelector(".znt-mobile-menu");
      if (!mobileMenu) return;
      
      const button = mobileMenu.querySelector(".znt-mobile-menu_trigger");
      const panel = mobileMenu.querySelector(".znt-mobile-menu_panel");
      
      if (button && panel) {
        button.setAttribute("aria-expanded", "false");
        panel.classList.remove("znt--open");
        button.focus();
      }
    }
  }



  function applyFocusOutBehaviorMobileMenu() {
    console.log('Setting up focusout behavior');
    document.querySelectorAll(".znt-mobile-menu").forEach(function (element) {
      element.addEventListener("focusout", function (event) {
        console.log('Focusout event triggered');
        console.log('Related target:', event.relatedTarget);
        console.log('Active element:', document.activeElement);
        
        if (!element.contains(event.relatedTarget)) {
          console.log('Focus is leaving menu');
          const toggleButton = element.querySelector(".znt-mobile-menu_trigger");
          const panel = element.querySelector(".znt-mobile-menu_panel");

          console.log('Button found:', !!toggleButton);
          console.log('Panel found:', !!panel);

          toggleButton.setAttribute("aria-expanded", "false");
          panel.classList.remove("znt--open");
          
          console.log('Menu closed');
        }
      });
    });
  }






  function setupDynamicIDsMobileMenu() {

    document.querySelectorAll(".znt-mobile-menu_trigger").forEach(function (button) {

      if (!button.hasAttribute("aria-expanded")) {

        button.setAttribute("aria-expanded", "false");

      }

      const mobileMenu = button.closest(".znt-mobile-menu");
      const panel = mobileMenu.querySelector(".znt-mobile-menu_panel");
      
      if (panel && !panel.id) {
        const uniqueId = "znt-mobile-menu_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
        panel.setAttribute("id", uniqueId);
        button.setAttribute("aria-controls", uniqueId);
      }

    });

  }



  function observeAriaExpandedMobileMenu() {

    document.querySelectorAll("ul").forEach(function (ul) {

      if (ul.querySelector(".znt-mobile-menu")) {

        const observer = new MutationObserver(function (mutations) {

          mutations.forEach(function (mutation) {

            if (mutation.type === "attributes" && mutation.attributeName === "aria-expanded") {

              const target = mutation.target;

              if (target.getAttribute("aria-expanded") === "true") {

                ul.querySelectorAll(".znt-mobile-menu_trigger[aria-expanded='true']").forEach(function (button) {

                  if (button !== target) {

                    button.setAttribute("aria-expanded", "false");

                    const panel = button.closest(".znt-mobile-menu").querySelector(".znt-mobile-menu_panel");
                    if (panel) {
                      panel.classList.remove("znt--open");
                    }

                  }

                });

              }

            }

          });

        });

        observer.observe(ul, { attributes: true, subtree: true, attributeFilter: ["aria-expanded"] });

      }

    });

  }



  // Initialize mobile menu
  document.addEventListener("DOMContentLoaded", function() {
    // Remove any existing event listeners
    document.querySelectorAll(".znt-mobile-menu_trigger").forEach(function (button) {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });

    // Add event listeners
    document.querySelectorAll(".znt-mobile-menu_trigger").forEach(function (button) {
      button.addEventListener("click", toggleDisclosureMobileMenu);
    });

    document.addEventListener("keyup", closeOnEscapeMobileMenu);
    applyFocusOutBehaviorMobileMenu();
    setupDynamicIDsMobileMenu();
    observeAriaExpandedMobileMenu();
  });





  // Tabs 

  document.querySelectorAll('.znt-tabs').forEach(tabContainer => {
    const tablist = tabContainer.querySelector('.znt-tabs_triggers');
    const tabs = tablist.querySelectorAll('[role="tab"]');
    const panels = tabContainer.querySelectorAll('[role="tabpanel"]');

    function activateTab(tab) {
      // Deactivate all tabs
      tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
      });

      // Hide all panels
      panels.forEach(p => p.hidden = true);

      // Activate the clicked tab
      tab.setAttribute('aria-selected', 'true');

      const panelId = tab.getAttribute('aria-controls');
      const panel = tabContainer.querySelector(`#${panelId}`);
      if (panel) {
        panel.hidden = false;
        tab.focus();
      }
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activateTab(tab);
      });

      tab.addEventListener('keydown', e => {
        let newTab;
        const i = Array.prototype.indexOf.call(tabs, tab);

        if (e.key === 'ArrowRight') {
          newTab = tabs[(i + 1) % tabs.length];
        } else if (e.key === 'ArrowLeft') {
          newTab = tabs[(i - 1 + tabs.length) % tabs.length];
        }

        if (newTab) {
          e.preventDefault();
          activateTab(newTab);
        }
      });
    });
  });





});


// ENF OF MEGA MENU

$(document).ready(function () {

  // Main selectors/Variables
  const formSelectorZntForm = $('[data-znt-form]');
  // Submit button: [data-znt-form_submit]
  const formControlZnt = '[data-znt-form_control]';
  // const submitButtonToCloneSelector = $('[data-znt-form] input[type="submit"], [data-znt-form_submit]');


  const formFocusoutZntFallbackSelector = $('input[type="email"]');


  // Function Snippets

  if (formSelectorZntForm.length > 0) {


    // Basic Form validator


    // Main Event Handler
    // Responsible for field validation
    $('input, select, textarea').on('input blur', function () {

      // Get the closest label, field, and 'aria-required' attribute
      const field = $(this);
      const closestLabel = field.closest(formControlZnt).find('label').text().trim();
      const ariaRequired = field.attr('aria-required') === 'true';

      // Insert new line here to get 'describedById'
      // START OF - get 'describedById' for handleErrorMessage function
      const describedById = getDescribedById(closestLabel, field.attr('id')); // Use field's ID as well
      // END OF - get 'describedById' for handleErrorMessage function

      // Calculate 'aria-invalid' based on your logic (this part is hypothetical)
      const ariaInvalid = calculateAriaInvalid(field, ariaRequired);

      // Call handleErrorMessage function
      handleErrorMessage(field, ariaInvalid, closestLabel, describedById);
    });
    // END OF - Main Event Handler


    // Dummy function to avoid the Uncaught ReferenceError for calculateAriaInvalid
    const calculateAriaInvalid = () => {
      // console.log("calculateAriaInvalid called");
    };

    // Dummy function to avoid the Uncaught ReferenceError for checkFieldsZntForm
    const checkFieldsZntForm = () => {
      // console.log("checkFields called");
    };



    // Dynamic attributes and properties
    // Dynamic FOR - ID
    const handleDynamicForId = () => {
      // Select all form elements
      $('[data-znt-form]').each(function () {
        const form = $(this); // 'form' now specifically refers to each .form
        let counter = 1;

        // Find and modify only elements within the current form
        form.find('input:not(.form_submit, [data-form_original-submit]), select, textarea').each(function () {
          const element = $(this);
          let controlId = element.attr('id');
          const commonParent = element.closest('[data-znt-form_control]');
          const label = commonParent.find('label').first();

          // Case 1: Label has 'for' but element does not have 'id'
          if (!controlId && label.attr('for')) {
            controlId = label.attr('for');
            element.attr('id', controlId);
          }

          // Case 2: Element has 'id' but label does not have 'for'
          if (controlId && !label.attr('for')) {
            label.attr('for', controlId);
          }

          // Case 3: Neither 'id' nor 'for' are present, generate new unique ID
          if (!controlId && !label.attr('for')) {
            const controlIdBase = 'znt-id_' + String(counter).padStart(2, '0');
            const labelText = label.text().toLowerCase().replace(/[^a-z0-9]+/g, '');
            controlId = `${controlIdBase}_${labelText}`;
            element.attr('id', controlId);
            label.attr('for', controlId);
            counter++;
          }

          // Case 4: Both 'id' and 'for' are present but do not match
          if (controlId && label.attr('for') && label.attr('for') !== controlId) {
            label.attr('for', controlId);
          }

        });
      });
    };

    // Run the function immediately to handle all forms
    handleDynamicForId();

    // END OF - Dynamic FOR - ID



    // Required fields based on the label
    $('label').each(function () {
      const labelText = $(this).text().toLowerCase();
      const forAttribute = $(this).attr('for');

      if (labelText.includes('*') || labelText.includes('required')) {
        $(`#${forAttribute}`).attr('aria-required', 'true');
      }
    });
    // END OF - Required fields based on the label



    // ARIA Attribute Updates and initial states
    const updateAriaAttributes = () => {
      formSelectorZntForm.find('input:not([data-znt-form_submit], [data-znt-form_original-submit]), select, textarea').each(function () {
        const field = $(this);
        // Update aria-required
        if (field.attr('required')) {
          field.attr('aria-required', 'true');
        } else {
          $('input:not([aria-required="true"], [data-znt-form_submit], [data-znt-form_original-submit]), select:not([aria-required="true"]), textarea:not([aria-required="true"])').attr('aria-required', 'false');
        }
        // Set aria-invalid to false initially
        field.attr('aria-invalid', 'false');
      });
    };
    updateAriaAttributes();
    // END OF - ARIA Attribute Updates and initial states

    // ARIA autocomplete update
    $('[data-znt-form_control]').find('input, select, textarea').each(function () {
      let autoCompleteValue = '';
      const field = $(this);
      const labelID = field.attr('id'); ``
      const closestLabel = $(`label[for="${labelID}"]`).text().toLowerCase();
      const labelWords = closestLabel.replace(/[^a-zA-Z]/g, '').toLowerCase();

      if (labelWords.includes('name') && labelWords.includes('first')) {
        autoCompleteValue = 'given-name';
      } else if (labelWords.includes('last') && labelWords.includes('name')) {
        autoCompleteValue = 'family-name';
      } else if (labelWords.includes('email')) {
        autoCompleteValue = 'email';
      } else if (labelWords.includes('company')) {
        autoCompleteValue = 'organization';
      } else if (labelWords.includes('zip') && labelWords.includes('code')) {
        autoCompleteValue = 'postal-code';
      } else if (labelWords.includes('phone')) {
        autoCompleteValue = 'tel';
      } else if (labelWords.includes('full') && labelWords.includes('name')) {
        autoCompleteValue = 'name';
      } else if (labelWords.includes('company')) {
        autoCompleteValue = 'organization';
      } else if (labelWords.includes('state')) {
        autoCompleteValue = 'address-level1';
      } else if (labelWords.includes('street')) {
        autoCompleteValue = 'address-line1';
      } else if (labelWords.includes('nickname')) {
        autoCompleteValue = 'nickname';
      } else if (labelWords.includes('user')) {
        autoCompleteValue = 'username';
      } else if (labelWords.includes('new') && labelWords.includes('password')) {
        autoCompleteValue = 'new-password';
      } else if (labelWords.length === 1 && labelWords[0] === 'password') {
        autoCompleteValue = 'current-password';
      }
      if (autoCompleteValue) {
        field.attr('autocomplete', autoCompleteValue);
      }
    });
    // END OF - ARIA autocomplete update



    // END OF - Dynamic attributes and properties



    // Email Validation
    const isValidEmailZntForm = (email) => {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      return emailRegex.test(email);
    };
    // END OF - Email Validation

    // Focusout Fallback
    // Some forms has a focusout validation hat can conflict
    // This functions revalidates quickly on focusout
    const focusOutFallback = () => {
      formSelectorZntForm.on('focusout', formFocusoutZntFallbackSelector, function () {
        setTimeout(() => {
          checkFieldsZntForm();
        }, 10);
      });
    };
    focusOutFallback();
    // END OF - Focusout Fallback

    // Error Message
    const getDescribedById = (label, id) => {
      return 'znt-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id + '-error';
    };

    const handleErrorMessage = (field, ariaInvalid, closestLabel) => {
      const describedById = getDescribedById(closestLabel, field.attr('id'));
      const formControlElement = field.closest(formControlZnt); // Get the parent form control element

      if (ariaInvalid === 'true') {
        let errorMsg = closestLabel + ' is required';

        if (field.is('input[type="email"]')) {
          errorMsg += ' (name@domain.com)';
        }

        if (!$(`#${describedById}`).length) {
          field.after(`<p id="${describedById}" class="znt-error-message">${errorMsg}</p>`);
          field.attr('aria-describedby', describedById);
          formControlElement.addClass('znt-invalid-control'); // Add the class to the parent form control element
        }
      } else {
        const observerZntForm = new MutationObserver(function (mutationsList, observerZntForm) {
          for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              const target = mutation.target;
              if (target.matches(formControlZnt) && !$(target).hasClass('znt-invalid-control')) {
                $(target).find('input, textarea, select').removeAttr('aria-describedby');
                $(target).find('.znt-error-message').remove();
              }
            }
          }
        });

        const configZntForm = { attributes: true, attributeFilter: ['class'], subtree: true };
        observerZntForm.observe(document.body, configZntForm);

        // Check if any other fields in the same form control are still invalid
        const invalidFieldsInControl = formControlElement.find('input[aria-invalid="true"], select[aria-invalid="true"], textarea[aria-invalid="true"]');

        if (invalidFieldsInControl.length === 0) {
          formControlElement.removeClass('znt-invalid-control'); // Remove the class from the parent form control element
        }
      }
    };
    // END OF - Error Message

    // Define the function in a scope accessible to your main script
    function updateFormState(form) {
      // Your logic to update the form state
    }

    $(document).ready(function () {
      $('[data-znt-form]').each(function () {
        const form = $(this);

        if (form.children('.znt-form_live-region').length === 0) {
          const liveRegionDiv = $('<div class="znt-form_live-region" aria-live="polite" aria-atomic="true"></div>');
          form.prepend(liveRegionDiv);
        }

        updateFormState(form);

        const observerZntForm = new MutationObserver((mutationsList) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              const target = $(mutation.target);
              if (!target.hasClass('znt-invalid-control')) {
                updateFormState(form);
              }
            }
          });
        });

        const configZntForm = { attributes: true, attributeFilter: ['class'], subtree: true };
        observerZntForm.observe(form[0], configZntForm);

        form.on('input change blur', '[aria-required="true"], [aria-invalid]', function () {
          updateFormState(form);
        });
      });
    });



    // Form tag validation for button replacement
    // Select all forms with the specified attribute
    $('[data-znt-form]').each(function () {
      const form = $(this);

      // Initial state check and setup observers
      setupObservers(form);
      updateFormBlockState(form);

      // Event handlers to handle user inputs immediately
      form.on('input change blur', 'input, select, textarea', function () {
        updateFormBlockState(form);
      });
    });

    function setupObservers(form) {
      // Setup a MutationObserver to react to changes in attributes like 'aria-invalid'
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && (mutation.attributeName === 'aria-invalid' || mutation.attributeName === 'value')) {
            updateFormBlockState(form);
          }
        });
      });

      // Observe changes in all input fields within the form
      form.find('input, select, textarea').each(function () {
        observer.observe(this, {
          attributes: true,
          attributeFilter: ['aria-invalid', 'value']
        });
      });
    }

    // Function to update the blocked state of the form
    function updateFormBlockState(form) {
      let isFormBlocked = false;
      const inputs = form.find('input:not([data-znt-form_submit], [data-znt-form_original-submit]), select, textarea');

      inputs.each(function () {
        const input = $(this);

        // Include radio groups and checkboxes in the blocking logic
        if (
          input.attr('aria-invalid') === 'true' ||
          (input.attr('aria-required') === 'true' &&
            ((!input.is('[type="checkbox"], [type="radio"]') && !input.val().trim()) ||
              (input.is('[type="checkbox"]') && !input.prop('checked')) ||
              (input.is('[type="radio"]') && !input.closest('[role="radiogroup"]').find(':checked').length)))
        ) {
          isFormBlocked = true;
          return false; // Exit loop early if a blocking condition is found
        }
      });

      // Update the form's class based on validation results
      if (isFormBlocked) {
        form.addClass('znt-form-blocked');
        form.find('[data-znt-form_submit]').prop('disabled', true).attr('aria-disabled', 'true');
      } else {
        form.removeClass('znt-form-blocked');
        form.find('[data-znt-form_submit]').prop('disabled', false).removeAttr('aria-disabled');
      }
    }


    // END OF - Form tag validation for button replacement



    // Input fields Validation (input, select, textarea)
    const inputFieldsValidation = () => {
      $(document).ready(function () {
        if ($('form').length > 0) {
          $(formSelectorZntForm).on('input focusin focusout', 'input, textarea', function (event) {
            const field = $(this);

            // Skip validation for fields with aria-required="false"
            const ariaRequired = field.attr('aria-required') === 'true';
            if (!ariaRequired) {
              return;
            }

            let ariaInvalid = 'false';
            const value = field.val().trim();

            // Check for znt-min-length attribute
            const minLengthAttr = field.attr('znt-min-length');
            const minLength = minLengthAttr ? parseInt(minLengthAttr, 10) : 0;

            // Identify the closest label based on your HTML structure
            const closestLabel = field.closest(formControlZnt).find('label[for="' + field.attr('id') + '"]').text().replace(/[^a-zA-Z0-9 ]/g, "");

            // On focusin, initialize hasInteracted to false
            if (event.type === 'focusin') {
              field.data('hasInteracted', false);
            }

            // On input, set hasInteracted to true and validate
            if (event.type === 'input') {
              field.data('hasInteracted', true);

              if (field.is('input[type="email"]')) {
                ariaInvalid = isValidEmailZntForm(value) ? 'false' : 'true';
              } else if (minLength > 0 && value.length < minLength) {
                // Check for minimum length requirement
                ariaInvalid = 'true';
              } else {
                ariaInvalid = value === '' ? 'true' : 'false';
              }

              field.attr('aria-invalid', ariaInvalid);
              handleErrorMessage(field, ariaInvalid, closestLabel);
            }
          });
        }
      });
    };

    inputFieldsValidation();

    // END OF - Input fields Validation (input, select, textarea)


    // Top Alert message
    // Prevent default behavior for all links inside .znt-form .znt-form_live-region
    $(document).on('click', '[data-znt-form] .znt-form_live-region a', function (event) {
      event.preventDefault();
      var targetId = $(this).attr('href').substring(1); // Get the target element ID
      var targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Focus the target element without scrolling
        targetElement.focus({ preventScroll: true });
      }
    });

  }

  // Function to handle error messages for checkboxes
  function handleCheckboxErrorMessage(checkbox, triggerValidation = false) {
    const describedById = 'error-' + Math.random().toString(36).substr(2, 9); // Generate a random ID
    const labelContent = checkbox.closest('[data-znt-form_control]').find('label').text().trim().replace('*', ''); // Remove the asterisk
    const errorMessage = `<p id="${describedById}" class="znt-error-message">${labelContent} is required</p>`;

    // Check if the checkbox is selected
    const isChecked = checkbox.prop('checked');

    if (!isChecked) {
      if (triggerValidation) {
        // Add error message only if triggered
        if (!checkbox.closest('[data-znt-form_control]').find('.znt-error-message').length) {
          checkbox.closest('[data-znt-form_control]').append(errorMessage);
        }
        checkbox.attr('aria-invalid', 'true').attr('aria-describedby', describedById);
        checkbox.closest('[data-znt-form_control]').addClass('znt-invalid-control');
      } else {
        // Ensure aria-invalid starts as false without an error message
        checkbox.attr('aria-invalid', 'false').removeAttr('aria-describedby');
      }
    } else {
      // Remove error message if valid
      checkbox.closest('[data-znt-form_control]').find('.znt-error-message').remove();
      checkbox.attr('aria-invalid', 'false').removeAttr('aria-describedby');
      checkbox.closest('[data-znt-form_control]').removeClass('znt-invalid-control');
    }

    updateFormBlockState(checkbox.closest('form')); // Update the form block state based on the checkbox state
  }

  // Attach validation to checkboxes
  $('input[type="checkbox"][aria-required="true"]').each(function () {
    const checkbox = $(this);

    // Perform initial setup without triggering validation
    handleCheckboxErrorMessage(checkbox, false);

    // Attach change event to trigger validation
    checkbox.on('change', function () {
      handleCheckboxErrorMessage($(this), true); // Trigger validation on interaction
    });
  });

  // END OF - Event handler for checkboxes


  // Function to handle radio group validation
  function validateRadioGroup(radioGroup, triggerValidation = false) {
    const legendId = radioGroup.attr("aria-labelledby");
    const legend = $(`#${legendId}`);
    const radios = radioGroup.find('input[type="radio"]');
    const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
    const errorMessage = `<p id="${errorId}" class="znt-error-message">${legend.text().trim()} is required</p>`;

    // Check if any radio is selected
    const isAnySelected = radios.is(':checked');

    if (!isAnySelected) {
      if (triggerValidation) {
        // Add error message only if triggered
        if (!radioGroup.next('.znt-error-message').length) {
          radioGroup.after(errorMessage);
        }
        radios.attr('aria-invalid', 'true').attr('aria-describedby', errorId);
      } else {
        // Ensure aria-invalid starts as false
        radios.attr('aria-invalid', 'false').removeAttr('aria-describedby');
      }
    } else {
      // Remove error message if valid
      radioGroup.next('.znt-error-message').remove();
      radios.attr('aria-invalid', 'false').removeAttr('aria-describedby');
    }

    // Update the form's block state
    updateFormBlockState(radioGroup.closest('[data-znt-form]'));
  }




  // Attach validation to radio groups
  $('[role="radiogroup"]').each(function () {
    const radioGroup = $(this);

    const legendId = radioGroup.attr("aria-labelledby");
    const legend = $(`#${legendId}`);
    if (legend.text().includes('*')) {
      radioGroup.find('input[type="radio"]').attr('aria-required', 'true');

      // Attach change event to trigger validation
      radioGroup.find('input[type="radio"]').on('change', function () {
        validateRadioGroup(radioGroup, true); // Trigger validation on interaction
      });
    }

    // Perform initial setup without triggering validation
    validateRadioGroup(radioGroup, false);
  });


  //END OF - Function to handle radio group validation



  // Event handler for <select>
  function handleSelectErrorMessage(select) {
    const formControl = select.closest('[data-znt-form_control]');
    const describedById = 'error-' + Math.random().toString(36).substr(2, 9); // Generate a random ID
    const labelContent = formControl.find('label').text().trim().replace('*', ''); // Remove the asterisk
    const errorMessage = `<p id="${describedById}" class="znt-error-message">${labelContent} is required</p>`;

    if (select.val().trim() !== '') {
      select.attr('aria-invalid', 'false');
      formControl.removeClass('znt-invalid-control');
      select.removeAttr('aria-describedby');
      formControl.find('.znt-error-message').remove();
    } else {
      select.attr('aria-invalid', 'true');
      formControl.addClass('znt-invalid-control');
      if (formControl.find('.znt-error-message').length === 0) {
        formControl.append(errorMessage);
        select.attr('aria-describedby', describedById);
      }
    }

    updateFormBlockState(select.closest('form')); // Update the form block state based on the select state
  }

  // Event handler for select elements
  $('select[aria-required="true"]').one('focus', function () {
    $(this).data('hasInteracted', true);
  });

  $('select[aria-required="true"]').on('change', function () {
    if ($(this).data('hasInteracted')) {
      handleSelectErrorMessage($(this));
    }
  });


  // END OF - Event handler for <select>



  // Prevents the form from submitting
  $("[data-znt-form]").each(function () {
    const $form = $(this);

    // Prevent form submission if blocked
    $form.on("submit", function (event) {
      if ($form.hasClass("znt-form-blocked")) {
        event.preventDefault();
      }
    });

    // Prevent default Enter key behavior if form is blocked
    $form.find("input").on("keydown", function (event) {
      if (event.key === "Enter" && $form.hasClass("znt-form-blocked")) {
        event.preventDefault();
        $form.find("[data-znt-form_submit]").click();

      }
    });
  });

});


// Function to check the form's validity
// Checks if there is a invalid field to keep the submit button disabled
$(document).ready(function () {

  // Array of form selectors
  let formSelectors = ['[data-znt-form]'];
  let submitButtonSelectors = ['[data-znt-form_submit]'];
  let emailFieldSelectors = ['[type="email"]'];

  function checkFormValidity() {
    formSelectors.forEach((formSelector, index) => {
      let requiredFields = $(`${formSelector} [aria-required="true"]`);
      let allFieldsValid = true;

      requiredFields.each(function () {
        if ($(this).attr('aria-invalid') === 'true' || $(this).val().trim() === '') {
          allFieldsValid = false;
          return false; // Break out of each loop
        }
      });

      let submitButton = $(submitButtonSelectors[index]);
      // let emailField = $(emailFieldSelectors[index]);
      let infoParagraphId = `formInfo-${index}`;
      let infoParagraph = $(`#${infoParagraphId}`);

      if (!allFieldsValid) {
        submitButton.prop('disabled', true);
        submitButton.attr('aria-disabled', 'true');

        // Remove aria-describedby and paragraph if button is disabled
        //   emailField.attr('aria-describedby', '');
        if (infoParagraph.length) {
          infoParagraph.remove();
        }
      } else {
        submitButton.prop('disabled', false);
        submitButton.removeAttr('aria-disabled');
      }
    });
  }

  // Initially disable the submit buttons
  submitButtonSelectors.forEach((submitButtonSelector) => {
    $(submitButtonSelector).prop('disabled', true).attr('aria-disabled', 'true');
  });

  // Initial check on page load
  checkFormValidity();

  // MutationObserver configuration
  let observerConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-invalid', 'value']
  };

  // Create a MutationObserver instance
  let observer = new MutationObserver(function (mutationsList) {
    // When a mutation is observed, check the form's validity
    checkFormValidity();
  });

  // Select the target nodes (forms) to observe
  formSelectors.forEach((formSelector) => {
    let targetNode = document.querySelector(formSelector);
    // Start observing the target node for configured mutations
    if (targetNode) {
      observer.observe(targetNode, observerConfig);
    }
  });

  // Manually trigger a mutation for testing purposes
  setTimeout(function () {
    //   $(emailFieldSelectors[0]).attr('aria-invalid', 'true');
    checkFormValidity(); // Ensure state is checked immediately after mutation
  }, 2000);
});
// END OF - Function to check the form's validity


// SEARCH ENHANCEMENTS
// Script to add screen reader annotations to highlighted search terms
document.addEventListener('DOMContentLoaded', function () {
  // Create a mutation observer to watch for changes in the DOM
  const bodyObserver = new MutationObserver(function (mutations) {
    // Check if the predictive search results container exists
    const resultsContainer = document.getElementById('predictive-search-results');
    if (resultsContainer) {
      // Function to add screen reader annotations to highlighted terms
      function addScreenReaderAnnotationsToMarks() {
        const marks = document.querySelectorAll('#predictive-search-results mark');
        if (marks.length > 0) {
          marks.forEach(mark => {
            // Check if annotations are already added
            if (!mark.previousElementSibling || !mark.previousElementSibling.classList.contains('visually-hidden')) {
              const startSpan = document.createElement('span');
              startSpan.className = 'visually-hidden';
              startSpan.textContent = 'highlight start';

              const endSpan = document.createElement('span');
              endSpan.className = 'visually-hidden';
              endSpan.textContent = 'highlight end';

              mark.parentNode.insertBefore(startSpan, mark);
              mark.parentNode.insertBefore(endSpan, mark.nextSibling);
            }
          });
        }
      }

      // First, check for existing mark elements
      addScreenReaderAnnotationsToMarks();

      // Then set up an observer specifically for the results container
      const resultsObserver = new MutationObserver(function () {
        addScreenReaderAnnotationsToMarks();
      });

      // Start observing the results container for any changes
      resultsObserver.observe(resultsContainer, {
        childList: true,
        subtree: true
      });

      // Stop observing the body since we found what we need
      bodyObserver.disconnect();
    }
  });

  // Start observing the body for changes
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
});



document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("svg.icon").forEach(function (svg) {
    svg.setAttribute("aria-hidden", "true");
  });
});

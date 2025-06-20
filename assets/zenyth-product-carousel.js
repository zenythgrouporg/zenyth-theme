console.log('TESTE 0000000');
$(document).ready(function() {

  console.log('TESTE 111111');
  
      if ($(".znt-product-carousel").length) {
  
          // Global object to expose carousel functions
          window.zenythProductCarousel = {
              initializeCarousel: function() {
                  initializeCarousel();
              },
              reorderSlides: function(variantMediaId) {
                  reorderSlidesForVariant(variantMediaId);
              }
          };

          // Function to reorder slides for variant selection
          function reorderSlidesForVariant(variantMediaId) {
              $('.znt-product-carousel').each(function() {
                  var $carousel = $(this);
                  var $wrapper = $carousel.find('.znt-product-carousel_wrapper');
                  var $variantSlide = $wrapper.find(`[data-media-id*="${variantMediaId}"]`);
                  
                  if ($variantSlide.length) {
                      // Remove the variant slide from its current position
                      $variantSlide.detach();
                      // Insert it at the beginning
                      $wrapper.prepend($variantSlide);
                      
                      // Update the slide classes and data attributes
                      $variantSlide.removeClass('znt-product-carousel_slide').addClass('znt-product-carousel_slide 1');
                      $variantSlide.attr('data-media-position', '1');
                      
                      // Update other slides' positions
                      $wrapper.find('.znt-product-carousel_slide').each(function(index) {
                          if (index > 0) {
                              $(this).removeClass('znt-product-carousel_slide 1').addClass('znt-product-carousel_slide');
                              $(this).attr('data-media-position', (index + 1).toString());
                          }
                      });
                      
                      // Immediately update thumbnails after reordering
                      setTimeout(function() {
                          updateCarouselThumbs();
                      }, 100);
                  }
              });
          }
  
          // Lightbox
          // This must be placed always the first code, so the lightbox carousel will have the handlers correctly set
          $('.znt-product-carousel[znt-product-carousel-lightbox="true"]').each(function(index) {
         
              if (!$('body').find('.znt-backdrop').length) {
                  $('body').append('<div class="znt-backdrop"></div>');
              }
          
              // Add ID to product title if it exists
              var $productTitle = $('.product__title h1');
              if ($productTitle.length) {
                  var productTitleId = 'product-title-' + index;
                  $productTitle.attr('id', productTitleId);
              }
          
              // SVG markup to be added to the button
              var svgMarkup = '<svg class="magnifier"  aria-hidden="true" stroke-width="2" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><line x1="18" x2="30" y1="18" y2="30"/></svg>';
  
              var uniqueId = 'znt-product-carousel_lightbox-' + index; 
  
              var $carousel = $(this);
  
              var ariaLabelledById = $carousel.attr('aria-labelledby');
              var labelledByText = $('#' + ariaLabelledById).text().trim();
              var lightboxLabel = labelledByText + ' Lightbox';
  
  
              // Create the button and include the SVG markup along with the text
              var $triggerButton = $('<button>', {
                  class: 'znt-product-carousel_lightbox-trigger',
                  html: svgMarkup + 'Open Lightbox' // Using 'html' instead of 'text' to include SVG
              });
  
          
              // Append the lightbox trigger button to the original carousel only
              $carousel.append($triggerButton);
  
              var $dialog = $('<dialog>', {
                  class: 'znt-product-carousel_lightbox',
                  id: uniqueId,
                  'aria-label': lightboxLabel,
                  'aria-labelledby': productTitleId,
                  'aria-modal': 'true'
              });
          
              // Clone the carousel for the dialog content and remove the trigger button from the clone
              var $clonedCarousel = $carousel.clone(true, true);
              $clonedCarousel.find('.znt-product-carousel_lightbox-trigger').remove(); // Remove the trigger button from the clone
          
              // Create the dialog and append it to the body
              var closeDialogSvg = '<svg aria-hidden="true"viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><line stroke-width="4" x1="2" x2="30" y1="2" y2="30"/><line stroke-width="4" x1="2" x2="30" y1="30" y2="2"/></svg>';
  
              $dialog.append($clonedCarousel).prepend($('<button>', {
                  class: 'znt-product-carousel_close-dialog',
                  html: closeDialogSvg + ' Close dialog'
              }));
              
              $('body').append($dialog);
          
              // Function to handle opening the dialog
              function openDialog() {
                  $('body > *:not(.znt-backdrop)').not($dialog).attr('inert', 'true');
                  $('#' + uniqueId).attr('open', true);
                  $('html').addClass('no-scroll');
                  $('#' + uniqueId + ' .znt-product-carousel_close-dialog').focus(); // Focus on the close button of the dialog
                  setCarouselWidth();
  
                  // Re-bind event handlers for scroll buttons after the lightbox is opened
                  // Note: Adjust selectors based on your specific setup
                  var $clonedDotsContainer = $('#uniqueIdForLightbox .znt-product-carousel_dots'); // Use actual unique ID
                  setupVerticalScrollForDots($clonedDotsContainer); // Pass the cloned dots container to your setup function
                  setupHorizontalScrollForDots($clonedDotsContainer); // Similar for horizontal setup
                  
                  // Manually trigger a scroll event to update button states
                  $clonedDotsContainer.scroll();
              }
          
              // Function to handle closing the dialog
              function closeDialog() {
                  $('body > *').removeAttr('inert');
                  $('#' + uniqueId).removeAttr('open');
                  $('html').removeClass('no-scroll');
                  $triggerButton.focus(); // Return focus to the trigger button
              }
          
              // When the lightbox trigger is clicked, open the dialog
              $triggerButton.on('click', openDialog);
          
              // When the close button is clicked, close the dialog
              $dialog.find('.znt-product-carousel_close-dialog').on('click', closeDialog);
          });
  
          $(document).on('keydown', function(event) {
              if (event.key === "Escape") { // Check if the pressed key is 'ESC'
                  if ($(document.activeElement).closest('.znt-product-carousel_lightbox').length) {
                      // Check if the focused element is within .znt-product-carousel_lightbox
                      $('.znt-product-carousel_lightbox .znt-product-carousel_close-dialog').click(); // Simulate a click
                  }
              }
          });
          
          // END OF - Lightbox
      
      
          // Dynamic sizes
          function setCarouselWidth() {
              $('.znt-product-carousel_wrapper').each(function() {
                  var parentWidth = $(this).parent().width(); // Get the width of the parent container
                  var slideCount = $(this).children('.znt-product-carousel_slide').length; // Count the number of slides
      
                  // Set the width of the carousel
                  $(this).css('width', parentWidth * slideCount);
      
                  // Set the width of each slide
                  $(this).children('.znt-product-carousel_slide').css('width', parentWidth);
              });
          }
          // Update carousel width on window resize
          $(window).resize(function() {
              setCarouselWidth();
          });
          // END OF - Dynamic sizes
      
      
      
      
          // Dynamic Names and Roles
          // Function to dynamically set names and roles for accessibility
          function setDynamicNamesAndRoles() {
              $('.znt-product-carousel').each(function(carouselIndex, carousel) {
                  // Adds attributes to each carousel
                  $(carousel).attr('aria-roledescription', 'carousel');
                  $(carousel).attr('role', 'region');
      
                  var slides = $(carousel).find('.znt-product-carousel_slide');
                  var totalSlides = slides.length;
      
                  // Iterate over slides within the current carousel
                  slides.each(function(slideIndex, slide) {
                      // Add aria-roledescription="slide" to each slide
                      $(slide).attr('aria-roledescription', 'slide');
      
                      // Generate a unique ID for the <p> element
                      var slideId = 'slide_' + carouselIndex + '_' + (slideIndex + 1);
      
                      // Prepare the <p> element text, e.g., "1 of 4"
                      var slideText = (slideIndex + 1) + ' of ' + totalSlides;
      
                      // Add the <p> element as the first child of the current slide
                      var pInfo = $('<p class="d-none" id="' + slideId + '">' + slideText + '</p>');
                      $(slide).prepend(pInfo);
      
                      // Set the aria-labelledby attribute of the slide to point to the added <p> element's ID
                      $(slide).attr('aria-labelledby', slideId);
      
                      // If the slide has more than one child, add role="group" to it
                      if ($(slide).children().length > 1) {
                          $(slide).attr('role', 'group');
                      }
                  });
      
                  // If there is only one slide, remove navigation controls
                  if (totalSlides === 1) {
                      $(carousel).find('.znt-product-carousel_prev, .znt-product-carousel_next, .znt-product-carousel_dots, .znt-product-carousel_toggle-pause').remove();
                  }
              });
          }
          // END OF - Dynamic Names and Roles
      
      
          
          // Next and Previous buttons
          // Creating Next and Prev Controls
          function addCarouselButtons() {
              $('.znt-product-carousel').each(function() {
                  // SVG markup for the previous button
                  var svgPrevMarkup = '<svg aria-hidden="true"viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22,2 L10,16 22,30" stroke-width="4"/></svg>';
          
                  // SVG markup for the next button
                  var svgNextMarkup = '<svg aria-hidden="true"viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10,2 L22,16 10,30" stroke-width="4"/></svg>';
          
                  // Create previous button with SVG
                  var prevButton = $('<button></button>', {
                      'class': 'znt-product-carousel_prev',
                      'aria-label': 'Previous',
                      'html': svgPrevMarkup // Use html to include SVG markup
                  });
          
                  // Create next button with SVG
                  var nextButton = $('<button></button>', {
                      'class': 'znt-product-carousel_next',
                      'aria-label': 'Next',
                      'html': svgNextMarkup // Use html to include SVG markup
                  });
          
                  // Append buttons to the carousel
                  $(this).append(prevButton, nextButton);
              });
          }
      
      
      
          // Next and Prev handlers
          // Function to add click event handlers for Next and Previous buttons
          function setupCarouselButtonHandlers() {
              $('.znt-product-carousel').each(function() {
                  var $carousel = $(this);
                  var $wrapper = $carousel.find('.znt-product-carousel_wrapper');
                  var currentSlide = 0;
      
                  // Set initial position and button states
                  $wrapper.css('left', '0%');
                  $carousel.data('currentSlide', currentSlide); // Store the currentSlide index
                  $carousel.find('.znt-product-carousel_prev').prop('disabled', true); // Disable prev button initially
                  
      
                  // Next button click event
                  $carousel.find('.znt-product-carousel_next').off('click').on('click', function(event) {
                      event.preventDefault();
                      moveCarousel($carousel, 'next');
                  });
      
                  // Previous button click event
                  $carousel.find('.znt-product-carousel_prev').off('click').on('click', function(event) {
                      event.preventDefault();
                      moveCarousel($carousel, 'prev');
                  });
              });
          }
      
          // Function to move the carousel to next or previous slide
          function moveCarousel($carousel, direction) {
              var $wrapper = $carousel.find('.znt-product-carousel_wrapper');
              var totalSlides = $carousel.find('.znt-product-carousel_slide').length;
              var currentSlide = $carousel.data('currentSlide');
              var $prevButton = $carousel.find('.znt-product-carousel_prev');
              var $nextButton = $carousel.find('.znt-product-carousel_next');
          
              if (direction === 'next' && currentSlide < totalSlides - 1) {
                  currentSlide++;
              } else if (direction === 'prev' && currentSlide > 0) {
                  currentSlide--;
              }
          
              $wrapper.css('left', '-' + currentSlide * 100 + '%');
          
              var atFirstSlide = currentSlide === 0;
              var atLastSlide = currentSlide === totalSlides - 1;
              $prevButton.prop('disabled', atFirstSlide);
              $nextButton.prop('disabled', atLastSlide);
          
              // Automatically shift focus if necessary
              if (atLastSlide && direction === 'next') {
                  $prevButton.focus(); // Focus to Prev if Next is disabled
              } else if (atFirstSlide && direction === 'prev') {
                  $nextButton.focus(); // Focus to Next if Prev is disabled
              }
          
              updateActiveSlide($carousel, currentSlide);
              $carousel.data('currentSlide', currentSlide);
          }
          // END OF - Next and Previous buttons
      
      
          
          // Dots pagination
          // Function to update the active slide class
          // Those handlers are required to make the dots and next and prev compatible
  
          
          function updateActiveSlide($carousel, newIndex) {
              // Remove active class from all slides
              $carousel.find('.znt-product-carousel_slide').removeClass('znt-product-carousel_slide-active');
              // Add active class to the new active slide
              $carousel.find('.znt-product-carousel_slide').eq(newIndex).addClass('znt-product-carousel_slide-active');
      
              // Update dots' aria-current attribute and active state if dots exist
              if ($carousel.find('.znt-product-carousel_dot').length) {
                  $carousel.find('.znt-product-carousel_dot').attr('aria-current', 'false').removeClass('znt-product-carousel_dot-active');
                  $carousel.find('.znt-product-carousel_dot').removeClass('znt-product-carousel_dot-active');
                  $carousel.find('.znt-product-carousel_dot').eq(newIndex).attr('aria-current', 'true').addClass('znt-product-carousel_dot-active');
                  $carousel.find('.znt-product-carousel_dot').eq(newIndex).addClass('znt-product-carousel_dot-active');
              }
          }
      
      
      
      
          // Adds navigation dots dynamically
          function addCarouselDots() {
              $('.znt-product-carousel').each(function() {
                  var $carousel = $(this);
                  var totalSlides = $carousel.find('.znt-product-carousel_slide').length;
                  // Changed from div to ul for the dots container
                  var dotsContainer = $('<ul></ul>', {
                      'class': 'znt-product-carousel_dots'
                  });
  
                  for (var i = 0; i < totalSlides; i++) {
                      var dot = $('<button></button>', {
                          'class': 'znt-product-carousel_dot',
                          'aria-label': 'Slide ' + (i + 1),
                          'aria-current': i === 0 ? 'true' : 'false'
                      }).data('slide', i);
                      // Wrap the button inside an li element
                      var listItem = $('<li></li>').append(dot);
  
                      dotsContainer.append(listItem);
                  }
  
                  $carousel.append(dotsContainer);
  
                  $carousel.data('currentSlide', 0);
              });
          }
  
      
          // Dots click event
          $('.znt-product-carousel').on('click', '.znt-product-carousel_dot', function() {
              var $dot = $(this);
              var $carousel = $dot.closest('.znt-product-carousel');
              var $wrapper = $carousel.find('.znt-product-carousel_wrapper');
              var newSlideIndex = $dot.data('slide');
      
              $carousel.data('currentSlide', newSlideIndex);
              updateActiveSlide($carousel, newSlideIndex);
      
              // Update the wrapper's left property based on the clicked dot
              $wrapper.css('left', '-' + newSlideIndex * 100 + '%');
      
              // Update currentSlide variable
              currentSlide = newSlideIndex;
              updateActiveSlide($carousel, newSlideIndex);
      
              // Update dots' aria-current attribute
              $carousel.find('.znt-product-carousel_dot').attr('aria-current', 'false');
              $dot.attr('aria-current', 'true');
      
              // Update the disabled state of prev and next buttons
              $carousel.find('.znt-product-carousel_prev').prop('disabled', newSlideIndex === 0);
              $carousel.find('.znt-product-carousel_next').prop('disabled', newSlideIndex === $carousel.find('.znt-product-carousel_slide').length - 1);
          });
          // END OF -  Dots pagination
  
  
  
  
          // Touch swipe 
          $(document).ready(function() {
              var threshold = 100; // Minimum pixels to consider it a swipe
          
              $('.znt-product-carousel').each(function() {
                  var swipeEnabled = $(this).attr('znt-product-carousel-swipe') !== 'false'; // Default is true if attribute is missing or not "false"
                  if (!swipeEnabled) {
                      return; // Skip this carousel if swipe is disabled
                  }
          
                  var isSwiping = false;
                  var startX, startY;
          
                  $(this).find('.znt-product-carousel_wrapper').on('touchstart mousedown', function(e) {
                      isSwiping = true;
                      startX = e.type === 'mousedown' ? e.pageX : e.originalEvent.touches[0].pageX;
                      startY = e.type === 'mousedown' ? e.pageY : e.originalEvent.touches[0].pageY;
                      if (e.type === 'mousedown') {
                          e.preventDefault(); // Prevent text selection for mouse events
                      }
                  }).on('touchmove mousemove', function(e) {
                      if (!isSwiping) return;
          
                      var moveX = e.type === 'mousemove' ? e.pageX : e.originalEvent.touches[0].pageX;
                      var moveY = e.type === 'mousemove' ? e.pageY : e.originalEvent.touches[0].pageY;
          
                      var diffX = startX - moveX;
                      var diffY = startY - moveY;
          
                      // Only prevent default if horizontal movement is greater than vertical movement
                      if (Math.abs(diffX) > Math.abs(diffY)) {
                          e.preventDefault(); // Prevent scrolling in touch events
                          if (Math.abs(diffX) >= threshold) {
                              if (diffX > 0) {
                                  // Left swipe
                                  $(this).parent().find('.znt-product-carousel_next').trigger('click');
                              } else {
                                  // Right swipe
                                  $(this).parent().find('.znt-product-carousel_prev').trigger('click');
                              }
                              isSwiping = false; // Reset swipe state
                          }
                      }
                  }).on('touchend touchcancel mouseup mouseleave', function() {
                      isSwiping = false;
                  });
              });
          });
          
          // END OF - Touch swipe 
          
              
      
      
          // Live regions
          // This section ensures announcements when using any controls
          function setupLiveRegionForCarousels() {
              $('.znt-product-carousel').each(function() {
                  var $carousel = $(this);
                  var totalSlides = $carousel.find('.znt-product-carousel_slide').length;
          
                  // Create the live region element initially with off
                  var liveRegion = $('<div></div>', {
                      'class': 'znt-message sr-only',
                      'aria-live': 'off'
                  }).prependTo($carousel);
          
                  // Initial text update for each live region
                  updateLiveRegionText(liveRegion, 1, totalSlides);
          
                  // Check paused state after a delay
                  setTimeout(function() {
                      var ariaLiveValue = $carousel.hasClass('znt-paused') ? 'assertive' : 'off';
                      liveRegion.attr('aria-live', ariaLiveValue);
                  }, 1000);
          
                  // Setup a MutationObserver to observe changes in the active slide for each carousel independently
                  var observer = new MutationObserver(function(mutations) {
                      mutations.forEach(function(mutation) {
                          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                              var $activeSlide = $(mutation.target);
                              if ($activeSlide.hasClass('znt-product-carousel_slide-active')) {
                                  var currentSlideIndex = $carousel.find('.znt-product-carousel_slide').index($activeSlide) + 1;
                                  updateLiveRegionText(liveRegion, currentSlideIndex, totalSlides);
                              }
                          }
                      });
                  });
          
                  // Configuration of the observer
                  var config = { attributes: true, childList: false, subtree: true };
          
                  // Start observing the carousel for changes in the active slide
                  $carousel.find('.znt-product-carousel_slide').each(function() {
                      observer.observe(this, config);
                  });
              });
          }
          
          
          // Function to update the live region text for each live region individually
          function updateLiveRegionText($liveRegion, currentSlideIndex, totalSlides) {
              // Initially clear the live region text
              $liveRegion.text('');
              
              // Set a timeout to update the text after a brief delay
              setTimeout(() => {
                  var text = "Showing slide " + currentSlideIndex + " of " + totalSlides;
                  $liveRegion.text(text);
          
                  // Optionally remove the text after 2 seconds if needed
                  setTimeout(() => {
                      $liveRegion.text('');
                  }, 2000);
              }, 50); // Delay to ensure the screen reader detects the change
          }
          
          
      
  
      
          // Indivisual slides counter
          // Adds a hidden text to each slide with the slide position within the total 
          function initializeSlideCounters() {
              // Iterate through each carousel wrapper
              $('.znt-product-carousel_wrapper').each(function(index, wrapper) {
                  // Count the number of slides within the current carousel wrapper
                  var totalSlides = $(wrapper).find('.znt-product-carousel_slide').length;
              
                  $(wrapper).find('.znt-product-carousel_slide').each(function(slideIndex, slide) {
                      // Generate a unique ID for the <p> element
                      var slideId = 'slide_' + index + '_' + (slideIndex + 1);
              
                      // Only add <p> if it doesn't already exist for this slide
                      if ($('#' + slideId).length === 0) {
                          // Prepare the <p> element text, e.g., "1 of 4"
                          var slideText = (slideIndex + 1) + ' of ' + totalSlides;
              
                          // Add the <p> element as the first child of the current slide
                          var pInfo = $('<p class="d-none" id="' + slideId + '">' + slideText + '</p>');
                          $(slide).prepend(pInfo);
              
                          // Set the aria-labelledby attribute of the slide to point to the added <p> element's ID
                          $(slide).attr('aria-labelledby', slideId);
                      }
              
                      // If the slide has more than one child, add role="group" to it
                      if ($(slide).children().length > 1) {
                          $(slide).attr('role', 'group');
                      }
                  });
              });
          }    
          // END OF - Indivisual slides counter
      
      
      
          // Autoplay
          // Adjusted startAutoplay to ensure forward movement
          function startAutoplay($carousel, interval) {
              var autoplayId = setInterval(() => {
                  if (!$carousel.hasClass('znt-paused')) {
                      var currentSlide = $carousel.find('.znt-product-carousel_slide-active').index();
                      var totalSlides = $carousel.find('.znt-product-carousel_slide').length;
                      var newSlideIndex = (currentSlide + 1) % totalSlides; // Ensure forward movement
          
                      // Update to the new active slide
                      updateActiveSlide($carousel, newSlideIndex);
          
                      // Manually update the wrapper's left property
                      $carousel.find('.znt-product-carousel_wrapper').css('left', '-' + newSlideIndex * 100 + '%');
          
                      updateButtonStates($carousel, newSlideIndex);
          
                      // Ensure the page does not scroll to the carousel
                      var currentScrollTop = $(window).scrollTop();
                      $(window).scrollTop(currentScrollTop);
                  }
              }, interval);
          
              $carousel.data('autoplayId', autoplayId); // Store the interval ID for later use
          }
          
  
          function updateButtonStates($carousel, currentSlide) {
              var totalSlides = $carousel.find('.znt-product-carousel_slide').length;
              $carousel.find('.znt-product-carousel_prev').prop('disabled', currentSlide === 0);
              $carousel.find('.znt-product-carousel_next').prop('disabled', currentSlide === totalSlides - 1);
          }
      
          // Initialize autoplay for each carousel with the znt-autoplay attribute
          $('.znt-product-carousel[znt-autoplay]').each(function() {
              var $this = $(this);
              var carouselId = $this.attr('id'); // Ensure each carousel has a unique ID
              var autoplayAttr = $this.attr('znt-autoplay');
              var autoplayInterval = parseInt(autoplayAttr, 10) || 8000; // Use the attribute value or default to 8000ms
  
              var $carousel = $(this).closest('.znt-product-carousel');
              // Live region to announce when the carousel is playing or paused
              // Assuming $carousel is a jQuery object representing the carousel.
              var ariaLiveValue = $this.hasClass('znt-paused') ? 'assertive' : 'off';
              $carousel.append('<div class="znt-product-carousel_state sr-only" aria-live="' + ariaLiveValue + '"></div>');
  
  
      
              // Retrieve the saved button label from local storage
              var savedButtonLabel = localStorage.getItem(carouselId + '-buttonLabel');
              var savedState = localStorage.getItem(carouselId + '-isPaused');
              var isPaused = savedState === 'true';
      
              // Set the initial label for the toggle button based on saved state or default to 'Pause Carousel'
              var buttonLabel = savedButtonLabel ? savedButtonLabel : 'Pause Carousel';
      
              // Create and append the toggle pause button with the correct label and state
              // Define the SVG markup for the icons
              var svgPlayMarkup = '<svg aria-hidden="true"class="svg-geo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="2,2 30,16 2,30"/></svg>';
              var svgPauseMarkup = '<svg aria-hidden="true"height="32" id="pause" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M4 4 H12 V28 H4 z M20 4 H28 V28 H20 z"/></svg>';
  
              // Create and append the toggle pause button with the correct label and state
              var $togglePauseButton = $('<button class="znt-product-carousel_toggle-pause"></button>')
                  .addClass(isPaused ? 'znt-play' : 'znt-pause')
                  // Use .html() to include both SVG markup and text
                  .html((isPaused ? svgPlayMarkup : svgPauseMarkup) + buttonLabel)
                  .prependTo($this);
      
              // Apply the saved paused state
              if (isPaused) {
                  $this.addClass('znt-paused');
              } else if (!$this.hasClass('znt-paused')) {
                  // If not paused or no state saved, start autoplay if applicable
                  startAutoplay($this, autoplayInterval);
              }
  
              // Removes aria-live on page load when it's autoplaying
              var $message = $(this).find('.znt-message.sr-only');
              if ($this.hasClass('znt-paused')) {
                  $message.attr('aria-live', 'assertive');
              } else {
                  $message.attr('aria-live', 'off');
              }
  
              // $(this).find('.znt-product-carousel_wrapper').attr('aria-live', 'polite');
              $(this).not('.znt-paused').find('.znt-product-carousel_wrapper[aria-live], .znt-message.sr-only').attr('aria-live', 'off');
  
  
              // Button click event handler
              $togglePauseButton.on('click', function() {
                  
                  $this.toggleClass('znt-paused');
                  isPaused = $this.hasClass('znt-paused');
                  
                  // Determine which SVG markup to use based on the paused state
                  var svgMarkup = isPaused ? svgPlayMarkup : svgPauseMarkup;
                  var buttonText = isPaused ? 'Autoplay Carousel' : 'Pause Carousel';
  
                  // Update both class and HTML content of the button to reflect the new state
                  // This includes the correct SVG icon and button label
                  $(this).toggleClass('znt-play znt-pause')
                      .html(svgMarkup + buttonText);
  
                  // Simulate a click on the current dot if the carousel is paused
                  if (isPaused) {
                      $carousel.find('.znt-product-carousel_dot[aria-current="true"]').click();
                  }
  
                  // Save the new state and label to local storage
                  localStorage.setItem(carouselId + '-isPaused', isPaused.toString());
                  localStorage.setItem(carouselId + '-buttonLabel', buttonText);
  
                  // Start or stop autoplay based on the presence of 'znt-paused' class
                  if (isPaused && $this.data('autoplayId')) {
                      clearInterval($this.data('autoplayId'));
                      $this.removeData('autoplayId');
                      $this.find('.znt-message.sr-only').attr('aria-live', 'assertive');
                      $this.find('.znt-product-carousel_wrapper[aria-live]').attr('aria-live', 'polite');
  
                      // Updates the live region from the carousel autoplay state
                      $carousel.find('.znt-product-carousel_state').text('Carousel is paused');
                      setTimeout(function() {
                          $carousel.find('.znt-product-carousel_state').text('');
                      }, 2000);
                  } else if (!isPaused && !$this.data('autoplayId')) {
                      startAutoplay($this, autoplayInterval);
                      $this.find('.znt-product-carousel_wrapper[aria-live], .znt-message.sr-only').attr('aria-live', 'off');
   
                      // Updates the live region from the carousel autoplay state
                      $carousel.find('.znt-product-carousel_state').text('Carousel is playing');
                      setTimeout(function() {
                          $carousel.find('.znt-product-carousel_state').text('');
                      }, 2000);
                  }
              });
          });
  
          // Initialize autoplay for each carousel with the znt-autoplay attribute
          $('.znt-product-carousel[znt-autoplay]').each(function() {
              var $this = $(this);
              var carouselId = $this.attr('id'); // Ensure each carousel has a unique ID
              var autoplayAttr = $this.attr('znt-autoplay');
              var autoplayInterval = parseInt(autoplayAttr, 10) || 8000; // Use the attribute value or default to 8000ms
  
              // Define the function to restart autoplay within this scope
              function restartAutoplay($carousel, interval) {
                  // Clear the existing autoplay interval if it exists
                  var autoplayId = $carousel.data('autoplayId');
                  if (autoplayId) {
                      clearInterval(autoplayId);
                  }
                  // Start autoplay again
                  startAutoplay($carousel, interval);
              }
  
              // Add the rest of your initialization code here...
  
              // Bind restartAutoplay to control interactions within this carousel
              $this.on('click', '.znt-product-carousel_dot, .znt-product-carousel_prev, .znt-product-carousel_next', function() {
                  // Only restart autoplay if the carousel has not been manually paused
                  if (!$this.hasClass('znt-paused')) {
                      restartAutoplay($this, autoplayInterval);
                  }
              });
              
  
              // The rest of your carousel setup continues...
          });
  
  
      
      
      
      
          setTimeout(function() {
              $('body').attr('tabindex', '0');
              $('body').focus();
              $('body').removeAttr('tabindex');
          }, 500);
          // END OF - Autoplay
  
  
          // Dynamic aria-controls
          // Sets up aria-controls on each dot targetting corresponding slides
          function setupDotsAriaControls() {
              // Iterate over each carousel on the page
              $('.znt-product-carousel').each(function(carouselIndex) {
                  // Within each carousel, find slides and dots
                  const $slides = $(this).find('.znt-product-carousel_slide');
                  const $dots = $(this).find('.znt-product-carousel_dot');
          
                  $slides.each(function(index) {
                      // Generate a unique ID for each slide
                      const slideId = `carousel-${carouselIndex}-slide-${index}`;
                      $(this).attr('id', slideId);
          
                      // If there's a corresponding dot, set its aria-controls to match the slide ID
                      if ($dots.eq(index).length) {
                          $dots.eq(index).attr('aria-controls', slideId);
                      }
                  });
              });
          }
          // END OF - Dynamic aria-controls
      
      
          // Dynamic Names and Roles initialization
          function initializeCarousel() {
              // Dynamic sizes initialization
              setCarouselWidth(); 
      
              // Dynamic Names and Roles initialization
              setDynamicNamesAndRoles();
      
              // Call the function on initial load
              addCarouselButtons();
      
              // Next and Previous buttons initialization
              setupCarouselButtonHandlers();
             
              // Call this function to setup the live region and observers
              setupLiveRegionForCarousels();
      
              // Indivisual slides counter
              initializeSlideCounters();
      
              // Dots pagination initialization
              // Call the update function on initial load to set the first slide as active
              $('.znt-product-carousel').each(function() {
                  updateActiveSlide($(this), 0); // Set the first slide as active initially
              });
              // Call the function on initial load
              addCarouselDots();
              setupDotsAriaControls();
  
  
                          // COntrols position
                          updateCarouselControlsPosition();
  
  
  
              // Initial call to update carousel thumbs
              
              setTimeout(function() {
                  updateCarouselThumbs();
              }, 1000);
  
  
              moveCarouselDotsToLeft();
  
              // Initialize the function after the carousels are setup
              setupVerticalScrollForDots();
  
              setupHorizontalScrollForDots()
  
              scrollActiveDotIntoViewZntOrderUpdated();
   
  
          }
      
          initializeCarousel(); // Set up initial state of the carousel
  
          setInterval(function() {
              updateCarouselThumbs();
          }, 1000);
  
          // Function to update dots with thumbnails
          function updateCarouselThumbs() {
              $('.znt-product-carousel[znt-product-carousel-thumbs="true"]').each(function() {
                  var $carousel = $(this);
                  
                  $carousel.find('.znt-product-carousel_slide').each(function(index) {
                      var $slide = $(this);
                      var $dot = $carousel.find('.znt-product-carousel_dots li').eq(index).find('.znt-product-carousel_dot');
                      
                      if ($dot.length) {
                          // Find the image in the slide
                          var imgSrc = $slide.find('img').attr('src');
                          
                          if (imgSrc) {
                              // Apply the thumbnail
                              $dot.css({
                                  'background-image': 'url(' + imgSrc + ')',
                                  'background-size': 'cover',
                                  'background-position': 'center'
                              });
                          }
                      }
                  });
              });
          }
          // END OF - Function to update dots with thumbnails
  
  // Sets scroll for pagination
  function setupVerticalScrollForDots() {
      $(window).on('resize', function() {
          $('.znt-product-carousel[znt-product-carousel-thumbs="true"]').each(function() {
              var $carousel = $(this);
              var $dotsContainer = $carousel.find('.znt-product-carousel_dots');
              var $dots = $dotsContainer.find('.znt-product-carousel_dot');
  
              // Calculate the total height of all dots
              var totalDotsHeight = 0;
              $dots.each(function() {
                  totalDotsHeight += $(this).outerHeight(true);
              });
  
              // Compare the total height of the dots to the visible height of the container
              var containerHeight = $dotsContainer.height();
  
              if (totalDotsHeight > containerHeight) {
                  addScrollButtons($dotsContainer);
              } else {
                  removeScrollButtons($dotsContainer);
              }
          });
      }).trigger('resize');
  
      function addScrollButtons($container) {
          // Check if buttons already exist and if there are more than 6 slides
          if ($container.siblings('.znt-product-carousel_scroll-prev, .znt-product-carousel_scroll-next').length === 0 && 
              $container.find('.znt-product-carousel_dot').length > 6) {
              var dotHeight = $container.find('.znt-product-carousel_dot').outerHeight(true);
              var $prevButton = $('<button class="znt-product-carousel_scroll-prev"><svg aria-hidden="true" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22,2 L10,16 22,30" stroke-width="4"/></svg>Scroll right</button>'); 
              var $nextButton = $('<button class="znt-product-carousel_scroll-next"><svg aria-hidden="true" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10,2 L22,16 10,30" stroke-width="4"/></svg>Scroll left</button>');
  
              $container.before($prevButton).after($nextButton);
  
              // Set up event handlers
              setupScrollEventHandlers($container, dotHeight, $prevButton, $nextButton);
          }
      }
  
      function removeScrollButtons($container) {
          $container.siblings('.znt-product-carousel_scroll-prev, .znt-product-carousel_scroll-next').remove();
      }
  
      // Function to set up scroll event handlers and simulate clicks on the carousel controls
      function setupScrollEventHandlers($container, dotHeight, $prevButton, $nextButton) {
          $prevButton.on('click', function(event) {
              event.preventDefault(); // Prevent default behavior
              event.stopPropagation(); // Stop propagation to avoid affecting page scroll
  
              $container.animate({
                  scrollTop: $container.scrollTop() - dotHeight
              }, 'slow');
  
              // Simulate click on the corresponding .znt-product-carousel_prev button
              $prevButton.closest('.znt-product-carousel').find('.znt-product-carousel_prev').trigger('click');
          });
  
          $nextButton.on('click', function(event) {
              event.preventDefault(); // Prevent default behavior
              event.stopPropagation(); // Stop propagation to avoid affecting page scroll
  
              $container.animate({
                  scrollTop: $container.scrollTop() + dotHeight
              }, 'slow');
  
              // Simulate click on the corresponding .znt-product-carousel_next button
              $nextButton.closest('.znt-product-carousel').find('.znt-product-carousel_next').trigger('click');
          });
      }
  }
  
  
  
  
          function setupHorizontalScrollForDots() {
              $(window).on('resize', function() {
                  $('.znt-product-carousel:not([znt-product-carousel-thumbs])').each(function() {
                      var $carousel = $(this);
                      var $dotsContainer = $carousel.find('.znt-product-carousel_dots');
                      var $dots = $dotsContainer.find('.znt-product-carousel_dot');
          
                      // Calculate the total width of all dots
                      var totalDotsWidth = 0;
                      $dots.each(function() {
                          totalDotsWidth += $(this).outerWidth(true);
                      });
          
                      // Compare the total width of the dots to the visible width of the container
                      var containerWidth = $dotsContainer.width();
          
                      if (totalDotsWidth > containerWidth) {
                          addScrollButtons($dotsContainer);
                      } else {
                          removeScrollButtons($dotsContainer);
                      }
                  });
              }).trigger('resize');
          
              function addScrollButtons($container) {
                  // Check if buttons already exist
                  if ($container.siblings('.znt-product-carousel_scroll-prev, .znt-product-carousel_scroll-next').length === 0) {
                      var dotWidth = $container.find('.znt-product-carousel_dot').outerWidth(true);
                      var $prevButton = $('<button class="znt-product-carousel_scroll-prev"><svg aria-hidden="true" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22,2 L10,16 22,30" stroke-width="4"/></svg>Scroll Left</button>'); 
                      var $nextButton = $('<button class="znt-product-carousel_scroll-next"><svg aria-hidden="true" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10,2 L22,16 10,30" stroke-width="4"/></svg>Scroll Right</button>');
          
                      $container.before($prevButton).after($nextButton);
          
                      // Set up event handlers
                      setupScrollEventHandlers($container, dotWidth, $prevButton, $nextButton);
                  }
              }
          
              function removeScrollButtons($container) {
                  $container.siblings('.znt-product-carousel_scroll-prev, .znt-product-carousel_scroll-next').remove();
              }
          
              function setupScrollEventHandlers($container, dotWidth, $prevButton, $nextButton) {
                  // Remove the focus management and disable logic, only handle clicks for scrolling
                  $prevButton.on('click', function(event) {
                      event.preventDefault(); // Prevent default behavior
                      event.stopPropagation(); // Stop propagation to avoid affecting page scroll
          
                      $container.animate({
                          scrollLeft: $container.scrollLeft() - dotWidth
                      }, 'slow');
                  });
          
                  $nextButton.on('click', function(event) {
                      event.preventDefault(); // Prevent default behavior
                      event.stopPropagation(); // Stop propagation to avoid affecting page scroll
          
                      $container.animate({
                          scrollLeft: $container.scrollLeft() + dotWidth
                      }, 'slow');
                  });
              }
          }
          
          
          
          // END OF - Sets scroll for pagination
        
          
          
      
          // Carousel settings
          // Must be after the scroll code snippets
          // Moves the dots and pause buttons to the first in focus order
          function moveCarouselDotsToLeft() {
              $('.znt-product-carousel[znt-product-carousel-thumbs="true"]').each(function() {
                  var $carousel = $(this);
                  var $dots = $carousel.find('.znt-product-carousel_dots');
                  if($dots.length) {
                      $carousel.prepend($dots);
                  }
  
                  // Keeps the Pause button as the first element of the carousel
                  var $pauseButton = $carousel.find('.znt-product-carousel_toggle-pause');
                  if($pauseButton.length) {
                      $carousel.prepend($pauseButton);
                  }
              });
          }
  
  
          // This one must be the very last
          // Removes the dots from the accessibility Tree
          // Must remain in the DOM due to other scripts dependencies
          $('.znt-product-carousel').each(function() {
              // Check if the znt-product-carousel-dots attribute is not "true"
              if ($(this).attr('znt-product-carousel-pagination') == 'false') {
                  // Find the .znt-product-carousel_dots element within this carousel and set aria-hidden="true"
                  $(this).find('.znt-product-carousel_dots').attr('role', 'presentation');
                  
                  // Then find .znt-product-carousel_dot elements within .znt-product-carousel_dots
                  $(this).find('.znt-product-carousel_dots .znt-product-carousel_dot').each(function() {
                      // Set tabindex="-0" and aria-hidden="true" on each .znt-product-carousel_dot element
                      $(this).attr({
                          'tabindex': '-1',
                          'aria-hidden': 'true'
                      });
                  });
              }
          });
  
  
          // This one must be the very last (right after znt-product-carousel-pagination)
          // Removes the dots from the accessibility Tree
          // Must remain in the DOM due to other scripts dependencies
          $('.znt-product-carousel').each(function() {
              // Check if the znt-product-carousel-dots attribute is not "true"
              if ($(this).attr('znt-product-carousel-arrows') == 'false') {
                  // Find the .znt-product-carousel_dots element within this carousel and set aria-hidden="true"
                  $(this).find('.znt-product-carousel_next, .znt-product-carousel_prev').attr('role', 'presentation');
                  
                  // Then find .znt-product-carousel_dot elements within .znt-product-carousel_dots
                  $(this).find('.znt-product-carousel_next, .znt-product-carousel_prev').each(function() {
                      // Set tabindex="-0" and aria-hidden="true" on each .znt-product-carousel_dot element
                      $(this).attr({
                          'tabindex': '-1',
                          'aria-hidden': 'true'
                      });
                  });
              }
          });
  
  
          // Adds a container to arrange the controls as the last in DOM
          $('.znt-product-carousel').each(function() {
              // Find the .znt-product-carousel_controls within the current .znt-product-carousel
              var controls = $(this).find('.znt-product-carousel_controls');
              var wrapper = $(this).find('.znt-product-carousel_wrapper');
              
              // If controls don't exist, create them
              if (!controls.length) {
                  controls = $('<div class="znt-product-carousel_controls"></div>');
              }
              
              // Always place controls after the wrapper
              if (wrapper.length) {
                  wrapper.after(controls);
              } else {
                  $(this).append(controls);
              }
          });
  
  
  
          // Controls position
          function updateCarouselControlsPosition() {
              // Process all carousels to ensure dots are after wrapper
              var allCarousels = document.querySelectorAll('.znt-product-carousel');
              processCarousels(allCarousels);
          }
          
          function processCarousels(carousels) {
              carousels.forEach(function(carousel) {
                  // Create or select the existing controls container
                  var controlsDiv = carousel.querySelector('.znt-product-carousel_controls');
                  if (!controlsDiv) {
                      controlsDiv = document.createElement('div');
                      controlsDiv.className = 'znt-product-carousel_controls';
                      // Always append after the wrapper
                      var wrapper = carousel.querySelector('.znt-product-carousel_wrapper');
                      if (wrapper) {
                          wrapper.parentNode.insertBefore(controlsDiv, wrapper.nextSibling);
                      } else {
                          carousel.appendChild(controlsDiv);
                      }
                  }
          
                  // Define the selectors for the controls to be moved
                  var controlsSelectors = [
                      '.znt-product-carousel_toggle-pause',
                      '.znt-product-carousel_lightbox-trigger',
                      '.znt-product-carousel_prev',
                      '.znt-product-carousel_next',
                      '.znt-product-carousel_dots'
                  ];
          
                  // Move each control found within the current carousel to the controlsDiv
                  controlsSelectors.forEach(function(selector) {
                      var controlElement = carousel.querySelector(selector);
                      if (controlElement) {
                          controlsDiv.appendChild(controlElement);
                      }
                  });
              });
          }
  
  
  
          // Identifies when the slides order changes and reaply the thumbs and dots
          // Function to generate a unique order string for the slides
          function getOrderStringZntOrderUpdated(wrapper) {
              return $(wrapper).find('.znt-product-carousel_slide').map(function() {
                  return $(this).attr('class'); // using class to detect order changes
              }).get().join(',');
          }
  
          // Initial setup
          $('.znt-product-carousel').each(function() {
              var $this = $(this);
              $this.find('.znt-product-carousel_wrapper').each(function() {
                  var $wrapper = $(this);
                  $wrapper.data('orderStringZntOrderUpdated', getOrderStringZntOrderUpdated($wrapper));
              });
          });
  
          // Function to check and log changes
          function checkOrderChangeZntOrderUpdated() {
              $('.znt-product-carousel').each(function() {
                  var $this = $(this);
                  $this.find('.znt-product-carousel_wrapper').each(function() {
                      var $wrapper = $(this);
                      var currentOrder = getOrderStringZntOrderUpdated($wrapper);
                      var storedOrder = $wrapper.data('orderStringZntOrderUpdated');
  
                      if (currentOrder !== storedOrder) {
                          $wrapper.data('orderStringZntOrderUpdated', currentOrder);
                          $this.find('.znt-product-carousel_dots > li:nth-child(1) > button').click();
                          scrollToTopOfDotsZntOrderUpdated();
                          setTimeout(function() {
                              updateCarouselThumbs();
                          }, 1000);
                      }
                  });
              });
          }
  
          // Observer to detect changes in the DOM
          var observerZntOrderUpdated = new MutationObserver(checkOrderChangeZntOrderUpdated);
  
          // Configuration of the observer
          var configZntOrderUpdated = { childList: true, subtree: true };
  
          // Observe each .znt-product-carousel_wrapper within each .znt-product-carousel
          $('.znt-product-carousel').each(function() {
              var $this = $(this);
              $this.find('.znt-product-carousel_wrapper').each(function() {
                  observerZntOrderUpdated.observe(this, configZntOrderUpdated);
              });
          });
  
          // Trigger an initial check
          checkOrderChangeZntOrderUpdated();
          // END OF - Identifies when the slides order changes and reaply the thumbs and dots
  
  
          // Scrolls the active dot into view
          // Function to scroll the active dot into view
          function scrollActiveDotIntoViewZntOrderUpdated(carousel) {
              var $carousel = $(carousel);
              var $activeDot = $carousel.find('.znt-product-carousel_dot-active');
  
              if ($activeDot.length) {
                  var $dotsContainer = $carousel.find('.znt-product-carousel_dots');
                  $activeDot[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
          }
  
          // Observer to detect changes in the class attribute of the dots
          var observerZntOrderUpdated = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                      var $targetCarousel = $(mutation.target).closest('.znt-product-carousel');
                      scrollActiveDotIntoViewZntOrderUpdated($targetCarousel);
                  }
              });
          });
  
          // Configuration of the observer
          var configZntOrderUpdated = { attributes: true, subtree: true, attributeFilter: ['class'] };
  
          // Observe each .znt-product-carousel_dots for changes
          $('.znt-product-carousel[znt-product-carousel-thumbs="true"]').each(function() {
              var $this = $(this);
              $this.find('.znt-product-carousel_dots > li > button').each(function() {
                  observerZntOrderUpdated.observe(this, configZntOrderUpdated);
              });
          });
  
          // Trigger an initial check
          $('.znt-product-carousel[znt-product-carousel-thumbs="true"]').each(function() {
              scrollActiveDotIntoViewZntOrderUpdated(this);
          });
  
          function scrollToTopOfDotsZntOrderUpdated() {
              $('.znt-product-carousel[znt-product-carousel-thumbs="true"]').each(function() {
                  var $this = $(this);
                  var $dotsContainer = $this.find('.znt-product-carousel_dots');
  
                  if ($dotsContainer.length) {
                      $dotsContainer.scrollTop(0);
                  }
              });
          }
  
          // END OF - Scrolls the active dot into view


          $('.znt-product-carousel').each(function() {
            var $carousel = $(this);
            var $controls = $carousel.find('.znt-product-carousel_controls');
            var $wrapper = $carousel.find('.znt-product-carousel_wrapper');
            var $dots = $carousel.find('.znt-product-carousel_dots');
            var $scrollPrev = $carousel.find('.znt-product-carousel_scroll-prev');
            var $scrollNext = $carousel.find('.znt-product-carousel_scroll-next');
        
            // Create controls if not present
            if (!$controls.length) {
                $controls = $('<div class="znt-product-carousel_controls"></div>');
                $carousel.prepend($controls);
            } else {
                // Move controls before the wrapper
                if ($wrapper.length) {
                    $controls.insertBefore($wrapper);
                } else {
                    $carousel.prepend($controls);
                }
            }
        
            // Move scroll-prev after the wrapper
            if ($wrapper.length && $scrollPrev.length) {
                $scrollPrev.insertAfter($wrapper);
            }
        
            // Move dots after scroll-prev
            if ($scrollPrev.length && $dots.length) {
                $dots.insertAfter($scrollPrev);
            } else if ($wrapper.length && $dots.length) {
                // fallback: if no scroll-prev, place dots after wrapper
                $dots.insertAfter($wrapper);
            }
        
            // Move scroll-next after dots
            if ($dots.length && $scrollNext.length) {
                $scrollNext.insertAfter($dots);
            }
        });
          
      }
  });
  
  

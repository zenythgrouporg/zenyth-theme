if ($(".znt-announcement").length) {

  // Dynamic sizes
  function setCarouselWidth() {
      $('.znt-announcement_wrapper').each(function() {
          var parentWidth = $(this).parent().width(); // Get the width of the parent container
          var slideCount = $(this).children('.znt-announcement_slide').length; // Count the number of slides
  
          // Set the width of the carousel
          $(this).css('width', parentWidth * slideCount);
  
          // Set the width of each slide
          $(this).children('.znt-announcement_slide').css('width', parentWidth);
  
          // Make sure the first slide is visible and active
          $(this).children('.znt-announcement_slide').first()
              .addClass('znt-announcement_slide-active')
              .css('visibility', 'visible');
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
      $('.znt-announcement').each(function(carouselIndex, carousel) {
          // Adds attributes to each carousel
          $(carousel).attr('aria-roledescription', 'carousel');
          $(carousel).attr('role', 'group');
  
          var slides = $(carousel).find('.znt-announcement_slide');
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
      });
  }
  // END OF - Dynamic Names and Roles
  
  
  
  // Next and Previous buttons
  // Creating Next and Prev Controls
  function addCarouselButtons() {
      $('.znt-announcement').each(function() {
          // SVG markup for the previous button
          var svgPrevMarkup = '<svg aria-hidden="true"viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M22,2 L10,16 22,30" stroke-width="4"/></svg>';
  
          // SVG markup for the next button
          var svgNextMarkup = '<svg aria-hidden="true"viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10,2 L22,16 10,30" stroke-width="4"/></svg>';
  
          // Create previous button with SVG
          var prevButton = $('<button></button>', {
              'class': 'znt-announcement_prev',
              'aria-label': 'Previous',
              'html': svgPrevMarkup // Use html to include SVG markup
          });
  
          // Create next button with SVG
          var nextButton = $('<button></button>', {
              'class': 'znt-announcement_next',
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
      $('.znt-announcement').each(function() {
          var $carousel = $(this);
          var $wrapper = $carousel.find('.znt-announcement_wrapper');
          var currentSlide = 0;
  
          // Set initial position and button states
          $wrapper.css('left', '0%');
          $carousel.data('currentSlide', currentSlide); // Store the currentSlide index
          $carousel.find('.znt-announcement_prev').prop('disabled', true); // Disable prev button initially
          
  
          // Next button click event
          $carousel.find('.znt-announcement_next').off('click').on('click', function(event) {
              event.preventDefault();
              moveCarousel($carousel, 'next');
          });
  
          // Previous button click event
          $carousel.find('.znt-announcement_prev').off('click').on('click', function(event) {
              event.preventDefault();
              moveCarousel($carousel, 'prev');
          });
      });
  }
  
  // Function to move the carousel to next or previous slide
  function moveCarousel($carousel, direction) {
      var $wrapper = $carousel.find('.znt-announcement_wrapper');
      var totalSlides = $carousel.find('.znt-announcement_slide').length;
      var currentSlide = $carousel.data('currentSlide');
      var $prevButton = $carousel.find('.znt-announcement_prev');
      var $nextButton = $carousel.find('.znt-announcement_next');
  
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
  
  
  
  
  
  function updateActiveSlide($carousel, newIndex) {
      // Remove active class from all slides
      $carousel.find('.znt-announcement_slide').removeClass('znt-announcement_slide-active');
      // Add active class to the new active slide
      $carousel.find('.znt-announcement_slide').eq(newIndex).addClass('znt-announcement_slide-active');
  }
  
  
  
  
  
  
  
  // Touch swipe 
  $(document).ready(function() {
      var threshold = 100; // Minimum pixels to consider it a swipe
  
      $('.znt-announcement').each(function() {
          var swipeEnabled = $(this).attr('znt-announcement-swipe') !== 'false'; // Default is true if attribute is missing or not "false"
          if (!swipeEnabled) {
              return; // Skip this carousel if swipe is disabled
          }
  
          var isSwiping = false;
          var startX, startY;
  
          $(this).find('.znt-announcement_wrapper').on('touchstart mousedown', function(e) {
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
                          $(this).parent().find('.znt-announcement_next').trigger('click');
                      } else {
                          // Right swipe
                          $(this).parent().find('.znt-announcement_prev').trigger('click');
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
      $('.znt-announcement').each(function() {
          var $carousel = $(this);
          var totalSlides = $carousel.find('.znt-announcement_slide').length;
  
          // Determine aria-live value based on [znt-autoplay] attribute
          var ariaLiveValue = $carousel.is('[znt-autoplay]') ? 'off' : 'assertive';
  
          // Create the live region element with the determined aria-live attribute value
          var liveRegion = $('<div></div>', {
              'class': 'znt-message sr-only',
              'aria-live': ariaLiveValue
          }).prependTo($carousel);
  
          // Initial text update for each live region
          updateLiveRegionText(liveRegion, 1, totalSlides);
  
          // Setup a MutationObserver to observe changes in the active slide for each carousel independently
          var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                      var $activeSlide = $(mutation.target);
                      if ($activeSlide.hasClass('znt-announcement_slide-active')) {
                          var currentSlideIndex = $carousel.find('.znt-announcement_slide').index($activeSlide) + 1;
                          updateLiveRegionText(liveRegion, currentSlideIndex, totalSlides);
                      }
                  }
              });
          });
  
          // Configuration of the observer
          var config = { attributes: true, childList: false, subtree: true };
  
          // Start observing the carousel for changes in the active slide
          $carousel.find('.znt-announcement_slide').each(function() {
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
      $('.znt-announcement_wrapper').each(function(index, wrapper) {
          // Count the number of slides within the current carousel wrapper
          var totalSlides = $(wrapper).find('.znt-announcement_slide').length;
      
          $(wrapper).find('.znt-announcement_slide').each(function(slideIndex, slide) {
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
  function startAutoplay($carousel, interval) {
      var autoplayId = setInterval(() => {
          if (!$carousel.hasClass('znt-paused')) {
              var currentSlide = $carousel.find('.znt-announcement_slide-active').index();
              var totalSlides = $carousel.find('.znt-announcement_slide').length;
              var newSlideIndex = (currentSlide + 1) % totalSlides;
  
              updateActiveSlide($carousel, newSlideIndex);
              $carousel.find('.znt-announcement_wrapper').css('left', '-' + newSlideIndex * 100 + '%');
              updateButtonStates($carousel, newSlideIndex);
  
              // Update dots if they exist
              if ($carousel.find('.znt-announcement_dot').length) {
                  $carousel.find('.znt-announcement_dot').attr('aria-current', 'false')
                      .removeClass('znt-announcement_dot--active');
                  $carousel.find('.znt-announcement_dot').eq(newSlideIndex)
                      .attr('aria-current', 'true')
                      .addClass('znt-announcement_dot--active');
              }
          }
      }, interval);
  
      $carousel.data('autoplayId', autoplayId);
  }
  
  function updateButtonStates($carousel, currentSlide) {
      var totalSlides = $carousel.find('.znt-announcement_slide').length;
      $carousel.find('.znt-announcement_prev').prop('disabled', currentSlide === 0);
      $carousel.find('.znt-announcement_next').prop('disabled', currentSlide === totalSlides - 1);
  }
  
  // Add dots to the carousel
  function addCarouselDots() {
      $('.znt-announcement').each(function() {
          var $carousel = $(this);
          var $slides = $carousel.find('.znt-announcement_slide');
          var $dotsContainer = $('<div class="znt-announcement_dots" role="tablist"></div>');
  
          $slides.each(function(index) {
              var $dot = $('<button class="znt-announcement_dot" role="tab"></button>')
                  .attr('aria-label', 'Show slide ' + (index + 1) + ' of ' + $slides.length)
                  .attr('aria-current', index === 0 ? 'true' : 'false')
                  .addClass(index === 0 ? 'znt-announcement_dot--active' : '');
  
              $dot.on('click', function() {
                  var slideIndex = $(this).index();
                  
                  // Update active states
                  $carousel.find('.znt-announcement_dot')
                      .attr('aria-current', 'false')
                      .removeClass('znt-announcement_dot--active');
                  $(this).attr('aria-current', 'true')
                      .addClass('znt-announcement_dot--active');
  
                  // Move to the selected slide
                  $carousel.find('.znt-announcement_wrapper')
                      .css('left', '-' + (slideIndex * 100) + '%');
                  updateActiveSlide($carousel, slideIndex);
                  updateButtonStates($carousel, slideIndex);
              });
  
              $dotsContainer.append($dot);
          });
  
          $carousel.append($dotsContainer);
      });
  }
  
  // Initialize autoplay for each carousel with the znt-autoplay attribute
  $('.znt-announcement[znt-autoplay]').each(function() {
      var $this = $(this);
      var autoplayInterval = parseInt($(this).attr('znt-autoplay'), 10) || 8000;
  
      // Define SVG icons
      var svgPlayMarkup = '<svg aria-hidden="true" class="svg-geo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="2,2 30,16 2,30"/></svg>';
      var svgPauseMarkup = '<svg aria-hidden="true" height="32" id="pause" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M4 4 H12 V28 H4 z M20 4 H28 V28 H20 z"/></svg>';
  
      // Add dots to the carousel
      addCarouselDots();
  
      // Start autoplay if not paused
      if (!$this.hasClass('znt-paused')) {
          startAutoplay($this, autoplayInterval);
      }
  
      // Handle pause button click
      $this.find('.znt-announcement_toggle-pause').on('click', function() {
          $this.toggleClass('znt-paused');
          
          if ($this.hasClass('znt-paused')) {
              clearInterval($this.data('autoplayId'));
              $this.removeData('autoplayId');
              // Simulate click on current dot to ensure proper slide state
              $this.find('.znt-announcement_dot[aria-current="true"]').click();
              // Update button to show play icon
              $(this).html(svgPlayMarkup + 'Autoplay Carousel').toggleClass('znt-pause znt-play');
          } else {
              startAutoplay($this, autoplayInterval);
              // Update button to show pause icon
              $(this).html(svgPauseMarkup + 'Pause Carousel').toggleClass('znt-play znt-pause');
          }
      });
  
      // Handle dot clicks for autoplay state
      $this.on('click', '.znt-announcement_dot', function() {
          if (!$this.hasClass('znt-paused')) {
              // Reset autoplay timer when manually changing slides
              clearInterval($this.data('autoplayId'));
              startAutoplay($this, autoplayInterval);
          }
      });
  });
  
  setTimeout(function() {
      $('body').attr('tabindex', '0');
      $('body').focus();
      $('body').removeAttr('tabindex');
  }, 500);
  // END OF - Autoplay
  
  
  
  
  
  // Dynamic Names and Roles initialization
  function initializeCarousel() {
      // Dynamic sizes initialization
      setCarouselWidth(); 
  
      // Make first slide visible and active for each carousel
      $('.znt-announcement').each(function() {
          $(this).find('.znt-announcement_slide').first()
              .addClass('znt-announcement_slide-active')
              .css('visibility', 'visible');
          
          // Store the current slide index
          $(this).data('currentSlide', 0);
      });
  
      // Check for single slides and remove controls if needed
      $('.znt-announcement').each(function() {
          var totalSlides = $(this).find('.znt-announcement_slide').length;
          if (totalSlides === 1) {
              // Add delay before removing carousel elements
              setTimeout(() => {
                  // Remove navigation controls
                  $(this).find('.znt-announcement_prev, .znt-announcement_next, .znt-announcement_toggle-pause').remove();
                  
                  // Remove carousel-related ARIA attributes and elements
                  $(this).removeAttr('aria-roledescription')
                        .removeAttr('role')
                        .find('.znt-message.sr-only').remove();
                  
                  // Remove slide-related ARIA attributes and elements
                  $(this).find('.znt-announcement_slide')
                        .removeAttr('aria-roledescription')
                        .removeAttr('aria-labelledby')
                        .removeAttr('role')
                        .find('p.d-none').remove();
                  
                  // Remove carousel-specific classes
                  $(this).find('.znt-announcement_slide').removeClass('znt-announcement_slide-active');
              }, 2000);
          }
      });
  
      // Dynamic Names and Roles initialization
      setDynamicNamesAndRoles();
  
      // Call the function on initial load
      addCarouselButtons();
  
      // Next and Previous buttons initialization
      setupCarouselButtonHandlers();
     
      // Call this function to setup the live region and observers
      setupLiveRegionForCarousels();
  
      // Individual slides counter
      initializeSlideCounters();
  
      // Controls position
                  updateCarouselControlsPosition();
  
      // Remove controls if only one slide (must be after controls are added)
      $('.znt-announcement').each(function() {
          var totalSlides = $(this).find('.znt-announcement_slide').length;
          if (totalSlides === 1) {
              $(this).find('.znt-announcement_prev, .znt-announcement_next, .znt-announcement_toggle-pause').remove();
          }
      });
  }
  
  initializeCarousel(); // Set up initial state of the carousel
  
  // Function to update the active slide class
  function updateActiveSlide($carousel, newIndex) {
      // Remove active class from all slides
      $carousel.find('.znt-announcement_slide').removeClass('znt-announcement_slide-active');
      // Add active class to the new active slide
      $carousel.find('.znt-announcement_slide').eq(newIndex).addClass('znt-announcement_slide-active');
  }
  
  // Controls position
  function updateCarouselControlsPosition() {
      // Handle carousels with controls at the bottom
      var bottomCarousels = document.querySelectorAll('.znt-announcement[znt-announcement-controls-position*="bottom"]');
      processCarousels(bottomCarousels, 'append');
  
      // Handle carousels with controls at the top
      var topCarousels = document.querySelectorAll('.znt-announcement[znt-announcement-controls-position*="top"]');
      processCarousels(topCarousels, 'prepend');
  }
  
  function processCarousels(carousels, action) {
      carousels.forEach(function(carousel) {
          // Create or select the existing controls container
          var controlsDiv = carousel.querySelector('.znt-announcement_controls');
          if (!controlsDiv) {
              controlsDiv = document.createElement('div');
              controlsDiv.className = 'znt-announcement_controls';
              if (action === 'append') {
                  carousel.appendChild(controlsDiv);
              } else if (action === 'prepend') {
                  carousel.insertBefore(controlsDiv, carousel.firstChild);
              }
          }
  
          // Define the selectors for the controls to be moved
          var controlsSelectors = [
              '.znt-announcement_toggle-pause',
              '.znt-announcement_prev',
              '.znt-announcement_next'
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
  
  // Touch swipe 
  $(document).ready(function() {
      var threshold = 100; // Minimum pixels to consider it a swipe
  
      $('.znt-announcement').each(function() {
          var swipeEnabled = $(this).attr('znt-announcement-swipe') !== 'false'; // Default is true if attribute is missing or not "false"
          if (!swipeEnabled) {
              return; // Skip this carousel if swipe is disabled
          }
  
          var isSwiping = false;
          var startX, startY;
  
          $(this).find('.znt-announcement_wrapper').on('touchstart mousedown', function(e) {
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
                          $(this).parent().find('.znt-announcement_next').trigger('click');
                      } else {
                          // Right swipe
                          $(this).parent().find('.znt-announcement_prev').trigger('click');
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
  } // Close the main if statement
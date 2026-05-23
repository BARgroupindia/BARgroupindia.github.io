        // On initial page load, if there is a hash, scroll with offset after layout settles
        $(window).on('load', function () {
            var hash = window.location.hash;
            if (hash && $(hash).length) {
                setTimeout(function () {
                    scrollWithOffset(hash);
                }, 400); // Wait for header/menu rendering
            }
        });
    // Smooth scroll with header offset for anchor links
    function scrollWithOffset(hash) {
        var target = $(hash);
        if (target.length) {
            var headerHeight = $('header.fixed-header').outerHeight() || 0;
            var windowHeight = $(window).height();
            var offsetVH = windowHeight * 0.10; // 10vh
            var scrollTo = target.offset().top - headerHeight - offsetVH;
            scrollTo = Math.max(0, scrollTo);
            $('html, body').animate({ scrollTop: scrollTo }, 600);
        }
    }

    // Intercept anchor clicks for menu links
    $(document).on('click', 'a[href^="#"]', function (e) {
        var hash = this.hash;
        if (hash && $(hash).length) {
            e.preventDefault();

            // If inside a dropdown menu, close it first
            var $dropdown = $(this).closest('.dropdown-menu.show');
            if ($dropdown.length) {
                // Bootstrap 5: hide dropdown
                var dropdownToggle = $dropdown.prev('.dropdown-toggle, [data-bs-toggle="dropdown"]');
                if (dropdownToggle.length) {
                    dropdownToggle.dropdown && dropdownToggle.dropdown('hide');
                }
                $dropdown.removeClass('show');
            }

            // Wait for menu to close and layout to settle
            setTimeout(function () {
                scrollWithOffset(hash);
                // Update URL hash without jumping
                if (history.pushState) {
                    history.pushState(null, null, hash);
                } else {
                    location.hash = hash;
                }
            }, 350); // 350ms for menu animation
        }
    });
$(function () {

    function ensureUnifiedContactLinks() {
        const primaryPhoneDigits = '919950209377';
        const secondaryPhoneDigits = '918209851679';
        const secondaryPhoneHref = 'tel:+918209851679';
        const primaryPhoneText = '+91 9950209377';
        const secondaryPhoneText = '+91 8209851679';

        $('.dropdown-menu').each(function () {
            const $menu = $(this);
            if ($menu.find(`a[href="${secondaryPhoneHref}"]`).length) {
                return;
            }

            const $actionRow = $menu.find('.hstack.gap-3').last();
            if (!$actionRow.length) {
                return;
            }

            
        });

        $('footer').each(function () {
            const $footer = $(this);
            const $contactBlock = $footer.find('a[href^="mailto:"]').first().closest('.d-flex.flex-column');
            if (!$contactBlock.length) {
                return;
            }

            $contactBlock.find('.footer-phone-row').remove();
            $contactBlock.find('a[href^="tel:+91"]').remove();

            const phoneRow = `
                <div class="hstack gap-3 text-white fs-5 footer-phone-row">
                    <iconify-icon icon="lucide:phone" class="fs-7" style="color: #707070;"></iconify-icon>
                    <span><b>Phone:</b>
                        <a href="https://wa.me/${secondaryPhoneDigits}" target="_blank" rel="noopener noreferrer" class="link-hover text-white text-decoration-none">${secondaryPhoneText}</a>,
                        <a href="https://wa.me/${primaryPhoneDigits}" target="_blank" rel="noopener noreferrer" class="link-hover text-white text-decoration-none">${primaryPhoneText}</a>
                    </span>
                </div>
            `;

            const $mailAnchor = $contactBlock.find('a[href^="mailto:"]').first();
            if ($mailAnchor.length) {
                $mailAnchor.after(phoneRow);
            } else {
                $contactBlock.prepend(phoneRow);
            }
        });
    }

    function syncNavbarAndFooterFromIndex() {
        const hasHeader = $('header.header').length > 0;
        const hasFooter = $('footer.footer').length > 0;

        if (!hasHeader && !hasFooter) {
            ensureUnifiedContactLinks();
            return;
        }

        fetch('index.html')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Layout fetch failed');
                }
                return response.text();
            })
            .then(function (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const sourceHeader = doc.querySelector('header.header');
                const sourceFooter = doc.querySelector('footer.footer');

                if (sourceHeader && $('header.header').length) {
                    $('header.header').replaceWith(sourceHeader.outerHTML);
                }

                if (sourceFooter && $('footer.footer').length) {
                    $('footer.footer').replaceWith(sourceFooter.outerHTML);
                }
            })
            .catch(function () {
                // Keep existing layout if fetch fails
            })
            .finally(function () {
                ensureUnifiedContactLinks();
            });
    }

    syncNavbarAndFooterFromIndex();

    // About Us marquee: keep progress across page navigation/back
    function initPersistentAboutMarquee() {
        const $marquee = $('.about-products-marquee .marquee-content').first();
        if (!$marquee.length || typeof window.sessionStorage === 'undefined') {
            return;
        }

        const marqueeEl = $marquee.get(0);
        const marqueeStyle = window.getComputedStyle(marqueeEl);
        const durationRaw = marqueeStyle.animationDuration || '0s';

        let durationMs = 0;
        if (durationRaw.endsWith('ms')) {
            durationMs = parseFloat(durationRaw);
        } else if (durationRaw.endsWith('s')) {
            durationMs = parseFloat(durationRaw) * 1000;
        }

        if (!durationMs || Number.isNaN(durationMs)) {
            return;
        }

        const storageKey = 'aboutProductsMarqueeAnchorMs';
        const now = Date.now();
        let anchorMs = parseInt(sessionStorage.getItem(storageKey), 10);

        if (!anchorMs || Number.isNaN(anchorMs)) {
            anchorMs = now;
            sessionStorage.setItem(storageKey, String(anchorMs));
        }

        const elapsedMs = (now - anchorMs) % durationMs;
        marqueeEl.style.animationDelay = `${-(elapsedMs / 1000)}s`;
    }

    initPersistentAboutMarquee();

    // What we do: keep right tab rows aligned to left image heights
    function syncWhatWeDoHeights() {
        const navItems = document.querySelectorAll('.services-tab .nav-tabs .nav-item');
        const images = document.querySelectorAll('.services-what-we-do-image');

        if (!navItems.length || !images.length) {
            return;
        }

        const itemCount = Math.min(navItems.length, images.length);

        if (window.innerWidth >= 1200) {
            for (let i = 0; i < itemCount; i += 1) {
                const imageHeight = images[i].offsetHeight;
                if (imageHeight > 0) {
                    navItems[i].style.minHeight = `${Math.round(imageHeight)}px`;
                }
            }
        } else {
            navItems.forEach((item) => {
                item.style.minHeight = '';
            });
        }
    }

    syncWhatWeDoHeights();
    setTimeout(syncWhatWeDoHeights, 100);
    window.addEventListener('load', syncWhatWeDoHeights);
    window.addEventListener('resize', syncWhatWeDoHeights);

    // Header Scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() >= 60) {
            $("header").addClass("fixed-header");
        } else {
            $("header").removeClass("fixed-header");
        }
    });


    // Featured Owl Carousel
    const $featuredCarousel = $('.featured-projects-slider .owl-carousel');

    $featuredCarousel.owlCarousel({
        center: true,
        loop: true,
        margin: 30,
        nav: true,
        navText: [
            '<span class="featured-nav-btn" aria-label="Previous slide"><iconify-icon icon="lucide:arrow-left" class="featured-nav-icon"></iconify-icon></span>',
            '<span class="featured-nav-btn" aria-label="Next slide"><iconify-icon icon="lucide:arrow-right" class="featured-nav-icon"></iconify-icon></span>'
        ],
        dots: false,
        autoplay: true,
        autoplayTimeout: 2000,
        autoplayHoverPause: false,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 2
            },
            1000: {
                items: 3
            },
            1200: {
                items: 4
            }
        }
    });

    // Pause autoplay while hovering a product card
    $('.featured-projects-slider').on('mouseenter', '.owl-item .portfolio', function () {
        $featuredCarousel.trigger('stop.owl.autoplay');
    });

    $('.featured-projects-slider').on('mouseleave', '.owl-item .portfolio', function () {
        $featuredCarousel.trigger('play.owl.autoplay', [1500]);
    });

    // Product variant tabs inside Pigments / Reactives cards
    function activateVariant($tab) {
        const nextImage = $tab.attr('data-image');
        const nextLink = $tab.attr('data-link');
        const nextAlt = $tab.attr('data-alt') || $tab.text().trim();
        const $portfolio = $tab.closest('.portfolio');

        if (!nextImage || !nextLink || !$portfolio.length) {
            return;
        }

        $portfolio.find('.variant-main-image').attr('src', nextImage).attr('alt', nextAlt);
        $portfolio.find('.variant-main-link').attr('href', nextLink);
        $portfolio.find('.product-variant-tab').removeClass('is-active');
        $tab.addClass('is-active');
    }

    const variantState = {
        pigments: {
            index: 0,
            paused: false,
            timerId: null
        },
        reactives: {
            index: 1,
            paused: false,
            timerId: null
        }
    };

    function rotateVariantGroup(groupName) {
        const $groupCards = $(`.featured-projects-slider .portfolio[data-variant-group="${groupName}"]`);
        if (!$groupCards.length) {
            return;
        }

        const $tabsInFirstCard = $groupCards.first().find('.product-variant-tab');
        if (!$tabsInFirstCard.length) {
            return;
        }

        const total = $tabsInFirstCard.length;
        variantState[groupName].index = (variantState[groupName].index + 1) % total;

        $groupCards.each(function () {
            const $tab = $(this).find('.product-variant-tab').eq(variantState[groupName].index);
            if ($tab.length) {
                activateVariant($tab);
            }
        });
    }

    function startVariantAutoRotate(groupName) {
        if (!variantState[groupName] || variantState[groupName].timerId) {
            return;
        }

        // Faster rotation for variant groups (pigments/reactives)
        const variantInterval = 1000; // ms, faster than normal carousel
        variantState[groupName].timerId = setInterval(function () {
            if (!variantState[groupName].paused) {
                rotateVariantGroup(groupName);
            }
        }, variantInterval);
    }

    function stopVariantAutoRotate(groupName) {
        if (!variantState[groupName] || !variantState[groupName].timerId) {
            return;
        }

        clearInterval(variantState[groupName].timerId);
        variantState[groupName].timerId = null;
    }

    startVariantAutoRotate('pigments');
    startVariantAutoRotate('reactives');

    $('.featured-projects-slider').on('mouseenter', '.portfolio[data-variant-group]', function () {
        const groupName = $(this).attr('data-variant-group');
        if (variantState[groupName]) {
            variantState[groupName].paused = true;
        }
    });

    $('.featured-projects-slider').on('mouseleave', '.portfolio[data-variant-group]', function () {
        const groupName = $(this).attr('data-variant-group');
        if (variantState[groupName]) {
            variantState[groupName].paused = false;
        }
    });

    $('.featured-projects-slider').on('mouseenter focus', '.product-variant-tab', function () {
        const $tab = $(this);
        const groupName = $tab.closest('.portfolio').attr('data-variant-group');
        const tabIndex = $tab.closest('.portfolio').find('.product-variant-tab').index($tab);

        activateVariant($tab);

        if (variantState[groupName] && tabIndex >= 0) {
            variantState[groupName].index = tabIndex;
        }
    });

    $(window).on('beforeunload', function () {
        stopVariantAutoRotate('pigments');
        stopVariantAutoRotate('reactives');
    });


    // Why Choose Us image swap on industry hover (preloaded to avoid network delay)
    const $whyChooseImage = $('#whyChoosePreviewImage');
    const whyImageCache = {};

    function preloadWhyChooseImage(src) {
        if (!src || whyImageCache[src]) {
            return;
        }
        const img = new Image();
        img.src = src;
        whyImageCache[src] = img;
    }

    function swapWhyChooseImage(nextImage, nextAlt) {
        if (!nextImage || !$whyChooseImage.length) {
            return;
        }

        const currentSrc = $whyChooseImage.attr('src') || '';
        if (currentSrc.endsWith(nextImage) || currentSrc === nextImage) {
            return;
        }

        const preloaded = whyImageCache[nextImage];
        if (preloaded && preloaded.complete) {
            $whyChooseImage.stop(true, true).animate({ opacity: 0.2 }, 80, function () {
                $whyChooseImage.attr('src', nextImage).attr('alt', nextAlt).animate({ opacity: 1 }, 120);
            });
            return;
        }

        const img = preloaded || new Image();
        img.onload = function () {
            $whyChooseImage.stop(true, true).animate({ opacity: 0.2 }, 80, function () {
                $whyChooseImage.attr('src', nextImage).attr('alt', nextAlt).animate({ opacity: 1 }, 120);
            });
        };
        img.src = nextImage;
        whyImageCache[nextImage] = img;
    }

    if ($whyChooseImage.length) {
        // Warm cache for smoother hover on deployed environments
        $('.why-choose-item').each(function () {
            preloadWhyChooseImage($(this).attr('data-why-image'));
        });

        $('.why-choose-industries').on('mouseenter', '.why-choose-item', function () {
            const $item = $(this);
            const nextImage = $item.attr('data-why-image');
            const nextAlt = $item.attr('data-why-alt') || $item.text().trim();

            if (!nextImage) {
                return;
            }

            $('.why-choose-item').removeClass('is-active');
            $item.addClass('is-active');
            swapWhyChooseImage(nextImage, nextAlt);
        });
    }


    // FAQ capsule smooth morph during open/close
    $('.faq').on('show.bs.collapse', '.faq-capsule-answer', function () {
        $(this).closest('.faq-capsule').addClass('is-expanded');
    });

    $('.faq').on('hide.bs.collapse', '.faq-capsule-answer', function () {
        $(this).closest('.faq-capsule').removeClass('is-expanded');
    });

    // FAQ: toggle even when clicking anywhere inside the capsule
    $('.faq').on('click', '.faq-capsule', function (e) {
        const $target = $(e.target);
        if ($target.closest('.faq-capsule-btn').length || $target.closest('a').length) {
            return;
        }

        const $btn = $(this).find('.faq-capsule-btn').first();
        if ($btn.length) {
            $btn.trigger('click');
        }
    });


    // Count on view
    function animateCount($el) {
        if ($el.data('counted')) {
            return;
        }

        const target = parseInt($el.data('target'), 10) || parseInt($el.text(), 10) || 0;
        $el.data('counted', true);
        $el.prop('Counter', 0).animate({
            Counter: target
        }, {
            duration: 1000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    }

    const $counts = $('.count');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount($(entry.target));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        $counts.each(function () {
            observer.observe(this);
        });
    } else {
        $counts.each(function () {
            animateCount($(this));
        });
    }


    // ScrollToTop
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    const btn = document.getElementById("scrollToTopBtn");
    btn.addEventListener("click", scrollToTop);

    window.onscroll = function () {
        const btn = document.getElementById("scrollToTopBtn");
        if (document.documentElement.scrollTop > 100 || document.body.scrollTop > 100) {
            btn.style.display = "flex";
        } else {
            btn.style.display = "none";
        }
    };


    // Aos
	AOS.init({
		once: true,
	});

});




const contactForm = document.querySelector(".get-in-touch form");

if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const nameEl = document.getElementById("name");
        const emailEl = document.getElementById("email");
        const phoneEl = document.getElementById("phone");
        const companyEl = document.getElementById("company");
        const designationEl = document.getElementById("Designation");
        const requestTypeEl = document.getElementById("RequestproductInput");
        const businessEl = document.getElementById("business");
        const countryEl = document.getElementById("country");
        const stateEl = document.getElementById("state");
        const cityEl = document.getElementById("city");
        const pincodeEl = document.getElementById("pincode");
        const messageEl = document.getElementById("message");
        const productInputEl = document.getElementById("productInput");

        // Per-field inline error helpers
        function showFieldError(errorId, message) {
            const el = document.getElementById(errorId);
            if (!el) return;
            el.textContent = message;
            el.classList.remove("d-none");
        }

        function clearFieldError(errorId) {
            const el = document.getElementById(errorId);
            if (!el) return;
            el.textContent = "";
            el.classList.add("d-none");
        }

        // Clear all field errors first
        ["nameError","emailError","phoneError","companyError","designationError",
         "requestError","businessError","productError","locationError","pincodeError"].forEach(clearFieldError);

        if (!nameEl || !emailEl || !phoneEl || !companyEl || !designationEl || !requestTypeEl || !businessEl || !countryEl || !stateEl || !cityEl || !pincodeEl || !messageEl || !productInputEl) {
            return;
        }

        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const phone = phoneEl.value.trim();
        const company = companyEl.value.trim();
        const designation = designationEl.value.trim();
        const requestType = requestTypeEl.value.trim();
        const business = businessEl.value.trim();
        const country = countryEl.value;
        const state = stateEl.value;
        const city = cityEl.value;
        const pincode = pincodeEl.value.trim();
        const productInput = productInputEl.value.trim();

        // Email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Phone regex – digits, spaces, +, -, parentheses only (any length)
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;

        let hasError = false;

        if (!name || name.length < 2) {
            showFieldError("nameError", "Please enter a valid name.");
            hasError = true;
        } else if (/\d/.test(name)) {
            showFieldError("nameError", "Name should not contain numbers.");
            hasError = true;
        }

        if (!emailRegex.test(email)) {
            showFieldError("emailError", "Please enter a valid email address.");
            hasError = true;
        }

        if (!phone || !phoneRegex.test(phone)) {
            showFieldError("phoneError", "Please enter a valid phone number (no letters allowed).");
            hasError = true;
        }

        if (!company) {
            showFieldError("companyError", "Company name is required.");
            hasError = true;
        }

        if (!designation) {
            showFieldError("designationError", "Designation is required.");
            hasError = true;
        } else if (/\d/.test(designation)) {
            showFieldError("designationError", "Designation should not contain numbers.");
            hasError = true;
        }

        if (!requestType) {
            showFieldError("requestError", "Please select a type of request.");
            hasError = true;
        }

        if (!business) {
            showFieldError("businessError", "Please select your business type.");
            hasError = true;
        }

        if (!productInput) {
            showFieldError("productError", "Please select at least one product.");
            hasError = true;
        }

        if (!country) {
            showFieldError("locationError", "Please select your country.");
            hasError = true;
        }

        if (!pincode || !/^\d{4,10}$/.test(pincode)) {
            showFieldError("pincodeError", "Please enter a valid pincode (digits only, 4–10 digits).");
            hasError = true;
        }

        if (hasError) return;

        this.submit(); // remove this if using AJAX later
    });
}


const countryEl = document.getElementById("country");
const stateEl = document.getElementById("state");
const cityEl = document.getElementById("city");

// Load countries
fetch("https://countriesnow.space/api/v0.1/countries/positions")
  .then(res => res.json())
  .then(data => {
    data.data.forEach(c => {
      countryEl.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
  });

// On country change → load states
countryEl.addEventListener("change", function () {
    stateEl.innerHTML = "<option value=\"\">State</option>";
    cityEl.innerHTML = "<option value=\"\">City</option>";

  fetch("https://countriesnow.space/api/v0.1/countries/states", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country: this.value })
  })
    .then(res => res.json())
    .then(data => {
      data.data.states.forEach(s => {
        stateEl.innerHTML += `<option value="${s.name}">${s.name}</option>`;
      });
    });
});

// On state change → load cities
stateEl.addEventListener("change", function () {
    cityEl.innerHTML = "<option value=\"\">City</option>";

  fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      country: countryEl.value,
      state: this.value
    })
  })
    .then(res => res.json())
    .then(data => {
      data.data.forEach(c => {
        const normalized = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        cityEl.innerHTML += `<option value="${normalized}">${normalized}</option>`;
      });
    });
});



const input = document.getElementById("productInput");
const dropdown = document.getElementById("productDropdown");
const checkboxes = dropdown.querySelectorAll("input");

input.addEventListener("click", () => {
  dropdown.classList.toggle("d-none");
});

checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    const selected = Array.from(checkboxes)
      .filter(i => i.checked)
      .map(i => i.value);

    input.value = selected.join("; ");
  });
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".position-relative")) {
    dropdown.classList.add("d-none");
  }
});

const Requestinput = document.getElementById("RequestproductInput");
const Requestdropdown = document.getElementById("RequestproductDropdown");
const skcheckboxes = Requestdropdown.querySelectorAll("input");


Requestinput.addEventListener("click", () => {
  Requestdropdown.classList.toggle("d-none");
});

skcheckboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    const selected = Array.from(skcheckboxes)
      .filter(i => i.checked)
      .map(i => i.value);

    Requestinput.value = selected.join("; ");
  });
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".position-relative")) {
    Requestdropdown.classList.add("d-none");
  }
});


const businessinput = document.getElementById("business");
const businessDropdown = document.getElementById("businessDropdown");
const skdcheckboxes = businessDropdown.querySelectorAll("input");


businessinput.addEventListener("click", () => {
  businessDropdown.classList.toggle("d-none");
});

skdcheckboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    const selected = Array.from(skdcheckboxes)
      .filter(i => i.checked)
      .map(i => i.value);

    businessinput.value = selected.join("; ");
  });
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".position-relative")) {
    businessDropdown.classList.add("d-none");
  }
});

// Real-time input filtering & validation
(function () {
    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const designationEl = document.getElementById('Designation');
    const phoneEl = document.getElementById('phone');
    const companyEl = document.getElementById('company');
    const pincodeEl = document.getElementById('pincode');
    const countryEl = document.getElementById('country');
    const stateEl = document.getElementById('state');
    const cityEl = document.getElementById('city');
    const productInputEl = document.getElementById('productInput');
    const requestInputEl = document.getElementById('RequestproductInput');
    const businessEl = document.getElementById('business');

    function clearError(errorId) {
        const el = document.getElementById(errorId);
        if (el) {
            el.textContent = "";
            el.classList.add("d-none");
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;

    if (nameEl) {
        nameEl.addEventListener('input', function () {
            this.value = this.value.replace(/[0-9]/g, '');
            if (this.value.trim().length >= 2 && !/\d/.test(this.value)) {
                clearError('nameError');
            }
        });
    }

    if (emailEl) {
        emailEl.addEventListener('input', function () {
            if (emailRegex.test(this.value.trim())) {
                clearError('emailError');
            }
        });
    }

    if (designationEl) {
        designationEl.addEventListener('input', function () {
            this.value = this.value.replace(/[0-9]/g, '');
            if (this.value.trim().length > 0 && !/\d/.test(this.value)) {
                clearError('designationError');
            }
        });
    }

    if (phoneEl) {
        phoneEl.addEventListener('input', function () {
            this.value = this.value.replace(/[a-zA-Z]/g, '');
            if (this.value.trim().length > 0 && phoneRegex.test(this.value.trim())) {
                clearError('phoneError');
            }
        });
    }

    if (companyEl) {
        companyEl.addEventListener('input', function () {
            if (this.value.trim().length > 0) {
                clearError('companyError');
            }
        });
    }

    if (pincodeEl) {
        pincodeEl.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '');
            if (/^\d{4,10}$/.test(this.value)) {
                clearError('pincodeError');
            }
        });
    }

    if (countryEl) {
        countryEl.addEventListener('change', function () {
            if (this.value && stateEl.value && cityEl.value) {
                clearError('locationError');
            }
        });
    }

    if (stateEl) {
        stateEl.addEventListener('change', function () {
            if (countryEl.value && this.value && cityEl.value) {
                clearError('locationError');
            }
        });
    }

    if (cityEl) {
        cityEl.addEventListener('change', function () {
            if (countryEl.value && stateEl.value && this.value) {
                clearError('locationError');
            }
        });
    }

    if (productInputEl) {
        productInputEl.addEventListener('change', function () {
            if (this.value.trim().length > 0) {
                clearError('productError');
            }
        });
    }

    if (requestInputEl) {
        requestInputEl.addEventListener('change', function () {
            if (this.value.trim().length > 0) {
                clearError('requestError');
            }
        });
    }

    if (businessEl) {
        businessEl.addEventListener('change', function () {
            if (this.value.trim().length > 0) {
                clearError('businessError');
            }
        });
    }
}());

const fileInput = document.getElementById("attachment");
const fileBtn = document.getElementById("fileBtn");
const fileText = document.getElementById("fileText");
const fileError = document.getElementById("fileError");

const MAX_SIZE_MB = 30;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

fileBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const files = fileInput.files;

  // Reset error
  fileError.classList.add("d-none");
  fileError.textContent = "";

  const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);

  if (totalSize > MAX_SIZE_BYTES) {
    fileInput.value = "";
    fileText.textContent = "No file chosen (max 30 MB)";

    fileError.textContent = "Total file size must not exceed 30 MB.";
    fileError.classList.remove("d-none");

    return;
  }

  if (files.length > 0) {
    const names = Array.from(files).map(f => f.name);
    fileText.textContent = names.join(", ");
  } else {
    fileText.textContent = "No file chosen (max 30 MB)";
  }
});

// Image Lazy Loading - Load images only when they come into viewport
$(function() {
  // Check if browser supports IntersectionObserver
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          // Stop observing this image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px' // Start loading 50px before image enters viewport
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers - load all images immediately
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
});
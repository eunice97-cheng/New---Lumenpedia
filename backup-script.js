document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded - initializing Lumenpedia...");

    // ================== INITIALIZE ALL CAROUSELS ==================
    function initializeAllCarousels() {
        console.log("Initializing carousels...");

        const allPopularSections = document.querySelectorAll('.popular-wrapper');
        console.log(`Found ${allPopularSections.length} carousel sections`);

        allPopularSections.forEach((wrapper, index) => {
            if (wrapper.dataset.initialized) return;

            const popular = wrapper.querySelector('.popular');
            const leftBtn = wrapper.querySelector('.scroll-btn.left');
            const rightBtn = wrapper.querySelector('.scroll-btn.right');

            if (popular && leftBtn && rightBtn) {
                setupCarousel(popular, leftBtn, rightBtn);
                wrapper.dataset.initialized = "true";
            }
        });
    }

    // ================== A-Z BUTTONS & SEARCH FUNCTIONALITY ==================
    const alphabetEl = document.getElementById('alphabet');
    const searchEl = document.getElementById('search');

    if (!alphabetEl || !searchEl) {
        console.error("Required elements not found!");
        return;
    }

    const letterSections = document.querySelectorAll('.letter-section');
    const availableLetters = Array.from(letterSections).map(section => {
        const title = section.querySelector('h3');
        return title ? title.textContent.replace(/[^A-Z]/g, '') : '';
    }).filter(letter => letter.length === 1);

    // ================== SECTION TITLE VISUAL FEEDBACK ==================
    function activateSectionTitle(letter) {
        document.querySelectorAll('.section-title').forEach(title => {
            title.classList.remove('active');
        });

        const targetSection = document.getElementById(`section-${letter}`);
        if (targetSection) {
            const title = targetSection.querySelector('.section-title');
            if (title) {
                title.classList.add('active');
            }
        }
    }

    function deactivateAllSectionTitles() {
        document.querySelectorAll('.section-title').forEach(title => {
            title.classList.remove('active');
        });
    }

    // Add ALL button
    const allBtn = document.createElement('button');
    allBtn.className = 'letter all';
    allBtn.textContent = 'ALL';
    allBtn.addEventListener('click', () => {
        showAllSections();
        deactivateAllSectionTitles();
        document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    alphabetEl.insertBefore(allBtn, alphabetEl.firstChild);

    // Build A-Z buttons
    const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    ALPHABET.forEach(letter => {
        const btn = document.createElement('button');
        const isAvailable = availableLetters.includes(letter);
        btn.className = 'letter' + (isAvailable ? '' : ' disabled');
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.addEventListener('click', () => {
            if (!isAvailable) return;
            showSectionByLetter(letter);
            activateSectionTitle(letter);
            document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        alphabetEl.appendChild(btn);
    });

    // ================== SEARCH FUNCTIONALITY ==================
    searchEl.addEventListener('input', () => {
        const query = searchEl.value.trim().toLowerCase();
        
        // Hide Most Searched section when searching
        const mostSearchedSection = document.querySelector('.popular-section');
        if (mostSearchedSection) {
            if (query === '') {
                mostSearchedSection.style.display = 'block';
            } else {
                mostSearchedSection.style.display = 'none';
            }
        }

        if (query === '') {
            showAllSections();
            deactivateAllSectionTitles();
            return;
        }

        hideAllSections();
        let foundAny = false;

        letterSections.forEach(section => {
            const cards = section.querySelectorAll('.pop-card');
            let sectionHasMatch = false;

            cards.forEach(card => {
                const titleElement = card.querySelector('.pop-title');
                const imgElement = card.querySelector('.thumb img');

                if (!titleElement) return;

                const title = titleElement.textContent.toLowerCase();
                const thumbAlt = imgElement ? imgElement.alt.toLowerCase() : '';

                if (title.includes(query) || thumbAlt.includes(query)) {
                    card.style.display = 'flex';
                    sectionHasMatch = true;
                    foundAny = true;
                } else {
                    card.style.display = 'none';
                }
            });

            if (sectionHasMatch) {
                section.style.display = 'block';
                const wrapper = section.querySelector('.popular-wrapper');
                if (wrapper) {
                    const popular = wrapper.querySelector('.popular');
                    const leftBtn = wrapper.querySelector('.scroll-btn.left');
                    const rightBtn = wrapper.querySelector('.scroll-btn.right');
                    if (popular && leftBtn && rightBtn) {
                        setupCarousel(popular, leftBtn, rightBtn);
                    }
                }
            }
        });

        if (!foundAny) showNoResultsMessage();
    });

    // ================== HELPER FUNCTIONS ==================
    function showAllSections() {
        // Show Most Searched section when showing all
        const mostSearchedSection = document.querySelector('.popular-section');
        if (mostSearchedSection) {
            mostSearchedSection.style.display = 'block';
        }

        letterSections.forEach(section => {
            section.style.display = 'block';
            const cards = section.querySelectorAll('.pop-card');
            cards.forEach(card => card.style.display = 'flex');
        });
        removeNoResultsMessage();
        setTimeout(initializeAllCarousels, 100);
    }

    function showSectionByLetter(letter) {
        // Hide Most Searched section when showing specific letter
        const mostSearchedSection = document.querySelector('.popular-section');
        if (mostSearchedSection) {
            mostSearchedSection.style.display = 'none';
        }

        hideAllSections();
        removeNoResultsMessage();

        letterSections.forEach(section => {
            const title = section.querySelector('h3');
            if (!title) return;

            const sectionLetter = title.textContent.replace(/[^A-Z]/g, '');
            if (sectionLetter === letter) {
                section.style.display = 'block';
                const cards = section.querySelectorAll('.pop-card');
                cards.forEach(card => card.style.display = 'flex');
                const wrapper = section.querySelector('.popular-wrapper');
                if (wrapper) {
                    const popular = wrapper.querySelector('.popular');
                    const leftBtn = wrapper.querySelector('.scroll-btn.left');
                    const rightBtn = wrapper.querySelector('.scroll-btn.right');
                    if (popular && leftBtn && rightBtn) {
                        setupCarousel(popular, leftBtn, rightBtn);
                    }
                }
            }
        });
    }

    function hideAllSections() {
        letterSections.forEach(section => section.style.display = 'none');
    }

    function showNoResultsMessage() {
        removeNoResultsMessage();
        const message = document.createElement('div');
        message.className = 'no-results';
        message.innerHTML = `<p style="text-align: center; color: var(--neon-pink); margin: 2rem 0; font-size: 1.2rem;">No results found for "${searchEl.value}"</p>`;
        
        // Insert after the search section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.parentNode.insertBefore(message, heroSection.nextSibling);
        }
    }

    function removeNoResultsMessage() {
        const existingMessage = document.querySelector('.no-results');
        if (existingMessage) existingMessage.remove();
    }

    // ================== INITIALIZE EVERYTHING ==================
    setTimeout(initializeAllCarousels, 100);
    showAllSections();
});

// ================== CAROUSEL WITH PROPER LINK SUPPORT ==================
function setupCarousel(popular, leftBtn, rightBtn) {
    if (!popular || !leftBtn || !rightBtn) {
        console.warn('Carousel elements missing');
        return;
    }

    const cards = Array.from(popular.querySelectorAll('.pop-card'));
    if (cards.length === 0) {
        leftBtn.style.display = "none";
        rightBtn.style.display = "none";
        return;
    }

    const cardWidth = 200;
    const gap = 20;
    const cardWithGap = cardWidth + gap;
    const visibleCards = Math.max(1, Math.floor(popular.offsetWidth / cardWithGap));

    // Set fixed card sizes
    cards.forEach(card => {
        card.style.flex = `0 0 ${cardWidth}px`;
        card.style.width = `${cardWidth}px`;
        card.style.minWidth = `${cardWidth}px`;
        card.style.maxWidth = `${cardWidth}px`;
    });

    let currentPosition = 0;
    let maxScroll = popular.scrollWidth - popular.clientWidth;

    // Update button states
    function updateButtonStates() {
        leftBtn.style.opacity = popular.scrollLeft <= 10 ? "0.5" : "1";
        rightBtn.style.opacity = popular.scrollLeft >= maxScroll - 10 ? "0.5" : "1";
        
        leftBtn.disabled = popular.scrollLeft <= 10;
        rightBtn.disabled = popular.scrollLeft >= maxScroll - 10;
    }

    // Scroll functions
    function scrollLeft() {
        const newPosition = Math.max(0, popular.scrollLeft - (visibleCards * cardWithGap));
        popular.scrollTo({ left: newPosition, behavior: 'smooth' });
    }

    function scrollRight() {
        const newPosition = Math.min(maxScroll, popular.scrollLeft + (visibleCards * cardWithGap));
        popular.scrollTo({ left: newPosition, behavior: 'smooth' });
    }

    // Event listeners for buttons
    leftBtn.addEventListener("click", scrollLeft);
    rightBtn.addEventListener("click", scrollRight);

    // Update max scroll on resize and update button states on scroll
    popular.addEventListener("scroll", updateButtonStates);
    window.addEventListener("resize", () => {
        maxScroll = popular.scrollWidth - popular.clientWidth;
        updateButtonStates();
    });

    // FIX FOR LINKS: Add a simple click handler that doesn't interfere
    popular.addEventListener('click', (e) => {
        const link = e.target.closest('.pop-card-link');
        if (link && link.href) {
            // Allow the link to work normally
            return true;
        }
    }, true); // Use capture phase to handle links early

    // Enhanced drag scrolling
    let isDragging = false;
    let startX;
    let scrollLeftStart;

    popular.addEventListener('mousedown', (e) => {
        // Don't interfere with link clicks
        if (e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        isDragging = true;
        popular.style.cursor = 'grabbing';
        popular.style.scrollSnapType = 'none';
        startX = e.pageX - popular.offsetLeft;
        scrollLeftStart = popular.scrollLeft;
    });

    popular.addEventListener('mouseleave', () => {
        isDragging = false;
        popular.style.cursor = 'grab';
        popular.style.scrollSnapType = 'x mandatory';
    });

    popular.addEventListener('mouseup', () => {
        isDragging = false;
        popular.style.cursor = 'grab';
        popular.style.scrollSnapType = 'x mandatory';
        
        // Re-enable snap after drag
        setTimeout(() => {
            popular.style.scrollSnapType = 'x mandatory';
        }, 100);
    });

    popular.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - popular.offsetLeft;
        const walk = (x - startX) * 2;
        popular.scrollLeft = scrollLeftStart - walk;
    });

    // Touch support for mobile
    popular.addEventListener('touchstart', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        startX = e.touches[0].pageX - popular.offsetLeft;
        scrollLeftStart = popular.scrollLeft;
    }, { passive: true });

    popular.addEventListener('touchmove', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        const x = e.touches[0].pageX - popular.offsetLeft;
        const walk = (x - startX) * 2;
        popular.scrollLeft = scrollLeftStart - walk;
    }, { passive: true });

    // Initial button state
    updateButtonStates();
}

// ================== EXPANDABLE HEADER IMAGES ==================
document.addEventListener('DOMContentLoaded', function () {
    const classicImage = document.getElementById('classic-image');
    const mainImage = document.getElementById('main-image');
    const classicColumn = document.getElementById('classic-column');
    const mainColumn = document.getElementById('main-column');

    function addCloseButtons() {
        if (!classicColumn.querySelector('.close-btn')) {
            const closeBtn = document.createElement('div');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                resetColumns();
            });
            classicColumn.appendChild(closeBtn);
        }
        if (!mainColumn.querySelector('.close-btn')) {
            const closeBtn = document.createElement('div');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                resetColumns();
            });
            mainColumn.appendChild(closeBtn);
        }
    }

    function resetColumns() {
        classicColumn.classList.remove('expanded', 'hidden');
        mainColumn.classList.remove('expanded', 'hidden');
        classicImage.classList.remove('grayed-out');
        mainImage.classList.remove('grayed-out');

        const closeBtns = document.querySelectorAll('.close-btn');
        closeBtns.forEach(btn => btn.remove());
    }

    function expandClassic() {
        resetColumns();
        classicColumn.classList.add('expanded');
        mainColumn.classList.add('hidden');
        mainImage.classList.add('grayed-out');
        addCloseButtons();
    }

    function expandMain() {
        resetColumns();
        mainColumn.classList.add('expanded');
        classicColumn.classList.add('hidden');
        classicImage.classList.add('grayed-out');
        addCloseButtons();
    }

    // Expand classic column
    classicImage.addEventListener('click', function () {
        if (classicColumn.classList.contains('expanded')) {
            resetColumns();
        } else {
            expandClassic();
        }
    });

    // Expand main column
    mainImage.addEventListener('click', function () {
        if (mainColumn.classList.contains('expanded')) {
            resetColumns();
        } else {
            expandMain();
        }
    });
});

// ================== ADDITIONAL LINK FIX FOR A SECTION ==================
setTimeout(() => {
    // Force links to work by reattaching event listeners
    const allLinks = document.querySelectorAll('.pop-card-link');
    allLinks.forEach(link => {
        link.setAttribute('onclick', `window.location.href='${link.href}'; return false;`);
    });
}, 500);
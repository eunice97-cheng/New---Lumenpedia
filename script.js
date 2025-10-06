document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded - initializing Lumenpedia...");

    // ================== INITIALIZE ALL CAROUSELS ==================
    function initializeAllCarousels() {
        console.log("Initializing carousels...");

        const allPopularSections = document.querySelectorAll('.popular-wrapper');
        console.log(`Found ${allPopularSections.length} carousel sections`);

        allPopularSections.forEach((wrapper, index) => {
            // Skip if already initialized
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
        letterSections.forEach(section => {
            section.style.display = 'block';
            const cards = section.querySelectorAll('.pop-card');
            cards.forEach(card => card.style.display = 'flex');
        });
        removeNoResultsMessage();
        setTimeout(initializeAllCarousels, 100);
    }

    function showSectionByLetter(letter) {
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
        const popularSection = document.querySelector('.popular-section');
        if (popularSection) popularSection.parentNode.insertBefore(message, popularSection.nextSibling);
    }

    function removeNoResultsMessage() {
        const existingMessage = document.querySelector('.no-results');
        if (existingMessage) existingMessage.remove();
    }

    // ================== INITIALIZE EVERYTHING ==================
    setTimeout(initializeAllCarousels, 100);
    showAllSections();
});//


// ================== NETFLIX CAROUSEL WITH INFINITE LOOP & CENTER EFFECTS ==================
function setupCarousel(popular, leftBtn, rightBtn) {
    if (!popular) return;

    const FIXED_W = 200;
    const gap = parseInt(getComputedStyle(popular).gap) || 20;
    const cardWithGap = FIXED_W + gap;

    function lockCardSize(card) {
        card.style.flex = `0 0 ${FIXED_W}px`;
        card.style.width = `${FIXED_W}px`;
        card.style.minWidth = `${FIXED_W}px`;
        card.style.maxWidth = `${FIXED_W}px`;
    }

    // Remove existing clones
    const existingClones = popular.querySelectorAll('.pop-card.clone');
    existingClones.forEach(clone => clone.remove());

    const originalCards = Array.from(popular.querySelectorAll('.pop-card:not(.clone)'));
    if (originalCards.length === 0) return;

    originalCards.forEach(lockCardSize);

    const cardCount = originalCards.length;
    const visibleCards = Math.max(1, Math.floor(popular.offsetWidth / cardWithGap));

    // CASE 1: Not enough cards for scrolling
    if (cardCount <= visibleCards) {
        leftBtn.style.display = "none";
        rightBtn.style.display = "none";
        removeAllFocusEffects();
        return;
    }

    // CASE 2: Enable Netflix-style scrolling
    leftBtn.style.display = "block";
    rightBtn.style.display = "block";

    // Add clones for infinite loop
    for (let i = cardCount - visibleCards; i < cardCount; i++) {
        const clone = originalCards[i].cloneNode(true);
        clone.classList.add('clone');
        lockCardSize(clone);
        popular.insertBefore(clone, popular.firstChild);
    }

    for (let i = 0; i < visibleCards; i++) {
        const clone = originalCards[i].cloneNode(true);
        clone.classList.add('clone');
        lockCardSize(clone);
        popular.appendChild(clone);
    }

    const startScroll = cardWithGap * visibleCards;
    popular.scrollLeft = startScroll;
    let currentIndex = 0;
    let isScrolling = false;

    // Center card scaling and glow effects
    function updateCardFocus() {
        const cards = Array.from(popular.querySelectorAll('.pop-card'));
        if (!cards.length) return;

        const wrapperRect = popular.getBoundingClientRect();
        const centerX = wrapperRect.left + wrapperRect.width / 2;

        let closestCard = null;
        let closestDistance = Infinity;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const distance = Math.abs(centerX - cardCenter);

            // Scale and opacity based on distance from center
            const scale = Math.max(0.85, 1 - distance / 600);
            const opacity = Math.max(0.6, 1 - distance / 800);

            card.style.transform = `scale(${scale})`;
            card.style.opacity = opacity;
            card.classList.remove('active-card');

            if (distance < closestDistance) {
                closestDistance = distance;
                closestCard = card;
            }
        });

        // Add active class to center card
        if (closestCard) {
            closestCard.classList.add('active-card');
            closestCard.style.transform = `scale(1.05)`;
            closestCard.style.opacity = '1';
        }
    }

    // Infinite scroll handler
    function handleInfiniteScroll() {
        if (isScrolling) return;

        const scrollLeft = popular.scrollLeft;
        const scrollWidth = popular.scrollWidth;
        const clientWidth = popular.clientWidth;

        // Jump to clones for infinite effect
        if (scrollLeft <= 0) {
            isScrolling = true;
            popular.scrollLeft = scrollWidth - (2 * clientWidth);
            setTimeout(() => { isScrolling = false; }, 50);
        } else if (scrollLeft >= scrollWidth - clientWidth) {
            isScrolling = true;
            popular.scrollLeft = clientWidth;
            setTimeout(() => { isScrolling = false; }, 50);
        }
    }

    // Scroll to specific index
    function scrollToIndex(index, smooth = true) {
        const left = startScroll + index * cardWithGap;
        popular.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
        currentIndex = index;
    }

    // Scroll carousel
    function scrollCarousel(direction) {
        if (isScrolling) return;
        isScrolling = true;

        let nextIndex = currentIndex + direction;
        if (nextIndex >= cardCount) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = cardCount - 1;
        }

        scrollToIndex(nextIndex);
        setTimeout(() => { isScrolling = false; }, 300);
    }

    // Remove focus effects (for non-scrollable sections)
    function removeAllFocusEffects() {
        const cards = Array.from(popular.querySelectorAll('.pop-card'));
        cards.forEach(card => {
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
            card.classList.remove('active-card');
        });
    }

    // Event listeners
    leftBtn.addEventListener("click", () => scrollCarousel(-1));
    rightBtn.addEventListener("click", () => scrollCarousel(1));

    popular.addEventListener("scroll", () => {
        handleInfiniteScroll();
        updateCardFocus();
    });

    window.addEventListener("resize", updateCardFocus);

    // Initial setup
    scrollToIndex(0, false);
    updateCardFocus();
}

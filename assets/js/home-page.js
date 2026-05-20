/* Reader's Haven - Home Page JavaScript */

document.addEventListener('DOMContentLoaded', () => {

    // Dropdown interactivity

    function setupDropdown(btnId, dropdownId) {
        const btn = document.getElementById(btnId);
        const dropdown = document.getElementById(dropdownId);
        if (!btn || !dropdown) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('opacity-100');

            // Close all dropdowns first
            document.querySelectorAll('[id^="dropdown-"]').forEach(el => {
                el.classList.remove('opacity-100', 'visible', 'translate-y-0');
                el.classList.add('opacity-0', 'invisible', 'translate-y-2');
            });

            if (!isOpen) {
                dropdown.classList.remove('opacity-0', 'invisible', 'translate-y-2');
                dropdown.classList.add('opacity-100', 'visible', 'translate-y-0');
            }
        });
    }

    setupDropdown('btn-history', 'dropdown-history');
    setupDropdown('btn-genres', 'dropdown-genres');
    setupDropdown('btn-browse', 'dropdown-browse');

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('[id^="dropdown-"]').forEach(el => {
            el.classList.remove('opacity-100', 'visible', 'translate-y-0');
            el.classList.add('opacity-0', 'invisible', 'translate-y-2');
        });
    });


    // Sidebar drawer toggle

    const btnHamburger = document.getElementById('btn-hamburger');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const sidebarDrawer = document.getElementById('sidebar-drawer');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleSidebar(show) {
        if (show) {
            sidebarDrawer.style.right = '0';
            sidebarOverlay.classList.remove('opacity-0', 'invisible');
            sidebarOverlay.classList.add('opacity-100', 'visible');
            document.body.style.overflow = 'hidden';
        } else {
            sidebarDrawer.style.right = '-350px';
            sidebarOverlay.classList.remove('opacity-100', 'visible');
            sidebarOverlay.classList.add('opacity-0', 'invisible');
            document.body.style.overflow = '';
        }
    }

    if (btnHamburger) btnHamburger.addEventListener('click', () => toggleSidebar(true));
    if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', () => toggleSidebar(false));
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    // Close sidebar with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleSidebar(false);
    });


    // Filter tabs (with actual filtering)
    const filterTabs = document.querySelectorAll('.filter-tab');
    let activeFilter = 'latest';
    const filterMap = ['latest', 'popular', 'completed', 'upcoming'];

    function parseViews(v) {
        if (!v) return 0;
        const s = String(v).toLowerCase().replace(/,/g, '');
        if (s.endsWith('k')) return parseFloat(s) * 1000;
        if (s.endsWith('m')) return parseFloat(s) * 1000000;
        return parseFloat(s) || 0;
    }

    function getFilteredData() {
        let data = [...gridData];
        switch (activeFilter) {
            case 'popular': data.sort((a, b) => parseViews(b.views) - parseViews(a.views)); break;
            case 'completed': data = data.filter(m => (m.status || '').toUpperCase() === 'COMPLETED'); break;
            case 'upcoming': data = data.filter(m => m.isNew); break;
            default: break; // latest = default order
        }
        return data;
    }

    filterTabs.forEach((tab, i) => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            activeFilter = filterMap[i] || 'latest';
            currentPage = 1;
            renderGrid();
        });
    });


    // Hero carousel

    // Load from global MangaData store or fallback if not loaded
    const carouselData = window.MangaData?.carouselData || [];

    let currentSlide = 0;
    const heroTitle = document.getElementById('hero-title');
    const heroChapter = document.getElementById('hero-chapter');
    const heroDesc = document.getElementById('hero-desc');
    const heroStatus = document.getElementById('hero-status');
    const heroGenres = document.getElementById('hero-genres');
    const heroImage = document.getElementById('hero-image');
    const heroContent = document.getElementById('hero-content');
    const dotsContainer = document.getElementById('hero-dots');
    const dotsMobileContainer = document.getElementById('hero-dots-mobile');

    // Create indicator dots for both desktop and mobile
    [dotsContainer, dotsMobileContainer].forEach(container => {
        if (!container) return;
        carouselData.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${idx === 0 ? 'bg-accent w-5' : 'bg-gray-600 hover:bg-gray-500'}`;
            dot.addEventListener('click', () => goToSlide(idx));
            container.appendChild(dot);
        });
    });

    let fadeTimeout;
    function updateSlideUI() {
        const data = carouselData[currentSlide];
        const heroBgBlur = document.getElementById('hero-bg-blur');

        // Fade out
        if (heroContent) heroContent.style.opacity = '0';
        if (heroImage) heroImage.style.opacity = '0.4';

        clearTimeout(fadeTimeout);
        fadeTimeout = setTimeout(() => {
            if (heroTitle) heroTitle.textContent = data.title;
            if (heroChapter) {
                heroChapter.innerHTML = `<span class="w-3 h-3 rounded-full bg-accent animate-pulse"></span> ${data.chapter}`;
            }
            if (heroDesc) heroDesc.innerHTML = data.desc;
            if (heroStatus) heroStatus.textContent = data.status;
            if (heroImage) heroImage.src = data.img;
            if (heroImage) heroImage.alt = data.title + ' Cover';
            if (heroBgBlur && data && data.img) {
                heroBgBlur.style.backgroundImage = `url('${data.img}')`;
            }

            if (heroGenres) {
                heroGenres.innerHTML = data.genres.map(g =>
                    `<span class="hero-genre-tag px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-300">${g}</span>`
                ).join('');
            }

            // Update dots (both desktop and mobile)
            [dotsContainer, dotsMobileContainer].forEach(container => {
                if (!container) return;
                Array.from(container.children).forEach((dot, idx) => {
                    if (idx === currentSlide) {
                        dot.className = 'w-5 h-2 rounded-full cursor-pointer transition-all duration-300 bg-accent';
                    } else {
                        dot.className = 'w-2 h-2 rounded-full cursor-pointer transition-all duration-300 bg-gray-600 hover:bg-gray-500';
                    }
                });
            });

            // Fade back in
            if (heroContent) heroContent.style.opacity = '1';
            if (heroImage) heroImage.style.opacity = '1';
        }, 220);
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlideUI();
    }

    // Wire up all prev/next buttons (desktop + mobile)
    const prevBtns = [document.getElementById('carousel-prev'), document.getElementById('carousel-prev-mobile')];
    const nextBtns = [document.getElementById('carousel-next'), document.getElementById('carousel-next-mobile')];

    prevBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : carouselData.length - 1;
            updateSlideUI();
        });
    });

    nextBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            currentSlide = currentSlide < carouselData.length - 1 ? currentSlide + 1 : 0;
            updateSlideUI();
        });
    });


    updateSlideUI();


    // Manga grid with pagination

    const gridData = window.MangaData?.gridData || [];
    const gridContainer = document.getElementById('manga-grid');
    const CARDS_PER_PAGE = 5;
    let currentPage = 1;

    function generateStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) html += '<i class="fa-solid fa-star"></i>';
            else if (rating >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke"></i>';
            else html += '<i class="fa-regular fa-star"></i>';
        }
        return html;
    }

    function buildCardHTML(manga, index) {
        const newBadge = manga.isNew
            ? `<span class="badge-new absolute top-1.5 right-1.5 text-dark text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow tracking-wide">NEW</span>`
            : '';
        return `
            <div class="manga-card bg-card rounded-lg overflow-hidden cursor-pointer flex flex-col animate-fade-in-up" style="animation-delay: ${index * 80}ms;">
                <div class="manga-card-image-wrap relative w-full aspect-[2/3] overflow-hidden">
                    <img src="${manga.img}" alt="${manga.title}" class="card-img w-full h-full object-cover">
                    ${newBadge}
                </div>
                <div class="p-3 sm:p-4 flex flex-col gap-2 flex-grow justify-between">
                    <div>
                        <h4 class="card-title font-bold text-white text-sm truncate transition-colors duration-300">${manga.title}</h4>
                        <span class="text-xs text-muted font-semibold">${manga.ch}</span>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                        <div class="flex items-center gap-1.5">
                            <div class="stars-row flex gap-[1.5px]">
                                ${generateStars(manga.rating)}
                            </div>
                            <span class="text-white font-bold text-[11px]">${manga.rating.toFixed(1)}</span>
                        </div>
                        <div class="flex items-center gap-1 text-muted text-[10px] font-medium">
                            <i class="fa-regular fa-eye text-[9px]"></i>${manga.views}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderGrid() {
        if (!gridContainer) return;
        const filtered = getFilteredData();
        const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * CARDS_PER_PAGE;
        const pageData = filtered.slice(start, start + CARDS_PER_PAGE);

        gridContainer.innerHTML = '';
        if (pageData.length === 0) {
            gridContainer.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
                <i class="fa-solid fa-ghost text-4xl text-muted/30"></i>
                <p class="text-muted font-bold text-sm">No manga found for this filter.</p>
            </div>`;
        } else {
            pageData.forEach((manga, i) => gridContainer.insertAdjacentHTML('beforeend', buildCardHTML(manga, i)));
        }
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        const pageInfo = paginationContainer.querySelector('.page-info');
        if (pageInfo) pageInfo.innerHTML = `<span class="text-muted text-xs font-bold uppercase tracking-widest">Page</span><span class="text-white font-black text-sm">${String(currentPage).padStart(2, '0')} <span class="text-muted/40 mx-1">/</span> ${String(totalPages).padStart(2, '0')}</span>`;

        const numbersWrap = paginationContainer.querySelector('.page-numbers');
        if (numbersWrap) {
            numbersWrap.innerHTML = '';
            for (let p = 1; p <= totalPages; p++) {
                const btn = document.createElement('button');
                btn.textContent = p;
                btn.className = p === currentPage
                    ? 'w-12 h-12 rounded-2xl bg-accent text-dark font-black text-sm shadow-lg shadow-accent/20'
                    : 'w-12 h-12 rounded-2xl bg-surface border border-gray-800/40 text-muted hover:text-white font-bold text-sm transition-all hover:bg-gray-800';
                btn.addEventListener('click', () => { currentPage = p; renderGrid(); window.scrollTo({ top: gridContainer.offsetTop - 120, behavior: 'smooth' }); });
                numbersWrap.appendChild(btn);
            }
        }

        const prevBtn = paginationContainer.querySelector('.page-prev');
        const nextBtn = paginationContainer.querySelector('.page-next');
        if (prevBtn) { prevBtn.disabled = currentPage <= 1; prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderGrid(); window.scrollTo({ top: gridContainer.offsetTop - 120, behavior: 'smooth' }); } }; }
        if (nextBtn) { nextBtn.disabled = currentPage >= totalPages; nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderGrid(); window.scrollTo({ top: gridContainer.offsetTop - 120, behavior: 'smooth' }); } }; }
    }

    renderGrid();

    // Live search
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-results-dropdown');

    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (query.length < 2) { searchDropdown.classList.add('hidden'); return; }

            const allManga = [...gridData, ...carouselData];
            const seen = new Set();
            const results = allManga.filter(m => {
                if (seen.has(m.title.toLowerCase())) return false;
                seen.add(m.title.toLowerCase());
                return m.title.toLowerCase().includes(query);
            }).slice(0, 6);

            if (results.length === 0) {
                searchDropdown.innerHTML = `<div class="p-4 text-center text-muted text-xs font-bold">No results found</div>`;
            } else {
                searchDropdown.innerHTML = results.map(m => `
                    <div class="search-result-item flex items-center gap-3 p-3 hover:bg-gray-800/60 cursor-pointer transition-colors rounded-xl" data-title="${m.title}">
                        <img src="${m.img}" alt="${m.title}" class="w-10 h-14 object-cover rounded-lg flex-shrink-0">
                        <div class="min-w-0">
                            <div class="font-semibold text-sm text-white truncate">${m.title}</div>
                            <div class="text-xs text-muted">${m.ch || m.chapter || ''}</div>
                        </div>
                    </div>
                `).join('');
            }
            searchDropdown.classList.remove('hidden');

            // Click search result
            searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const title = item.getAttribute('data-title');
                    const manga = allManga.find(m => m.title === title);
                    if (manga) openMangaDetail(manga);
                    searchDropdown.classList.add('hidden');
                    searchInput.value = '';
                });
            });
        });

        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') { searchDropdown.classList.add('hidden'); searchInput.blur(); } });
        document.addEventListener('click', (e) => { if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) searchDropdown.classList.add('hidden'); });
    }



    // Auth & theme logic
    const headerAuthContainer = document.getElementById('header-auth-container');
    const sidebarAuthBtn = document.getElementById('sidebar-auth-btn');
    const authText = document.getElementById('auth-text');
    const authIcon = document.getElementById('auth-icon');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    function updateAuthState() {
        const isLoggedIn = localStorage.getItem('rh_logged_in') === 'true';
        if (isLoggedIn) {
            if (headerAuthContainer) {
                headerAuthContainer.innerHTML = `<a href="#" id="header-logout-btn" class="text-[10px] font-black text-red-400 hover:text-red-500 transition-colors duration-300 tracking-tighter">LOG OUT</a>`;
                const logoutBtn = document.getElementById('header-logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.removeItem('rh_logged_in');
                        updateAuthState();
                        showAlert('Logged out successfully!', 'success');
                    });
                }
            }
            if (authText) authText.textContent = 'Log Out';
            if (authIcon) authIcon.className = 'fa-solid fa-right-from-bracket w-5 text-center';
            if (sidebarAuthBtn) {
                sidebarAuthBtn.href = '#';
                sidebarAuthBtn.classList.remove('text-accent', 'hover:bg-accent/10', 'hover:text-accent');
                sidebarAuthBtn.classList.add('text-red-400', 'hover:bg-red-500/10', 'hover:text-red-500');
            }
        } else {
            if (headerAuthContainer) {
                headerAuthContainer.innerHTML = `
                    <a href="login.html" class="text-[10px] font-black text-muted hover:text-accent transition-colors duration-300 tracking-tighter">LOG IN</a>
                    <div class="h-3 w-[1px] bg-gray-800/80"></div>
                    <a href="signup.html" class="text-[10px] font-black text-muted hover:text-accent transition-colors duration-300 tracking-tighter">SIGN UP</a>
                `;
            }
            if (authText) authText.textContent = 'Login / Sign Up';
            if (authIcon) authIcon.className = 'fa-solid fa-user-plus w-5 text-center';
            if (sidebarAuthBtn) {
                sidebarAuthBtn.href = 'login.html';
                sidebarAuthBtn.classList.remove('text-red-400', 'hover:bg-red-500/10', 'hover:text-red-500');
                sidebarAuthBtn.classList.add('text-accent', 'hover:bg-accent/10', 'hover:text-accent');
            }
        }
    }

    if (sidebarAuthBtn) {
        sidebarAuthBtn.addEventListener('click', (e) => {
            const isLoggedIn = localStorage.getItem('rh_logged_in') === 'true';
            if (isLoggedIn) {
                e.preventDefault();
                localStorage.removeItem('rh_logged_in');
                updateAuthState();
                window.location.reload();
            }
        });
    }

    function updateThemeUI(isLight) {
        if (isLight) {
            document.documentElement.classList.add('light-mode');
            if (themeIcon) themeIcon.className = 'fa-solid fa-sun w-5 text-center text-accent';
            if (themeText) themeText.textContent = 'Light Mode Active';
        } else {
            document.documentElement.classList.remove('light-mode');
            if (themeIcon) themeIcon.className = 'fa-solid fa-moon w-5 text-center text-muted';
            if (themeText) themeText.textContent = 'Dark Mode Active';
        }
    }

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isLight = document.documentElement.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateThemeUI(isLight);
        });
    }

    updateAuthState();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') updateThemeUI(true);
    // Utility: showalert (mirrors auth.js)
    function showAlert(message, type = 'error') {
        const existing = document.querySelector('.auth-alert');
        if (existing) existing.remove();
        const alert = document.createElement('div');
        alert.className = 'auth-alert';
        const bgColor = type === 'success' ? 'rgba(214, 51, 108, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        const borderColor = type === 'success' ? 'rgba(214, 51, 108, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        const textColor = type === 'success' ? '#D6336C' : '#f87171';
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        alert.style.cssText = `position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-20px);background:${bgColor};border:1px solid ${borderColor};color:${textColor};padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;font-family:'Inter',sans-serif;z-index:1000;display:flex;align-items:center;gap:10px;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);opacity:0;transition:all 0.35s cubic-bezier(0.16,1,0.3,1);max-width:90vw;`;
        alert.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        document.body.appendChild(alert);
        requestAnimationFrame(() => { alert.style.opacity = '1'; alert.style.transform = 'translateX(-50%) translateY(0)'; });
        setTimeout(() => { alert.style.opacity = '0'; alert.style.transform = 'translateX(-50%) translateY(-20px)'; setTimeout(() => alert.remove(), 350); }, 3500);
    }

    // Page transitions
    document.body.classList.add('loaded');

    // Scroll interactions
    const header = document.getElementById('main-header');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 60;

        // Header polish on scroll
        if (header) {
            if (scrolled) {
                header.classList.add('py-2', 'bg-darker/98', 'shadow-2xl', 'border-accent/10');
                header.classList.remove('py-3', 'bg-darker/95', 'border-gray-800/60');
            } else {
                header.classList.add('py-3', 'bg-darker/95', 'border-gray-800/60');
                header.classList.remove('py-2', 'bg-darker/98', 'shadow-2xl', 'border-accent/10');
            }
        }

        // Back to top button visibility
        if (backToTop) {
            if (window.scrollY > 400) {
                backToTop.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                backToTop.classList.add('opacity-100', 'translate-y-0');
            } else {
                backToTop.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                backToTop.classList.remove('opacity-100', 'translate-y-0');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) document.body.classList.remove('fade-out');
    });

    document.querySelectorAll('a').forEach(link => {
        const isInternal = link.hostname === window.location.hostname || !link.hostname;
        const isSamePage = link.getAttribute('href')?.startsWith('#');
        const isTargetBlank = link.target === '_blank';

        if (isInternal && !isSamePage && !isTargetBlank) {
            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey) return;
                if (link.getAttribute('href') === '#' || link.closest('#manga-detail-modal') || link.closest('#manga-reader-modal')) return;
                e.preventDefault();
                const destination = link.href;
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = destination; }, 400);
            });
        }
    });

    // Manga details & reader modals

    const detailModal = document.getElementById('manga-detail-modal');
    const readerModal = document.getElementById('manga-reader-modal');
    
    // Elements for Details Modal
    const btnCloseDetail = document.getElementById('btn-close-detail');
    const detailCover = document.getElementById('detail-cover');
    const detailTitle = document.getElementById('detail-title');
    const detailDesc = document.getElementById('detail-desc');
    const detailStatus = document.getElementById('detail-status');
    const detailRating = document.getElementById('detail-rating');
    const detailViews = document.getElementById('detail-views');
    const detailGenres = document.getElementById('detail-genres');
    const chaptersContainer = document.getElementById('chapters-list-container');
    
    // Elements for Reader Modal
    const btnReaderBack = document.getElementById('btn-reader-back');
    const btnReaderClose = document.getElementById('btn-reader-close');
    const readerMangaTitle = document.getElementById('reader-manga-title');
    const readerChapterTitle = document.getElementById('reader-chapter-title');
    const btnReaderMode = document.getElementById('btn-reader-mode');
    const btnReaderPrevCh = document.getElementById('btn-reader-prev-ch');
    const btnReaderNextCh = document.getElementById('btn-reader-next-ch');
    const readerCanvas = document.getElementById('reader-canvas');
    
    // Elements for Reader Footer (Page mode)
    const readerFooter = document.getElementById('reader-footer');
    const btnReaderPrevPage = document.getElementById('btn-reader-prev-page');
    const btnReaderNextPage = document.getElementById('btn-reader-next-page');
    const readerPageIndicator = document.getElementById('reader-page-indicator');

    let currentActiveManga = null;
    let currentActiveChapterIdx = -1;
    let currentReadingPageIdx = 0;
    let readingMode = 'scroll'; // 'scroll' or 'page'
    let readerBackground = 'dark';
    let readerPageWidth = 750;
    let readerZoom = 100;

    // Open Details Modal
    function openMangaDetail(manga) {
        if (!manga) return;
        currentActiveManga = manga;
        
        detailCover.src = manga.img;
        detailCover.alt = manga.title;
        detailTitle.textContent = manga.title;
        detailDesc.innerHTML = manga.desc || "No description available for this manga. Follow the journey and explore the pages of this fantastic story.";
        detailStatus.textContent = manga.status || "ONGOING";
        detailRating.textContent = (manga.rating || 4.5).toFixed(1);
        detailViews.textContent = manga.views || "10.0k";
        
        // Render genres
        const genres = manga.genres || ["Action", "Fantasy"];
        detailGenres.innerHTML = genres.map(g => 
            `<span class="px-2.5 py-1 bg-surface border border-gray-800 text-muted rounded-full text-[10px] font-bold">${g}</span>`
        ).join('');
        
        // Render chapters
        renderChaptersList();
        
        // Show Modal
        detailModal.classList.remove('invisible', 'opacity-0');
        detailModal.querySelector('.relative').classList.remove('scale-95');
        detailModal.querySelector('.relative').classList.add('scale-100');
        document.body.style.overflow = 'hidden';
    }

    // Close Details Modal
    function closeMangaDetail() {
        detailModal.classList.add('invisible', 'opacity-0');
        detailModal.querySelector('.relative').classList.remove('scale-100');
        detailModal.querySelector('.relative').classList.add('scale-95');
        if (!readerModal.classList.contains('visible') && !readerModal.classList.contains('opacity-100')) {
            document.body.style.overflow = '';
        }
    }

    if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeMangaDetail);
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) closeMangaDetail();
        });
    }

    // Populate chapters
    function renderChaptersList() {
        if (!chaptersContainer) return;
        chaptersContainer.innerHTML = '';
        
        // If chapters are not present in data, generate fallback chapters
        let chapters = currentActiveManga.chapters;
        if (!chapters || chapters.length === 0) {
            chapters = [
                { id: 'ch-5', title: 'Chapter 5: Epilogue & Resolution', pages: 12 },
                { id: 'ch-4', title: 'Chapter 4: The Ultimate Clash', pages: 16 },
                { id: 'ch-3', title: 'Chapter 3: Hidden Mysteries Revealed', pages: 15 },
                { id: 'ch-2', title: 'Chapter 2: The Training Ground', pages: 14 },
                { id: 'ch-1', title: 'Chapter 1: The New Horizon', pages: 20 }
            ];
            // Cache it in active manga
            currentActiveManga.chapters = chapters;
        }

        chapters.forEach((ch, idx) => {
            const card = document.createElement('div');
            card.className = "flex justify-between items-center bg-surface hover:bg-gray-800/80 p-3.5 rounded-2xl border border-gray-800/60 transition-all duration-300 group cursor-pointer";
            card.innerHTML = `
                <div class="flex flex-col gap-0.5">
                    <span class="font-bold text-white text-xs group-hover:text-accent transition-colors duration-300">${ch.title}</span>
                    <span class="text-[10px] text-muted font-semibold">${ch.pages} pages</span>
                </div>
                <button class="px-3.5 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-xl text-[10px] font-black tracking-wide transition-all duration-300">
                    READ
                </button>
            `;
            
            // Clicking "READ" or card opens the reader
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                openMangaReader(idx);
            });
            chaptersContainer.appendChild(card);
        });
    }

    // Dynamic Manga Page SVG Data URL Generator
    function generateMangaPageSVG(mangaTitle, chapterTitle, pageNum, totalPages) {
        const accentColor = '#D6336C';
        const bgColor = '#141414';
        
        let panelsHTML = '';
        const layoutSeed = (pageNum * 7) % 3;
        
        if (layoutSeed === 0) {
            panelsHTML = `
                <rect x="50" y="150" width="700" height="320" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <rect x="50" y="500" width="335" height="420" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <rect x="415" y="500" width="335" height="420" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <text x="400" y="310" font-family="sans-serif" font-size="28" font-weight="900" fill="#ffffff" opacity="0.1" text-anchor="middle">PANEL VIEW 1</text>
                <text x="217" y="710" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" opacity="0.1" text-anchor="middle">PANEL 2</text>
                <text x="582" y="710" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" opacity="0.1" text-anchor="middle">PANEL 3</text>
            `;
        } else if (layoutSeed === 1) {
            panelsHTML = `
                <rect x="50" y="150" width="700" height="380" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <rect x="50" y="560" width="700" height="380" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <text x="400" y="340" font-family="sans-serif" font-size="28" font-weight="900" fill="#ffffff" opacity="0.1" text-anchor="middle">PANEL VIEW 2</text>
                <text x="400" y="750" font-family="sans-serif" font-size="28" font-weight="900" fill="#ffffff" opacity="0.1" text-anchor="middle">PANEL VIEW 3</text>
            `;
        } else {
            panelsHTML = `
                <rect x="50" y="150" width="335" height="360" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <rect x="415" y="150" width="335" height="360" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <rect x="50" y="540" width="335" height="400" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <rect x="415" y="540" width="335" height="400" fill="#1e1e1e" rx="12" stroke="#2a2a2a" stroke-width="2"/>
                <text x="217" y="330" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" opacity="0.08" text-anchor="middle">PANEL 1</text>
                <text x="582" y="330" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" opacity="0.08" text-anchor="middle">PANEL 2</text>
                <text x="217" y="740" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" opacity="0.08" text-anchor="middle">PANEL 3</text>
                <text x="582" y="740" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" opacity="0.08" text-anchor="middle">PANEL 4</text>
            `;
        }

        // Add dialogues based on seed values
        let dialogues = '';
        if (layoutSeed === 0) {
            dialogues = `
                <!-- Dialogue bubble 1 -->
                <path d="M 120 220 C 120 180, 290 180, 290 220 C 290 250, 230 250, 210 270 C 205 260, 190 255, 180 255 C 130 255, 120 240, 120 220 Z" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
                <text x="205" y="215" font-family="sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle">IT CANNOT BE...</text>
                <text x="205" y="232" font-family="sans-serif" font-size="11" font-weight="500" fill="#333333" text-anchor="middle">Are they advancing?!</text>

                <!-- Dialogue bubble 2 -->
                <path d="M 460 580 C 460 545, 620 545, 620 580 C 620 605, 570 605, 550 620 C 545 612, 535 608, 525 608 C 480 608, 460 595, 460 580 Z" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
                <text x="540" y="575" font-family="sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle">WE HAVE TO RETREAT!</text>
                <text x="540" y="592" font-family="sans-serif" font-size="11" font-weight="500" fill="#333333" text-anchor="middle">Now, before it's too late!</text>
            `;
        } else if (layoutSeed === 1) {
            dialogues = `
                <!-- Narration Box -->
                <rect x="420" y="220" width="280" height="70" fill="#ffffff" stroke="#000000" stroke-width="2.5" rx="4"/>
                <text x="560" y="250" font-family="sans-serif" font-size="12" font-weight="800" fill="#000000" text-anchor="middle">"The world is a cruel place..."</text>
                <text x="560" y="268" font-family="sans-serif" font-size="12" font-weight="800" fill="#000000" text-anchor="middle">"...but also very beautiful."</text>

                <!-- Dialogue bubble -->
                <path d="M 120 650 C 120 610, 300 610, 300 650 C 300 680, 230 680, 210 700 C 205 690, 190 685, 180 685 C 130 685, 120 670, 120 650 Z" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
                <text x="210" y="645" font-family="sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle">I WILL WIN THIS FIGHT!</text>
                <text x="210" y="662" font-family="sans-serif" font-size="11" font-weight="500" fill="#333333" text-anchor="middle">Whatever it takes!</text>
            `;
        } else {
            dialogues = `
                <!-- Dialogue bubble -->
                <path d="M 480 230 C 480 195, 620 195, 620 230 C 620 255, 580 255, 560 270 C 555 262, 545 258, 535 258 C 500 258, 480 245, 480 230 Z" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
                <text x="550" y="225" font-family="sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle">This power...</text>
                <text x="550" y="242" font-family="sans-serif" font-size="11" font-weight="500" fill="#333333" text-anchor="middle">Is it truly mine?</text>

                <!-- Dialogue bubble 2 -->
                <path d="M 100 600 C 100 560, 280 560, 280 600 C 280 630, 220 630, 200 650 C 195 640, 180 635, 170 635 C 120 635, 100 620, 100 600 Z" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
                <text x="190" y="595" font-family="sans-serif" font-size="12" font-weight="900" fill="#000000" text-anchor="middle">THE MONARCHS...</text>
                <text x="190" y="612" font-family="sans-serif" font-size="11" font-weight="500" fill="#333333" text-anchor="middle">Are finally rising.</text>
            `;
        }

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
                <!-- Background -->
                <rect width="800" height="1200" fill="${bgColor}"/>
                
                <!-- Borders -->
                <rect x="20" y="20" width="760" height="1160" fill="none" stroke="${accentColor}" stroke-width="3" rx="15"/>
                
                <!-- Headers -->
                <text x="50%" y="70" font-family="sans-serif" font-size="28" font-weight="900" fill="${accentColor}" text-anchor="middle" letter-spacing="4">${mangaTitle.toUpperCase()}</text>
                <text x="50%" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#888" text-anchor="middle">${chapterTitle.toUpperCase()}</text>
                
                <!-- Comic Panels -->
                ${panelsHTML}
                
                <!-- Dialogues -->
                ${dialogues}
                
                <!-- Footers -->
                <text x="50%" y="1135" font-family="sans-serif" font-size="12" font-weight="bold" fill="#555" text-anchor="middle">PAGE ${pageNum} OF ${totalPages} · READER'S HAVEN</text>
                <text x="50%" y="1160" font-family="sans-serif" font-size="10" font-weight="bold" fill="#333" text-anchor="middle">DYNAMIC LOCAL PREVIEW</text>
            </svg>
        `;
        
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    let loadedSourcePages = [];

    // Open Manga Reader
    function openMangaReader(chapterIdx) {
        if (!currentActiveManga) return;
        
        currentActiveChapterIdx = chapterIdx;
        currentReadingPageIdx = 0;
        
        // Hide details modal to avoid clutter (it will remain cached in currentActiveManga)
        closeMangaDetail();
        
        const chapter = currentActiveManga.chapters[chapterIdx];
        
        if (readerMangaTitle) readerMangaTitle.textContent = currentActiveManga.title;
        if (readerChapterTitle) readerChapterTitle.textContent = chapter.title;
        
        // Set up next/prev chapter states
        if (btnReaderPrevCh) btnReaderPrevCh.disabled = (chapterIdx === currentActiveManga.chapters.length - 1);
        if (btnReaderNextCh) btnReaderNextCh.disabled = (chapterIdx === 0);
        
        // Show Reader Modal
        if (readerModal) {
            readerModal.classList.remove('invisible', 'opacity-0');
        }
        document.body.style.overflow = 'hidden';

        // Check if there is a local extracted image directory
        if (chapter.pagesPathPattern) {
            // Extracted folder exists. Can load pages natively without CORS!
            renderReaderContent();
        } else if (chapter.source && chapter.source.toLowerCase().endsWith('.pdf')) {
            // PDF file. Can load natively via iframe without CORS!
            renderReaderContent();
        } else if (chapter.source) {
            // Free any previous loaded source pages
            loadedSourcePages.forEach(url => URL.revokeObjectURL(url));
            loadedSourcePages = [];
            
            // Try fetching first (e.g. if CORS allows it or running on server)
            tryLocalFetch(chapter);
        } else {
            // Render normal synthetic preview pages
            renderReaderContent();
        }
    }

    // Try fetching the local file automatically
    async function tryLocalFetch(chapter) {
        try {
            // Show short loading state
            if (readerCanvas) {
                readerCanvas.innerHTML = `
                    <div class="flex flex-col items-center justify-center gap-4 my-24 animate-pulse">
                        <div class="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                        <span class="text-xs text-accent font-black tracking-wider uppercase">Loading source file...</span>
                    </div>
                `;
            }
            
            const response = await fetch(chapter.source);
            if (!response.ok) throw new Error("Fetch failed");
            
            const arrayBuffer = await response.arrayBuffer();
            const extension = chapter.source.split('.').pop().toLowerCase();
            
            if (extension === 'pdf') {
                await parsePDFFile(arrayBuffer);
            } else {
                await parseCBZFile(arrayBuffer);
            }
            
            chapter.pages = loadedSourcePages.length;
            renderReaderContent();
            
        } catch (e) {
            // Fetch failed (CORS block or missing file), prompt user with file selector
            renderFileUploader(chapter);
        }
    }

    // Render local file select/drop zone
    function renderFileUploader(chapter) {
        if (!readerCanvas) return;
        readerCanvas.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 bg-card border border-dashed border-gray-800 rounded-3xl max-w-lg text-center gap-6 my-12 animate-fade-in-up">
                <div class="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center text-2xl shadow-lg">
                    <i class="fa-solid fa-file-import"></i>
                </div>
                <div>
                    <h5 class="text-lg font-black text-white uppercase tracking-wider mb-2">Local File Import Required</h5>
                    <p class="text-xs text-muted leading-relaxed font-semibold">
                        Browser security policy blocks automatic access to local files when running via <code>file://</code> protocol.
                    </p>
                    <div class="mt-4 p-3 bg-dark rounded-xl border border-gray-800 text-[10px] text-accent font-black tracking-wide truncate max-w-full">
                        PLEASE CHOOSE: ${chapter.source.split('/').pop()}
                    </div>
                </div>
                
                <label class="w-full py-4 bg-accent hover:bg-accent/85 text-white font-extrabold rounded-2xl cursor-pointer shadow-lg shadow-accent/25 transition-all duration-300 flex items-center justify-center gap-2 text-xs tracking-wider">
                    <i class="fa-solid fa-folder-open"></i> SELECT FILE
                    <input type="file" id="local-file-picker" accept=".cbz,.zip,.pdf" class="hidden">
                </label>
                
                <span class="text-[10px] text-muted font-bold">Supports .cbz (ZIP archives) and .pdf files</span>
            </div>
        `;
        
        const picker = document.getElementById('local-file-picker');
        if (picker) {
            picker.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    processLocalMangaFile(file, chapter);
                }
            });
        }
    }

    // Process selected local file
    async function processLocalMangaFile(file, chapter) {
        try {
            if (!readerCanvas) return;
            readerCanvas.innerHTML = `
                <div class="flex flex-col items-center justify-center gap-4 my-24 animate-pulse">
                    <div class="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                    <span class="text-xs text-accent font-black tracking-wider uppercase">Parsing file content...</span>
                </div>
            `;
            
            const arrayBuffer = await file.arrayBuffer();
            const filename = file.name.toLowerCase();
            
            if (filename.endsWith('.pdf')) {
                await parsePDFFile(arrayBuffer);
            } else if (filename.endsWith('.cbz') || filename.endsWith('.zip')) {
                await parseCBZFile(arrayBuffer);
            } else {
                throw new Error("Unsupported file format. Please select a .cbz, .zip or .pdf file.");
            }
            
            chapter.pages = loadedSourcePages.length;
            currentReadingPageIdx = 0;
            renderReaderContent();
            
        } catch (err) {
            console.error(err);
            if (readerCanvas) {
                readerCanvas.innerHTML = `
                    <div class="flex flex-col items-center justify-center p-8 bg-card border border-red-900 rounded-3xl max-w-lg text-center gap-4 my-12">
                        <div class="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h5 class="text-sm font-black text-white uppercase tracking-wider">Failed to parse file</h5>
                        <p class="text-xs text-muted font-bold">${err.message}</p>
                        <button id="btn-retry-upload" class="mt-2 px-4 py-2 bg-surface hover:bg-gray-800 text-white text-xs font-bold rounded-xl border border-gray-800">
                            TRY AGAIN
                        </button>
                    </div>
                `;
                const btnRetry = document.getElementById('btn-retry-upload');
                if (btnRetry) {
                    btnRetry.addEventListener('click', () => {
                        renderFileUploader(chapter);
                    });
                }
            }
        }
    }

    // Extract pages from ZIP/CBZ
    async function parseCBZFile(arrayBuffer) {
        if (!window.JSZip) {
            throw new Error("JSZip is not loaded. Ensure scripts are properly imported.");
        }
        
        const zip = await window.JSZip.loadAsync(arrayBuffer);
        const imageFiles = [];
        
        zip.forEach((relativePath, zipEntry) => {
            const lowerName = zipEntry.name.toLowerCase();
            const isImage = lowerName.endsWith('.jpg') || 
                            lowerName.endsWith('.jpeg') || 
                            lowerName.endsWith('.png') || 
                            lowerName.endsWith('.webp') ||
                            lowerName.endsWith('.gif');
            if (isImage && !zipEntry.dir && !lowerName.includes('__macosx')) {
                imageFiles.push(zipEntry);
            }
        });
        
        if (imageFiles.length === 0) {
            throw new Error("No comic images (.jpg, .png, .webp) found inside this ZIP archive.");
        }
        
        // Sort image names numerically/alphabetically
        imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        
        loadedSourcePages.forEach(url => URL.revokeObjectURL(url));
        loadedSourcePages = [];
        
        for (const fileEntry of imageFiles) {
            const blob = await fileEntry.async('blob');
            const blobUrl = URL.createObjectURL(blob);
            loadedSourcePages.push(blobUrl);
        }
    }

    // Render pages from PDF using PDF.js
    async function parsePDFFile(arrayBuffer) {
        if (!window.pdfjsLib) {
            throw new Error("PDF.js is not loaded. Ensure scripts are imported.");
        }
        
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        
        loadedSourcePages.forEach(url => URL.revokeObjectURL(url));
        loadedSourcePages = [];
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            loadedSourcePages.push(dataUrl);
        }
    }

    // Render Pages in Reader Canvas
    function renderReaderContent() {
        if (!readerCanvas) return;
        readerCanvas.innerHTML = '';
        const chapter = currentActiveManga.chapters[currentActiveChapterIdx];
        
        // Native PDF check - render directly in iframe
        if (chapter.source && chapter.source.toLowerCase().endsWith('.pdf')) {
            if (readerFooter) readerFooter.classList.add('hidden');
            if (btnReaderMode) btnReaderMode.classList.add('hidden');
            
            const iframe = document.createElement('iframe');
            iframe.src = chapter.source;
            iframe.className = "w-full max-w-[1000px] h-[85vh] bg-[#0c0c0e] border border-gray-800 rounded-3xl shadow-2xl transition-all duration-300";
            readerCanvas.appendChild(iframe);
            return;
        }
        
        // Restore reader mode toggle visibility if hidden previously
        if (btnReaderMode) btnReaderMode.classList.remove('hidden');
        
        const totalPages = chapter.pages;
        const hasSourcePages = loadedSourcePages.length > 0;
        
        if (readingMode === 'scroll') {
            // Scroll Mode: render all pages vertically
            if (readerFooter) readerFooter.classList.add('hidden');
            if (btnReaderMode) {
                btnReaderMode.innerHTML = `<i class="fa-solid fa-file-lines"></i>`;
                btnReaderMode.title = "Switch to Slide View";
            }
            
            for (let p = 1; p <= totalPages; p++) {
                const img = document.createElement('img');
                img.className = "w-full max-w-[750px] aspect-[2/3] object-contain bg-neutral-900 border border-gray-800 rounded-2xl shadow-2xl transition-all duration-300 my-2";
                
                if (chapter.pagesPathPattern) {
                    const pageStr = String(p).padStart(3, '0');
                    img.src = chapter.pagesPathPattern.replace('{{page}}', pageStr);
                } else if (hasSourcePages) {
                    img.src = loadedSourcePages[p - 1];
                } else {
                    img.src = generateMangaPageSVG(currentActiveManga.title, chapter.title, p, totalPages);
                }
                
                img.alt = `Page ${p}`;
                img.loading = "lazy";
                readerCanvas.appendChild(img);
            }
            
            // Scroll reader back to top
            readerCanvas.scrollTop = 0;
        } else {
            // Page Mode: render one page at a time with footer controls
            if (readerFooter) readerFooter.classList.remove('hidden');
            if (btnReaderMode) {
                btnReaderMode.innerHTML = `<i class="fa-solid fa-scroll"></i>`;
                btnReaderMode.title = "Switch to Webtoon Scroll View";
            }
            
            const img = document.createElement('img');
            img.className = "w-full max-w-[750px] aspect-[2/3] object-contain bg-neutral-900 border border-gray-800 rounded-2xl shadow-2xl transition-all duration-300 animate-fade-in";
            
            if (chapter.pagesPathPattern) {
                const pageStr = String(currentReadingPageIdx + 1).padStart(3, '0');
                img.src = chapter.pagesPathPattern.replace('{{page}}', pageStr);
            } else if (hasSourcePages) {
                img.src = loadedSourcePages[currentReadingPageIdx];
            } else {
                img.src = generateMangaPageSVG(currentActiveManga.title, chapter.title, currentReadingPageIdx + 1, totalPages);
            }
            
            img.alt = `Page ${currentReadingPageIdx + 1}`;
            readerCanvas.appendChild(img);
            
            // Update page navigation UI
            if (btnReaderPrevPage) btnReaderPrevPage.disabled = (currentReadingPageIdx === 0);
            if (btnReaderNextPage) btnReaderNextPage.disabled = (currentReadingPageIdx === totalPages - 1);
            if (readerPageIndicator) readerPageIndicator.textContent = `PAGE ${currentReadingPageIdx + 1} / ${totalPages}`;
            
            // Scroll reader back to top
            readerCanvas.scrollTop = 0;
        }
        
        // Apply width and zoom settings to the newly rendered images
        applyPageScaling();
    }

    // Toggle Reading Mode (Scroll vs Page)
    if (btnReaderMode) {
        btnReaderMode.addEventListener('click', () => {
            readingMode = (readingMode === 'scroll' ? 'page' : 'scroll');
            renderReaderContent();
        });
    }

    // Close Reader Modal
    function closeMangaReader() {
        if (readerModal) {
            readerModal.classList.add('invisible', 'opacity-0');
        }
        // Re-open details modal for smooth back navigation
        openMangaDetail(currentActiveManga);
    }

    if (btnReaderBack) btnReaderBack.addEventListener('click', closeMangaReader);
    
    // Close reader completely back to homepage
    if (btnReaderClose) {
        btnReaderClose.addEventListener('click', () => {
            if (readerModal) {
                readerModal.classList.add('invisible', 'opacity-0');
            }
            currentActiveManga = null;
            document.body.style.overflow = '';
        });
    }

    // Reader Settings Panel Controls
    const btnReaderSettings = document.getElementById('btn-reader-settings');
    const readerSettingsPanel = document.getElementById('reader-settings-panel');
    const zoomIndicator = document.getElementById('zoom-indicator');
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');

    if (btnReaderSettings && readerSettingsPanel) {
        btnReaderSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            readerSettingsPanel.classList.toggle('invisible');
            readerSettingsPanel.classList.toggle('opacity-0');
            readerSettingsPanel.classList.toggle('scale-95');
        });

        // Close settings drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (readerSettingsPanel && !readerSettingsPanel.contains(e.target) && e.target !== btnReaderSettings && !btnReaderSettings.contains(e.target)) {
                readerSettingsPanel.classList.add('invisible', 'opacity-0', 'scale-95');
            }
        });
    }

    // Apply Background Color / Theme Selection
    const bgButtons = document.querySelectorAll('#reader-settings-panel [data-theme]');
    bgButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            readerBackground = theme;
            
            if (readerCanvas) {
                if (theme === 'dark') {
                    readerCanvas.style.backgroundColor = '#000000';
                    readerCanvas.style.color = '#ffffff';
                } else if (theme === 'charcoal') {
                    readerCanvas.style.backgroundColor = '#1a1a1a';
                    readerCanvas.style.color = '#ffffff';
                } else if (theme === 'sepia') {
                    readerCanvas.style.backgroundColor = '#f4ecd8';
                    readerCanvas.style.color = '#451a03';
                } else if (theme === 'light') {
                    readerCanvas.style.backgroundColor = '#ffffff';
                    readerCanvas.style.color = '#000000';
                }
            }
            
            bgButtons.forEach(b => b.classList.remove('ring-2', 'ring-accent'));
            btn.classList.add('ring-2', 'ring-accent');
        });
    });

    // Apply Max Page Width Selection
    const widthButtons = document.querySelectorAll('#reader-settings-panel [data-width]');
    widthButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const width = parseInt(btn.getAttribute('data-width'), 10);
            readerPageWidth = width;
            
            applyPageScaling();
            
            widthButtons.forEach(b => {
                b.classList.remove('bg-accent', 'text-white', 'border-transparent');
                b.classList.add('bg-surface', 'text-white', 'border-gray-800');
            });
            btn.classList.remove('bg-surface', 'border-gray-800');
            btn.classList.add('bg-accent', 'border-transparent');
        });
    });

    // Zoom Controls
    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            if (readerZoom < 150) {
                readerZoom += 10;
                if (zoomIndicator) zoomIndicator.textContent = `${readerZoom}%`;
                applyPageScaling();
            }
        });
    }

    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            if (readerZoom > 50) {
                readerZoom -= 10;
                if (zoomIndicator) zoomIndicator.textContent = `${readerZoom}%`;
                applyPageScaling();
            }
        });
    }

    // Dynamic Image scaling helper
    function applyPageScaling() {
        if (!readerCanvas) return;
        const images = readerCanvas.querySelectorAll('img');
        const finalWidth = Math.round(readerPageWidth * (readerZoom / 100));
        
        images.forEach(img => {
            img.style.maxWidth = `${finalWidth}px`;
            img.style.width = '100%';
        });
    }

    // Prev / Next Chapter Buttons
    if (btnReaderPrevCh) {
        btnReaderPrevCh.addEventListener('click', () => {
            if (currentActiveChapterIdx < currentActiveManga.chapters.length - 1) {
                openMangaReader(currentActiveChapterIdx + 1);
            }
        });
    }

    if (btnReaderNextCh) {
        btnReaderNextCh.addEventListener('click', () => {
            if (currentActiveChapterIdx > 0) {
                openMangaReader(currentActiveChapterIdx - 1);
            }
        });
    }

    // Prev / Next Page (Single-page slide mode)
    if (btnReaderPrevPage) {
        btnReaderPrevPage.addEventListener('click', () => {
            if (currentReadingPageIdx > 0) {
                currentReadingPageIdx--;
                renderReaderContent();
            }
        });
    }

    if (btnReaderNextPage) {
        btnReaderNextPage.addEventListener('click', () => {
            const chapter = currentActiveManga.chapters[currentActiveChapterIdx];
            if (currentReadingPageIdx < chapter.pages - 1) {
                currentReadingPageIdx++;
                renderReaderContent();
            }
        });
    }

    // Keyboard controls for reader
    document.addEventListener('keydown', (e) => {
        if (!readerModal || readerModal.classList.contains('invisible') || readerModal.classList.contains('opacity-0')) return;
        
        if (e.key === 'Escape') {
            closeMangaReader();
        } else if (readingMode === 'page') {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                if (btnReaderPrevPage) btnReaderPrevPage.click();
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                if (btnReaderNextPage) btnReaderNextPage.click();
            }
        }
    });

    // Attach click events on Manga Card Grid using Delegation
    if (gridContainer) {
        gridContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.manga-card');
            if (!card) return;
            
            const titleEl = card.querySelector('.card-title');
            if (!titleEl) return;
            
            const titleText = titleEl.textContent;
            
            // Find in gridData (case insensitive search to be safe)
            const manga = gridData.find(m => m.title.toLowerCase() === titleText.toLowerCase());
            if (manga) {
                openMangaDetail(manga);
            }
        });
    }

    // Attach click events to Hero "READ NOW" Button
    const heroReadBtn = document.getElementById('hero-read-btn');
    if (heroReadBtn) {
        heroReadBtn.addEventListener('click', () => {
            const currentTitle = document.getElementById('hero-title')?.textContent;
            if (!currentTitle) return;
            
            // Look up the featured manga from carouselData
            const manga = carouselData.find(m => m.title.toLowerCase() === currentTitle.toLowerCase());
            if (manga) {
                openMangaDetail(manga);
            }
        });
    }

    // Carousel auto-play
    let autoPlayInterval = setInterval(() => {
        currentSlide = currentSlide < carouselData.length - 1 ? currentSlide + 1 : 0;
        updateSlideUI();
    }, 5000);

    // Pause auto-play on interaction
    const carouselContainer = document.querySelector('.carousel-inner')?.parentElement;
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(() => {
                currentSlide = currentSlide < carouselData.length - 1 ? currentSlide + 1 : 0;
                updateSlideUI();
            }, 5000);
        });
    }
});

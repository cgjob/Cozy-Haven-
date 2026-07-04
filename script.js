// DEFAULT PRESET STORIES WITH STATIC ROOT LINKS (ये सीधे बिना किसी सब-फोल्डर के मुख्य कड़ियों पर खुलेंगे)
const defaultArticles = [
    {
        id: "post-1",
        title: "10 Budget-Friendly Cozy Living Room Ideas",
        category: "decor",
        categoryLabel: "DIY & Decor",
        author: "Sarah Jenkins",
        date: "July 1, 2026",
        readTime: "5 Mins Read",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
        summary: "Transform your space without breaking the bank. Simple, warm styling tips using items you already own.",
        url: "decor-living-room.html" // Direct Link in Root Folder!
    },
    {
        id: "post-2",
        title: "Quick 15-Minute Creamy Garlic Pasta",
        category: "recipes",
        categoryLabel: "Quick Food",
        author: "Chef Marcus Cole",
        date: "June 28, 2026",
        readTime: "15 Mins Cook",
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=600",
        summary: "Perfect for busy weeknights. A rich, restaurant-style creamy pasta recipe requiring only 5 staple ingredients.",
        url: "food-pasta.html" // Direct Link in Root Folder!
    },
    {
        id: "post-3",
        title: "5 Simple Morning Habits for Less Stress",
        category: "wellness",
        categoryLabel: "Self-Care",
        author: "Dr. Elena Rostova",
        date: "June 25, 2026",
        readTime: "4 Mins Read",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
        summary: "Start your day with calm energy. Practical mindfulness and routines designed to reset your mental space.",
        url: "wellness-habits.html" // Direct Link in Root Folder!
    }
];

document.addEventListener('DOMContentLoaded', () => {

    const blogGrid = document.getElementById('blogGrid');
    const favCountSpan = document.getElementById('favCount');
    
    let allArticles = [];
    let savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
    let customArticles = JSON.parse(localStorage.getItem('customArticles')) || [];
    let subscribersList = JSON.parse(localStorage.getItem('subscribers')) || ["hello@cozyhaven.com"];

    // Setup base simulated views count
    let postViews = JSON.parse(localStorage.getItem('post_views')) || {
        "post-1": 1420,
        "post-2": 980,
        "post-3": 740
    };
    localStorage.setItem('post_views', JSON.stringify(postViews));

    // --- 🛠️ DYNAMIC RSS AUTO-BLOG ENGINE (आटोमेटिक लाइव ब्लॉगिंग फीचर) ---
    async function fetchLiveRSSPosts() {
        const categories = [
            { key: 'decor', label: 'DIY & Decor', url: 'https://www.apartmenttherapy.com/main.rss' },
            { key: 'recipes', label: 'Quick Food', url: 'https://pinchofyum.com/feed' },
            { key: 'wellness', label: 'Self-Care', url: 'https://greatist.com/feed' }
        ];

        let fetchedArticles = [];

        for (const cat of categories) {
            try {
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(cat.url)}`);
                const data = await response.json();
                
                if (data.status === 'ok' && data.items) {
                    const items = data.items.slice(0, 3).map((item, index) => {
                        let image = item.thumbnail || (item.enclosure ? item.enclosure.link : null);
                        if (!image || image.includes('placeholder') || image === '') {
                            const imgReg = /<img[^>]+src="?([^"\s]+)"?\s*/i;
                            const match = imgReg.exec(item.description);
                            image = match ? match[1] : "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=600";
                        }
                        const cleanSummary = item.description.replace(/<[^>]*>/g, '').substring(0, 110) + '...';
                        
                        return {
                            id: `live-${cat.key}-${index}`,
                            title: item.title,
                            category: cat.key,
                            categoryLabel: cat.label,
                            author: item.author || "Editorial Staff",
                            date: new Date(item.pubDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                            readTime: "5 Mins Read",
                            image: image,
                            summary: cleanSummary,
                            content: item.content || item.description,
                            url: `?post=live-${cat.key}-${index}`
                        };
                    });
                    fetchedArticles = [...fetchedArticles, ...items];
                }
            } catch (error) {
                console.error(`Error fetching feed for ${cat.key}:`, error);
            }
        }
        return fetchedArticles;
    }

    // Initialize Site
    async function initializeWebsite() {
        const livePosts = await fetchLiveRSSPosts();
        const defaultPool = livePosts.length > 0 ? [...livePosts, ...defaultArticles] : defaultArticles;

        allArticles = [...customArticles, ...defaultPool];
        renderBlogCards(allArticles);
        updateFavCount();
        
        // DEEP LINKING FOR CUSTOM & LIVE POSTS
        const urlParams = new URLSearchParams(window.location.search);
        const sharedPostId = urlParams.get('post');
        if (sharedPostId && (sharedPostId.startsWith('custom-') || sharedPostId.startsWith('live-'))) {
            const article = allArticles.find(art => art.id === sharedPostId);
            if (article) {
                openArticleModal(article);
            }
        }
    }

    // Render cards
    function renderBlogCards(articlesToRender) {
        blogGrid.innerHTML = ''; 

        if (articlesToRender.length === 0) {
            blogGrid.innerHTML = `<div style="text-align:center; width:100%; grid-column: 1/-1; padding: 40px 0; color:var(--gray);"><p>No articles found here. Explore another category!</p></div>`;
            return;
        }

        articlesToRender.forEach(article => {
            const isSaved = savedPosts.includes(article.id);
            const isCustom = article.id.startsWith('custom-'); 
            const isLive = article.id.startsWith('live-');
            
            const articleUrl = (isCustom || isLive) ? `#` : article.url;

            const card = document.createElement('article');
            card.className = 'blog-card';
            card.setAttribute('data-category', article.category);
            card.setAttribute('data-id', article.id);

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    <span class="card-category">${article.categoryLabel}</span>
                    <button class="bookmark-btn ${isSaved ? 'saved' : ''}" aria-label="Save Post">
                        <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-content">
                    <span class="read-time"><i class="far fa-clock"></i> ${article.readTime}</span>
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <div class="card-actions-row">
                        ${(isCustom || isLive) ? 
                            `<button class="read-more-btn" data-id="${article.id}">Read Article <i class="fas fa-arrow-right"></i></button>` : 
                            `<a href="${articleUrl}" class="read-more-btn static-article-link" data-id="${article.id}">Read Article <i class="fas fa-arrow-right"></i></a>`
                        }
                        <button class="share-card-btn" data-id="${article.id}" data-custom="${isCustom || isLive}" title="Share Story"><i class="far fa-share-square"></i></button>
                    </div>
                    ${isCustom ? `<button class="delete-post-btn" data-id="${article.id}" title="Delete Post"><i class="fas fa-trash-alt"></i></button>` : ''}
                </div>
            `;
            blogGrid.appendChild(card);
        });
    }

    // Grid Event Delegation
    blogGrid.addEventListener('click', (e) => {
        const target = e.target;

        // Bookmark Toggle
        if (target.closest('.bookmark-btn')) {
            const btn = target.closest('.bookmark-btn');
            const card = btn.closest('.blog-card');
            const postId = card.getAttribute('data-id');

            if (savedPosts.includes(postId)) {
                savedPosts = savedPosts.filter(id => id !== postId);
                btn.classList.remove('saved');
                btn.querySelector('i').className = 'far fa-heart';
            } else {
                savedPosts.push(postId);
                btn.classList.add('saved');
                btn.querySelector('i').className = 'fas fa-heart';
            }
            localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
            updateFavCount();
        }

        // Read Custom & Live Articles in Modal
        if (target.closest('.read-more-btn') && !target.closest('.read-more-btn').classList.contains('static-article-link')) {
            const btn = target.closest('.read-more-btn');
            const postId = btn.getAttribute('data-id');
            const article = allArticles.find(art => art.id === postId);
            if (article) openArticleModal(article);
        }

        // Static Links view increments
        if (target.closest('.static-article-link')) {
            const btn = target.closest('.static-article-link');
            const postId = btn.getAttribute('data-id');
            incrementViewCount(postId);
        }

        // Share Card Button
        if (target.closest('.share-card-btn')) {
            const btn = target.closest('.share-card-btn');
            const postId = btn.getAttribute('data-id');
            const isCustom = btn.getAttribute('data-custom') === "true";
            const article = allArticles.find(art => art.id === postId);
            if (article) {
                shareArticle(article, isCustom);
            }
        }

        // Delete custom post
        if (target.closest('.delete-post-btn')) {
            const btn = target.closest('.delete-post-btn');
            const postId = btn.getAttribute('data-id');
            
            if (confirm("Are you sure you want to delete this custom story?")) {
                customArticles = customArticles.filter(art => art.id !== postId);
                localStorage.setItem('customArticles', JSON.stringify(customArticles));
                
                savedPosts = savedPosts.filter(id => id !== postId);
                localStorage.setItem('savedPosts', JSON.stringify(savedPosts));

                initializeWebsite();
            }
        }
    });

    function updateFavCount() {
        favCountSpan.textContent = savedPosts.length;
    }

    function incrementViewCount(postId) {
        let currentViews = JSON.parse(localStorage.getItem('post_views')) || {};
        currentViews[postId] = (currentViews[postId] || 0) + 1;
        localStorage.setItem('post_views', JSON.stringify(currentViews));
    }

    // Modal For Custom & Live Articles
    function openArticleModal(article) {
        document.getElementById('modalTitle').textContent = article.title;
        document.getElementById('modalHeroImg').style.backgroundImage = `url('${article.image}')`;
        document.getElementById('modalCategory').textContent = article.categoryLabel;
        document.getElementById('modalDate').textContent = article.date;
        document.getElementById('modalAuthor').textContent = `By ${article.author}`;
        document.getElementById('modalMainContent').innerHTML = article.content;

        incrementViewCount(article.id);

        const shareUrl = `${window.location.origin}${window.location.pathname}?post=${article.id}`;
        
        document.getElementById('shareWa').href = `https://api.whatsapp.com/send?text=Check out this cozy story on Cozy Haven! 📲 ${encodeURIComponent(article.title)} - ${encodeURIComponent(shareUrl)}`;
        document.getElementById('shareFb').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        document.getElementById('sharePin').href = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(article.image)}&description=${encodeURIComponent(article.title)}`;

        const shareCopyBtn = document.getElementById('shareCopy');
        shareCopyBtn.onclick = () => {
            copyToClipboard(shareUrl).then(() => {
                showToastNotification();
            });
        };

        document.getElementById('articleModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Copy to Clipboard (Fallback integrated)
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            return new Promise((resolve, reject) => {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";  
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        resolve();
                    } else {
                        reject(new Error('Fallback copy failed'));
                    }
                } catch (err) {
                    reject(err);
                }
                document.body.removeChild(textArea);
            });
        }
    }

    function showToastNotification() {
        const toast = document.getElementById('shareToast');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500); 
    }

    // Share Handler (Direct links for static posts, deep query links for custom/live)
    function shareArticle(article, isCustom) {
        const shareUrl = isCustom ? 
            `${window.location.origin}${window.location.pathname}?post=${article.id}` : 
            `${window.location.origin}${window.location.pathname.replace('index.html', '')}${article.url}`;
        
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: `Read "${article.title}" on Cozy Haven! 📲`,
                url: shareUrl
            }).catch(console.error);
        } else {
            copyToClipboard(shareUrl).then(() => {
                showToastNotification();
            });
        }
    }

    // Category Filter
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedCategory = button.getAttribute('data-filter');
            
            if (selectedCategory === 'all') {
                renderBlogCards(allArticles);
            } else if (selectedCategory === 'favorites') {
                const favs = allArticles.filter(art => savedPosts.includes(art.id));
                renderBlogCards(favs);
            } else {
                const filtered = allArticles.filter(art => art.category === selectedCategory);
                renderBlogCards(filtered);
            }
        });
    });

    // Close Modal Events
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', () => {
            document.getElementById('articleModal').classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Theme Switcher
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggleBtn.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Reading Scroll Progress Bar
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('progressBar').style.width = scrolled + '%';
    });

    // Hamburger Mobile Menu
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = hamburgerBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    });

    // Newsletter Signup
    const subscribeForm = document.getElementById('subscribeForm');
    const emailInput = document.getElementById('emailInput');
    subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userEmail = emailInput.value.trim().toLowerCase();

        if (subscribersList.includes(userEmail)) {
            alert("This email address is already subscribed to Cozy Haven!");
        } else {
            subscribersList.push(userEmail);
            localStorage.setItem('subscribers', JSON.stringify(subscribersList));
            alert(`🎉 Success! Cozy Haven newsletters will be sent to: ${userEmail}`);
        }
        emailInput.value = '';
    });

    initializeWebsite();
});

// --- 📈 POST VIEWS TRACKER (बिना कोडिंग छेड़े सबसे नीचे ऑटो-कंट्रोलर) ---
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.read-more-btn');
    if (btn) {
        const postId = btn.getAttribute('data-id');
        if (postId) {
            let viewsData = JSON.parse(localStorage.getItem('post_views')) || {
                "post-1": 1420,
                "post-2": 980,
                "post-3": 740
            };
            viewsData[postId] = (viewsData[postId] || 0) + 1;
            localStorage.setItem('post_views', JSON.stringify(viewsData));
        }
    }
});
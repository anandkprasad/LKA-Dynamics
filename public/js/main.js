/* ===================================================================
 * Infinity 2.0.0 - Main JS
 *
 *
 * ------------------------------------------------------------------- */

(function(html) {

    'use strict';

    const cfg = {
        
        // MailChimp URL
        mailChimpURL : 'https://facebook.us1.list-manage.com/subscribe/post?u=1abf75f6981256963a47d197a&amp;id=37c6d8f4d6' 

    };


    /* animations
    * -------------------------------------------------- */
    const tl = anime.timeline( {
        easing: 'easeInOutCubic',
        duration: 800,
        autoplay: false
    })
    .add({
        targets: '#loader',
        opacity: 0,
        duration: 1000,
        begin: function(anim) {
            window.scrollTo(0, 0);
        }
    })
    .add({
        targets: '#preloader',
        opacity: 0,
        complete: function(anim) {
            document.querySelector("#preloader").style.visibility = "hidden";
            document.querySelector("#preloader").style.display = "none";
        }
    })
    .add({
        targets: ['.s-header__logo', '.s-header__menu-toggle'],
        opacity: [0, 1]
    }, '-=200')
    .add({
        targets: ['.s-intro__pretitle', '.s-intro__title', '.s-intro__more'],
        translateY: [100, 0],
        opacity: [0, 1],
        delay: anime.stagger(200)
    }, '-=400')
    .add({
        targets: ['.s-intro__social', '.s-intro__scroll'],
        opacity: [0, 1],
        delay: anime.stagger(200)
    }, '-=200');


   /* preloader
    * -------------------------------------------------- */
    const ssPreloader = function() {

        const preloader = document.querySelector('#preloader');
        if (!preloader) return;

        html.classList.add('ss-preload');
        
        window.addEventListener('load', function() {
            html.classList.remove('ss-preload');
            html.classList.add('ss-loaded');
            tl.play();
        });

    }; // end ssPreloader


    /* parallax
    * -------------------------------------------------- */
    const ssParallax = function() { 

        const rellax = new Rellax('.rellax');

    }; // end ssParallax


    /* matrix background (digital rain)
    * -------------------------------------------------- */
    const ssMatrixBackground = function() {
        const container = document.querySelector('.s-intro__bg');
        if (!container) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const canvas = document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        // place as first child so it paints behind cubes
        container.insertBefore(canvas, container.firstChild);

        const ctx = canvas.getContext('2d');
        let width = 0, height = 0, dpr = Math.max(1, window.devicePixelRatio || 1);
        let columns = 0;
        let drops = [];
        let fontSize = 16;
        let chars = 'アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let charArr = chars.split('');
        let lastTime = performance.now();

        function resize() {
            const rect = container.getBoundingClientRect();
            width = Math.max(1, Math.floor(rect.width));
            height = Math.max(1, Math.floor(rect.height));
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // compute font size relative to viewport
            fontSize = Math.max(12, Math.min(22, Math.round(width / 60)));
            ctx.font = `${fontSize}px monospace`;
            columns = Math.ceil(width / fontSize);
            drops = new Array(columns).fill(0).map(() => Math.random() * -20);
        }

        function step(now) {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            // motion scale
            const speed = prefersReducedMotion ? 15 : 30; // smaller -> slower fade trail

            // translucent background for trail effect
            ctx.fillStyle = `rgba(0, 10, 15, ${prefersReducedMotion ? 0.2 : 0.08})`;
            ctx.fillRect(0, 0, width, height);

            // draw characters
            for (let i = 0; i < columns; i++) {
                const text = charArr[(Math.random() * charArr.length) | 0];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // glowing head and dim tail
                ctx.fillStyle = 'rgba(180, 255, 180, 0.9)';
                ctx.shadowColor = 'rgba(0,255,140,0.6)';
                ctx.shadowBlur = 12;
                ctx.fillText(text, x, y);

                ctx.shadowBlur = 0;

                // advance drop
                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                } else {
                    drops[i] += (prefersReducedMotion ? 0.6 : 1.2);
                }
            }

            requestAnimationFrame(step);
        }

        updateEnabled();
        resize();
        window.addEventListener('resize', resize);
        requestAnimationFrame(step);
    }; // end ssMatrixBackground


    /* hero cubes (interactive)
    * -------------------------------------------------- */
    const ssHeroCubes = function() {
        const bg = document.querySelector('.s-intro__bg');
        if (!bg) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const CUBE_COUNT = 6; // adjustable
        const cubes = [];
        let mouse = { x: 0.5, y: 0.5 };
        let scrollInfluence = 0;
        let lastScrollY = window.scrollY || 0;
        let lastTime = performance.now();

        // Create cubes
        for (let i = 0; i < CUBE_COUNT; i++) {
            const el = document.createElement('div');
            el.className = 's-intro__cube';
            const size = Math.round(60 + Math.random() * 120); // 60-180px
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            // depth layer via zIndex + opacity tweaks
            const depth = Math.random(); // 0..1
            el.style.opacity = String(0.22 + depth * 0.25);
            el.style.zIndex = String(0); // stays behind text; container layering handles this
            bg.appendChild(el);

            cubes.push({
                el,
                size,
                depth,
                // normalized position (0..1) within bg
                x: Math.random(),
                y: Math.random(),
                // base velocity in normalized units per second
                vx: (Math.random() * 0.06 + 0.02) * (Math.random() < 0.5 ? -1 : 1) * (0.5 + depth),
                vy: (Math.random() * 0.06 + 0.02) * (Math.random() < 0.5 ? -1 : 1) * (0.5 + depth),
                rot: Math.random() * 360,
                rotSpeed: (Math.random() * 20 - 10) * (0.5 + depth)
            });
        }

        function updateMouse(e) {
            const rect = bg.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) / Math.max(1, rect.width);
            mouse.y = (e.clientY - rect.top) / Math.max(1, rect.height);
            mouse.x = Math.max(0, Math.min(1, mouse.x));
            mouse.y = Math.max(0, Math.min(1, mouse.y));
        }

        window.addEventListener('mousemove', updateMouse, { passive: true });

        window.addEventListener('scroll', () => {
            const current = window.scrollY || 0;
            const delta = current - lastScrollY;
            lastScrollY = current;
            // dampened influence
            scrollInfluence += delta * 0.0005;
            // clamp to avoid runaway
            scrollInfluence = Math.max(-0.2, Math.min(0.2, scrollInfluence));
        }, { passive: true });

        window.addEventListener('resize', () => {
            // nothing required; positions are normalized
        });

        function animate(now) {
            const dt = Math.min(0.05, (now - lastTime) / 1000); // cap dt to 50ms
            lastTime = now;

            const rect = bg.getBoundingClientRect();

            // gentle easing of scroll influence back to 0
            scrollInfluence *= 0.96;

            cubes.forEach(c => {
                // mouse parallax drift by depth
                const mx = (mouse.x - 0.5) * (0.06 + c.depth * 0.12);
                const my = (mouse.y - 0.5) * (0.06 + c.depth * 0.12);

                c.x += (c.vx * dt) + mx * dt + scrollInfluence * 0.1 * dt;
                c.y += (c.vy * dt) + my * dt - scrollInfluence * 0.2 * dt;
                c.rot += c.rotSpeed * dt;

                // wrap around with margin equal to cube size in normalized units
                const marginX = c.size / Math.max(1, rect.width);
                const marginY = c.size / Math.max(1, rect.height);

                if (c.x < -marginX) c.x = 1 + marginX;
                if (c.x > 1 + marginX) c.x = -marginX;
                if (c.y < -marginY) c.y = 1 + marginY;
                if (c.y > 1 + marginY) c.y = -marginY;

                const px = c.x * rect.width - c.size / 2;
                const py = c.y * rect.height - c.size / 2;
                c.el.style.transform = `translate(${px}px, ${py}px) rotate(${c.rot}deg)`;
            });

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }; // end ssHeroCubes


    /* chrome dino overlay (simple runner)
    * -------------------------------------------------- */
    const ssDinoRunner = function() {
        const content = document.querySelector('.s-intro__content');
        if (!content) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // ensure content is a positioned ancestor for absolute child placement
        try {
            const cs = window.getComputedStyle(content);
            if (cs && cs.position === 'static') content.style.position = 'relative';
        } catch (e) { /* no-op */ }

        const holder = document.createElement('div');
        holder.className = 'dino-runner';
        const canvas = document.createElement('canvas');
        holder.appendChild(canvas);
        content.appendChild(holder);

        const ctx = canvas.getContext('2d');
        let width = 320;
        let height = 90;
        let dpr = Math.max(1, window.devicePixelRatio || 1);
        const heroTitle = content.querySelector('.s-intro__title');
        const heroPretitle = content.querySelector('.s-intro__pretitle');
        const BREAKPOINT = 800; // px
        let enabled = true;

        function updateEnabled() {
            enabled = window.innerWidth >= BREAKPOINT;
            holder.style.display = enabled ? '' : 'none';
        }

        function resize() {
            // scale width on small screens
            const vw = Math.min(400, Math.max(260, Math.floor(window.innerWidth * 0.5)));
            width = vw;
            height = Math.round(vw * 0.28);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            updateEnabled();
            positionCanvas();
        }

        // helper: get element's top relative to a given ancestor
        function getTopRelativeTo(el, ancestor) {
            let top = 0;
            let node = el;
            while (node && node !== ancestor) {
                top += node.offsetTop || 0;
                node = node.offsetParent;
            }
            return top;
        }

        // place the canvas above the pretitle ("We Are LKA Dynamics.") without overlap
        // horizontally center over the main title text
        function positionCanvas() {
            if (!heroTitle && !heroPretitle) return;
            const contentRect = content.getBoundingClientRect();
            const anchorEl = heroPretitle || heroTitle;

            // vertical: sit above pretitle with a gap
            const gap = 16; // px
            const anchorTop = getTopRelativeTo(anchorEl, content);
            const desiredTop = Math.max(0, Math.round(anchorTop - height - gap));
            holder.style.top = desiredTop + 'px';

            // horizontal: center over title
            const titleRect = (heroTitle || anchorEl).getBoundingClientRect();
            const titleCenter = (titleRect.left - contentRect.left) + (titleRect.width / 2);
            let desiredLeft = Math.round(titleCenter - (width / 2));
            const maxLeft = Math.max(0, Math.floor(contentRect.width - width));
            desiredLeft = Math.max(0, Math.min(maxLeft, desiredLeft));
            holder.style.left = desiredLeft + 'px';
        }

        resize();
        window.addEventListener('resize', resize);
        // re-run positioning after layout/fonts settle
        requestAnimationFrame(() => positionCanvas());
        window.addEventListener('load', () => positionCanvas());

        // game state
        const groundY = height - 18;
        const gravity = 1600; // px/s^2
        const jumpV = 580;    // px/s
        const speed = 220;    // px/s ground speed

        const dino = {
            x: 24,
            y: groundY - 28,
            w: 36,
            h: 28,
            vy: 0,
            onGround: true,
            legPhase: 0
        };

        const obstacles = [];
        let lastSpawn = 0;
        let spawnDelay = 1.4; // seconds
        let lastTime = performance.now();

        function spawn() {
            const tall = Math.random() < 0.4;
            const w = tall ? 14 : 18;
            const h = tall ? 40 : 28;
            obstacles.push({ x: width + 10, y: groundY - h, w, h });
        }

        function jump() {
            if (!dino.onGround) return;
            dino.onGround = false;
            dino.vy = -jumpV;
        }

        // auto-jump to avoid obstacles to keep it playful without input
        function autoJumpAhead(dt) {
            for (let i = 0; i < obstacles.length; i++) {
                const o = obstacles[i];
                const timeToReach = (o.x - dino.x - dino.w) / speed; // seconds
                if (timeToReach > 0 && timeToReach < 0.35 && dino.onGround) {
                    jump();
                    break;
                }
            }
        }

        // optional manual jump with space or tap
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') jump();
        });
        content.addEventListener('click', () => jump());

        function drawDino() {
            // body
            ctx.fillStyle = '#e6e6e6';
            ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
            // head
            ctx.fillRect(dino.x + dino.w - 18, dino.y - 10, 16, 12);
            // eye
            ctx.fillStyle = '#111';
            ctx.fillRect(dino.x + dino.w - 6, dino.y - 6, 3, 3);
            // legs (alternating)
            ctx.fillStyle = '#dcdcdc';
            const legUp = (Math.floor(dino.legPhase) % 2) === 0;
            if (legUp) {
                ctx.fillRect(dino.x + 4, dino.y + dino.h, 6, 6);
                ctx.fillRect(dino.x + 18, dino.y + dino.h - 4, 6, 10);
            } else {
                ctx.fillRect(dino.x + 4, dino.y + dino.h - 4, 6, 10);
                ctx.fillRect(dino.x + 18, dino.y + dino.h, 6, 6);
            }
        }

        function drawGround(offset) {
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY + 1);
            ctx.lineTo(width, groundY + 1);
            ctx.stroke();
            // small ticks to imply motion
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            for (let x = -((offset) % 30); x < width; x += 30) {
                ctx.beginPath();
                ctx.moveTo(x, groundY + 3);
                ctx.lineTo(x + 10, groundY + 3);
                ctx.stroke();
            }
        }

        function drawObstacle(o) {
            // cactus base (brand yellow)
            ctx.fillStyle = '#F9A828';
            ctx.fillRect(o.x, o.y, o.w, o.h);
            // inner shading (darker yellow)
            ctx.fillStyle = '#C77F00';
            ctx.fillRect(o.x + 3, o.y + 4, o.w - 6, o.h - 8);
        }

        function loop(now) {
            const dt = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;

            if (!enabled) {
                // keep the RAF alive but skip updates/renders
                requestAnimationFrame(loop);
                return;
            }

            ctx.clearRect(0, 0, width, height);

            // update
            dino.legPhase += (dino.onGround ? 14 : 6) * dt;
            dino.y += dino.vy * dt;
            dino.vy += gravity * dt;
            if (dino.y >= groundY - dino.h) {
                dino.y = groundY - dino.h;
                dino.vy = 0;
                dino.onGround = true;
            }

            lastSpawn += dt;
            if (lastSpawn > spawnDelay) {
                spawn();
                lastSpawn = 0;
                spawnDelay = 1.2 + Math.random() * 1.0;
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const o = obstacles[i];
                o.x -= speed * dt;
                if (o.x + o.w < 0) obstacles.splice(i, 1);
            }

            autoJumpAhead(dt);

            // draw
            drawGround(now * 0.12);
            obstacles.forEach(drawObstacle);
            drawDino();

            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }; // end ssDinoRunner


   /* menu on scrolldown
    * ------------------------------------------------------ */
    const ssMenuOnScrolldown = function() {

        const menuToggle = document.querySelector('.s-header__menu-toggle');
        const triggerHeight = 150;


        window.addEventListener('scroll', function () {

            let loc = window.scrollY;

            if (loc > triggerHeight) {
                menuToggle.classList.add('opaque');
            } else {
                menuToggle.classList.remove('opaque');
            }

        });

    }; // menu on scrolldown


   /* offcanvas menu
    * ------------------------------------------------------ */
    const ssOffCanvas = function() {

        const menuToggle  = document.querySelector('.s-header__menu-toggle');
        const nav         = document.querySelector('.s-header__nav');
        const closeButton = document.querySelector('.s-header__nav-close-btn');
        const siteBody    = document.querySelector('body');

        if (!(menuToggle && nav)) return;

        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            siteBody.classList.add('menu-is-open');
        });

        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (siteBody.classList.contains('menu-is-open')) {
                siteBody.classList.remove('menu-is-open');
            }
        });

        siteBody.addEventListener('click', function(e) {
            if(!(e.target.matches('.s-header__nav, .smoothscroll'))) {
                closeButton.dispatchEvent(new Event('click'));
            }
        });

    }; // end ssOffcanvas


   /* masonry
    * ------------------------------------------------------ */
    const ssMasonry = function() {

        const containerBricks = document.querySelector('.bricks');
        if (!containerBricks) return;

        imagesLoaded(containerBricks, function() {

            const msnry = new Masonry(containerBricks, {
                itemSelector: '.brick',
                columnWidth: '.brick',
                percentPosition: true,
                resize: true
            });

        });

    }; // end ssMasonry


   /* animate elements if in viewport
    * ------------------------------------------------------ */
    const ssAnimateOnScroll = function() {

        const blocks = document.querySelectorAll('[data-animate-block]');
        if (!blocks) return;

        window.addEventListener('scroll', animateOnScroll);

        function animateOnScroll() {

            let scrollY = window.pageYOffset;

            blocks.forEach(function(current) {

                const viewportHeight = window.innerHeight;
                const triggerTop = (current.getBoundingClientRect().top + window.scrollY + (viewportHeight * .2)) - viewportHeight;
                const blockHeight = current.offsetHeight;
                const blockSpace = triggerTop + blockHeight;
                const inView = scrollY > triggerTop && scrollY <= blockSpace;
                const isAnimated = current.classList.contains('ss-animated');

                if (inView && (!isAnimated)) {

                    anime({
                        targets: current.querySelectorAll('[data-animate-el]'),
                        opacity: [0, 1],
                        translateY: [100, 0],
                        delay: anime.stagger(200, {start: 200}),
                        duration: 800,
                        easing: 'easeInOutCubic',
                        begin: function(anim) {
                            current.classList.add('ss-animated');
                        }
                    });
                }
            });
        }

    }; // end ssAnimateOnScroll


   /* swiper
    * ------------------------------------------------------ */ 
    const ssSwiper = function() {

        const clientsSwiper = new Swiper('.clients', {

            slidesPerView: 3,
            spaceBetween: 6,
            slideClass: 'clients__slide',
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                // when window width is > 500px
                501: {
                    slidesPerView: 4,
                    spaceBetween: 16
                },
                // when window width is > 900px
                901: {
                    slidesPerView: 5,
                    spaceBetween: 32
                },
                // when window width is > 1200px
                1201: {
                    slidesPerView: 6,
                    spaceBetween: 40
                }
            }
        });

        const testimonialsSwiper = new Swiper('.testimonial-slider', {

            slidesPerView: 1,
            effect: 'slide',
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            }
        });

    }; // end ssSwiper


    /* photoswipe
    * ----------------------------------------------------- */
    const ssPhotoswipe = function() {

        const items = [];
        const pswp = document.querySelectorAll('.pswp')[0];
        const folioItems = document.querySelectorAll('.folio-item');

        if (!(pswp && folioItems)) return;

        folioItems.forEach(function(folioItem) {

            let folio = folioItem;
            let thumbLink = folio.querySelector('.folio-item__thumb-link');
            let title = folio.querySelector('.folio-item__title');
            let caption = folio.querySelector('.folio-item__caption');
            let titleText = '<h4>' + title.innerHTML + '</h4>';
            let captionText = caption.innerHTML;
            let href = thumbLink.getAttribute('href');
            let size = thumbLink.dataset.size.split('x'); 
            let width  = size[0];
            let height = size[1];

            let item = {
                src  : href,
                w    : width,
                h    : height
            }

            if (caption) {
                item.title = titleText.trim() + captionText.trim();
            }

            items.push(item);

        });

        // bind click event
        folioItems.forEach(function(folioItem, i) {

            let thumbLink = folioItem.querySelector('.folio-item__thumb-link');

            thumbLink.addEventListener('click', function(event) {

                event.preventDefault();

                let options = {
                    index: i,
                    showHideOpacity: true
                }

                // initialize PhotoSwipe
                let lightBox = new PhotoSwipe(pswp, PhotoSwipeUI_Default, items, options);
                lightBox.init();
            });

        });

    };  // end ssPhotoSwipe


   /* mailchimp form
    * ---------------------------------------------------- */ 
    const ssMailChimpForm = function() {

        const mcForm = document.querySelector('#mc-form');

        if (!mcForm) return;

        // Add novalidate attribute
        mcForm.setAttribute('novalidate', true);

        // Field validation
        function hasError(field) {

            // Don't validate submits, buttons, file and reset inputs, and disabled fields
            if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') return;

            // Get validity
            let validity = field.validity;

            // If valid, return null
            if (validity.valid) return;

            // If field is required and empty
            if (validity.valueMissing) return 'Please enter an email address.';

            // If not the right type
            if (validity.typeMismatch) {
                if (field.type === 'email') return 'Please enter a valid email address.';
            }

            // If pattern doesn't match
            if (validity.patternMismatch) {

                // If pattern info is included, return custom error
                if (field.hasAttribute('title')) return field.getAttribute('title');

                // Otherwise, generic error
                return 'Please match the requested format.';
            }

            // If all else fails, return a generic catchall error
            return 'The value you entered for this field is invalid.';

        };

        // Show error message
        function showError(field, error) {

            // Get field id or name
            let id = field.id || field.name;
            if (!id) return;

            let errorMessage = field.form.querySelector('.mc-status');

            // Update error message
            errorMessage.classList.remove('success-message');
            errorMessage.classList.add('error-message');
            errorMessage.innerHTML = error;

        };

        // Display form status (callback function for JSONP)
        window.displayMailChimpStatus = function (data) {

            // Make sure the data is in the right format and that there's a status container
            if (!data.result || !data.msg || !mcStatus ) return;

            // Update our status message
            mcStatus.innerHTML = data.msg;

            // If error, add error class
            if (data.result === 'error') {
                mcStatus.classList.remove('success-message');
                mcStatus.classList.add('error-message');
                return;
            }

            // Otherwise, add success class
            mcStatus.classList.remove('error-message');
            mcStatus.classList.add('success-message');
        };

        // Submit the form 
        function submitMailChimpForm(form) {

            let url = cfg.mailChimpURL;
            let emailField = form.querySelector('#mce-EMAIL');
            let serialize = '&' + encodeURIComponent(emailField.name) + '=' + encodeURIComponent(emailField.value);

            if (url == '') return;

            url = url.replace('/post?u=', '/post-json?u=');
            url += serialize + '&c=displayMailChimpStatus';

            // Create script with url and callback (if specified)
            var ref = window.document.getElementsByTagName( 'script' )[ 0 ];
            var script = window.document.createElement( 'script' );
            script.src = url;

            // Create global variable for the status container
            window.mcStatus = form.querySelector('.mc-status');
            window.mcStatus.classList.remove('error-message', 'success-message')
            window.mcStatus.innerText = 'Submitting...';

            // Insert script tag into the DOM
            ref.parentNode.insertBefore( script, ref );

            // After the script is loaded (and executed), remove it
            script.onload = function () {
                this.remove();
            };

        };

        // Check email field on submit
        mcForm.addEventListener('submit', function (event) {

            event.preventDefault();

            let emailField = event.target.querySelector('#mce-EMAIL');
            let error = hasError(emailField);

            if (error) {
                showError(emailField, error);
                emailField.focus();
                return;
            }

            submitMailChimpForm(this);

        }, false);

    }; // end ssMailChimpForm


   /* alert boxes
    * ------------------------------------------------------ */
    const ssAlertBoxes = function() {

        const boxes = document.querySelectorAll('.alert-box');
  
        boxes.forEach(function(box){

            box.addEventListener('click', function(event) {
                if (event.target.matches('.alert-box__close')) {
                    event.stopPropagation();
                    event.target.parentElement.classList.add('hideit');

                    setTimeout(function(){
                        box.style.display = 'none';
                    }, 500)
                }
            });
        })

    }; // end ssAlertBoxes


    /* Back to Top
    * ------------------------------------------------------ */
     const ssBackToTop = function() {

        const pxShow = 900;
        const goTopButton = document.querySelector(".ss-go-top");

        if (!goTopButton) return;

        // Show or hide the button
        if (window.scrollY >= pxShow) goTopButton.classList.add("link-is-visible");

        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                if(!goTopButton.classList.contains('link-is-visible')) goTopButton.classList.add("link-is-visible")
            } else {
                goTopButton.classList.remove("link-is-visible")
            }
        });

    }; // end ssBackToTop



   /* smoothscroll
    * ------------------------------------------------------ */
    const ssMoveTo = function() {

        const siteBody    = document.querySelector('body');

        const easeFunctions = {
            easeInQuad: function (t, b, c, d) {
                t /= d;
                return c * t * t + b;
            },
            easeOutQuad: function (t, b, c, d) {
                t /= d;
                return -c * t* (t - 2) + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t*t + b;
                t -= 2;
                return c/2*(t*t*t + 2) + b;
            }
        }

        const triggers = document.querySelectorAll('.smoothscroll');
        
        const moveTo = new MoveTo({
            tolerance: 0,
            duration: 1200,
            easing: 'easeInOutCubic',
            container: window,
            callback: function (target) {
                if (siteBody.classList.contains('menu-is-open')) {
                    siteBody.classList.remove('menu-is-open');
                }
            }
        }, easeFunctions);

}; // end ssMoveTo


/* init
* ------------------------------------------------------ */
const ssInit = function() {
    ssPreloader();
    ssParallax();
    ssHeroCubes();
    ssDinoRunner();
    ssMenuOnScrolldown();
    ssOffCanvas();
    ssMasonry();
    ssAnimateOnScroll();
    ssSwiper();
    ssPhotoswipe();
    ssMailChimpForm();
    ssAlertBoxes();
    ssBackToTop();
    ssMoveTo();
};

ssInit();

})(document.documentElement);
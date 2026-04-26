const JSONBIN_ID = '69afc98bb748274d1d50122b';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;
// Replace with the actual access key
const JSONBIN_ACCESS_KEY = '$2a$10$Ecd1VMiKpPt.e0F8TR5PVOaKDb.6ppTAmGhW4DYnOJ9pc4MPaoiC.';

// Extract data from the global API
async function getActiveData() {
    try {
        const response = await fetch(JSONBIN_URL, {
            headers: {
                'X-Access-Key': JSONBIN_ACCESS_KEY
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        // The actual data payload is nested under the 'record' key in jsonbin v3
        window.portfolioData = json.record;
        return json.record;
    } catch (error) {
        console.error('Error fetching data from JSONBin, falling back to local:', error);
        // Fallback to local data if API fails to prevent white screen
        return JSON.parse(JSON.stringify(window.portfolioData || {}));
    }
}

// Initialize content
document.addEventListener('DOMContentLoaded', async () => {
    const heroNameEl = document.getElementById('hero-name');
    if (heroNameEl) heroNameEl.textContent = "Loading...";

    // 1. IMPROVED SMOOTH LOADER
    const loaderPct = document.getElementById('loader-percentage');
    let pct = 0;
    let isDataLoaded = false;

    const animateLoader = () => {
        if (pct < 100) {
            // If data is loaded, speed up significantly to 100%
            // If not loaded, slow down as it approaches 99% to avoid the "hang"
            let increment = isDataLoaded ? 5 : (pct < 80 ? Math.random() * 8 + 2 : Math.random() * 0.5 + 0.1);
            pct += increment;
            
            if (!isDataLoaded && pct > 98) pct = 98; // Hold at 98 until data is ready
            if (pct >= 100) pct = 100;

            if (loaderPct) loaderPct.textContent = Math.floor(pct) + "%";

            if (pct < 100) {
                requestAnimationFrame(animateLoader);
            } else {
                finishLoading();
            }
        }
    };

    const finishLoading = () => {
        const themeLoader = document.getElementById('theme-loader');
        if (themeLoader) {
            setTimeout(() => {
                themeLoader.style.opacity = '0';
                setTimeout(() => {
                    themeLoader.style.display = 'none';
                }, 500);
            }, 200);
        }
    };

    // Start the animation
    requestAnimationFrame(animateLoader);

    // Fetch data and update persistence
    const data = await getActiveData();
    isDataLoaded = true;

    // Cache data for next refresh (Theme Persistence)
    if (data && data.settings) {
        localStorage.setItem('portfolioEditorData', JSON.stringify(data));
    }


    // Apply Theme Version
    const uiVersion = (data.settings && data.settings.ui_version) ? data.settings.ui_version : "v0.5";
    const themeStylesheet = document.getElementById('theme-stylesheet');
    if (themeStylesheet) {
        // Only swap if it's different from default
        if (uiVersion !== "v0.5") {
            themeStylesheet.href = `theme-${uiVersion}.css`;
        }
    }

    // 1. Hero
    document.getElementById('hero-name').textContent = data.hero.name;
    document.getElementById('hero-subtitle').textContent = data.hero.subtitle;
    document.getElementById('hero-tagline').textContent = data.hero.tagline;
    if (data.hero.btn1_text) document.getElementById('hero-btn-1').textContent = data.hero.btn1_text;
    if (data.hero.btn1_link) document.getElementById('hero-btn-1').href = data.hero.btn1_link;
    if (data.hero.btn2_text) document.getElementById('hero-btn-2').textContent = data.hero.btn2_text;
    if (data.hero.btn2_link) document.getElementById('hero-btn-2').href = data.hero.btn2_link;

    // 2. About
    document.getElementById('about-summary').textContent = data.about.summary;
    const statsContainer = document.getElementById('stats-container');
    data.about.stats.forEach((stat, index) => {
        const d = document.createElement('div');
        d.className = 'stat-card';
        // Note: I'm rendering the raw stat.value and stat.suffix via textContent
        // so they can be edited directly without breaking the number counter logic 
        // if they choose to type something else.
        d.innerHTML = `
            <div class="stat-value" data-val="${stat.value}" data-editable="about.stats.${index}.value">${stat.value}</div>
            <div style="font-size: 1.5rem; color: var(--accent-cyan); margin-top: -10px; margin-bottom: 5px;" data-editable="about.stats.${index}.suffix">${stat.suffix}</div>
            <div class="stat-label" style="color: var(--text-secondary);" data-editable="about.stats.${index}.label">${stat.label}</div>
        `;
        statsContainer.appendChild(d);
    });

    // 3. Experience Timeline
    const expTimeline = document.getElementById('experience-timeline');

    // Sort experience by date (latest first) using start date with month granularity
    const monthMap = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    const parseDateStr = (dateStr) => {
        if (!dateStr) return 0;
        if (dateStr.toLowerCase().includes('present')) return Infinity;
        // Match "Mon 'YY" pattern (e.g., "May '25") — use the START date (first match)
        const monthYearMatch = dateStr.match(/([A-Za-z]{3})\s*'(\d{2})/);
        if (monthYearMatch) {
            const month = monthMap[monthYearMatch[1].toLowerCase()] || 0;
            const year = parseInt(monthYearMatch[2]) + 2000;
            return year * 12 + month;
        }
        // Fallback: try 4-digit year
        const yearMatch = dateStr.match(/(\d{4})/);
        if (yearMatch) return parseInt(yearMatch[1]) * 12;
        return 0;
    };
    data.experience.sort((a, b) => parseDateStr(b.date) - parseDateStr(a.date));

    data.experience.forEach((job, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const item = document.createElement('div');
        item.className = `timeline-item ${side}`;
        
        let ul = '<ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.9rem; margin-top: 10px;">';
        job.points.forEach((pt, ptIndex) => ul += `<li style="margin-bottom: 5px;" data-editable="experience.${index}.points.${ptIndex}">${pt}</li>`);
        ul += '</ul>';

        item.innerHTML = `
            <div class="timeline-content glass-panel" style="padding: 1.5rem;">
                <div class="timeline-date" data-editable="experience.${index}.date">${job.date}</div>
                <h3 style="margin-bottom: 5px;" data-editable="experience.${index}.role">${job.role}</h3>
                <div style="color: var(--accent-cyan); font-weight: 600;" data-editable="experience.${index}.company">${job.company}</div>
                ${ul}
            </div>
        `;
        expTimeline.appendChild(item);
    });

    // 4. Projects
    const projGrid = document.getElementById('projects-grid');
    data.projects.forEach((proj, index) => {
        const item = document.createElement('div');
        item.className = 'glass-panel project-card';
        item.innerHTML = `
            <div class="card-tilt-layer">
                <div class="project-domain" data-editable="projects.${index}.domain">${proj.domain}</div>
                <h3 class="project-title" data-editable="projects.${index}.title">${proj.title}</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 10px;"><strong style="color: var(--accent-cyan);">Problem:</strong> <span data-editable="projects.${index}.problem">${proj.problem}</span></p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 15px;"><strong style="color: var(--accent-cyan);">Solution:</strong> <span data-editable="projects.${index}.solution">${proj.solution}</span></p>
                <div class="project-metrics">
                    <div>📉 <span data-editable="projects.${index}.metrics">${proj.metrics}</span></div>
                </div>
            </div>
            <div class="project-links">
                <a href="${proj.link || '#'}" target="_blank" class="project-action-btn btn-arch" data-editable-href="projects.${index}.link">Portfolio Detail</a>
                <a href="${proj.demoLink || '#'}" target="_blank" class="project-action-btn btn-live" data-editable-href="projects.${index}.demoLink">Live Demo</a>
            </div>
        `;
        projGrid.appendChild(item);
    });

    // 5. Training
    const trainGrid = document.getElementById('training-container');
    data.training.forEach((train, index) => {
        const item = document.createElement('div');
        item.className = 'glass-panel';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px; margin-bottom: 10px;">
                <h3 style="color: var(--text-primary);" data-editable="training.${index}.title">${train.title}</h3>
                <span data-editable="training.${index}.score" style="background: rgba(123, 47, 247, 0.2); padding: 5px 12px; border-radius: 12px; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.9rem; font-weight: bold; border: 1px solid rgba(123,47,247,0.4);">${train.score}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 8px;"><strong style="color: var(--accent-cyan);">Core Focus:</strong> <span data-editable="training.${index}.focus">${train.focus}</span></p>
            ${train.summary ? `<p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 10px;" data-editable="training.${index}.summary">${train.summary}</p>` : ''}
            ${train.link ? `<a href="${train.link}" target="_blank" class="project-action-btn btn-arch" style="align-self: flex-start; margin-top: 1rem;" data-editable-href="training.${index}.link">View on GitHub</a>` : ''}
        `;
        trainGrid.appendChild(item);
    });

    // 6. Skills
    const skillsGrid = document.getElementById('skills-grid');
    for (const [category, skills] of Object.entries(data.skills)) {
        const div = document.createElement('div');
        div.className = 'skill-category';
        
        let tags = '';
        skills.forEach((s, i) => tags += `<span class="skill-tag" data-editable="skills.${category}.${i}">${s}</span>`);
        
        div.innerHTML = `
            <h3 style="font-size: 1.1rem;">${category}</h3>
            <div class="skill-tags">${tags}</div>
        `;
        skillsGrid.appendChild(div);
    }
    
    // Certifications inside Skills Panel
    const certDiv = document.createElement('div');
    certDiv.className = 'skill-category';
    certDiv.style.gridColumn = "1 / -1";
    certDiv.style.marginTop = "1rem";
    certDiv.style.paddingTop = "1rem";
    certDiv.style.borderTop = "1px solid var(--border-glass)";
    let certTags = '';
    data.certifications.forEach((s, i) => certTags += `<span class="skill-tag" style="border-color: rgba(0,240,255,0.3);" data-editable="certifications.${i}">${s}</span>`);
    certDiv.innerHTML = `
        <h3 style="font-size: 1.1rem; color: var(--text-primary);">Key Certifications</h3>
        <div class="skill-tags">${certTags}</div>
    `;
    skillsGrid.appendChild(certDiv);

    // 6.5. Volunteering & Research
    const volGrid = document.getElementById('volunteering-container');
    if (volGrid && data.volunteering) {
        data.volunteering.sort((a, b) => parseDateStr(b.date) - parseDateStr(a.date));
        data.volunteering.forEach((vol, index) => {
            const item = document.createElement('div');
            item.className = 'glass-panel';
            item.style.padding = '1.5rem';
            
            let ul = '<ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.9rem; margin-top: 10px; margin-bottom: 0;">';
            if (vol.points) {
                vol.points.forEach((pt, ptIndex) => ul += `<li style="margin-bottom: 5px;" data-editable="volunteering.${index}.points.${ptIndex}">${pt}</li>`);
            }
            ul += '</ul>';

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <h3 style="color: var(--text-primary); margin: 0;" data-editable="volunteering.${index}.role">${vol.role}</h3>
                    <div style="color: var(--accent-cyan); font-weight: bold; font-family: var(--font-mono); font-size: 0.9rem; text-align: right;" data-editable="volunteering.${index}.date">${vol.date}</div>
                </div>
                <div style="color: var(--accent-cyan); font-weight: 600; font-size: 0.95rem;" data-editable="volunteering.${index}.org">${vol.org}</div>
                ${ul}
            `;
            volGrid.appendChild(item);
        });
    }

    // 6.6. Education
    const eduGrid = document.getElementById('education-container');
    if (eduGrid) {
        data.education.forEach((edu, index) => {
            const item = document.createElement('div');
            item.className = 'glass-panel';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.padding = '1.5rem';
            
            const yearText = edu.year || '2026-2027'; // Fallback if missing
            item.innerHTML = `
                <div>
                    <h3 style="color: var(--text-primary); margin-bottom: 5px;" data-editable="education.${index}.degree">${edu.degree}</h3>
                    <p style="color: var(--text-secondary); margin: 0;" data-editable="education.${index}.school">${edu.school}</p>
                </div>
                <div style="color: var(--accent-cyan); font-weight: bold; font-family: var(--font-mono); font-size: 0.9rem;" data-editable="education.${index}.year">${yearText}</div>
            `;
            eduGrid.appendChild(item);
        });
    }

    // 7. Social Links
    const links = document.getElementById('social-links');
    links.innerHTML = `
        <a href="${data.social.linkedin || '#'}" target="_blank" title="LinkedIn" data-editable-href="social.linkedin">in</a>
        <a href="${data.social.github || '#'}" target="_blank" title="GitHub" data-editable-href="social.github">gh</a>
        <a href="${data.social.email || '#'}" title="Email" data-editable-href="social.email">✉</a>
        <a href="${data.social.phone || '#'}" title="Phone" data-editable-href="social.phone">📞</a>
    `;

    // 8. Resume Link
    if (data.social && data.social.resume) {
        const resumeLink = document.getElementById('resume-link');
        if (resumeLink) resumeLink.href = data.social.resume;
    }

    // Initialize Animations
    initParticles();
    initScrollAnimations();
});

// Particles Background for Hero
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const count = 70;
    
    for(let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            p.x += p.vx;
            p.y += p.vy;
            
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });
        
        // Lines
        ctx.strokeStyle = 'rgba(123, 47, 247, 0.1)';
        for(let i=0; i<count; i++) {
            for(let j=i+1; j<count; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(draw);
    }
    
    draw();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Simple fade-in sequence on load (No IntersectionObserver)
function initScrollAnimations() {
    // Show everything immediately first
    const animatedElements = document.querySelectorAll('.glass-panel, .timeline-item, #stats-container');
    
    animatedElements.forEach((el, index) => {
        // Initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Staggered reveal
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            
            // Animate Numbers if it's the stats container
            if (el.id === 'stats-container' && !el.dataset.animated) {
                el.dataset.animated = 'true';
                const stats = el.querySelectorAll('.stat-value');
                stats.forEach(stat => {
                    let rawVal = stat.getAttribute('data-val');
                    if (!rawVal || rawVal === 'undefined') {
                        rawVal = stat.textContent;
                    }
                    const target = parseFloat(rawVal);
                    
                    if (isNaN(target)) {
                        return; // Non-numeric text, skip animation
                    }

                    const isDecimal = rawVal.toString().includes('.');

                    let count = 0;
                    const updateCount = () => {
                        const inc = target / 20;
                        if(count < target) {
                            count += inc;
                            stat.innerText = isDecimal ? count.toFixed(1) : Math.ceil(count);
                            setTimeout(updateCount, 40);
                        } else {
                            stat.innerText = rawVal; // Final text matches original exactly
                        }
                    };
                    updateCount();
                });
            }
        }, 100 + (index * 50)); // Fast stagger
    });
}

// Tilt effect for project cards — applied to tilt-layer wrapper, not the card,
// so child button click hit-boxes are never shifted by 3D transforms
document.addEventListener('mouseover', e => {
    const card = e.target.closest('.project-card');
    if (!card) return;

    // Get or create the inner tilt layer
    let tiltLayer = card.querySelector('.card-tilt-layer');
    if (!tiltLayer) return; // Safety: only operate if the layer exists

    card.onmousemove = e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        tiltLayer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    card.onmouseleave = () => {
        tiltLayer.style.transform = 'none';
    };
});

// FAANG v1.0 & v0.5 Scroll Animation Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Function to attach observer to newly rendered elements with staggered delays
function attachScrollAnimations() {
    const animatableElements = document.querySelectorAll('.glass-panel, .timeline-item, .project-card, .stat-card');
    
    animatableElements.forEach((el, index) => {
        // Only apply the fade-in-element class if it's not already there 
        // to prevent double-applying during re-renders
        if (!el.classList.contains('fade-in-element')) {
            el.classList.add('fade-in-element');
            
            // Add slight staggered transition delays based on DOM order
            // to create a sweeping effect when multiple items enter viewport at once
            const delay = (index % 5) * 0.1;
            el.style.transitionDelay = `${delay}s`;
            
            fadeObserver.observe(el);
        }
    });
}

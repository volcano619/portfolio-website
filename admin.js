document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('admin-trigger');
    const modal = document.getElementById('admin-modal');
    const overlay = document.getElementById('admin-overlay');
    const btnLogin = document.getElementById('btn-login');
    const btnCancel = document.getElementById('btn-cancel-login');
    const user = document.getElementById('admin-user');
    const pass = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('admin-error');
    const toolbar = document.getElementById('edit-toolbar');
    const btnSave = document.getElementById('btn-save-edits');
    const btnExit = document.getElementById('btn-exit-edit');
    
    let isEditMode = false;

    let clickCount = 0;
    let clickTimer = null;

    // --- FaceID / Biometric Login ---
    const btnFaceID = document.getElementById('btn-faceid');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    async function checkBiometrics() {
        // Show FaceID button if on iOS or if platform biometrics are supported
        if (window.PublicKeyCredential && 
            window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
            try {
                const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                if (available || isIOS) {
                    btnFaceID.style.display = 'flex';
                }
            } catch (e) {
                if (isIOS) btnFaceID.style.display = 'flex';
            }
        }
    }
    checkBiometrics();

    btnFaceID.addEventListener('click', async () => {
        try {
            // Trigger a biometric challenge
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            
            const options = {
                publicKey: {
                    challenge: challenge,
                    rp: { name: "Venkatesh Portfolio" },
                    user: {
                        id: new Uint8Array([1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6]),
                        name: "admin@portfolio",
                        displayName: "Portfolio Admin"
                    },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required"
                    },
                    timeout: 60000
                }
            };

            // This will trigger the native FaceID/TouchID prompt
            const credential = await navigator.credentials.create(options);
            if (credential) {
                modal.style.display = 'none';
                overlay.style.display = 'none';
                enableEditMode();
            }
        } catch (err) {
            console.error("Biometric failed:", err);
            errorMsg.textContent = "Biometric verification failed.";
            errorMsg.style.display = 'block';
        }
    });


    // Trigger Login Modal (4 Clicks)
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        clickCount++;
        
        if (clickCount >= 4) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
            user.focus();
            clickCount = 0;
            clearTimeout(clickTimer);
        } else {
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000); // Reset if 1 second passes without the next click
        }
    });

    // Close Modal
    btnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
        user.value = '';
        pass.value = '';
        errorMsg.style.display = 'none';
    });

    // Handle Login
    btnLogin.addEventListener('click', () => {
        // Hardcoded credentials as requested
        if (user.value === 'admin' && pass.value === 'admin') {
            modal.style.display = 'none';
            overlay.style.display = 'none';
            enableEditMode();
        } else {
            errorMsg.style.display = 'block';
        }
    });

    // Enter key support for login
    pass.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnLogin.click();
    });

    // Enable Editing
    function enableEditMode() {
        isEditMode = true;
        toolbar.style.display = 'flex';

        // Set the UI Version dropdown to match current layout setting
        const versionSelector = document.getElementById('admin-ui-version');
        if (versionSelector && window.portfolioData && window.portfolioData.settings) {
            versionSelector.value = window.portfolioData.settings.ui_version || 'v0.5';
        }
        
        // Find all editable elements
        const editables = document.querySelectorAll('[data-editable]');
        editables.forEach(el => {
            el.setAttribute('contenteditable', 'true');
        });

        // Make links editable
        const editableLinks = document.querySelectorAll('[data-editable-href]');
        editableLinks.forEach(el => {
            el.addEventListener('click', handleLinkEdit);
        });

        injectAddButtons();
        injectDeleteButtons();
        createUndoToast();
        
        // Show notification
        const notif = document.createElement('div');
        notif.textContent = 'Edit Mode Activated. Click text to edit.';
        notif.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--accent-cyan);color:black;padding:10px 20px;border-radius:20px;z-index:9999;font-weight:bold;';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    // Save Edits
    btnSave.addEventListener('click', async () => {
        // Get current data map
        const data = await getActiveData();
        
        // Clear array- and object-based sections so deleted items don't carry over
        data.experience = [];
        data.projects = [];
        data.training = [];
        data.volunteering = [];
        data.education = [];
        data.certifications = [];
        data.skills = {};
        
        // Extract content from all editables but ignore items marked for deletion
        const getCleanText = (el) => {
            const clone = el.cloneNode(true);
            clone.querySelectorAll('.admin-del-btn, .admin-add-btn').forEach(btn => btn.remove());
            return (clone.innerText || clone.textContent).trim();
        };
        const editables = document.querySelectorAll('[data-editable]:not(.deleted-item):not(.deleted-item [data-editable])');
        editables.forEach(el => {
            const path = el.getAttribute('data-editable').split('.');
            const val = getCleanText(el);
            
            let current = data;
            for (let i = 0; i < path.length - 1; i++) {
                if (current[path[i]] === undefined) {
                    current[path[i]] = isNaN(path[i+1]) ? {} : [];
                }
                current = current[path[i]];
            }
            // For skills categories, it might just be tracking the category name
            current[path[path.length - 1]] = val;
        });

        // Find all editable hrefs, ignoring deleted
        const editableHrefs = document.querySelectorAll('[data-editable-href]:not(.deleted-item):not(.deleted-item [data-editable-href])');
        editableHrefs.forEach(el => {
            const path = el.getAttribute('data-editable-href').split('.');
            const val = el.getAttribute('href');
            
            let current = data;
            for (let i = 0; i < path.length - 1; i++) {
                if (current[path[i]] === undefined) {
                    current[path[i]] = isNaN(path[i+1]) ? {} : [];
                }
                current = current[path[i]];
            }
            current[path[path.length - 1]] = val;
        });

        // 0.5. Inject Global Settings (UI Version) from the dropdown
        const versionSelector = document.getElementById('admin-ui-version');
        if (versionSelector) {
            data.settings = { "ui_version": versionSelector.value };
        } else {
            data.settings = { "ui_version": "v0.5" }; // Safe default
        }

        // Special Sorting Logic for Experience Journey
        if (data.experience && Array.isArray(data.experience)) {
            const monthMap = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
            data.experience.sort((a, b) => {
                const parseDateStr = (dateStr) => {
                    if (!dateStr) return 0;
                    if (dateStr.toLowerCase().includes('present')) return Infinity;
                    const monthYearMatch = dateStr.match(/([A-Za-z]{3})\s*'(\d{2})/);
                    if (monthYearMatch) {
                        const month = monthMap[monthYearMatch[1].toLowerCase()] || 0;
                        const year = parseInt(monthYearMatch[2]) + 2000;
                        return year * 12 + month;
                    }
                    const yearMatch = dateStr.match(/(\d{4})/);
                    if (yearMatch) return parseInt(yearMatch[1]) * 12;
                    return 0;
                };
                return parseDateStr(b.date) - parseDateStr(a.date);
            });
        }

        // Special Sorting Logic for Volunteering & Research
        if (data.volunteering && Array.isArray(data.volunteering)) {
            const monthMap = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
            data.volunteering.sort((a, b) => {
                const parseDateStr = (dateStr) => {
                    if (!dateStr) return 0;
                    if (dateStr.toLowerCase().includes('present')) return Infinity;
                    const monthYearMatch = dateStr.match(/([A-Za-z]{3})\s*'(\d{2})/);
                    if (monthYearMatch) {
                        const month = monthMap[monthYearMatch[1].toLowerCase()] || 0;
                        const year = parseInt(monthYearMatch[2]) + 2000;
                        return year * 12 + month;
                    }
                    const yearMatch = dateStr.match(/(\d{4})/);
                    if (yearMatch) return parseInt(yearMatch[1]) * 12;
                    return 0;
                };
                return parseDateStr(b.date) - parseDateStr(a.date);
            });
        }

        // --- Deep Array Cleanup ---
        // The data extraction leaves the arrays 'sparse' if there's a gap in the indexes (e.g. 0, 1, 3 -> 2 is empty)
        // This function recursively filters arrays to remove empty slots, nulls, and undefineds.
        function cleanArrays(obj) {
            for (let prop in obj) {
                if (obj[prop] && typeof obj[prop] === 'object') {
                    if (Array.isArray(obj[prop])) {
                        // Remove empty slots
                        obj[prop] = obj[prop].filter(item => item !== null && item !== undefined);
                        // Recursively clean objects within the array
                        obj[prop].forEach(item => {
                            if (typeof item === 'object') cleanArrays(item);
                        });
                    } else {
                        cleanArrays(obj[prop]);
                    }
                }
            }
        }
        cleanArrays(data);
        
        // Final sanity check: if skills object is completely emptied out or broken
        if (data.skills && Array.isArray(data.skills)) {
            data.skills = {}; // Recover if it accidentally became an array
        }
        
        // Change button state to saving
        const btnText = btnSave.textContent;
        btnSave.textContent = 'Saving to Database...';
        btnSave.style.background = '#f39c12';
        btnSave.style.color = '#fff';

        try {
            // Push to JSONBin
            const response = await fetch(JSONBIN_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': JSONBIN_ACCESS_KEY
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Network response was not ok');

            btnSave.textContent = 'Saved Globally!';
            btnSave.style.background = '#00f0ff';
            btnSave.style.color = '#000';
            
            // We also update local storage as a fallback cache, but the source of truth is now JSONBin
            localStorage.setItem('portfolioEditorData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to JSONBin:', error);
            btnSave.textContent = 'Error Saving';
            btnSave.style.background = '#e74c3c';
            btnSave.style.color = '#fff';
        }

        setTimeout(() => {
            btnSave.textContent = btnText;
            btnSave.style.background = '';
            btnSave.style.color = '';
        }, 2000);
    });

    // Exit Edit Mode
    btnExit.addEventListener('click', () => {
        isEditMode = false;
        toolbar.style.display = 'none';
        
        const editables = document.querySelectorAll('[data-editable]');
        editables.forEach(el => {
            el.removeAttribute('contenteditable');
        });

        const editableLinks = document.querySelectorAll('[data-editable-href]');
        editableLinks.forEach(el => {
            el.removeEventListener('click', handleLinkEdit);
        });

        const addBtns = document.querySelectorAll('.admin-add-btn');
        addBtns.forEach(btn => btn.remove());
        
        const delBtns = document.querySelectorAll('.admin-del-btn');
        delBtns.forEach(btn => btn.remove());

        const toast = document.getElementById('admin-undo-toast');
        if (toast) toast.remove();
        
        // Clear login fields
        user.value = '';
        pass.value = '';
    });

    // --- Link Editing Logic ---
    let currentLinkBeingEdited = null;
    const linkModal = document.getElementById('link-edit-modal');
    const linkInput = document.getElementById('link-edit-input');
    const btnSaveLink = document.getElementById('btn-save-link');
    const btnCancelLink = document.getElementById('btn-cancel-link');

    function handleLinkEdit(e) {
        if (!isEditMode) return;
        e.preventDefault(); // Stop navigation
        currentLinkBeingEdited = this;
        let val = this.getAttribute('href') || '';
        const editablePath = this.getAttribute('data-editable-href');
        if (editablePath === 'social.email') {
            if (val.toLowerCase().startsWith('mailto:')) {
                val = val.substring(7);
            }
        } else if (editablePath === 'social.phone') {
            if (val.toLowerCase().startsWith('tel:')) {
                val = val.substring(4);
            }
        }
        linkInput.value = val;
        overlay.style.display = 'block';
        overlay.style.zIndex = '9999'; 
        linkModal.style.display = 'block';
        linkInput.focus();
    }

    btnSaveLink.addEventListener('click', () => {
        if (currentLinkBeingEdited && linkInput.value.trim() !== '') {
            let val = linkInput.value.trim();
            const editablePath = currentLinkBeingEdited.getAttribute('data-editable-href');
            if (editablePath === 'social.email') {
                if (!val.toLowerCase().startsWith('mailto:')) {
                    val = 'mailto:' + val;
                }
            } else if (editablePath === 'social.phone') {
                if (!val.toLowerCase().startsWith('tel:')) {
                    val = 'tel:' + val;
                }
            } else {
                // Auto-prepend https:// for general external web/social/project links if protocol is missing
                if (!val.startsWith('#') && 
                    !val.startsWith('/') && 
                    !val.toLowerCase().startsWith('http://') && 
                    !val.toLowerCase().startsWith('https://')) {
                    val = 'https://' + val;
                }
            }
            currentLinkBeingEdited.setAttribute('href', val);
        }
        closeLinkModal();
    });

    btnCancelLink.addEventListener('click', closeLinkModal);

    linkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnSaveLink.click();
    });

    function closeLinkModal() {
        linkModal.style.display = 'none';
        overlay.style.display = 'none';
        currentLinkBeingEdited = null;
    }

    // --- Dynamic Template Generators for Add Item Feature ---

    function injectAddButtons() {
        const sections = [
            { id: 'experience-timeline', key: 'experience', template: getExperienceTemplate },
            { id: 'projects-grid', key: 'projects', template: getProjectTemplate },
            { id: 'training-container', key: 'training', template: getTrainingTemplate },
            { id: 'volunteering-container', key: 'volunteering', template: getVolunteeringTemplate },
            { id: 'education-container', key: 'education', template: getEducationTemplate }
        ];

        sections.forEach(sec => {
            const container = document.getElementById(sec.id);
            if (container) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline admin-add-btn';
                btn.style.marginTop = '20px';
                btn.style.width = '100%';
                btn.style.borderStyle = 'dashed';
                btn.textContent = `+ Add New ${sec.key.charAt(0).toUpperCase() + sec.key.slice(1)} Item`;
                
                btn.addEventListener('click', () => {
                    const nextIdx = getNextIndexForPrefix(container, `${sec.key}.`);
                    const newItemHTML = sec.template(nextIdx);
                    
                    const newNode = instantiateTemplate(newItemHTML);
                    container.insertBefore(newNode, btn);
                    newNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
                
                if (sec.id.includes('grid') || sec.id.includes('timeline')) {
                    btn.style.gridColumn = "1 / -1";
                }
                
                container.appendChild(btn);
            }
        });

        // Complex Add functionality for Skills & Certifications
        const skillsContainer = document.getElementById('skills-grid');
        if (skillsContainer) {
            // "Add Category" button
            const btnAddCategory = document.createElement('button');
            btnAddCategory.className = 'btn btn-outline admin-add-btn';
            btnAddCategory.style.gridColumn = '1 / -1';
            btnAddCategory.style.marginTop = '20px';
            btnAddCategory.style.borderStyle = 'dashed';
            btnAddCategory.textContent = '+ Add New Skill Category';
            
            btnAddCategory.addEventListener('click', () => {
                const categoryName = prompt("Enter new category name:", "New Category");
                if (!categoryName) return;
                
                const html = `
                    <div class="skill-category admin-deletable">
                        <h3 style="font-size: 1.1rem;" data-category-name="${categoryName}">${categoryName}</h3>
                        <div class="skill-tags">
                            <span class="skill-tag admin-deletable" data-editable="skills.${categoryName}.0">New Skill</span>
                        </div>
                    </div>
                `;
                const newNode = instantiateTemplate(html);
                injectAddSkillButtonToCategory(newNode, categoryName);
                attachDeleteBtn(newNode);
                skillsContainer.insertBefore(newNode, btnAddCategory);
            });
            skillsContainer.appendChild(btnAddCategory);

            // "Add Skill" to existing categories
            const existingCategories = skillsContainer.querySelectorAll('.skill-category');
            existingCategories.forEach(cat => {
                // If this is the certifications block, skip it (handle specially)
                if (cat.querySelector('h3') && cat.querySelector('h3').textContent.includes('Certifications')) {
                    injectAddCertButton(cat);
                    return;
                }
                
                // Try to infer category key from existing tags
                let categoryKey = null;
                const firstTag = cat.querySelector('span[data-editable]');
                if (firstTag) {
                    const parts = firstTag.getAttribute('data-editable').split('.');
                    if (parts.length >= 2) categoryKey = parts[1];
                }
                if (categoryKey) {
                    injectAddSkillButtonToCategory(cat, categoryKey);
                }
            });
        }
    }

    function injectAddSkillButtonToCategory(categoryNode, categoryKey) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline admin-add-btn';
        btn.style.fontSize = '0.7rem';
        btn.style.padding = '0.2rem 0.5rem';
        btn.style.marginTop = '0.5rem';
        btn.style.borderStyle = 'dashed';
        btn.textContent = '+ Add Skill';
        
        btn.addEventListener('click', () => {
            const tagsContainer = categoryNode.querySelector('.skill-tags');
            const nextIdx = getNextIndexForPrefix(tagsContainer, `skills.${categoryKey}.`);
            const html = `<span class="skill-tag admin-deletable" data-editable="skills.${categoryKey}.${nextIdx}">New Skill</span>`;
            const newNode = instantiateTemplate(html);
            attachDeleteBtn(newNode);
            tagsContainer.appendChild(newNode);
        });
        categoryNode.appendChild(btn);
    }

    function injectAddCertButton(certCategoryNode) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline admin-add-btn';
        btn.style.fontSize = '0.7rem';
        btn.style.padding = '0.2rem 0.5rem';
        btn.style.marginTop = '0.5rem';
        btn.style.borderStyle = 'dashed';
        btn.textContent = '+ Add Certification';
        
        btn.addEventListener('click', () => {
            const tagsContainer = certCategoryNode.querySelector('.skill-tags');
            const nextIdx = getNextIndexForPrefix(tagsContainer, `certifications.`);
            const html = `<span class="skill-tag admin-deletable" style="border-color: rgba(0,240,255,0.3);" data-editable="certifications.${nextIdx}">New Certification</span>`;
            const newNode = instantiateTemplate(html);
            attachDeleteBtn(newNode);
            tagsContainer.appendChild(newNode);
        });
        certCategoryNode.appendChild(btn);
    }

    function getNextIndexForPrefix(container, prefix) {
        let maxIdx = -1;
        const inputs = container.querySelectorAll(`[data-editable^="${prefix}"]`);
        inputs.forEach(input => {
            const parts = input.getAttribute('data-editable').split('.');
            // The index is the part right after the prefix.
            // prefix is like 'experience.' (so parts corresponds to 'experience', '0', ...)
            // or 'skills.Category.' ('skills', 'Category', '0')
            let idxStr = '';
            if (prefix.startsWith('skills.')) {
                idxStr = parts[2];
            } else if (prefix === 'certifications.') {
                idxStr = parts[1];
            } else {
                idxStr = parts[1];
            }
            if (idxStr && !isNaN(idxStr)) {
                maxIdx = Math.max(maxIdx, parseInt(idxStr));
            }
        });
        return maxIdx + 1;
    }

    function instantiateTemplate(htmlString) {
        const temp = document.createElement('div');
        temp.innerHTML = htmlString.trim();
        const newNode = temp.firstElementChild;
        
        const newEditables = newNode.querySelectorAll('[data-editable]');
        if (newNode.hasAttribute('data-editable')) newEditables.push = newNode; // Edge case for single tags
        if (newNode.hasAttribute('data-editable')) newNode.setAttribute('contenteditable', 'true');

        newEditables.forEach(el => el.setAttribute('contenteditable', 'true'));
        
        const newEditableLinks = newNode.querySelectorAll('[data-editable-href]');
        newEditableLinks.forEach(el => el.addEventListener('click', handleLinkEdit));

        attachDeleteBtn(newNode);
        
        return newNode;
    }

    // --- Delete and Undo Managers ---

    let undoQueue = [];
    let undoToast = null;

    function createUndoToast() {
        undoToast = document.createElement('div');
        undoToast.id = 'admin-undo-toast';
        undoToast.style.cssText = `
            position: fixed;
            bottom: -100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            padding: 15px 25px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 20px;
            z-index: 10000;
            transition: bottom 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
        `;

        undoToast.innerHTML = `
            <span style="color: var(--text-primary);">${undoQueue.length} items removed.</span>
            <button class="btn btn-outline admin-undo-btn" style="padding: 5px 15px; font-size: 0.8rem;">Undo</button>
            <button class="admin-toast-close" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:1.2rem;">&times;</button>
        `;

        document.body.appendChild(undoToast);

        undoToast.querySelector('.admin-undo-btn').addEventListener('click', () => {
            if (undoQueue.length > 0) {
                const itemToRestore = undoQueue.pop();
                itemToRestore.el.classList.remove('deleted-item');
                itemToRestore.el.style.display = itemToRestore.originalDisplay;
                clearTimeout(itemToRestore.timer);
                updateToast();
            }
        });

        undoToast.querySelector('.admin-toast-close').addEventListener('click', () => {
            flushUndoQueue();
        });
    }

    function updateToast() {
        if (!undoToast) return;
        if (undoQueue.length > 0) {
            undoToast.querySelector('span').textContent = `${undoQueue.length} item(s) removed.`;
            undoToast.style.bottom = '30px';
        } else {
            undoToast.style.bottom = '-100px';
        }
    }

    function flushUndoQueue() {
        undoQueue.forEach(item => {
            item.el.remove();
        });
        undoQueue = [];
        updateToast();
    }

    function deleteItem(el) {
        const originalDisplay = el.style.display || '';
        el.classList.add('deleted-item');
        el.style.display = 'none';

        const timer = setTimeout(() => {
            const idx = undoQueue.findIndex(i => i.el === el);
            if (idx !== -1) {
                undoQueue.splice(idx, 1);
                el.remove();
                updateToast();
            }
        }, 10000); // 10 seconds to undo

        undoQueue.push({ el, originalDisplay, timer });
        updateToast();
    }

    function injectDeleteButtons() {
        // Find main blocks to make deletable
        const blocks = document.querySelectorAll('.timeline-item, .project-card, #training-container .glass-panel, #volunteering-container .glass-panel, #education-container .glass-panel, .skill-category, .skill-tag');
        
        blocks.forEach(block => {
            // Add a class indicating it can be deleted
            block.classList.add('admin-deletable');
            attachDeleteBtn(block);
        });
    }

    function attachDeleteBtn(node) {
        if (node.querySelector('.admin-del-btn')) return; // already has one

        const btn = document.createElement('button');
        btn.className = 'admin-del-btn';
        btn.innerHTML = '&times;';
        
        let css = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(255, 0, 0, 0.2);
            color: #ff4757;
            border: 1px solid rgba(255, 0, 0, 0.5);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            z-index: 10;
        `;

        if (node.classList.contains('skill-tag')) {
            css = `
                margin-left: 8px;
                background: none;
                color: #ff4757;
                border: none;
                cursor: pointer;
                font-size: 14px;
                line-height: 1;
            `;
            node.style.display = 'inline-flex';
            node.style.alignItems = 'center';
            btn.style.cssText = css;
            node.appendChild(btn);
        } else {
            node.style.position = 'relative'; // Ensure absolute positioning works
            btn.style.cssText = css;
            node.appendChild(btn);
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(node);
        });
    }

    function getExperienceTemplate(index) {
        const side = index % 2 === 0 ? 'left' : 'right';
        return `
            <div class="timeline-item ${side} admin-deletable">
                <div class="timeline-content glass-panel" style="padding: 1.5rem;">
                    <div class="timeline-date" data-editable="experience.${index}.date">New Date</div>
                    <h3 style="margin-bottom: 5px;" data-editable="experience.${index}.role">New Role</h3>
                    <div style="color: var(--accent-cyan); font-weight: 600;" data-editable="experience.${index}.company">New Company</div>
                    <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.9rem; margin-top: 10px;">
                        <li style="margin-bottom: 5px;" data-editable="experience.${index}.points.0">New Bullet Point (add more via list later or combine)</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function getProjectTemplate(index) {
        return `
            <div class="glass-panel project-card admin-deletable">
                <div class="card-tilt-layer">
                    <div class="project-domain" data-editable="projects.${index}.domain">New Domain</div>
                    <h3 class="project-title" data-editable="projects.${index}.title">New Project Title</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 10px;"><strong style="color: var(--accent-cyan);">Problem:</strong> <span data-editable="projects.${index}.problem">Describe the problem...</span></p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 15px;"><strong style="color: var(--accent-cyan);">Solution:</strong> <span data-editable="projects.${index}.solution">Describe the solution...</span></p>
                    <div class="project-metrics">
                        <div>📉 <span data-editable="projects.${index}.metrics">Key metrics...</span></div>
                    </div>
                </div>
                <div class="project-links">
                    <a href="#" target="_blank" class="project-action-btn btn-arch" data-editable-href="projects.${index}.link">Portfolio Detail</a>
                    <a href="#" target="_blank" class="project-action-btn btn-live" data-editable-href="projects.${index}.demoLink">Live Demo</a>
                </div>
            </div>
        `;
    }

    function getTrainingTemplate(index) {
        return `
            <div class="glass-panel admin-deletable" style="display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 10px; margin-bottom: 10px;">
                    <h3 style="color: var(--text-primary);" data-editable="training.${index}.title">New Analysis Title</h3>
                    <span data-editable="training.${index}.score" style="background: rgba(123, 47, 247, 0.2); padding: 5px 12px; border-radius: 12px; color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.9rem; font-weight: bold; border: 1px solid rgba(123,47,247,0.4);">9.0/10 Score</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 8px;"><strong style="color: var(--accent-cyan);">Core Focus:</strong> <span data-editable="training.${index}.focus">Add core focus areas...</span></p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 10px;" data-editable="training.${index}.summary">Add a summary...</p>
                <a href="#" target="_blank" class="project-action-btn btn-arch" style="align-self: flex-start; margin-top: 1rem;" data-editable-href="training.${index}.link">View on GitHub</a>
            </div>
        `;
    }

    function getVolunteeringTemplate(index) {
        return `
            <div class="glass-panel admin-deletable" style="padding: 1.5rem; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <h3 style="color: var(--text-primary); margin: 0;" data-editable="volunteering.${index}.role">New Role</h3>
                    <div style="color: var(--accent-cyan); font-weight: bold; font-family: var(--font-mono); font-size: 0.9rem; text-align: right;" data-editable="volunteering.${index}.date">Date</div>
                </div>
                <div style="color: var(--accent-cyan); font-weight: 600; font-size: 0.95rem; margin-bottom: 10px;" data-editable="volunteering.${index}.org">Organization</div>
                <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0;">
                    <li style="margin-bottom: 5px;" data-editable="volunteering.${index}.points.0">Point 1</li>
                </ul>
            </div>
        `;
    }

    function getVolunteeringTemplate(index) {
        return `
            <div class="glass-panel admin-deletable" style="padding: 1.5rem; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <h3 style="color: var(--text-primary); margin: 0;" data-editable="volunteering.${index}.role">New Role</h3>
                    <div style="color: var(--accent-cyan); font-weight: bold; font-family: var(--font-mono); font-size: 0.9rem; text-align: right;" data-editable="volunteering.${index}.date">Date</div>
                </div>
                <div style="color: var(--accent-cyan); font-weight: 600; font-size: 0.95rem; margin-bottom: 10px;" data-editable="volunteering.${index}.org">Organization</div>
                <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0;">
                    <li style="margin-bottom: 5px;" data-editable="volunteering.${index}.points.0">Point 1</li>
                </ul>
            </div>
        `;
    }

    function getEducationTemplate(index) {
        return `
            <div class="glass-panel admin-deletable" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem;">
                <div>
                    <h3 style="color: var(--text-primary); margin-bottom: 5px;" data-editable="education.${index}.degree">New Degree</h3>
                    <p style="color: var(--text-secondary); margin: 0;" data-editable="education.${index}.school">School Name</p>
                </div>
                <div style="color: var(--accent-cyan); font-weight: bold; font-family: var(--font-mono); font-size: 0.9rem;" data-editable="education.${index}.year">Year</div>
            </div>
        `;
    }

});

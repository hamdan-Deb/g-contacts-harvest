  (function() {
    // ====================================================================
    // OPTION A: PASTE YOUR PREVIOUS CSV CONTENT BETWEEN THE BACKTICKS BELOW
    // (If you paste your CSV here, the script pre-loads your contacts
    // and automatically fast-forwards down to the last contact in your file.)
    // ====================================================================
    const previousCSV = ``; 

    // ====================================================================
    // OPTION B: MANUAL START EMAIL (Use if Option A is empty)
    // Replace the email below with User's exact email address from
    // which you want to start/move onwards.
    // ====================================================================
    const startAfterEmail = "userEmail@company.com"; 
    // ====================================================================

    // --- CONFIGURATION FOR SLOW CONNECTIONS ---
    const SCROLL_INTERVAL = 8000; // Safe harvest interval (8 seconds)
    const SCROLL_STEP = 200;      // Safe harvest scroll step (200px)
    const NUDGE_STEP = 400;       // Gentle push if stuck

    const contacts = new Map();
    let lastCount = 0;
    let harvestingStarted = false;
    let targetStartEmail = startAfterEmail.toLowerCase().trim();

    // --- PRE-LOAD PREVIOUSLY EXTRACTED CONTACTS ---
    if (previousCSV.trim().length > 0) {
        const lines = previousCSV.split("\n");
        lines.forEach((line) => {
            let cleanLine = line.replace(/^\uFEFF/, '').trim();
            if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
                const content = cleanLine.substring(1, cleanLine.length - 1);
                const parts = content.split('","');
                if (parts.length >= 5) {
                    const name = parts[0].replace(/""/g, '"');
                    const job = parts[1].replace(/""/g, '"');
                    const email = parts[2].toLowerCase().trim();
                    const phone = parts[3];
                    const img = parts[4];
                    if (email && email.includes('@') && email !== "email") {
                        contacts.set(email, { name, job, email, phone, img });
                    }
                }
            }
        });
        console.log(`📥 Pre-loaded ${contacts.size} contacts from previous session.`);
        
        // Automatically set the target start email to the last contact in your CSV
        if (contacts.size > 0) {
            targetStartEmail = Array.from(contacts.keys()).pop();
            console.log(`🎯 Fast-forward target set to last CSV contact: ${targetStartEmail}`);
        }
    }

    // If no CSV and no custom start email, start immediately
    if (!targetStartEmail) {
        harvestingStarted = true;
    }

    console.clear();
    console.log("🚀 Starting Anchor Harvester... Target: 56,848.");

    // --- UI SETUP ---
    const ui = document.createElement("div");
    ui.style.cssText = "position:fixed;top:10px;right:10px;z-index:999999;background:white;padding:20px;border-radius:15px;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-family:sans-serif;width:260px;text-align:center;border:4px solid #1a73e8;";
    
    const countDisplay = document.createElement("div");
    countDisplay.textContent = contacts.size;
    countDisplay.style.cssText = "font-size:48px;font-weight:bold;color:#1a73e8;margin:5px 0;";
    ui.appendChild(countDisplay);

    const label = document.createElement("div");
    label.textContent = "Clean Contacts Extracted";
    label.style.fontSize = "12px";
    ui.appendChild(label);

    const dlBtn = document.createElement("button");
    dlBtn.textContent = "DOWNLOAD CLEAN CSV";
    dlBtn.style.cssText = "width:100%;background:#34a853;color:white;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:bold;margin-top:15px;";
    ui.appendChild(dlBtn);

    const status = document.createElement("div");
    status.textContent = "Status: Initializing...";
    status.style.cssText = "font-size:11px;margin-top:10px;color:#666;";
    ui.appendChild(status);

    document.body.appendChild(ui);

    // --- EXTRACTION LOGIC ---
    const snatch = () => {
        const allElements = document.querySelectorAll('div, span, a');
        
        allElements.forEach(el => {
            const text = el.innerText || "";
            const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

            if (emailMatch && text.length < 100 && !text.includes('function')) {
                const email = emailMatch[0].toLowerCase().trim();

                // Check if we hit the trigger contact to switch from fast-forward to harvest
                if (!harvestingStarted && email === targetStartEmail) {
                    harvestingStarted = true;
                    status.textContent = "🎯 Target found! Slow harvesting mode activated.";
                    console.log(`🎯 Reached target: ${email}. Commencing extraction...`);
                }

                // Only extract if harvesting has started
                if (harvestingStarted && !contacts.has(email)) {
                    const row = el.closest('[role="row"]') || el.parentElement?.parentElement?.parentElement;
                    
                    if (row) {
                        const rowText = row.innerText;
                        const lines = rowText.split('\n').map(l => l.trim()).filter(l => l.length > 1);

                        const name = lines[0] || "Unknown";
                        const phoneMatch = rowText.match(/(\+?\d[\d\s().-]{9,})/);
                        const phone = phoneMatch ? phoneMatch[0] : "";
                        const job = lines.find(l => l !== name && !l.includes('@') && l !== phone) || "";
                        const imgTag = row.querySelector('img');
                        const img = imgTag ? imgTag.src : "";

                        if (name !== "Name" && !name.includes("Skip to")) {
                            contacts.set(email, { name, job, email, phone, img });
                            countDisplay.textContent = contacts.size;
                            status.textContent = "Snatched: " + name;
                        }
                    }
                }
            }
        });
    };

    // --- CSV GENERATION ---
    const download = () => {
        let csv = "\uFEFFName,Job Title/Company,Email,Phone,ImageURL\n";
        contacts.forEach(c => {
            csv += `"${c.name.replace(/"/g,'""')}","${c.job.replace(/"/g,'""')}","${c.email}","${c.phone}","${c.img}"\n`;
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `Clean_Directory_Export_${contacts.size}.csv`;
        a.click();
    };
    dlBtn.onclick = download;

    // --- DYNAMIC AUTO-SCROLL LOOP ---
    const findScrollBox = () => {
        return Array.from(document.querySelectorAll('div')).find(el => 
            el.scrollHeight > el.clientHeight && el.clientHeight > 400
        ) || window;
    };
    
    let scrollBox = findScrollBox();
    lastCount = contacts.size;
    let lastScrollTop = -1;

    const scrollLoop = () => {
        snatch();

        let intervalTime = SCROLL_INTERVAL;
        let step = SCROLL_STEP;

        if (!harvestingStarted) {
            // FAST-FORWARD MODE: Scroll rapidly (every 1.2 seconds, 800px) to reach Brandon quickly
            intervalTime = 1200; 
            step = 800;
            status.textContent = `Skipping to target: ${targetStartEmail}...`;
        }

        // Perform Scroll
        if (scrollBox === window) window.scrollBy(0, step);
        else scrollBox.scrollTop += step;

        // Track position to detect network lag/stuck scrolling
        const currentScroll = (scrollBox === window) ? window.scrollY : scrollBox.scrollTop;
        
        if (currentScroll === lastScrollTop) {
            // If stuck, apply a larger scroll offset to trigger list rendering
            status.textContent = "Waiting for list to load...";
            const nudge = harvestingStarted ? NUDGE_STEP : 1500;
            if (scrollBox === window) window.scrollBy(0, nudge);
            else scrollBox.scrollTop += nudge;
            scrollBox = findScrollBox();
        } else {
            lastScrollTop = currentScroll;
            lastCount = contacts.size;
        }

        setTimeout(scrollLoop, intervalTime);
    };

    // Start the loop
    setTimeout(scrollLoop, 1000);

})();

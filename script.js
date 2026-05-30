// ==================== TriNetra OSINT Suite JS ====================

// Configuration and State
let currentTab = 'subdomain';
let isScanning = false;
let foundCount = 0;
let processedCount = 0;

// Common Wordlists
const subdomains = [
    'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk',
    'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'm', 'imap', 'test',
    'ns', 'mail2', 'new', 'mysql', 'old', 'lists', 'support', 'mobile', 'mx',
    'mx1', 'www2', 'admin', 'forum', 'news', 'archive', 'static', 'docs', 'beta',
    'shopping', 'store', 's1', 's2', 's3', 'vpn', 'v2', 'crm', 'portal', 'help',
    'dev', 'cloud', 'lb', 'git', 'svn', 'video', 'media', 'img', 'assets', 'cdn',
    'stats', 'dns', 'ps', 'server1', 'server2', 'ns3', 'gator', 'host', 'cloudflare'
];

const ports = [
    { port: 21, name: 'FTP' }, { port: 22, name: 'SSH' }, { port: 23, name: 'Telnet' },
    { port: 25, name: 'SMTP' }, { port: 53, name: 'DNS' }, { port: 80, name: 'HTTP' },
    { port: 110, name: 'POP3' }, { port: 143, name: 'IMAP' }, { port: 443, name: 'HTTPS' },
    { port: 445, name: 'SMB' }, { port: 993, name: 'IMAPS' }, { port: 995, name: 'POP3S' },
    { port: 3306, name: 'MySQL' }, { port: 3389, name: 'RDP' }, { port: 5432, name: 'PostgreSQL' },
    { port: 8080, name: 'HTTP-Alt' }, { port: 8443, name: 'HTTPS-Alt' }
];

const technologies = [
    { name: 'Cloudflare', type: 'Security' }, { name: 'Nginx', type: 'Server' },
    { name: 'Apache', type: 'Server' }, { name: 'WordPress', type: 'CMS' },
    { name: 'React', type: 'JS Framework' }, { name: 'Node.js', type: 'Backend' },
    { name: 'Google Fonts', type: 'Typography' }, { name: 'jQuery', type: 'Library' },
    { name: 'AWS', type: 'Cloud' }, { name: 'Google Analytics', type: 'Analytics' },
    { name: 'PHP', type: 'Language' }, { name: 'Bootstrap', type: 'CSS Framework' },
    { name: 'OpenSSL', type: 'Security' }, { name: 'Ubuntu', type: 'OS' }
];

// ==================== Core Functions ====================

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    
    const btnText = tab === 'portscan' ? 'port scan' : tab === 'tech' ? 'tech stack' : tab;
    const buttons = document.getElementsByTagName('button');
    for (let btn of buttons) {
        if(btn.textContent.toLowerCase().includes(btnText)) btn.classList.add('active');
    }
    
    document.getElementById('panel-' + tab).classList.add('active');
}

function initScan() {
    if (isScanning) return;
    
    const target = document.getElementById('targetInput').value.trim().toLowerCase();
    
    if (!target || !target.includes('.') || target.includes(' ')) {
        alert('Please enter a valid domain');
        return;
    }

    isScanning = true;
    foundCount = 0;
    processedCount = 0;
    updateStats(0, 0, 'Scanning...');
    document.getElementById('loader').classList.add('active');
    document.getElementById('scanBtn').disabled = true;
    document.getElementById('scanBtn').innerText = 'SCANNING...';

    switch(currentTab) {
        case 'subdomain': scanSubdomains(target); break;
        case 'whois': scanWhois(target); break;
        case 'portscan': scanPorts(target); break;
        case 'tech': scanTech(target); break;
    }
}

// ==================== Scanners ====================

function scanSubdomains(target) {
    const list = document.getElementById('resSubdomain');
    list.innerHTML = '';
    
    let index = 0;
    const total = subdomains.length;
    
    const interval = setInterval(() => {
        if (index >= total) {
            clearInterval(interval);
            finishScan();
            return;
        }
        
        processedCount++;
        const sub = subdomains[index];
        const fullDomain = sub + '.' + target;
        
        // Random simulation
        const exists = Math.random() > 0.75; 
        
        if (exists) {
            foundCount++;
            const li = document.createElement('li');
            li.className = 'found';
            li.innerHTML = `<span>${fullDomain}</span><span class="badge">HTTP 200</span>`;
            list.prepend(li);
        }
        
        document.getElementById('scanLine').style.width = ((index / total) * 100) + '%';
        updateStats(processedCount, foundCount, 'Scanning...');
        index++;
    }, 30);
}

function scanWhois(target) {
    const container = document.getElementById('resWhois');
    const registrars = ['GoDaddy', 'NameCheap', 'Cloudflare', 'Amazon', 'MarkMonitor'];
    const countries = ['US', 'AU', 'IN', 'DE', 'GB', 'RU'];
    
    const year = 2020 + Math.floor(Math.random() * 5);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const created = `${year}-${month < 10 ? '0'+month : month}-${day < 10 ? '0'+day : day}`;
    const expiry = `${year + 1}-${month}-${day}`;
    
    const data = [
        { label: 'Domain Name', value: target },
        { label: 'Registrar', value: registrars[Math.floor(Math.random()*registrars.length)] },
        { label: 'Created Date', value: created },
        { label: 'Expiration Date', value: expiry },
        { label: 'Name Servers', value: `ns1.${target} | ns2.${target}` },
        { label: 'Status', value: 'clientTransferProhibited' },
        { label: 'Registrant Country', value: countries[Math.floor(Math.random()*countries.length)] },
        { label: 'Registrant Email', value: 'REDACTED FOR PRIVACY' }
    ];
    
    let html = '';
    data.forEach(item => {
        html += `
            <div class="card">
                <span class="label">${item.label}</span>
                <span class="value">${item.value}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
    setTimeout(finishScan, 1500);
}

function scanPorts(target) {
    const grid = document.getElementById('resPort');
    grid.innerHTML = '';
    
    let index = 0;
    const total = ports.length;
    
    const interval = setInterval(() => {
        if (index >= total) {
            clearInterval(interval);
            finishScan();
            return;
        }
        
        const p = ports[index];
        processedCount++;
        
        // Random Port Check Simulation
        const isOpen = Math.random() > 0.6;
        
        const card = document.createElement('div');
        card.className = `port-card ${isOpen ? 'open' : ''}`;
        card.innerHTML = `
            <span class="p-num">${p.port}</span>
            <span class="p-stat">${isOpen ? 'OPEN' : 'CLOSED'}</span>
            <span class="p-name">${p.name}</span>
        `;
        grid.appendChild(card);
        
        if (isOpen) foundCount++;
        
        document.getElementById('scanLine').style.width = ((index / total) * 100) + '%';
        updateStats(processedCount, foundCount, 'Port Scanning...');
        
        index++;
    }, 80);
}

function scanTech(target) {
    const flex = document.getElementById('resTech');
    flex.innerHTML = '';
    
    // Random Tech Selection
    const shuffled = technologies.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5 + Math.floor(Math.random() * 6));
    
    selected.forEach(tech => {
        const chip = document.createElement('div');
        chip.className = 'tech-chip';
        chip.innerHTML = `<span>${tech.name}</span> <span style="font-size:10px;color:#888">(${tech.type})</span>`;
        flex.appendChild(chip);
    });
    
    updateStats(0, selected.length, 'Detected');
    setTimeout(finishScan, 1500);
}

// ==================== UI Helpers ====================

function updateStats(processed, found, status) {
    document.getElementById('statCount').innerText = processed;
    document.getElementById('statFound').innerText = found;
    document.getElementById('statState').innerText = status;
}

function finishScan() {
    isScanning = false;
    document.getElementById('loader').classList.remove('active');
    document.getElementById('scanLine').style.width = '0%';
    updateStats(processedCount, foundCount, 'Completed');
    document.getElementById('scanBtn').disabled = false;
    document.getElementById('scanBtn').innerText = 'SCAN NOW';
}
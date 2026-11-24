import { ImpactGraph } from './graph.js';
const SCENARIOS = {
    chat: { title: 'Repeated targeting + group power', copy: 'Several students repeatedly use a chat to target one person. A pattern and social power imbalance suggest bullying. A trusted adult can help assess the situation and respond safely.' },
    argument: { title: 'Conflict is not automatically bullying', copy: 'Two friends having one disagreement does not necessarily indicate a repeated misuse of power. A disagreement can still be upsetting or harmful, and support may be useful.' },
    exclusion: { title: 'Repeated exclusion can be social bullying', copy: 'If a group deliberately and repeatedly excludes one person while using social influence against them, that may involve social bullying. The wider context and power balance still matter.' }
};
const NETWORK = {
    forward: { label: 'CHOICE 01 / AMPLIFICATION', title: 'Sharing adds another route.', copy: 'Passing along hurtful content can expose more people to it. You can choose not to become another link in that chain.' },
    pause: { label: 'CHOICE 02 / NOT REPOSTING', title: 'No new share from you.', copy: 'Choosing not to repost avoids adding another sharing route. It does not automatically remove messages other people have already seen.' },
    checkin: { label: 'CHOICE 03 / PRIVATE SUPPORT', title: 'A connection rather than a spotlight.', copy: 'Checking in privately can offer companionship and help someone feel heard without drawing more attention to the harmful content.' },
    adult: { label: 'CHOICE 04 / SEEKING HELP', title: 'Support can extend beyond the chat.', copy: 'A trusted adult, teacher or school counsellor can help assess what happened and what practical steps are appropriate. You do not have to confront anyone directly.' }
};
const SUPPORT = {
    evidence: { label: '01 / PRESERVE', title: 'Keep the information that helps explain what happened.', copy: 'Where safe, save relevant screenshots, links, usernames and dates. Avoid redistributing harmful content to others. A trusted adult can help decide what evidence is useful.', link: 'eSafety evidence guide ↗', href: 'https://www.esafety.gov.au/report/how-to-collect-evidence' },
    report: { label: '02 / REPORT', title: 'Start with the platform where it happened.', copy: 'Use the in-app reporting tools on the website, game or service. If serious cyberbullying targeting someone under 18 remains online after a platform report, check whether eSafety can investigate.', link: 'eSafety reporting guidance ↗', href: 'https://www.esafety.gov.au/key-topics/cyberbullying/report-cyberbullying' },
    protect: { label: '03 / PROTECT', title: 'Set boundaries without escalating.', copy: 'After preserving relevant evidence, use mute, block and privacy settings when appropriate. Ask for help before responding if you feel unsafe or uncertain.', link: 'eSafety young people guidance ↗', href: 'https://www.esafety.gov.au/young-people/cyberbullying' },
    connect: { label: '04 / CONNECT', title: 'Tell somebody who can help.', copy: 'A parent, trusted adult, teacher, school counsellor or youth support service can help you work out next steps. You can seek help at any stage and do not need perfect evidence before speaking up.', link: 'Kids Helpline support ↗', href: 'https://www.kidshelpline.com.au/teens/issues/cyberbullying' }
};
const PLEDGES = { pause: 'I will pause before sharing.', support: 'I will check in privately.', help: 'I will help someone find support.' };
const DATA = [{ label: '10–12', ever: 46, year: 34 }, { label: '13–15', ever: 57, year: 42 }, { label: '16–17', ever: 59, year: 39 }];
const NARRATIONS = {
    hold: 'One message. A network of consequences. Before a message spreads, we have a choice. Explore how online bullying works, why sharing matters, and where support can begin.',
    recognise: 'Bullying involves an ongoing, deliberate misuse of power through repeated harmful behaviour. Online posts may be repeatedly shared. Context matters: disagreement is not automatically bullying, and serious one-off harm still deserves support. The Australian eSafety Commissioner surveyed 3,454 children aged ten to seventeen between December 2024 and February 2025. Fifty-three percent reported ever experiencing cyberbullying, while thirty-eight percent reported it within the last year.',
    intervene: 'Bystanders have choices. Reposting harmful content can add to its reach. Choosing not to share, checking privately on someone, or asking a trusted adult for help are constructive options. The interactive network is an illustrative model, not a prediction or a measure of real human behaviour.',
    support: 'If cyberbullying happens, consider preserving evidence, reporting the content through the platform, limiting further contact and seeking help from a trusted person. Serious cyberbullying content may be reportable to the Australian eSafety Commissioner after platform reporting. You can seek support at any point, and a trusted adult can help.',
    next: 'The next message is another choice. You cannot control every online interaction, but you can choose not to amplify harm, check in privately and help someone find support. Your reflection here is local to your browser and is not posted publicly.'
};
const q = (selector) => {
    const el = document.querySelector(selector);
    if (!el)
        throw new Error(`Required element not found: ${selector}`);
    return el;
};
const setText = (selector, text) => { q(selector).textContent = text; };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeChapter = 'hold';
let graph = null;
let soundEnabled = false;
let audioContext = null;
let narrationActive = false;
let speechSession = 0;
let storedNotes = [];
let storageAvailable = true;
const STORAGE_KEY = 'pause-project-v2-reflections';
function initializeNavigation() {
    const nav = q('#mobile-nav');
    const toggle = q('#menu-toggle');
    const close = () => { nav.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open chapter menu'); };
    toggle.addEventListener('click', () => {
        nav.hidden = !nav.hidden;
        toggle.setAttribute('aria-expanded', String(!nav.hidden));
        toggle.setAttribute('aria-label', nav.hidden ? 'Open chapter menu' : 'Close chapter menu');
    });
    nav.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !nav.hidden) {
        close();
        toggle.focus();
    } });
    document.addEventListener('click', (e) => { if (!nav.hidden && !nav.contains(e.target) && !toggle.contains(e.target))
        close(); });
    const sections = [...document.querySelectorAll('[data-chapter]')];
    const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
            const next = visible[0].target.getAttribute('data-chapter');
            activeChapter = next;
            updateTranscript();
            document.querySelectorAll('.desktop-nav a').forEach(a => a.classList.toggle('is-active', a.hash === '#' + next));
        }
    }, { rootMargin: '-13% 0px -55% 0px', threshold: [0, .08, .3, .6] });
    sections.forEach(s => observer.observe(s));
    let scheduled = false;
    window.addEventListener('scroll', () => {
        if (scheduled)
            return;
        scheduled = true;
        requestAnimationFrame(() => {
            const height = Math.max(1, document.documentElement.scrollHeight - innerHeight);
            q('#progress-fill').style.width = `${Math.min(100, 100 * scrollY / height)}%`;
            scheduled = false;
        });
    }, { passive: true });
    const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            reveal.unobserve(entry.target);
        } });
    }, { threshold: .08 });
    document.querySelectorAll('.intro-grid,.evidence-heading,.end-hero').forEach(el => reveal.observe(el));
    const diagram = q('#support-diagram');
    if (reduceMotion) {
        diagram.classList.add('is-visible');
    }
    else {
        const diagramObserver = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                diagram.classList.add('is-visible');
                diagramObserver.disconnect();
            }
        }, { threshold: .3 });
        diagramObserver.observe(diagram);
    }
}
function initializeScenario() {
    const result = q('#scenario-result');
    document.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.scenario;
        document.querySelectorAll('[data-scenario]').forEach(b => { const active = b === button; b.classList.toggle('is-selected', active); b.setAttribute('aria-pressed', String(active)); });
        result.querySelector('h4').textContent = SCENARIOS[id].title;
        result.querySelector('p').textContent = SCENARIOS[id].copy;
        soundCue();
    }));
}
function svgTag(name, attrs) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attrs))
        element.setAttribute(key, value);
    return element;
}
function renderChart(period) {
    const host = q('#chart-visual');
    const svg = svgTag('svg', { viewBox: '0 0 820 300', 'aria-hidden': 'true', focusable: 'false' });
    const left = 75, right = 790, bottom = 252, plotHeight = 215;
    for (let tick = 0; tick <= 60; tick += 20) {
        const y = bottom - tick / 60 * plotHeight;
        svg.appendChild(svgTag('line', { x1: String(left), x2: String(right), y1: String(y), y2: String(y), stroke: '#ffffff28', 'stroke-width': '1' }));
        const label = svgTag('text', { x: '42', y: String(y + 4), 'text-anchor': 'end', fill: '#9aadb6', 'font-family': 'monospace', 'font-size': '12' });
        label.textContent = tick + '%';
        svg.appendChild(label);
    }
    DATA.forEach((entry, i) => {
        const value = entry[period], x = 135 + i * 234, top = bottom - value / 60 * plotHeight;
        svg.appendChild(svgTag('rect', { x: String(x), y: String(top), width: '103', height: String(bottom - top), rx: '3', fill: period === 'ever' ? '#ffaa75' : '#cde5da' }));
        const valueLabel = svgTag('text', { x: String(x + 51.5), y: String(top - 14), 'text-anchor': 'middle', fill: '#f2f0e9', 'font-family': 'monospace', 'font-size': '19', 'font-weight': 'bold' });
        valueLabel.textContent = value + '%';
        svg.appendChild(valueLabel);
        const age = svgTag('text', { x: String(x + 51.5), y: '279', 'text-anchor': 'middle', fill: '#b3c0c8', 'font-family': 'monospace', 'font-size': '13' });
        age.textContent = entry.label + ' years';
        svg.appendChild(age);
    });
    host.replaceChildren(svg);
    const label = period === 'ever' ? 'Lifetime experience' : 'Past-year experience';
    const text = label + ': ' + DATA.map(d => `${d[period]}% of ${d.label}-year-olds`).join(', ') + '.';
    setText('#chart-summary', text);
    host.setAttribute('aria-label', 'Bar chart. ' + text + ' Source: eSafety Commissioner, survey conducted December 2024 to February 2025.');
}
function initializeChart() {
    renderChart('ever');
    document.querySelectorAll('[data-period]').forEach(btn => btn.addEventListener('click', () => {
        const period = btn.dataset.period;
        document.querySelectorAll('[data-period]').forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
        renderChart(period);
        soundCue();
    }));
}
function renderNetworkFallback(action) {
    const svg = q('#network-fallback');
    const xy = [[100, 210], [275, 100], [275, 302], [448, 61], [458, 177], [480, 322], [618, 96], [628, 220], [626, 354], [730, 138], [735, 299], [460, 385], [690, 394]];
    const base = [[0, 1], [0, 2]];
    const variants = {
        forward: { active: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], edges: [[0, 1, false], [0, 2, false], [1, 3, false], [1, 4, false], [2, 5, false], [3, 6, false], [4, 7, false], [5, 8, false], [6, 9, false], [8, 10, false]] },
        pause: { active: [0, 1, 2], edges: base.map(([x, y]) => [x, y, false]) },
        checkin: { active: [0, 1, 2, 11], edges: [[0, 1, false], [0, 2, false], [2, 11, true]] },
        adult: { active: [0, 1, 2, 11, 12], edges: [[0, 1, false], [0, 2, false], [2, 11, true], [11, 12, true]] }
    };
    const plan = variants[action];
    svg.replaceChildren();
    for (const [from, to, support] of plan.edges) {
        const a = xy[from], b = xy[to];
        svg.appendChild(svgTag('line', { x1: String(a[0]), y1: String(a[1]), x2: String(b[0]), y2: String(b[1]), stroke: support ? '#cde5da' : '#ffaa75', 'stroke-width': support ? '4' : '2.5', 'stroke-opacity': support ? '1' : '.75' }));
    }
    for (const id of plan.active) {
        const p = xy[id];
        svg.appendChild(svgTag('circle', { cx: String(p[0]), cy: String(p[1]), r: id === 0 ? '25' : id >= 11 ? '18' : '12', fill: id >= 11 ? '#cde5da' : '#ffaa75' }));
    }
}
function initializeNetwork() {
    const canvas = q('#network-canvas');
    graph = new ImpactGraph(canvas);
    renderNetworkFallback('forward');
    const explanation = q('#network-explanation');
    const select = (action) => {
        graph?.setAction(action);
        renderNetworkFallback(action);
        document.querySelectorAll('[data-network]').forEach(btn => { const active = btn.dataset.network === action; btn.classList.toggle('is-selected', active); btn.setAttribute('aria-pressed', String(active)); });
        explanation.querySelector('span').textContent = NETWORK[action].label;
        explanation.querySelector('h4').textContent = NETWORK[action].title;
        explanation.querySelector('p').textContent = NETWORK[action].copy;
        q('#network-status').textContent = action === 'forward' ? 'ILLUSTRATIVE SHARING' : 'ILLUSTRATIVE ' + (action === 'pause' ? 'NON-AMPLIFICATION' : 'SUPPORT');
        const fallback = q('#network-fallback');
        fallback.setAttribute('aria-label', `Illustrative ${action} network. ${NETWORK[action].title} ${NETWORK[action].copy}`);
        soundCue();
    };
    document.querySelectorAll('[data-network]').forEach(btn => btn.addEventListener('click', () => select(btn.dataset.network)));
    q('#network-replay').addEventListener('click', () => { graph?.replay(); soundCue(); });
    window.addEventListener('pagehide', () => graph?.destroy(), { once: true });
}
function initializeSupport() {
    document.querySelectorAll('[data-support]').forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.support;
        const info = SUPPORT[id];
        document.querySelectorAll('[data-support]').forEach(b => { b.classList.toggle('is-selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
        const result = q('#support-result');
        result.querySelector('.result-overline').textContent = info.label;
        result.querySelector('h4').textContent = info.title;
        result.querySelector('p').textContent = info.copy;
        const anchor = q('#support-result-link');
        anchor.textContent = info.link;
        anchor.href = info.href;
        soundCue();
    }));
}
function safeStorageRead() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
            storedNotes = parsed.filter((n) => {
                if (typeof n !== 'object' || n === null)
                    return false;
                const value = n;
                return typeof value.id === 'string' && typeof value.text === 'string' && value.text.length <= 280 && typeof value.created === 'number' && ['pause', 'support', 'help'].includes(value.pledge || '');
            }).slice(-8);
    }
    catch {
        storageAvailable = false;
        storedNotes = [];
    }
}
function safeStorageWrite() {
    if (!storageAvailable)
        return false;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedNotes));
        return true;
    }
    catch {
        storageAvailable = false;
        return false;
    }
}
function renderNotes() {
    const host = q('#reflection-notes');
    host.replaceChildren();
    storedNotes.slice().reverse().forEach(note => {
        const article = document.createElement('article');
        article.className = 'reflection-note';
        const p = document.createElement('p');
        p.textContent = note.text;
        const meta = document.createElement('div');
        const pledge = document.createElement('span');
        pledge.textContent = PLEDGES[note.pledge];
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Delete';
        remove.setAttribute('aria-label', 'Delete note: ' + note.text.slice(0, 45));
        remove.addEventListener('click', () => { storedNotes = storedNotes.filter(n => n.id !== note.id); safeStorageWrite(); renderNotes(); setText('#reflection-feedback', 'Note deleted from this browser.'); });
        meta.append(pledge, remove);
        article.append(p, meta);
        host.appendChild(article);
    });
}
function containsContactDetails(text) {
    return /(?:https?:\/\/|www\.|@\w+\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\s().-]*){9,})/i.test(text);
}
function initializeReflections() {
    safeStorageRead();
    renderNotes();
    let pledge = 'pause';
    document.querySelectorAll('[data-pledge]').forEach(btn => btn.addEventListener('click', () => {
        pledge = btn.dataset.pledge;
        document.querySelectorAll('[data-pledge]').forEach(b => { b.classList.toggle('is-selected', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
        soundCue();
    }));
    const textarea = q('#reflection-text');
    textarea.addEventListener('input', () => setText('#reflection-count', `${textarea.value.length} / 280`));
    q('#reflection-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const value = textarea.value.trim().replace(/\s+/g, ' ');
        if (value.length < 8) {
            setText('#reflection-feedback', 'Write a little more about a constructive action you can take.');
            return;
        }
        if (value.length > 280) {
            setText('#reflection-feedback', 'Please keep your note under 280 characters.');
            return;
        }
        if (containsContactDetails(value)) {
            setText('#reflection-feedback', 'Please leave out links and contact details. Do not include identifying information.');
            return;
        }
        if (storedNotes.length >= 8) {
            setText('#reflection-feedback', 'This browser holds up to eight notes. Delete an old note before adding another.');
            return;
        }
        const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + '-' + String(storedNotes.length);
        storedNotes.push({ id, text: value, pledge, created: Date.now() });
        const saved = safeStorageWrite();
        renderNotes();
        textarea.value = '';
        setText('#reflection-count', '0 / 280');
        setText('#reflection-feedback', saved ? 'Saved locally in this browser. Not published online.' : 'Saved for this visit only. Browser storage is unavailable.');
        soundCue();
    });
    q('#clear-reflections').addEventListener('click', () => {
        storedNotes = [];
        safeStorageWrite();
        renderNotes();
        setText('#reflection-feedback', 'Your notes have been cleared from this browser.');
    });
}
function initializeImages() {
    document.querySelectorAll('img.remote-photo').forEach(img => {
        const fallback = () => {
            const fallbackSrc = img.dataset.fallback;
            if (!fallbackSrc || img.dataset.fallbackActive === 'true')
                return;
            img.dataset.fallbackActive = 'true';
            img.src = fallbackSrc;
            img.closest('.photo-frame')?.classList.add('is-fallback');
        };
        img.addEventListener('error', fallback, { once: true });
        if (img.complete && img.naturalWidth === 0)
            fallback();
    });
}
function soundCue() {
    if (!soundEnabled)
        return;
    try {
        audioContext ??= new AudioContext();
        if (audioContext.state === 'suspended')
            void audioContext.resume();
        const osc = audioContext.createOscillator(), gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(430, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + .13);
        gain.gain.setValueAtTime(.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(.055, audioContext.currentTime + .018);
        gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .19);
        osc.connect(gain).connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + .2);
    }
    catch {
        soundEnabled = false;
        q('#toggle-sfx').textContent = 'SOUND UNAVAILABLE';
    }
}
function updateTranscript() { setText('#transcript-text', NARRATIONS[activeChapter]); }
function stopSpeech() {
    speechSession++;
    if ('speechSynthesis' in window)
        window.speechSynthesis.cancel();
    narrationActive = false;
    q('#stop-narration').hidden = true;
    q('#narrate-current').hidden = false;
}
function playNarration(chapter) {
    if (!('speechSynthesis' in window)) {
        setText('#transcript-text', 'Speech playback is not supported in this browser. ' + NARRATIONS[chapter]);
        q('#transcript-panel').hidden = false;
        return;
    }
    stopSpeech();
    const session = ++speechSession;
    const utterance = new SpeechSynthesisUtterance(NARRATIONS[chapter]);
    utterance.lang = 'en-AU';
    utterance.rate = .94;
    utterance.pitch = 1;
    utterance.onend = () => { if (speechSession === session)
        stopSpeech(); };
    utterance.onerror = () => { if (speechSession === session)
        stopSpeech(); };
    narrationActive = true;
    q('#stop-narration').hidden = false;
    q('#narrate-current').hidden = true;
    window.speechSynthesis.speak(utterance);
}
function initializeNarration() {
    updateTranscript();
    q('#hero-narrate').addEventListener('click', () => playNarration('hold'));
    q('#narrate-current').addEventListener('click', () => playNarration(activeChapter));
    q('#stop-narration').addEventListener('click', stopSpeech);
    const panel = q('#transcript-panel'), toggle = q('#toggle-transcript');
    toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); updateTranscript(); });
    q('#close-transcript').addEventListener('click', () => { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    } });
    const sound = q('#toggle-sfx');
    sound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        sound.setAttribute('aria-pressed', String(soundEnabled));
        sound.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
        if (soundEnabled)
            soundCue();
    });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => { if (narrationActive)
        stopSpeech(); }));
    document.addEventListener('visibilitychange', () => { if (document.hidden && narrationActive)
        stopSpeech(); });
}
function main() {
    initializeImages();
    initializeNavigation();
    initializeScenario();
    initializeChart();
    initializeNetwork();
    initializeSupport();
    initializeReflections();
    initializeNarration();
}
main();

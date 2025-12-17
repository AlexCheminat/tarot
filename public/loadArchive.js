const SUPABASE_URL = "https://lanbxsawcjelsngtawxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbmJ4c2F3Y2plbHNuZ3Rhd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIzMjYsImV4cCI6MjA2MzM4ODMyNn0.OePJTwjh3sn42LDiHKGpXlLkIFvipHC507KaqOIEy3k";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ALLOWED_FINGERPRINT = "1d68d64bae517b9ea2b7821dbde959baabb865741c57bee252e59acda0bb8c2f";

async function getDeviceFingerprint() {
    const data = [
        navigator.userAgent,
        navigator.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
        navigator.platform
    ].join('|');

    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loadArchive() {
    const { data, error } = await supabase
        .from('score_archive')
        .select('*')
        .order('time_created', { ascending: true });

    if (error) {
        console.error("Error loading archive:", error);
        return;
    }

    const container = document.getElementById("scoreArchive");
    container.innerHTML = '';

    // Get fingerprint once before the loop
    const currentFingerprint = await getDeviceFingerprint();
    const isAuthorized = currentFingerprint === ALLOWED_FINGERPRINT;

    data.forEach(entry => {
        const button = document.createElement('button');
        button.className = 'score-entry';
        button.dataset.id = entry.id;

        let contrat = '';
        switch (entry.contrat) {
            case 1: contrat = 'Prise'; break;
            case 2: contrat = 'Garde'; break;
            case 3: contrat = 'Garde Sans'; break;
            case 4: contrat = 'Garde Contre'; break;
            default: break;
        }

        if (entry.equipier_nom === null) {
            button.innerHTML = `
                Preneur (${entry.preneur_nom}): ${entry.preneur_score}<br>
                Defense (${entry.defense_nom}): ${entry.defense_score}<br>
                Points: ${entry.points}, Contrat: ${contrat}, Bout: ${entry.bout}
            `;
        } else {
            button.innerHTML = `
                Preneur (${entry.preneur_nom}): ${entry.preneur_score}<br>
                Equipier (${entry.equipier_nom}): ${entry.equipier_score}<br>
                Defense (${entry.defense_nom}): ${entry.defense_score}<br>
                Points: ${entry.points}, Contrat: ${contrat}, Bout: ${entry.bout}
            `;
        }

        // Only add click handler if authorized
        if (isAuthorized) {
            button.addEventListener('click', () => {
                localStorage.setItem('selectedScore', JSON.stringify(entry));
                window.location.href = "addScore.html";
            });
        }

        container.appendChild(button);
    });
}

window.addEventListener('DOMContentLoaded', loadArchive);
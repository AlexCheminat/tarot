const SUPABASE_URL = "https://lanbxsawcjelsngtawxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbmJ4c2F3Y2plbHNuZ3Rhd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIzMjYsImV4cCI6MjA2MzM4ODMyNn0.OePJTwjh3sn42LDiHKGpXlLkIFvipHC507KaqOIEy3k";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadArchive() {
const { data, error } = await supabase
    .from('score_archive')
    .select('*')
    .order('time_created', { ascending: false });

if (error) {
    console.error("Error loading archive:", error);
    return;
}

const container = document.getElementById("scoreArchive");
container.innerHTML = '';

data.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'score-entry';
    div.textContent = `Preneur (${entry.preneur_nom}): ${entry.preneur_score}, Equipier (${entry.equipier_nom}): ${entry.equipier_score}, Defense (${entry.defense_nom}): ${entry.defense_score}\nPoints: ${entry.points}, Contrat: ${entry.contrat}, Bout: ${entry.bout}`;
    container.appendChild(div);
});
}

window.addEventListener('DOMContentLoaded', loadArchive);

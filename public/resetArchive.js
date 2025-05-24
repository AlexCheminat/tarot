const resetButton = document.getElementById('resetArchiveBtn');

resetButton.addEventListener('click', async () => {
  const confirmed = confirm("Voulez-vous vraiment réinitialiser l'archive ? Cela supprimera tous les scores enregistrés.");
  if (!confirmed) return;

  const confirmed2 = confirm("Vous êtes vraiment sure ?");
  if (!confirmed2) return;

  const confirmed3 = confirm("Dernière chance !");
  if (!confirmed3) return;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/score_archive?id=not.is.null`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'  // Optional: returns deleted rows
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to reset archive: ${res.status}`);
    }

    if (typeof loadArchive === 'function') {
      loadArchive();
    }

  } catch (error) {
    console.error('Error resetting archive:', error);
    alert("Failed to reset archive.");
  }
});

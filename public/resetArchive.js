const resetButton = document.getElementById('resetArchiveBtn');

resetButton.addEventListener('click', async () => {
  const confirmed = confirm("Are you sure you want to reset the archive? This will delete all saved scores.");
  if (!confirmed) return;

  const confirmed2 = confirm("Vous etes vraiment sure?");
  if (!confirmed2) return;

  const confirmed3 = confirm("Derniere chance!");
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

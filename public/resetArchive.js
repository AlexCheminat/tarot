const resetButton = document.getElementById('resetArchiveBtn');

resetButton.addEventListener('click', async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/score_archive?created_at=not.is.null`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'  // Optional, shows deleted rows
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to reset archive: ${res.status}`);
    }

    alert("Score archive successfully reset!");

    // Optional: reload the archive view if you have a function for that
    if (typeof loadArchive === 'function') {
      loadArchive();
    }

  } catch (error) {
    console.error('Error resetting archive:', error);
    alert("Failed to reset archive.");
  }
});

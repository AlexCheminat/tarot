const resetButton = document.getElementById('resetArchiveBtn');

resetButton.addEventListener('click', async () => {
  const confirmed = confirm("Are you sure you want to delete all archived scores?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/score_archive`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to reset archive: ${res.status}`);
    }

    alert("Score archive successfully reset!");
    // Optional: Refresh the archive view
    if (typeof loadArchive === 'function') loadArchive();

  } catch (error) {
    console.error('Error resetting archive:', error);
    alert("Failed to reset archive.");
  }
});
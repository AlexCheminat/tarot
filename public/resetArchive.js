const inspectButton = document.getElementById('resetArchiveBtn'); // temporarily reusing your reset button

inspectButton.addEventListener('click', async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/score_archive?select=*`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch archive: ${res.status}`);
    }

    const data = await res.json();
    console.log("Archive data:", data);

    if (data.length === 0) {
      alert("Archive is empty.");
    } else {
      alert(`Fetched ${data.length} rows. Check the console for structure.`);
    }

  } catch (error) {
    console.error('Error fetching archive data:', error);
    alert("Failed to fetch archive data.");
  }
});

import { db } from './firebase.js';
import {
  collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const resetButton = document.getElementById('resetArchiveBtn');

resetButton.addEventListener('click', async () => {
  const confirmed = confirm("Voulez-vous vraiment réinitialiser l'archive ? Cela supprimera tous les scores enregistrés.");
  if (!confirmed) return;

  const confirmed2 = confirm("Vous êtes vraiment sure ?");
  if (!confirmed2) return;

  const confirmed3 = confirm("Dernière chance !");
  if (!confirmed3) return;

  try {
    const snapshot = await getDocs(collection(db, 'score_archive'));
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'score_archive', d.id)));
    await Promise.all(deletePromises);

    if (typeof window.loadArchive === 'function') {
      window.loadArchive();
    }
  } catch (error) {
    console.error('Error resetting archive:', error);
    alert("Failed to reset archive.");
  }
});
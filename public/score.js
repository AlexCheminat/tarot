let contrat = null;
let primeCheck1 = null;
let primeCheck2 = null;
let primeCheck3 = null;

document.querySelectorAll('input[type="radio"][name="selected-task"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (preneur === this) {
      this.checked = false;
      preneur = null;
    } else {
      preneur = this;
    }
  });
});

document.querySelectorAll('input[type="radio"][name="selected-task2"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (equipier === this) {
      this.checked = false;
      equipier = null;
    } else {
      equipier = this;
    }
  });
});

document.querySelectorAll('input[type="radio"][name="contrat"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (contrat === this) {
      this.checked = false;
      contrat = null;
    } else {
      contrat = this;
    }
  });
});

document.querySelectorAll('input[type="radio"][name="prime1"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (primeCheck1 === this) {
      this.checked = false;
      primeCheck1 = null;
    } else {
      primeCheck1 = this;
    }
  });
});

document.querySelectorAll('input[type="radio"][name="prime2"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (primeCheck2 === this) {
      this.checked = false;
      primeCheck2 = null;
    } else {
      primeCheck2 = this;
    }
  });
});

document.querySelectorAll('input[type="radio"][name="prime3"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (primeCheck3 === this) {
      this.checked = false;
      primeCheck3 = null;
    } else {
      primeCheck3 = this;
    }
  });
});

function getFormData() {
    const selectedPlayers = Array.from(document.querySelectorAll('#checkbox-list input[type="checkbox"]:checked')).map(cb => cb.value);
    const preneur = document.querySelector('#radio-list input[type="radio"]:checked')?.value || null;
    const equipier = document.querySelector('#radio-list-2 input[type="radio"]:checked')?.value || null;
    const points = parseFloat(document.querySelector('#points')?.value) || 0;
    const contrat = document.querySelector('input[name="contrat"]:checked')?.value || null;
    const bout = parseInt(document.querySelector('#bout')?.value) || 0;
    const primes = Array.from(document.querySelectorAll('input[name^="prime"]:checked')).map(cb => cb.value);

    return {
        players: selectedPlayers,
        preneur,
        equipier,
        points,
        contrat,
        bout,
        primes,
    };
}

function submitForm() {
    const formData = getFormData();
    calculateScore(formData, true); // Final submit: update leaderboard
}

function previewScore() {
    const formData = getFormData();
    calculateScore(formData, false); // Preview only: no leaderboard update
}

function calculateScore(formData, isFinalSubmit) {
    let score = 0;

    switch (formData.bout) {
        case 0: score = formData.points - 56; break;
        case 1: score = formData.points - 51; break;
        case 2: score = formData.points - 41; break;
        case 3: score = formData.points - 36; break;
        default: break;
    }

    let winFlag = true;
    if (score < 0) {
        winFlag = false;
        score = -score;
    }

    score += 25;

    if (formData.primes.includes("1")) {
        score += winFlag ? 10 : -10;
    } else if (formData.primes.includes("2")) {
        score += winFlag ? -10 : 10;
    }

    switch (formData.contrat) {
        case "2": score *= 2; break;
        case "3": score *= 4; break;
        case "4": score *= 6; break;
        default: break;
    }

    if (formData.primes.includes("3")) score += 20;
    if (formData.primes.includes("4")) score += 40;
    if (formData.primes.includes("5")) score += 30;
    if (formData.primes.includes("6")) score += 40;

    if (winFlag) {
        if (formData.primes.includes("7")) score += 400;
        else if (formData.primes.includes("8")) score += 200;
        else if (formData.primes.includes("9")) score -= 200;
    } else {
        if (formData.primes.includes("7")) score -= 400;
        else if (formData.primes.includes("8")) score -= 200;
        else if (formData.primes.includes("9")) score += 200;
    }

    let defPlayer = 0;
    let attPlayer = 0;
    let equipier = 0;

    if (winFlag) {
        defPlayer = -score;
        if (formData.preneur === formData.equipier) {
            attPlayer = score * 4;
        } else if (formData.equipier === null) {
            attPlayer = score * 3;
        } else {
            attPlayer = score * 2;
            equipier = score;
        }
    } else {
        defPlayer = score;
        if (formData.preneur === formData.equipier) {
            attPlayer = -score * 4;
        } else if (formData.equipier === null) {
            attPlayer = -score * 3;
        } else {
            attPlayer = -score * 2;
            equipier = -score;
        }
    }

    display(attPlayer, equipier, defPlayer);

    if (isFinalSubmit) {
        const allDefenders = formData.players.filter(name => name !== formData.preneur && name !== formData.equipier);

        window.updatePlayerScore(formData.preneur, attPlayer);
        if (formData.preneur !== formData.equipier) {
            window.updatePlayerScore(formData.equipier, equipier);
        }
        allDefenders.forEach(name => {
            window.updatePlayerScore(name, defPlayer);
        });

        archiveScore(formData, attPlayer, equipier, defPlayer);
    }
}

async function archiveScore(formData, attPlayer, equipier, defPlayer) {
    const allDefenders = formData.players.filter(name => name !== formData.preneur && name !== formData.equipier);

    const { data, error } = await supabase
        .from('score_archive')
        .insert([{
            preneur_nom: formData.preneur,
            preneur_score: attPlayer,
            equipier_nom: formData.equipier,
            equipier_score: equipier,
            defense_nom: allDefenders,
            defense_score: defPlayer,
            points: formData.points,
            contrat: formData.contrat,
            bout: formData.bout,
            primes: formData.primes,
        }]);

    if (error) {
        console.error("Failed to archive score:", error);
        return;
    }

    console.log("Score archived:", data);
}

function display(attPlayer, equipier, defPlayer) {
    if (window.location.pathname.includes("addScore.html")) {
        const preneurSpan = document.querySelector('#preneur');
        const equipierSpan = document.querySelector('#equipier');
        const defenseSpan = document.querySelector('#defense');
        const equipierLine = document.querySelector('#equipier-line');

        if (preneurSpan && equipierSpan && defenseSpan && equipierLine) {
            preneurSpan.textContent = attPlayer;
            defenseSpan.textContent = defPlayer;

            if (equipier === 0) {
                equipierLine.style.display = 'none';
            } else {
                equipierLine.style.display = 'block';
                equipierSpan.textContent = equipier;
            }
        }
    }
}

function setupAutoUpdate() {
    const inputs = document.querySelectorAll('#checkbox-list input, #radio-list input, #radio-list-2 input, input[name="contrat"], input[name^="prime"], #points, #bout');
    inputs.forEach(input => {
        input.addEventListener('input', previewScore);
        input.addEventListener('change', previewScore);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes("addScore.html")) {
        setupAutoUpdate();
        previewScore();
    }
});
// Export for form submission handler in HTML
window.submitForm = submitForm;

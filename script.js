// ========== COURS ==========
function initialiserCours() {
    let html = '';
    
    // Intégration du déroulement de l'activité
    if (data.deroulement) {
        html += `<div class="deroulement-box">
            <h3>${data.deroulement.titre}</h3>
            <ul>`;
        data.deroulement.etapes.forEach(e => {
            html += `<li>${e}</li>`;
        });
        html += `</ul></div><hr class="cours-separator">`;
    }

    // Cours principal
    html += `<div class="intro"><strong>🎯 Introduction :</strong> ${data.cours.introduction}</div>`;
    data.cours.sections.forEach(s => {
        html += `<div class="section-cours"><h3>${s.titre}</h3><p>${s.contenu}</p></div>`;
    });
    $('#contenu-cours').innerHTML = html;
}

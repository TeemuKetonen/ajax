// Hae viittaukset DOM-elementteihin
const teatteriValinta = document.getElementById('theater-select');
const elokuvatSailio = document.getElementById('movies-container');

// Lataa ja näytä elokuvat VALITULLE teatterille
function lataaElokuvat(teatteriID) {
    // Finnkinon API:n URL teatterin id:llä
    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${teatteriID}`)
        .then(response => response.text())
        .then(data => {
            const parseri = new DOMParser();
            const xml = parseri.parseFromString(data, 'text/xml');
            const elokuvat = xml.getElementsByTagName('Show');

            elokuvatSailio.innerHTML = ''; // Tyhjennä aiemmat tulokset

            if (elokuvat.length === 0) {
                elokuvatSailio.innerHTML = '<p>Ei elokuvia saatavilla tälle teatterille.</p>';
                return;
            }

            // Ryhmitä elokuvat nimen perusteella
            const elokuvaKartta = new Map();

            Array.from(elokuvat).forEach(elokuva => {
                const nimi = elokuva.getElementsByTagName('Title')[0]?.textContent || 'Ei nimeä saatavilla';
                const kuvaURL = elokuva.getElementsByTagName('EventLargeImagePortrait')[0]?.textContent || 'https://via.placeholder.com/300x200.png?text=Ei+kuvaa';
                const naytosaika = new Date(elokuva.getElementsByTagName('dttmShowStart')[0]?.textContent);
                const naytosaikaMuotoiltu = `${naytosaika.toLocaleDateString('fi-FI')} ${naytosaika.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}`; // Päivämäärä ja aika
                const tapahtumaURL = elokuva.getElementsByTagName('EventURL')[0]?.textContent || '#';

                // Jos elokuvaa ei ole vielä listalla, lisää se
                if (!elokuvaKartta.has(nimi)) {
                    elokuvaKartta.set(nimi, {
                        kuvaURL,
                        tapahtumaURL,
                        naytosajat: []
                    });
                }

                // Lisää näytösaika elokuvan tietoihin
                elokuvaKartta.get(nimi).naytosajat.push(naytosaikaMuotoiltu);
            });

            // Luo elokuvakortit
            elokuvaKartta.forEach((elokuvaData, nimi) => {
                const { kuvaURL, tapahtumaURL, naytosajat } = elokuvaData;

                const elokuvaKortti = document.createElement('div');
                elokuvaKortti.classList.add('movie-card');

                elokuvaKortti.innerHTML = `
                    <img src="${kuvaURL}" alt="${nimi}">
                    <h3>${nimi}</h3>
                    <p>Näytösajat:<br>${naytosajat.join('<br>')}</p>
                    <a href="${tapahtumaURL}" target="_blank" class="movie-link">Lisätietoja</a>
                `;
                elokuvatSailio.appendChild(elokuvaKortti);
            });
        })
        .catch(virhe => {
            console.error('Virhe elokuvien lataamisessa:', virhe);
            elokuvatSailio.innerHTML = '<p>Valitettavasti tapahtui virhe. Yritä myöhemmin uudelleen.</p>';
        });
}

// Tapahtumankuuntelija teatterivalinnalle
teatteriValinta.addEventListener('change', (eventti) => {
    const valittuTeatteriID = eventti.target.value;
    if (valittuTeatteriID) {
        lataaElokuvat(valittuTeatteriID); // Lataa elokuvat valitulle teatterille
    } else {
        elokuvatSailio.innerHTML = ''; // Tyhjennä elokuvat, jos teatteria ei ole valittu
    }
});
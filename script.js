// CONFIG
// By default this points to the local sample JSON file included in the repo.
// If you want to switch to a Google Sheet JSON API later, replace this URL with your published sheet URL.
const DATA_URL = 'data/sample_data.json'; // <- change this to your Google Sheet JSON URL when ready

// Utility: fetch data
async function fetchData(){
  try{
    const res = await fetch(DATA_URL);
    const data = await res.json();
    return data;
  }catch(e){
    console.error('Failed to fetch data', e);
    return [];
  }
}

// PAGE: index.html
if(document.getElementById('search-btn')){
  (async ()=>{
    const data = await fetchData();
    const cities = [...new Set(data.map(d=>d.city))].sort();
    const suggestions = document.getElementById('city-suggestions');
    const input = document.getElementById('city-input');
    const showAll = document.getElementById('show-sample');
    function showList(list){
      suggestions.innerHTML = '';
      list.forEach(c=>{const li=document.createElement('li');li.textContent=c;li.onclick=()=>{input.value=c};suggestions.appendChild(li)});
    }
    showAll.onclick = ()=> showList(cities);
    document.getElementById('search-btn').onclick = ()=>{
      const q = input.value.trim();
      if(!q) return alert('Type a city like Udaipur');
      // open page2 with city param
      window.location.href = `page2.html?city=${encodeURIComponent(q)}`;
    }
    // quick typeahead
    input.addEventListener('input', ()=>{
      const q = input.value.trim().toLowerCase();
      if(!q){suggestions.innerHTML='';return}
      const filtered = cities.filter(c=>c.toLowerCase().includes(q));
      showList(filtered.slice(0,10));
    });
  })();
}

// PAGE: page2.html
if(document.getElementById('movies-list')){
  (async ()=>{
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city') || '';
    document.getElementById('city-title').textContent = city || 'City';
    const data = await fetchData();
    const cityData = data.filter(d=>d.city.toLowerCase() === city.toLowerCase());
    if(cityData.length === 0){
      document.getElementById('movies-list').innerHTML = '<p>No entries found for this city. Try another city or click Show All on the home page.</p>';
      return;
    }
    // group by movie
    const movies = {};
    cityData.forEach(row=>{
      if(!movies[row.movie]) movies[row.movie]=[];
      movies[row.movie].push(row);
    });
    const container = document.getElementById('movies-list');
    Object.keys(movies).forEach(movie=>{
      const mDiv = document.createElement('div');
      mDiv.className='movie-card';
      const title = document.createElement('div');
      title.className='movie-title';
      title.innerHTML = `<h3>${movie}</h3>`;
      mDiv.appendChild(title);
      movies[movie].forEach(scene=>{
        const s = document.createElement('div');s.className='scene';
        s.innerHTML = `
          <img src="${scene.image}" alt="${scene.scene_name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'" />
          <div class="meta">
            <h4>${scene.scene_name}</h4>
            <div>${scene.scene_description || ''}</div>
            <small>${scene.trivia || ''}</small>
          </div>
          <div class="actions">
            <button class="btn map-btn">Open in Maps</button>
            <button class="btn alt add-btn">Add to Trip</button>
          </div>
        `;
        // map
        s.querySelector('.map-btn').onclick = ()=>{
          window.open(`https://www.google.com/maps?q=${scene.lat},${scene.lng}`,'_blank');
        }
        // add
        s.querySelector('.add-btn').onclick = ()=>{
          const trip = JSON.parse(localStorage.getItem('trip')||'[]');
          trip.push(scene);
          localStorage.setItem('trip', JSON.stringify(trip));
          alert('Added to trip');
        }
        mDiv.appendChild(s);
      });
      container.appendChild(mDiv);
    });
    document.getElementById('generate-itinerary').onclick = ()=>{
      window.location.href = 'page3.html';
    }
  })();
}

// PAGE: page3.html
if(document.getElementById('itinerary-list')){
  (async ()=>{
    const list = JSON.parse(localStorage.getItem('trip')||'[]');
    const container = document.getElementById('itinerary-list');
    if(list.length===0){container.innerHTML='<p>No items in trip. Go add some scenes.</p>';return}
    list.forEach(item=>{
      const card = document.createElement('div');card.className='scene';
      card.innerHTML = `
        <img src="${item.image}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'" />
        <div class="meta">
          <h4>${item.movie} — ${item.scene_name}</h4>
          <div>${item.scene_description || ''}</div>
          <small>${item.trivia || ''}</small>
        </div>
        <div class="actions">
          <button class="btn map-btn">Open in Maps</button>
          <button class="btn alt remove-btn">Remove</button>
        </div>
      `;
      card.querySelector('.map-btn').onclick = ()=>{window.open(`https://www.google.com/maps?q=${item.lat},${item.lng}`,'_blank');}
      card.querySelector('.remove-btn').onclick = ()=>{
        const cur = JSON.parse(localStorage.getItem('trip')||'[]').filter(i=>!(i.scene_name===item.scene_name && i.movie===item.movie));
        localStorage.setItem('trip', JSON.stringify(cur));
        card.remove();
      }
      container.appendChild(card);
    });

    // download PDF
    const dl = document.getElementById('download-pdf');
    dl.onclick = ()=>{
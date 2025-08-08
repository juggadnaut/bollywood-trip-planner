// Sample dataset
const movieLocations = [
    {
        city: "Udaipur",
        featured: [
            {
                movie: "Yeh Jawaani Hai Deewani",
                scenes: [
                    "City Palace – Ranbir & Deepika date scene",
                    "Wedding scenes at Oberoi Udaivilas"
                ]
            },
            {
                movie: "Goliyon Ki Raasleela Ram-Leela",
                scenes: [
                    "Lakeside scenes at Lake Pichola",
                    "Market fight sequence"
                ]
            }
        ]
    },
    {
        city: "Mumbai",
        featured: [
            {
                movie: "Wake Up Sid",
                scenes: [
                    "Marine Drive night walk",
                    "Cafe scene at Colaba"
                ]
            },
            {
                movie: "Dhoom 2",
                scenes: [
                    "Train heist on Bandra station",
                    "Beach chase at Juhu"
                ]
            }
        ]
    },
    {
        city: "Manali",
        featured: [
            {
                movie: "Jab We Met",
                scenes: [
                    "Bus stop arrival scene",
                    "Snow trekking scene"
                ]
            },
            {
                movie: "Bang Bang",
                scenes: [
                    "Motorbike chase on mountain roads"
                ]
            }
        ]
    }
];

// Search button click
function handleSearch() {
    const query = document.getElementById("searchBox").value.trim().toLowerCase();
    const foundCity = movieLocations.find(
        loc => loc.city.toLowerCase() === query
    );

    if (foundCity) {
        localStorage.setItem("searchResults", JSON.stringify(foundCity));
        window.location.href = "page3.html";
    } else {
        alert("City not found in our database.");
    }
}

// Load results on page3.html
function loadResults() {
    const results = JSON.parse(localStorage.getItem("searchResults"));

    if (!results) {
        document.getElementById("results").innerHTML = "<p>No data found.</p>";
        return;
    }

    let html = `<h2>Movies filmed in ${results.city}</h2>`;
    results.featured.forEach(item => {
        html += `<h3>${item.movie}</h3><ul>`;
        item.scenes.forEach(scene => {
            html += `<li>${scene}</li>`;
        });
        html += `</ul>`;
    });

    document.getElementById("results").innerHTML = html;
}

// Auto-run loadResults() only if on page3.html
window.onload = function () {
    if (document.getElementById("results")) {
        loadResults();
    }
};

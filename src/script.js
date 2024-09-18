const searchForm = document.getElementById('search-form');
const input = document.getElementById('search-input');
const resultDiv = document.getElementById('result-div');

// Store the Grid.js instance globally so it can be destroyed when needed
let gridInstance;

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const selectedRadio = document.querySelector('input[name="radio-choice"]:checked').value;
    const searchInput = input.value;

    let url = '';

    // Set the URL based on the selected option
    if (selectedRadio == 'Country') {
        url = `https://restcountries.com/v3.1/name/${searchInput}`;
    } else {
        url = `https://restcountries.com/v3.1/lang/${searchInput}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                // If the response status is not OK, throw an error to be caught
                throw new Error('No matching country or language found');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                throw new Error('No matching country or language found'); // Handle empty data
            }

            data.sort((a, b) => b.population - a.population); // Sort by population

            // Clear the resultDiv before appending the grid
            resultDiv.innerHTML = '';

            // Prepare the data for Grid.js
            const gridData = data.map(country => [
                country.name.common,              // Country name
                country.capital ? country.capital[0] : 'N/A',  // Capital (if available)
                country.population.toLocaleString(),           // Population (formatted)
                gridjs.html(`<img src="${country.flags.png}" width="50" alt="Flag of ${country.name.common}"/>`) // Country flag using gridjs.html
            ]);

            // Destroy the previous grid instance if it exists
            if (gridInstance) {
                gridInstance.destroy();
            }

            // Initialize the Grid.js table
            gridInstance = new gridjs.Grid({
                columns: ['Country', 'Capital', 'Population', 'Flag'],
                data: gridData,
                search: true,     // Enable search
                pagination: {     // Enable pagination
                    limit: 5
                },
                sort: true,       // Enable sorting
                resizable: true,  // Allow resizing of columns
            }).render(resultDiv); // Render the grid inside the resultDiv
        })
        .catch(error => {
            let errorMessage = '';

            // Detect if it's a network or fetch error
            if (error.message === 'Failed to fetch') {
                errorMessage = 'Network error: Please check your internet connection or try again later.';
            } else {
                errorMessage = error.message; // Use the error message from the response
            }

            // If an error occurs, clear the resultDiv and show the error message
            resultDiv.innerHTML = `<p style="color: red; font-size: 18px;">${errorMessage}</p>`;
        });
});

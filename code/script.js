// Tab Switching Logic
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Function to open Fuel Points Help popup
function openFuelPointsHelp() {
    const popup = window.open('help.html', 'FuelPointsHelp', 'width=600,height=500,scrollbars=yes');
    if (popup) popup.focus();
}

// Mileage Tracker Logic (Tab 1)
let vehicleFuelLogs = {};
let currentVehicle = null;
let mileageSortDirection = 'asc';

// Initialize from localStorage
function initializeFuelLogs() {
    const mileageSavedData = localStorage.getItem('vehicleFuelLogs');
    if (mileageSavedData) {
        vehicleFuelLogs = JSON.parse(mileageSavedData);
        if (Object.keys(vehicleFuelLogs).length > 0) {
            currentVehicle = Object.keys(vehicleFuelLogs)[0];
        }
    }
}

function updateVehicleDropdown() {
    const vehicleSelect = document.getElementById('vehicleSelect');
    vehicleSelect.innerHTML = '';
    Object.keys(vehicleFuelLogs).forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle;
        option.textContent = vehicle;
        if (vehicle === currentVehicle) option.selected = true;
        vehicleSelect.appendChild(option);
    });
}

document.getElementById('addVehicleBtn').addEventListener('click', function() {
    const newVehicle = document.getElementById('newVehicle').value.trim();
    if (newVehicle && !vehicleFuelLogs[newVehicle]) {
        vehicleFuelLogs[newVehicle] = [];
        currentVehicle = newVehicle;
        localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        updateVehicleDropdown();
        displayFuelData();
        document.getElementById('newVehicle').value = '';
    }
});

document.getElementById('vehicleSelect').addEventListener('change', function() {
    currentVehicle = this.value;
    displayFuelData();
});

document.getElementById('addRowBtn').addEventListener('click', function() {
    if (!currentVehicle) {
        alert('Please select or add a vehicle first!');
        return;
    }
    if (!vehicleFuelLogs[currentVehicle]) {
        vehicleFuelLogs[currentVehicle] = [];
    }
    vehicleFuelLogs[currentVehicle].push({
        date: '',
        fuelLeftBefore: null,
        fuelFilled: null,
        cost: null,
        distanceRun: null,
        fuelLeftAfter: null,
        mileage: null
    });
    localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
    displayFuelData();
});

function calculateMileage(distanceRun, fuelLeftBefore, fuelFilled, fuelLeftAfter) {
    if (distanceRun && fuelFilled >= 0 && fuelLeftBefore >= 0 && fuelLeftAfter >= 0) {
        const fuelConsumed = (fuelLeftBefore + fuelFilled) - fuelLeftAfter;
        if (fuelConsumed > 0) {
            return (distanceRun / fuelConsumed).toFixed(2);
        }
    }
    return '';
}

function displayFuelData() {
    const tableBody = document.getElementById('fuelTableBody');
    tableBody.innerHTML = '';
    if (currentVehicle && vehicleFuelLogs[currentVehicle]) {
        vehicleFuelLogs[currentVehicle].forEach((entry, index) => {
            const mileage = calculateMileage(entry.distanceRun, entry.fuelLeftBefore, entry.fuelFilled, entry.fuelLeftAfter);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="date" class="editable-input date-input" value="${entry.date || ''}" data-index="${index}"></td>
                <td><input type="number" class="editable-input fuel-left-before-input" value="${entry.fuelLeftBefore || ''}" step="0.1" min="0" data-index="${index}"></td>
                <td><input type="number" class="editable-input fuel-filled-input" value="${entry.fuelFilled || ''}" step="0.1" min="0" data-index="${index}"></td>
                <td><input type="number" class="editable-input cost-input" value="${entry.cost || ''}" step="0.01" min="0" data-index="${index}"></td>
                <td><input type="number" class="editable-input distance-input" value="${entry.distanceRun || ''}" step="0.1" min="0" data-index="${index}"></td>
                <td><input type="number" class="editable-input fuel-left-after-input" value="${entry.fuelLeftAfter || ''}" step="0.1" min="0" data-index="${index}"></td>
                <td><input type="number" class="editable-input mileage-input" value="${mileage}" step="0.01" min="0" data-index="${index}" readonly></td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners after creating rows
        addTableEventListeners();
    }
    updateTotalCost();
}

function addTableEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            vehicleFuelLogs[currentVehicle].splice(index, 1);
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
            displayFuelData();
        });
    });

    document.querySelectorAll('.date-input').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            vehicleFuelLogs[currentVehicle][index].date = this.value;
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        });
    });

    document.querySelectorAll('.fuel-left-before-input').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const fuelLeftBefore = parseFloat(this.value) || 0;
            vehicleFuelLogs[currentVehicle][index].fuelLeftBefore = fuelLeftBefore;
            updateMileage(index);
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        });
    });

    document.querySelectorAll('.fuel-filled-input').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const fuelFilled = parseFloat(this.value) || 0;
            vehicleFuelLogs[currentVehicle][index].fuelFilled = fuelFilled;
            updateMileage(index);
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        });
    });

    document.querySelectorAll('.cost-input').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const cost = parseFloat(this.value) || 0;
            vehicleFuelLogs[currentVehicle][index].cost = cost;
            updateTotalCost();
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        });
    });

    document.querySelectorAll('.distance-input').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const distanceRun = parseFloat(this.value) || 0;
            vehicleFuelLogs[currentVehicle][index].distanceRun = distanceRun;
            updateMileage(index);
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        });
    });

    document.querySelectorAll('.fuel-left-after-input').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const fuelLeftAfter = parseFloat(this.value) || 0;
            vehicleFuelLogs[currentVehicle][index].fuelLeftAfter = fuelLeftAfter;
            updateMileage(index);
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        });
    });
}

function updateMileage(index) {
    const entry = vehicleFuelLogs[currentVehicle][index];
    const mileage = calculateMileage(entry.distanceRun, entry.fuelLeftBefore, entry.fuelFilled, entry.fuelLeftAfter);
    vehicleFuelLogs[currentVehicle][index].mileage = mileage ? parseFloat(mileage) : null;
    const mileageInput = document.querySelector(`.mileage-input[data-index="${index}"]`);
    if (mileageInput) mileageInput.value = mileage;
}

function updateTotalCost() {
    const totalCost = currentVehicle && vehicleFuelLogs[currentVehicle]
        ? vehicleFuelLogs[currentVehicle].reduce((sum, entry) => sum + (entry.cost || 0), 0)
        : 0;
    document.getElementById('totalCost').textContent = `Total Cost: ${totalCost.toFixed(2)}`;
}

document.getElementById('sortDate').addEventListener('click', function() {
    if (!currentVehicle) return;
    mileageSortDirection = (mileageSortDirection === 'asc') ? 'desc' : 'asc';
    vehicleFuelLogs[currentVehicle].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return mileageSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
    displayFuelData();
});

document.getElementById('loadFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file || !currentVehicle) {
        if (!currentVehicle) alert('Please select a vehicle first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n');
            const newEntries = [];
            
            lines.forEach((line, index) => {
                if (index === 0 || line.trim() === '') return; // Skip header or empty lines
                const [date, fuelLeftBefore, fuelFilled, cost, distanceRun, fuelLeftAfter, mileage] = line.split(',');
                if (date && fuelFilled && cost) {
                    newEntries.push({
                        date: date.trim(),
                        fuelLeftBefore: fuelLeftBefore ? parseFloat(fuelLeftBefore.trim()) : null,
                        fuelFilled: parseFloat(fuelFilled.trim()),
                        cost: parseFloat(cost.trim()),
                        distanceRun: distanceRun ? parseFloat(distanceRun.trim()) : null,
                        fuelLeftAfter: fuelLeftAfter ? parseFloat(fuelLeftAfter.trim()) : null,
                        mileage: mileage ? parseFloat(mileage.trim()) : null
                    });
                }
            });

            // Update vehicleFuelLogs with new data
            vehicleFuelLogs[currentVehicle] = newEntries;
            localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
            displayFuelData();
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Error loading file. Please ensure it follows the correct CSV format.');
        }
    };
    reader.readAsText(file);
});

document.getElementById('saveBtn').addEventListener('click', function() {
    if (!currentVehicle || !vehicleFuelLogs[currentVehicle] || vehicleFuelLogs[currentVehicle].length === 0) {
        alert('No data to save for the selected vehicle!');
        return;
    }

    let textContent = 'Date,Fuel Left Before (L),Fuel Filled (L),Cost,Distance Run (km),Fuel Left (L),Mileage (km/L)\n';
    vehicleFuelLogs[currentVehicle].forEach(entry => {
        textContent += `${entry.date},${entry.fuelLeftBefore || ''},${entry.fuelFilled},${entry.cost},${entry.distanceRun || ''},${entry.fuelLeftAfter || ''},${entry.mileage || ''}\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentVehicle}_fuel_log.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('File downloaded to your Downloads folder. On your device Move the downloaded file to your desired folder');
});

// Vehicle Expense Logic (Tab 2) remains unchanged
function toggleLoanDetails(value) {
    const loanDetails = document.getElementById("loanDetails");
    const ownershipPeriodSection = document.getElementById("ownershipPeriodSection");
    const loanAvailedLabel = document.getElementById("loanAvailedLabel");
    const expenseReport = document.getElementById("expenseReport");

    if (value === "1") {
        loanDetails.style.display = "block";
        ownershipPeriodSection.style.display = "none";
        loanAvailedLabel.textContent = "Yes";
    } else {
        loanDetails.style.display = "none";
        ownershipPeriodSection.style.display = "block";
        loanAvailedLabel.textContent = "No";
        const loanReportSection = document.querySelector(".section");
        if (loanReportSection) {
            loanReportSection.remove();
        }
    }
}

// Rest of the Vehicle Expense Logic remains unchanged...
// [Keeping all the existing functions: formatToTwoDecimals, generateReport, saveProfile, 
// loadProfile, deleteProfile, updateProfileSelector, loadLastSavedData, loadNotes, 
// addNote, deleteNote]

// Initialize
initializeFuelLogs();
updateVehicleDropdown();
displayFuelData();

// Mileage Calculator (Tab 1)
document.getElementById('mileageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const tankCapacity = parseFloat(document.getElementById('tankCapacity').value);
    const fullPoints = parseInt(document.getElementById('fullPoints').value);
    const fuelFilled = parseFloat(document.getElementById('fuelFilled').value);
    const remainingPoints = parseInt(document.getElementById('remainingPoints').value);
    const distance = parseFloat(document.getElementById('distance').value);

    if (remainingPoints > fullPoints) {
        document.getElementById('result').innerHTML = "Error: Remaining points cannot exceed full points!";
        return;
    }

    if (fuelFilled > tankCapacity) {
        document.getElementById('result').innerHTML = "Error: Fuel Filled cannot exceed Tank Capacity!";
        return;
    }

    const litersPerPoint = tankCapacity / fullPoints;
    const fuelFilledInPoints = fuelFilled / litersPerPoint;
    const fuelConsumedInPoints = fuelFilledInPoints - remainingPoints;
    if (fuelConsumedInPoints <= 0) {
        document.getElementById('result').innerHTML = "Error: Fuel consumed must be greater than zero!";
        return;
    }
    const mileage = distance / fuelConsumedInPoints;

    document.getElementById('result').innerHTML = `Mileage: ${mileage.toFixed(2)} km/L`;
});

// Tab 2 Initialization remains unchanged
updateProfileSelector();
loadNotes();
loadLastSavedData();
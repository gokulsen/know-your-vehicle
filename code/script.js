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
    const popup = window.open('..\code\help.html', 'FuelPointsHelp', 'width=600,height=500,scrollbars=yes');
    if (popup) popup.focus();
}

// Mileage Tracker Logic (Tab 1)
let vehicleFuelLogs = {};
let currentVehicle = null;
let mileageSortDirection = 'asc';

const mileageSavedData = localStorage.getItem('vehicleFuelLogs');
if (mileageSavedData) {
    vehicleFuelLogs = JSON.parse(mileageSavedData);
    if (Object.keys(vehicleFuelLogs).length > 0) {
        currentVehicle = Object.keys(vehicleFuelLogs)[0];
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
    }

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
            const date = this.value;
            vehicleFuelLogs[currentVehicle][index].date = date;
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

    updateTotalCost();
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
    document.getElementById('totalCost').textContent = `Total Cost ${totalCost.toFixed(2)}`;
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
    if (!file || !currentVehicle) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        vehicleFuelLogs[currentVehicle] = [];
        const lines = text.split('\n');
        lines.forEach((line, index) => {
            if (index === 0 || line.trim() === '') return;
            const [date, fuelLeftBefore, fuelFilled, cost, distanceRun, fuelLeftAfter, mileage] = line.split(',');
            if (date && fuelFilled && cost) {
                vehicleFuelLogs[currentVehicle].push({
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
        localStorage.setItem('vehicleFuelLogs', JSON.stringify(vehicleFuelLogs));
        displayFuelData();
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

updateVehicleDropdown();
displayFuelData();

// Vehicle Expense Logic (Tab 2)
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

function formatToTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}

function generateReport() {
    const model = document.getElementById("model").value;
    const downPayment = formatToTwoDecimals(parseFloat(document.getElementById("downPayment").value) || 0);
    const principal = formatToTwoDecimals(parseFloat(document.getElementById("principal").value) || 0);
    const interestRate = formatToTwoDecimals(parseFloat(document.getElementById("interestRate").value) || 0);
    const termMonths = parseInt(document.getElementById("termMonths").value) || 0;
    const emiPaidInAdvance = formatToTwoDecimals(parseFloat(document.getElementById("emiPaidInAdvance").value) || 0);
    const ownershipPeriod = parseInt(document.getElementById("ownershipPeriod").value) || 0;
    const distance = parseInt(document.getElementById("distance").value) || 0;
    const mileage = formatToTwoDecimals(parseFloat(document.getElementById("mileage").value) || 0);
    const fuelCost = formatToTwoDecimals(parseFloat(document.getElementById("fuelCost").value) || 0);
    const serviceMaintenance = formatToTwoDecimals(parseFloat(document.getElementById("serviceMaintenance").value) || 0);
    const otherMaintenance = formatToTwoDecimals(parseFloat(document.getElementById("otherMaintenance").value) || 0);
    const monthsPaid = parseInt(document.getElementById("monthsPaid").value) || 0;
    const resaleValue = formatToTwoDecimals(parseFloat(document.getElementById("resaleValue").value) || 0);

    localStorage.setItem('model', model);
    localStorage.setItem('downPayment', downPayment);
    localStorage.setItem('principal', principal);
    localStorage.setItem('interestRate', interestRate);
    localStorage.setItem('termMonths', termMonths);
    localStorage.setItem('emiPaidInAdvance', emiPaidInAdvance);
    localStorage.setItem('ownershipPeriod', ownershipPeriod);
    localStorage.setItem('distance', distance);
    localStorage.setItem('mileage', mileage);
    localStorage.setItem('fuelCost', fuelCost);
    localStorage.setItem('serviceMaintenance', serviceMaintenance);
    localStorage.setItem('otherMaintenance', otherMaintenance);
    localStorage.setItem('monthsPaid', monthsPaid);
    localStorage.setItem('resaleValue', resaleValue);

    const monthlyInterestRate = (interestRate / 100) / 12;
    const emi = (principal > 0 && termMonths > 0 && interestRate > 0)
        ? formatToTwoDecimals((principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / (Math.pow(1 + monthlyInterestRate, termMonths) - 1))
        : 0;
    const totalLoanAmount = formatToTwoDecimals(emi * termMonths);
    const emiPaidToDate = formatToTwoDecimals(emi * monthsPaid + emiPaidInAdvance);
    const emiToBePaid = formatToTwoDecimals(totalLoanAmount - emiPaidToDate);

    const ownershipPeriodInYears = ownershipPeriod / 12;
    const fuelConsumedPerYear = distance / mileage;
    const totalFuelCost = formatToTwoDecimals(fuelConsumedPerYear * fuelCost * ownershipPeriodInYears);
    const totalServiceMaintenance = formatToTwoDecimals(serviceMaintenance * ownershipPeriodInYears);

    const vehicleCost = formatToTwoDecimals(downPayment + totalLoanAmount);
    const totalMaintenanceCost = formatToTwoDecimals(totalFuelCost + totalServiceMaintenance + otherMaintenance);
    const totalExpense = formatToTwoDecimals(vehicleCost + totalMaintenanceCost);

    const vehicleCostToDate = formatToTwoDecimals(downPayment + emiPaidToDate);
    const totalFuelCostPaid = formatToTwoDecimals(fuelConsumedPerYear * fuelCost * (monthsPaid / 12));
    const totalServiceMaintenancePaid = formatToTwoDecimals(serviceMaintenance * (monthsPaid / 12));
    const totalMaintenanceCostPaid = formatToTwoDecimals(totalFuelCostPaid + totalServiceMaintenancePaid + otherMaintenance);
    const totalExpensePaid = formatToTwoDecimals(vehicleCostToDate + totalMaintenanceCostPaid);

    const reportHTML = `
        <div class="report-section">
            <h3>Vehicle Details</h3>
            <p>Vehicle Model ${model || 'Not specified'}</p>
            <hr>
        </div>
        <div class="report-section">
            <h3>Loan Details</h3>
            <p>Down Payment ${downPayment.toFixed(2)}</p>
            <p>EMI (Monthly) ${emi.toFixed(2)}</p>
            <p>Total Loan Amount ${totalLoanAmount.toFixed(2)}</p>
            <p>EMI Paid To-Date ${emiPaidToDate.toFixed(2)}</p>
            <p>EMI Due ${emiToBePaid.toFixed(2)}</p>
            <p>EMI Paid In Advance ${emiPaidInAdvance.toFixed(2)}</p>
            <hr>
        </div>
        <div class="report-section">
            <h3>Maintenance Cost for ${monthsPaid} Months To-Date</h3>
            <p>Vehicle Cost ${vehicleCostToDate.toFixed(2)}</p>
            <p>Fuel Cost ${totalFuelCostPaid.toFixed(2)}</p>
            <p>Service Maintenance ${totalServiceMaintenancePaid.toFixed(2)}</p>
            <p>Other Maintenance & Repair ${otherMaintenance.toFixed(2)}</p>
            <p>Total Expense To-Date ${totalExpensePaid.toFixed(2)}</p>
            <hr>
        </div>
        <div class="report-section">
            <h3>Maintenance Cost for ${ownershipPeriodInYears.toFixed(2)} Years</h3>
            <p>Vehicle Cost ${vehicleCost.toFixed(2)}</p>
            <p>Fuel Cost ${totalFuelCost.toFixed(2)}</p>
            <p>Service Maintenance ${totalServiceMaintenance.toFixed(2)}</p>
            <p>Other Maintenance & Repair ${otherMaintenance.toFixed(2)}</p>
            <p>Total Expense for Ownership Period ${totalExpense.toFixed(2)}</p>
            <hr>
        </div>
        <div class="report-section">
            <h3>Vehicle Resale Value</h3>
            <p>Current Resale Value ${resaleValue.toFixed(2)}</p>
        </div>
    `;
    document.getElementById("expenseReport").innerHTML = reportHTML;
    document.getElementById("expenseReport").style.display = 'block';

    Chart.register(ChartDataLabels);

    let chartToDate = null;
    let chartOwnership = null;

    function createBarChart(ctx, labels, data, chartLabel, maxYValueRounded) {
        const colors = ['#79b5c9', '#cccccc'];
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: data,
                    backgroundColor: labels.map((_, index) => colors[index % colors.length]),
                    borderColor: '#ccc',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: '#2c3e50',
                        font: { size: 12, weight: 'bold' },
                        formatter: (value) => value.toLocaleString()
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: maxYValueRounded,
                        ticks: {
                            callback: (value) => value.toLocaleString(),
                        },
                    }
                }
            }
        });
    }

    function calculateMaxYValue(dataArray) {
        const maxValue = Math.max(...dataArray);
        return Math.ceil(maxValue / 100000) * 100000;
    }

    function generateCharts() {
        const maxYValue = calculateMaxYValue([
            vehicleCostToDate, totalFuelCostPaid, totalServiceMaintenancePaid, otherMaintenance,
            vehicleCost, totalFuelCost, totalServiceMaintenance
        ]);

        if (chartToDate) chartToDate.destroy();
        if (chartOwnership) chartOwnership.destroy();

        const ctxToDate = document.getElementById('expenseChartToDate').getContext('2d');
        chartToDate = createBarChart(
            ctxToDate,
            ['Vehicle Cost', 'Fuel Cost Paid', 'Service Maintenance Paid', 'Other Maintenance'],
            [vehicleCostToDate, totalFuelCostPaid, totalServiceMaintenancePaid, otherMaintenance],
            'Expense To-Date',
            maxYValue
        );

        const ctxOwnership = document.getElementById('expenseChartOwnership').getContext('2d');
        chartOwnership = createBarChart(
            ctxOwnership,
            ['Vehicle Cost', 'Fuel Cost Total', 'Service Maintenance Total', 'Other Maintenance'],
            [vehicleCost, totalFuelCost, totalServiceMaintenance, otherMaintenance],
            'Expense Ownership Period',
            maxYValue
        );
    }

    generateCharts();
}

function saveProfile() {
    const profile = {
        model: document.getElementById("model").value,
        downPayment: document.getElementById("downPayment").value,
        principal: document.getElementById("principal").value,
        interestRate: document.getElementById("interestRate").value,
        termMonths: document.getElementById("termMonths").value,
        emiPaidInAdvance: document.getElementById("emiPaidInAdvance").value,
        ownershipPeriod: document.getElementById("ownershipPeriod").value,
        distance: document.getElementById("distance").value,
        mileage: document.getElementById("mileage").value,
        fuelCost: document.getElementById("fuelCost").value,
        serviceMaintenance: document.getElementById("serviceMaintenance").value,
        otherMaintenance: document.getElementById("otherMaintenance").value,
        monthsPaid: document.getElementById("monthsPaid").value,
        resaleValue: document.getElementById("resaleValue").value
    };

    const profiles = JSON.parse(localStorage.getItem("vehicleProfiles")) || [];
    profiles.push(profile);
    localStorage.setItem("vehicleProfiles", JSON.stringify(profiles));
    updateProfileSelector();
}

function loadProfile() {
    const selectedIndex = document.getElementById("profileSelector").value;
    if (!selectedIndex) {
        alert("Please select a profile.");
        return;
    }

    const profiles = JSON.parse(localStorage.getItem("vehicleProfiles")) || [];
    const profile = profiles[selectedIndex];

    document.getElementById("model").value = profile.model;
    document.getElementById("downPayment").value = profile.downPayment;
    document.getElementById("principal").value = profile.principal;
    document.getElementById("interestRate").value = profile.interestRate;
    document.getElementById("termMonths").value = profile.termMonths;
    document.getElementById("emiPaidInAdvance").value = profile.emiPaidInAdvance;
    document.getElementById("ownershipPeriod").value = profile.ownershipPeriod;
    document.getElementById("distance").value = profile.distance;
    document.getElementById("mileage").value = profile.mileage;
    document.getElementById("fuelCost").value = profile.fuelCost;
    document.getElementById("serviceMaintenance").value = profile.serviceMaintenance;
    document.getElementById("otherMaintenance").value = profile.otherMaintenance;
    document.getElementById("monthsPaid").value = profile.monthsPaid;
    document.getElementById("resaleValue").value = profile.resaleValue;

    generateReport();
}

function deleteProfile() {
    const selectedIndex = document.getElementById("profileSelector").value;
    if (!selectedIndex) {
        alert("Please select a profile.");
        return;
    }

    const profiles = JSON.parse(localStorage.getItem("vehicleProfiles")) || [];
    profiles.splice(selectedIndex, 1);
    localStorage.setItem("vehicleProfiles", JSON.stringify(profiles));
    updateProfileSelector();
}

function updateProfileSelector() {
    const profiles = JSON.parse(localStorage.getItem("vehicleProfiles")) || [];
    const profileSelector = document.getElementById("profileSelector");
    profileSelector.innerHTML = '<option value="">Select a Profile</option>';
    profiles.forEach((profile, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = profile.model || `Profile ${index + 1}`;
        profileSelector.appendChild(option);
    });
}

function loadLastSavedData() {
    if (localStorage.getItem('model')) {
        document.getElementById('model').value = localStorage.getItem('model');
        document.getElementById('downPayment').value = localStorage.getItem('downPayment');
        document.getElementById('principal').value = localStorage.getItem('principal');
        document.getElementById('interestRate').value = localStorage.getItem('interestRate');
        document.getElementById('termMonths').value = localStorage.getItem('termMonths');
        document.getElementById('emiPaidInAdvance').value = localStorage.getItem('emiPaidInAdvance');
        document.getElementById('ownershipPeriod').value = localStorage.getItem('ownershipPeriod');
        document.getElementById('distance').value = localStorage.getItem('distance');
        document.getElementById('mileage').value = localStorage.getItem('mileage');
        document.getElementById('fuelCost').value = localStorage.getItem('fuelCost');
        document.getElementById('serviceMaintenance').value = localStorage.getItem('serviceMaintenance');
        document.getElementById('otherMaintenance').value = localStorage.getItem('otherMaintenance');
        document.getElementById('monthsPaid').value = localStorage.getItem('monthsPaid');
        document.getElementById('resaleValue').value = localStorage.getItem('resaleValue');
    }
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `
            <p>${note}</p>
            <button onclick="deleteNote(${index})">Delete</button>
        `;
        notesList.appendChild(noteElement);
    });
}

function addNote() {
    const noteInput = document.getElementById('noteInput');
    const note = noteInput.value.trim();
    if (!note) {
        alert('Please enter a note.');
        return;
    }
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    noteInput.value = '';
    loadNotes();
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

// Tab 2 Initialization
updateProfileSelector();
loadNotes();
loadLastSavedData();

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

    document.getElementById('result').innerHTML = `Mileage ${mileage.toFixed(2)} km/L`;
});
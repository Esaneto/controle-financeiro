document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const tableBody = document.querySelector('#transaction-table tbody');
    const barberList = document.getElementById('barber-list');
    const chartCtx = document.getElementById('transaction-chart').getContext('2d');
    const totalEntradasEl = document.getElementById('total-entradas');
    const totalSaidasEl = document.getElementById('total-saidas');
    const saldoTotalEl = document.getElementById('saldo-total');
    const filterForm = document.getElementById('filter-form');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    const filterType = document.getElementById('filter-type');
    const filterBarber = document.getElementById('filter-barber');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let barbers = JSON.parse(localStorage.getItem('barbers')) || [];
    let filteredTransactions = transactions;

    let chart;

    barbers.forEach(barber => {
        const option = document.createElement('option');
        option.value = barber;
        barberList.appendChild(option);
    });

    updateTable();
    updateChart();
    updateTotals();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        const value = document.getElementById('value').value;
        const barber = document.getElementById('barber').value;
        const observation = document.getElementById('observation').value;

        if (!barbers.includes(barber)) {
            barbers.push(barber);
            const option = document.createElement('option');
            option.value = barber;
            barberList.appendChild(option);
            localStorage.setItem('barbers', JSON.stringify(barbers));
        }

        const transaction = { date, type, value: parseFloat(value), barber, observation };
        transactions.unshift(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        filteredTransactions = transactions;
        updateTable();
        updateChart();
        updateTotals();
    });

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilter();
    });

    function applyFilter() {
        const startDate = filterDateStart.value;
        const endDate = filterDateEnd.value;
        const type = filterType.value;
        const barber = filterBarber.value.toLowerCase();

        filteredTransactions = transactions.filter(transaction => {
            const date = transaction.date;
            const transactionType = transaction.type;
            const transactionBarber = transaction.barber.toLowerCase();
            const isDateInRange = (!startDate || date >= startDate) && (!endDate || date <= endDate);
            const isTypeMatch = !type || transactionType === type;
            const isBarberMatch = !barber || transactionBarber.includes(barber);

            return isDateInRange && isTypeMatch && isBarberMatch;
        });

        updateTable();
        updateChart();
        updateTotals();
    }

    function updateTable() {
        tableBody.innerHTML = '';
        filteredTransactions.forEach((transaction, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td class="${transaction.type}">${transaction.type}</td>
                <td class="${transaction.type}">${transaction.value.toFixed(2)}</td>
                <td>${transaction.barber}</td>
                <td>${transaction.observation}</td>
                <td><span class="delete-icon" data-index="${index}">&times;</span></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                const transactionToDelete = filteredTransactions[index];
                transactions = transactions.filter(transaction => transaction !== transactionToDelete);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                filteredTransactions = transactions;
                updateTable();
                updateChart();
                updateTotals();
            });
        });
    }

    function updateTotals() {
        const totalEntradas = filteredTransactions
            .filter(t => t.type === 'entrada')
            .reduce((acc, t) => acc + t.value, 0);

        const totalSaidas = filteredTransactions
            .filter(t => t.type === 'saida')
            .reduce((acc, t) => acc + t.value, 0);

        const saldoTotal = totalEntradas - totalSaidas;

        totalEntradasEl.textContent = totalEntradas.toFixed(2);
        totalSaidasEl.textContent = totalSaidas.toFixed(2);
        saldoTotalEl.textContent = saldoTotal.toFixed(2);
    }

    function updateChart() {
        const data = filteredTransactions.reduce((acc, transaction) => {
            const month = new Date(transaction.date).getMonth();
            const type = transaction.type === 'entrada' ? 'income' : 'expense';
            acc[type][month] += transaction.value;
            return acc;
        }, {
            income: Array(12).fill(0),
            expense: Array(12).fill(0)
        });

        const chartData = {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Entradas',
                    data: data.income,
                    backgroundColor: 'rgba(0, 128, 0, 0.5)',
                    borderColor: 'rgba(0, 128, 0, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Saídas',
                    data: data.expense,
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                    borderColor: 'rgba(255, 0, 0, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Saldo',
                    data: data.income.map((income, index) => income - data.expense[index]),
                    backgroundColor: 'rgba(0, 0, 255, 0.5)',
                    borderColor: 'rgba(0, 0, 255, 1)',
                    borderWidth: 1
                }
            ]
        };

        if (chart) {
            chart.data = chartData;
            chart.update();
        } else {
            chart = new Chart(chartCtx, {
                type: 'bar',
                data: chartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10000
                        }
                    }
                }
            });
        }
    }
});
if(localStorage.date) {
    document.getElementById('date').value = localStorage.date;}
    if(localStorage.value) {
    document.getElementById('value').value = localStorage.value;}
    if(localStorage.barber) {
    document.getElementById('barber').value = localStorage.barber;}
    if(localStorage.observation) {
    document.getElementById('observation').value = localStorage.observation;}
    var savedate = function() {
        var date = document.getElementById('date').value;
        var value = document.getElementById('value').value;
        var barber = document.getElementById('barber').value;
        var observation = document.getElementById('observation').value;
        localStorage.setItem('date',date);
        localStorage.setItem('value',value);
        localStorage.setItem('barber',barber);
        localStorage.setItem('observation',observation);
    }
    document.onchange = savedate;
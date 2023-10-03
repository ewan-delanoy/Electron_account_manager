function populateTable(rows, type) {
    const table = document.getElementById(type)

    rows.forEach(row => {
        const tr = document.createElement('tr')

        const th = document.createElement('th')
        th.scope = 'row'
        th.textContent = row.id

        const tdTitle = document.createElement('td')
        tdTitle.textContent = row.title

        const tdPrice = document.createElement('td')
        tdPrice.textContent = row.price + ' €'

        const tdButtons = document.createElement('td')

        const editBtn = document.createElement('button')
        editBtn.textContent = 'Modif.'
        editBtn.classList.add('btn', 'btn-outline-warning', 'mx-2')

        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = 'Suppr.'
        deleteBtn.classList.add('btn', 'btn-outline-danger', 'mx-2')

        tdButtons.append(editBtn, deleteBtn)

        tr.append(th, tdTitle, tdPrice, tdButtons)

        table.appendChild(tr)
    })
}

function updateBalance(balance) {
    const divBalance = document.getElementById('balance');
    divBalance.classList.remove('bg-success','bg-warning','bg-danger');
    divBalance.textContent = balance + '€'; 
    const classToAdd = balance >0 ? 'bg-success' : balance <0 ? 'bg-danger' : 'bg-warning' ;
    divBalance.classList.add(classToAdd);

}

window.ipcRenderer.onceInitData(handleInitData)

function handleInitData(e, accountData) {
    const incomes = accountData.filter(d => d.type === 'income');
    populateTable(incomes, 'income');
    const expenses = accountData.filter(d => d.type === 'expense');
    populateTable(expenses, 'expense');

    const totalIncome= incomes.reduce( (accu,item) => {accu+=item.price;return accu;},0);
    const totalExpense= expenses.reduce( (accu,item) => {accu+=item.price;return accu;},0);
    const balance = totalIncome - totalExpense;
    updateBalance(balance);
}
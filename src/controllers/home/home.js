const addBtns =  document.querySelectorAll('.btn-add');
addBtns.forEach(
    btn => {
        const type = btn.dataset.type;
        btn.addEventListener('click', (e) => {
            console.log("Main display 4 : Entering event listener for add buttons in home.js");
            window.ipcRenderer.askOpenNewAccountTypeWindow(type)
       });
    }
)


/////////////////////////// UTILS FCTS ///////////////////////////////////////
function populateTable(rows, type) {
    const table = document.getElementById(type)
    rows.forEach(row => {
        const tr = _generateRow(row);
        table.appendChild(tr);
    })
}

function updateBalance(accountData) {
    const incomes = accountData.filter(d => d.type === 'income');
    const expenses = accountData.filter(d => d.type === 'expense');
    const totalIncome= incomes.reduce( (accu,item) => {accu+=item.price;return accu;},0);
    const totalExpense= expenses.reduce( (accu,item) => {accu+=item.price;return accu;},0);
    const balance = totalIncome - totalExpense;
    const divBalance = document.getElementById('balance');
    divBalance.classList.remove('bg-success','bg-warning','bg-danger');
    divBalance.textContent = balance + '€'; 
    const classToAdd = balance >0 ? 'bg-success' : balance <0 ? 'bg-danger' : 'bg-warning' ;
    divBalance.classList.add(classToAdd);

}
/////////////////////////// IPC RENDERER EVENTS ///////////////////////////////////////
window.ipcRenderer.onceInitData(handleInitData)

function handleInitData(e, accountData) {
    console.log("Main display 3 : Entering handleInitData in home.js");
    const incomes = accountData.filter(d => d.type === 'income');
    populateTable(incomes, 'income');
    const expenses = accountData.filter(d => d.type === 'expense');
    populateTable(expenses, 'expense');
    updateBalance(accountData);
}

function _generateRow(accountElement) {
    const tr = document.createElement('tr')

        const th = document.createElement('th')
        th.scope = 'row'
        th.textContent = accountElement.id

        const tdTitle = document.createElement('td')
        tdTitle.textContent = accountElement.title

        const tdPrice = document.createElement('td')
        tdPrice.textContent = accountElement.price + ' €'

        const tdButtons = document.createElement('td')

        const editBtn = document.createElement('button')
        editBtn.textContent = 'Modif.'
        editBtn.classList.add('btn', 'btn-outline-warning', 'mx-2')

        editBtn.addEventListener('click', () => {
            window.ipcRenderer.askOpenEditAccountTypeWindow(accountElement.id);
            window.ipcRenderer.onAccountTypeEdited((e,
            res)=>{
                tdTitle.textContent = res.editedAccountType.title;
                tdPrice.textContent = res.editedAccountType.price + ' €';
                updateBalance(res.data);
            });
        })

        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = 'Suppr.'
        deleteBtn.classList.add('btn', 'btn-outline-danger', 'mx-2')

        deleteBtn.addEventListener('click', () => {
            window.ipcRenderer.invokeDeleteAccountItem(accountElement.id, (res) => {
                if(res.isDeleted) {
                    tr.remove();
                    updateBalance(res.data);
                }
            })
        })

        tdButtons.append(editBtn, deleteBtn)

        tr.append(th, tdTitle, tdPrice, tdButtons)

        return tr;
}

window.ipcRenderer.onAccountTypeAdded(handleAccountTypeAdded);

function handleAccountTypeAdded(e, accountData) {
    console.log("Main display 6 : Entering handleInitData in home.js");
    // J'ajoute dans le bon tableau la nouvelle valeur
    const newAccountType = accountData[accountData.length - 1];

    const table = document.getElementById(newAccountType.type);
    const tr = _generateRow(newAccountType);
    table.appendChild(tr);

    // Je mets à jour la balance
    updateBalance(accountData);
};
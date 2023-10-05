
const editItemForm = document.querySelector('#edit-item-form');
const editItemSubmit = editItemForm.querySelector('#edit-item-submit');

const labelInput = editItemForm.querySelector('#item-label');
const valueInput = editItemForm.querySelector('#item-value');

let storageForaccountItem;

const onInputCheckValue = () => {
    if (labelInput.value !== '' && !isNaN(valueInput.value) && valueInput.value > 0) {
        editItemSubmit.hidden = false;
    } else {
        editItemSubmit.hidden = true;
    }
};

const mainTitle = document.querySelector('#main-title');


labelInput.addEventListener('input', onInputCheckValue);
valueInput.addEventListener('input', onInputCheckValue);

window.ipcRenderer.onceInitData(handleInitData)

function handleInitData(e, accountItemToEdit) {
    // Pré-remplir les champs
    labelInput.value=accountItemToEdit.title;
    valueInput.value=accountItemToEdit.price;
    editItemSubmit.hidden = false;
    storageForaccountItem = accountItemToEdit;
}


editItemForm.addEventListener('submit', (e) => {
    console.log("Insert modal 1b : Entering event listener for item form in addAccountType.js");
    e.preventDefault();
    storageForaccountItem.title = labelInput.value;
    storageForaccountItem.price = valueInput.value;
    window.ipcRenderer.invokeEditAccountType(storageForaccountItem, (res) => {
        console.log("Insert modal 2b : Entering invoke method for item form in editAccountType.js");
        const divMsg = document.getElementById('response-message');
        divMsg.hidden = false;
        divMsg.textContent = res;
    });
})

/*




const onInputCheckValue = () => {
    if (labelInput.value !== '' && !isNaN(valueInput.value) && valueInput.value > 0) {
        newItemSubmit.hidden = false;
    } else {
        newItemSubmit.hidden = true;
    }
};

labelInput.addEventListener('input', onInputCheckValue);
valueInput.addEventListener('input', onInputCheckValue);

newItemForm.addEventListener('submit', (e) => {
    console.log("Insert modal 1 : Entering event listener for item form in addAccountType.js");
    e.preventDefault();
    const title = labelInput.value;
    const price = parseInt(valueInput.value);
    const accountType = { title, price };
    window.ipcRenderer.invokeNewAccountType(accountType, (res) => {
        console.log("Insert modal 2 : Entering invoke method for item form in addAccountType.js");
        newItemForm.reset();
        const divMsg = document.getElementById('response-message');
        divMsg.hidden = false;
        divMsg.textContent = res;
    });
})
*/
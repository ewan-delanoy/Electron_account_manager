const newItemForm = document.querySelector('#new-item-form');
const newItemSubmit = newItemForm.querySelector('#new-item-submit');

const labelInput = newItemForm.querySelector('#item-label');
const valueInput = newItemForm.querySelector('#item-value');

const mainTitle = document.querySelector('#main-title');

window.ipcRenderer.onceInitData((e,type) => {
    mainTitle.textContent = `Ajout d'une nouvelle ${type==='income'?'recette':'dépense'} !`;
})

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
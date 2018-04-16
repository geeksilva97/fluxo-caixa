const ipc = require('electron').ipcRenderer


let btnPronto, data = {}, messagesElement

messagesElement = document.querySelector('#messages')

btnPronto = document.querySelector('#btn-pronto')
btnPronto.addEventListener('click', function() {
	let fields = document.querySelectorAll('input');
	let hasError = false;
	for(let field of fields) {
		if(field.value.length === 0){
			hasError = true;
			break;
		}
		data[field.name] = field.value;
	} // end loop

	if(hasError) messagesElement.innerHTML = '* Preencha todos os campos!';

	messagesElement.innerHTML = 'Aguarde...'

	let response = ipc.sendSync('init-db', data)
	// if(response.status){
		
	// }

}, false)



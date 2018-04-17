const ipc = require('electron').ipcRenderer

 

let btnAddReceita = document.querySelector('#btn-add-receita');
btnAddReceita.addEventListener('click', function() {
	let campos = document.querySelectorAll('#form-receita input, #form-receita textarea');
	let data = {}, send = {};
	for(let campo of campos){
		data[campo.name] = campo.value;
	};

	const reply = ipc.sendSync('add-receita', {
		data: data
	});

	alert(reply);

	for(let campo of campos){
		campo.value = '';
	};

});


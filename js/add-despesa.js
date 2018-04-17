const ipc = require('electron').ipcRenderer

let selectCategoria = document.querySelector('select'), mapInfo = {};
let pInfoCat = document.querySelector('.info-categoria'), 
btnAddDespesa = document.querySelector('#btn-add-despesa');

// enviando de forma assícrona
ipc.send('listar-categorias', 'all');
ipc.on('categorias-response', function(event, categorias) {
	for(let categoria of categorias) {
		mapInfo[categoria.id] = categoria.observacao;
		selectCategoria.innerHTML += `<option value="${categoria.id}">${categoria.descricao}</option>`;
	}
});

selectCategoria.addEventListener('change', function() {
	if(mapInfo[this.value] === undefined) {
		pInfoCat.innerHTML = '';
		return;
	}
	pInfoCat.innerHTML = mapInfo[this.value];
});


btnAddDespesa.addEventListener('click', function() {
	let campos = document.querySelectorAll('#form-despesa input, #form-despesa select'),
	data = {}, response = '';
	for(let campo of campos) {
		data[campo.name] = campo.value;
	};

	// enviando requisição de inserção
	response = ipc.sendSync('inserir-despesa', data);
	alert(response);

	for(let campo of campos) {
		campo.value = '';
	};	
	pInfoCat.innerHTML = '';

});



/*
	id integer PRIMARY KEY AUTOINCREMENT,
      descricao text not null,
      valor real not null,
      data_lancamento datetime not null,
      data_gasto datetime not null,
      categoria_despesa_id integer not null
*/
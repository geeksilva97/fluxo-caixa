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

	// try {
	// 	let stmt = db.prepare("INSERT INTO receita (descricao, valor, observacao, data_lancamento) VALUES (?, ?, ?, ?);");
	// 	stmt.run(data['descricao-receita'], data['valor'], data['observacao'], data['data-recebimento']);
	// 	stmt.finalize();

	// 	document.querySelector('.data').innerHTML = 'Receita registrada';
	// } catch(e) {
	// 	document.querySelector('.data').innerHTML = 'Erro ao inserir: '+e;
	// }	

	

	for(let campo of campos){
		campo.value = '';
	};

});
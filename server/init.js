var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database(':memory:');
var db = new sqlite3.Database('./database.cerbasi');
 
db.serialize(function() {
  db.run(`CREATE TABLE usuario (
  	id integer PRIMARY KEY AUTOINCREMENT,
  	nome text NOT NULL,
  	email text )
  `);

  db.run(`CREATE TABLE categoria_despesa (
  	id integer PRIMARY KEY AUTOINCREMENT,
  	descricao text NOT NULL,
  	observacao text NOT NULL )
  `);


  db.run(`CREATE TABLE tipo_despesa (
  	id integer PRIMARY KEY AUTOINCREMENT,
  	descricao text NOT NULL)
  `);

  db.run(`CREATE TABLE despesa (
  	id integer PRIMARY KEY AUTOINCREMENT,
  	descricao text not null,
  	valor real not null,
  	data_lancamento datetime not null,
  	data_gasto datetime not null,
  	categoria_despesa_id integer not null)
  `);

  db.run(`CREATE TABLE receita (
  	id integer PRIMARY KEY AUTOINCREMENT,
  	descricao text not null,
  	valor real not null,
  	observacao text,
  	data_lancamento datetime not null,
  	data_recebimento datetime)
  `);
 
  // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  // for (var i = 0; i < 10; i++) {
  //     stmt.run("Ipsum " + i);
  // }
  // stmt.finalize();
 
  // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
  //     console.log(row.id + ": " + row.info);
  // });
});
 
db.close();
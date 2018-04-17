const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')

// Menu personalizado
const Menu = electron.Menu

// IPC Main
const ipc = electron.ipcMain

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./cerbasi.db');

// WebContents
const webContents = electron.webContents



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Cria o banco de dados
ipc.on('init-db', function(event, data) {
  let stmt;
  let categorias = [
    {descricao: 'Habitação', observacao: 'Contas de água, luz, telefone e gás, aluguel ou prestação da moradia, condomínio IPTU e taxas municipais, telefones fixos, telefones celulares, internet, TV por assinatura, supermercado, feira, padaria, empregados e afins'},
    {descricao: 'Saúde', observacao: 'Plano de saúde, tratamentos, medicamentos, consultas médicas, terapeutas e gastos com dentista/ortodontista.'},
    {descricao: 'Transporte', observacao: 'Prestação ou aluguel do automóvel, estacionamentos, IPVA, seguro, combustível, lavagens, multas, táxi, ônibus, trem e afins.'},
    {descricao: 'Pessoais', observacao: 'Higiene pessoal, cabelereiro, cosméticos, vestuário, academia, esportes, tratamentos estéticos, mesadas e afins.'},
    {descricao: 'Educação', observacao: 'Escola, faculdade, cursos, material escolar e uniformes.'},
    {descricao: 'Lazer', observacao: 'Restaurantes, cafés, bares, boates, livraria, jornais, revistas, acessórios, videogames, viagens, passagens, hospedagens, passeios e similares.'},    
    {descricao: 'Outras Despesas', observacao: 'Tarifa de bancos, anuidades de cartão de crédito, pensões, gorjetas, caixinhas, doações, dízimos e afins.'},    
  ];

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
  });

  // Inserindo dados do usuário
  stmt = db.prepare("INSERT INTO usuario (nome, email) VALUES (?, ?)")
  stmt.run(data.nome, data.email)
  stmt.finalize()

  // Inserindo categorias
  stmt = db.prepare("INSERT INTO categoria_despesa (descricao, observacao) VALUES (?, ?)");
  for(let cat of categorias){
    stmt.run(cat.descricao, cat.observacao)
  }
  stmt.finalize()

  // Inserindo tipos de despesa
  stmt = db.prepare("INSERT INTO tipo_despesa (descricao) VALUES (?), (?)")
  stmt.run('FIXA', 'EVENTUAL')
  stmt.finalize()

 
  // Encerrando uso do banco de dados.
  db.close();

  // retorna valor
  event.returnValue = {status: true};

  // Redirecoinando
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'teste.html'),
    protocol: 'file',
    slashes: true
  }));
})

// Insere um novo registro na tabela de receitas
ipc.on('add-receita', function(event, arg) {
 let stmt, receita;
 receita = arg.data;
 stmt = db.prepare("INSERT INTO receita (descricao, valor, observacao, data_lancamento, data_recebimento) VALUES (?, ?, ?, date('now'), ?)");
 stmt.run(receita['descricao-receita'], receita['valor'], receita['observacao'], receita['data-recebimento']);
 stmt.finalize();

 db.close();


 event.returnValue = 'Registrado com sucesso!';
})

// Busca lista de categorias
ipc.on('listar-categorias', function(event, arg) {
  let categorias = [];
  db.all("SELECT * FROM categoria_despesa", function(err, rows) {
    if(err){
      console.log(err);
      return;
    }
    event.sender.send('categorias-response', rows);
  });

  // db.close();
});

// Inserindo despesa no banco de dados
ipc.on('inserir-despesa', function(event, despesa) {
  let stmt;
  stmt = db.prepare("INSERT INTO despesa (descricao, valor, data_lancamento, data_gasto, categoria_despesa_id) VALUES (?, ?, datetime('now'), ?, ?)");
  stmt.run( despesa['descricao-despesa'], despesa['valor'], despesa['data-despesa'], despesa['categoria-despesa'] );
  stmt.finalize();

  event.returnValue = 'Despesa inserida com sucesso!';
});




// =============================================================================

function createWindow(fileStr, options){
  // Create browser window
  let win = new BrowserWindow(options)

  // and load the index.html of the app
  win.loadURL(url.format({
    pathname: path.join(__dirname, fileStr),
    protocol: 'file',
    slashes: true
  }));

  // Open the DevTools
  win.webContents.openDevTools()

  win.on('close', function(){
    win = null
  })

  return win
}


function cadastrarReceita() {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'pages/receita.html'),
    protocol: 'file',
    slashes: true
  }));
}

function cadastrarDespesa() {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'pages/despesa.html'),
    protocol: 'file',
    slashes: true
  }));
}




app.on('ready', () => {
  let page = 'index.html';
  let template = [
    {
      label: 'Cadastro',
      submenu: [
        {
          label: 'Receita',
          click: cadastrarReceita
        },
        {
          label: 'Despesa',
          click: cadastrarDespesa
        }
      ]
    }
  ];

   mainWindow = createWindow(page, {
    width: 800,
    height: 600,
    title: 'Cerbasi'
  })

  // Verificando se á foi configurado
  let db = new sqlite3.Database('./cerbasi.db');
  db.get("SELECT * FROM usuario WHERE id = ?", [1], (err, row) => {
    if(err){
      return console.error(err.message);
    }

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'pages/inicio.html'),
      protocol: 'file',
      slashes: true
    }));

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

  });  

  db.close();
})









// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})



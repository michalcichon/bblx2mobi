var fs = require('fs'),
	sqlite3 = require("sqlite3").verbose(),
	bblxFilename = process.argv[2],
	lang = process.argv[3],
	db = null;

var books = new Array(
	'',
	'Księga Rodzaju', 
	'Księga Wyjścia', 
	'Księga Kapłańska', 
	'Księga Liczb', 
	'Księga Powtórzonego Prawa', 
	'Księga Jozuego', 
	'Księga Sędziów', 
	'Księga Rut', 
	'1 Księga Samuela', 
	'2 Księga Samuela', 
	'1 Księga Królewska', 
	'2 Księga Królewska', 
	'1 Księga Kronik', 
	'2 Księga Kronik', 
	'Księga Ezdrasza', 
	'Księga Nehemiasza', 
	'Księga Estery', 
	'Księga Hioba', 
	'Księga Psalmów', 
	'Księga Przysłów', 
	'Księga Koheleta', 
	'Pieśń nad pieśniami', 
	'Księga Izajasza', 
	'Księga Jeremiasza', 
	'Lamentacje Jeremiasza', 
	'Księga Ezechiela', 
	'Księga Daniela', 
	'Księga Ozeasza'
	'Księga Joela',
	'Księga Amosa',
	'Księga Abdiasza',
	'Księga Jonasza',
	'Księga Micheasza',
	'Księga Nahuma',
	'Księga Habakuka',
	'Księga Sofoniasza',
	'Księga Aggeusza',
	'Księga Zachariasza',
	'Księga Malachiasza'
	);

function checkArgs() {
	var usage = '* usage:\tnode bblx2mobi <filename> <lang>\n* example:\tnode bblx2mobi bible.bblx pl';
	if (bblxFilename === undefined) {
		console.log(usage);
		return false;
	} else if (! fs.existsSync(bblxFilename)) {
		console.log(usage + '\nERROR: File ' + bblxFilename + ' doesn\'t exist.');
		return false;
	} if (lang === undefined) {
		console.log(usage);
	}
	return true;
}

function title(text) {
	return '<h1>' + text + '</h1>';
}

function book(text) {
	return '<h2>' + text + '</h2>';
}

function chapter(text) {
	return '<h3>' + text + '</h3>';
}

if (!checkArgs()) {
	process.exit();
} else {
	db = new sqlite3.Database(bblxFilename);
	db.each('SELECT Book, Chapter, Verse, Scripture FROM Bible WHERE Book = 1 AND Chapter = 1', function(err, row) {
		console.log(row.Scripture);
	});
}

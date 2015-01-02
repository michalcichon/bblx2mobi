var fs = require('fs'),
	unzip = require('unzip'),
	sqlite3 = require("sqlite3").verbose(),
	mustache = require('mustache'),
	staticFiles = 'epub-static.zip',
	bblxFilename = process.argv[2],
	lang = process.argv[3],
	db = null,
	bookMinValue = 1,
	bookMaxValue = 1,//66,
	books = null,
	data = null;

var books_pl = new Array('','Księga Rodzaju','Księga Wyjścia','Księga Kapłańska','Księga Liczb','Księga Powtórzonego Prawa','Księga Jozuego','Księga Sędziów','Księga Rut','1 Księga Samuela',  '2 Księga Samuela','1 Księga Królewska','2 Księga Królewska','1 Księga Kronik','2 Księga Kronik','Księga Ezdrasza','Księga Nehemiasza','Księga Estery','Księga Hioba','Księga Psalmów','Księga Przysłów','Księga Koheleta','Pieśń nad pieśniami','Księga Izajasza','Księga Jeremiasza','Lamentacje Jeremiasza','Księga Ezechiela','Księga Daniela','Księga Ozeasza','Księga Joela','Księga Amosa','Księga Abdiasza','Księga Jonasza','Księga Micheasza','Księga Nahuma','Księga Habakuka','Księga Sofoniasza','Księga Aggeusza','Księga Zachariasza','Księga Malachiasza','Ewangelia wg. św. Mateusza','Ewangelia wg. św. Marka','Ewangelia wg. św. Łukasza','Ewangelia wg. św. Jana','Dzieje Apostolskie','List do Rzymian','1 List do Koryntian','2 List do Koryntian','List do Galatów','List do Efezjan','List do Filipian','List do Kolosan','1 List do Tesaloniczan','2 List do Tesaloniczan','1 List do Tymoteusza','2 List do Tymoteusza','List do Tytusa','List do Filemona','List do Hebrajczyków','List św. Jakuba','1 List św. Piotra','2 List św. Piotra','1 List św. Jana','2 List św. Jana','3 List św. Jana','List św. Judy','Apokalipsa św. Jana'),
	books_en = new Array('','Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'),
	configs = {
		'pl' : {
			'title': 'Pismo Święte',
			'coverImage': 'cover.jpg',
			'contents': 'Spis treści',
			'creators': 'Bóg',
			'creatorFileAs': 'BÓG',
			'pubId': 'com.github.michalcichon.bblx2mobi.pismoSwiete',
			'lang': 'pl-PL',
			'modified': '2012-01-18T12:47:00Z',
			'publisher': 'bblx2mobi',
			'contributor': 'Michal Cichon',
			'attributionURL': 'http://github.com/michalcichon/bblx2mobi'
		},
		'en' : {
			'title': 'Holy Bible',
			'coverImage': 'cover.jpg',
			'contents': 'Contents',
			'creators': 'God',
			'creatorFileAs': 'GOD',
			'pubId': 'com.github.michalcichon.bblx2mobi.pismoSwiete',
			'lang': 'en-US',
			'modified': '2012-01-18T12:47:00Z',
			'publisher': 'bblx2mobi',
			'contributor': 'Michal Cichon',
			'attributionURL': 'http://github.com/michalcichon/bblx2mobi'
		}
	};

function checkArgs() {
	var usage = '* usage:\tnode bblx2mobi <filename> <lang>\n* example:\tnode bblx2mobi bible.bblx pl';
	if (bblxFilename === undefined) {
		console.log(usage);
		return false;
	} else if (! fs.existsSync(bblxFilename)) {
		console.log(usage + '\nERROR: File ' + bblxFilename + ' doesn\'t exist.');
		return false;
	} else if (lang == 'pl') {
		books = books_pl;
	} else if (lang == 'en') {
		books = books_en;
	} else {
		console.log(usage);
		books = books_pl;
		lang = 'pl';
	}
	return true;
}

function printError(err) {
	console.log('ERROR: ', err);
	process.exit();
}

function formatNumber_100(i) {
	if (i<10)
		i = "00" + i;
	else if (i<100)
		i = "0" + i;
	return i;
}

function formatNumber_1000(i) {
	if (i<10)
		i = "000" + i;
	else if (i<100)
		i = "00" + i;
	else if (i<1000)
		i = "000" + i;
	return i;
}

function generateToc(i, title) {
	var i = formatNumber_100(i);
	return '<li class="toc-Chapter-rw" id="toc-chapter_'+i+'"><a href="chapter_'+i+'.xhtml">'+title+'</a></li>';
}

function prepareCover(tempDir) {
	fs.readFile('templates/cover.xhtml.mst', 'utf8', function(err,data) {
		if(err) {
			printError(err);
		}

		var rendered = mustache.render(data, {title: configs[lang].title, coverImage: configs[lang].coverImage});
		fs.writeFile(tempDir + '/OPS/cover.xhtml', rendered, function(err) {
			if(err) {
				printError(err);
			}
		});
	});
}

function prepareToc() {

}

function prepareChapters() {

}

function preparePackage() {

}


function generateEpub(data) {
	var tempDir = bblxFilename + '.temp';
	fs.createReadStream('epub-static.zip').pipe(unzip.Extract({ path: tempDir }));
	prepareCover(tempDir);
}

if (!checkArgs()) {
	process.exit();
} else {
	db = new sqlite3.Database(bblxFilename);
	data = new Array();
	db.each('SELECT Book, Chapter, Verse, Scripture FROM Bible WHERE Book BETWEEN $bookMinValue AND $bookMaxValue', {$bookMinValue: bookMinValue, $bookMaxValue: bookMaxValue}, function(err, row) {

		var book = row.Book,
			chapter = row.Chapter,
			verse = row.Verse,
			scripture = row.Scripture;

		if(data[book] === undefined) {
			data[book] = {title: books[book], book: book};
		}

		if(data[book].chapters === undefined) {
			data[book].chapters = [];
		}

		if(data[book].chapters[chapter] === undefined) {
			data[book].chapters[chapter] = [];
		}

		data[book].chapters[chapter][verse] = scripture;

	}, function(err, rows) {
		generateEpub(data);
	});
}


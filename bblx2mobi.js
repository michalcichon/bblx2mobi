var fs = require('fs'),
	unzip = require('unzip'),
	sqlite3 = require("sqlite3").verbose(),
	mustache = require('mustache'),
	staticFiles = 'epub-static.zip',
	bblxFilename = process.argv[2],
	lang = process.argv[3],
	defaultLang = 'pl',
	db = null,
	bookMinValue = 1,
	bookMaxValue = 5,//66,
	books = null,
	data = null;

var books_pl = new Array('','Księga Rodzaju','Księga Wyjścia','Księga Kapłańska','Księga Liczb','Księga Powtórzonego Prawa','Księga Jozuego','Księga Sędziów','Księga Rut','1 Księga Samuela',  '2 Księga Samuela','1 Księga Królewska','2 Księga Królewska','1 Księga Kronik','2 Księga Kronik','Księga Ezdrasza','Księga Nehemiasza','Księga Estery','Księga Hioba','Księga Psalmów','Księga Przysłów','Księga Koheleta','Pieśń nad pieśniami','Księga Izajasza','Księga Jeremiasza','Lamentacje Jeremiasza','Księga Ezechiela','Księga Daniela','Księga Ozeasza','Księga Joela','Księga Amosa','Księga Abdiasza','Księga Jonasza','Księga Micheasza','Księga Nahuma','Księga Habakuka','Księga Sofoniasza','Księga Aggeusza','Księga Zachariasza','Księga Malachiasza','Ewangelia wg. św. Mateusza','Ewangelia wg. św. Marka','Ewangelia wg. św. Łukasza','Ewangelia wg. św. Jana','Dzieje Apostolskie','List do Rzymian','1 List do Koryntian','2 List do Koryntian','List do Galatów','List do Efezjan','List do Filipian','List do Kolosan','1 List do Tesaloniczan','2 List do Tesaloniczan','1 List do Tymoteusza','2 List do Tymoteusza','List do Tytusa','List do Filemona','List do Hebrajczyków','List św. Jakuba','1 List św. Piotra','2 List św. Piotra','1 List św. Jana','2 List św. Jana','3 List św. Jana','List św. Judy','Apokalipsa św. Jana'),
	books_en = new Array('','Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'),
	configs = {
		'pl' : {
			'title': 'Pismo Święte',
			'coverImage': 'cover.jpg',
			'contents': 'Spis treści',
			'creator': 'Bóg',
			'creatorFileAs': 'BÓG',
			'pubId': 'com.github.michalcichon.bblx2mobi.pismoSwiete',
			'lang': 'pl-PL',
			'modified': new Date().toISOString(),
			'publisher': 'bblx2mobi',
			'contributor': 'Michal Cichon',
			'attributionURL': 'http://github.com/michalcichon/bblx2mobi'
		},
		'en' : {
			'title': 'Holy Bible',
			'coverImage': 'cover.jpg',
			'contents': 'Contents',
			'creator': 'God',
			'creatorFileAs': 'GOD',
			'pubId': 'com.github.michalcichon.bblx2mobi.holyBible',
			'lang': 'en-US',
			'modified': new Date().toISOString(),
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
	} else if (lang) {
		var availableLangs = '';
		for (var config in configs)
			availableLangs += config + ' ';
		console.log(usage);
		console.log('Available languages: ' + availableLangs);
		return false;
	} else {
		console.log(usage);
		console.log('Setting default language: ' + defaultLang);
		books = books_pl;
		lang = defaultLang;
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

function generateToc(i, title) {
	var i = formatNumber_100(i);
	return '<li class="toc-Chapter-rw" id="toc-chapter_'+i+'"><a href="chapter_'+i+'.xhtml">'+title+'</a></li>';
}

function prepareCover(tempDir) {
	var tpl = fs.readFileSync('templates/cover.xhtml.mst', 'utf8');

	if (tpl) {
		var rendered = mustache.render(tpl, {title: configs[lang].title, coverImage: configs[lang].coverImage});
		try {
			fs.writeFileSync(tempDir + '/OPS/cover.xhtml', rendered);
			fs.writeFileSync(tempDir + '/OPS/images/' + configs[lang].coverImage, fs.readFileSync('images/cover_' + lang + '.jpg'));
		} catch (err) {
			printError(err);
		}
	}
}

function prepareToc(tempDir) {
	var toc = {
			chapters: [],
			title: configs[lang].title,
			contents: configs[lang].contents
		},
		tocXHTMLTemplate = fs.readFileSync('templates/toc.xhtml.mst', 'utf8'),
		tocNCXTemplate = fs.readFileSync('templates/toc.ncx.mst', 'utf8');

	for(var i=1, len=data.length; i<len; ++i) {
		toc.chapters.push({ 
			title: data[i].title, 
			id: 'toc-chapter_' + formatNumber_100(data[i].book), 
			filename: 'chapter_'+formatNumber_100(data[i].book)+'.xhtml',
			navpoint: 'navpoint' + i,
			playOrder: i
		});
	}

	if (tocXHTMLTemplate && tocNCXTemplate) {
		var renderedXHTML = mustache.render(tocXHTMLTemplate, toc),
			renderedNCX = mustache.render(tocNCXTemplate, toc);

		try {
			fs.writeFileSync(tempDir + '/OPS/toc.xhtml', renderedXHTML);
			fs.writeFileSync(tempDir + '/OPS/toc.ncx', renderedNCX);
			console.log('Table of contents prepared.');
		} catch (err) {
			printError(err);
		}
	}
}

function generateContent(chapters) {
	var out = '';
	for (var i=1, len_i=chapters.length; i<len_i; ++i) {
		var chapter = chapters[i];
		for(var j=1, len_j=chapter.length; j<len_j; ++j) {
			var verse = chapter[j];
			
			if(verse) {
				verse = verse.replace('\\f6', '');
				verse = verse.replace(/"/g, '&quot;');
				verse = verse.replace('<', '&lt;');
				verse = verse.replace('>', '&gt;');
			}

			if(j == 1)
				out += '<p><div class="initial-letter">'+i+'</div>';
			out += '<sup>'+j+'</sup>' + verse;
		}
		out += '</p>';
	}

	return out;
}

function prepareBooks(tempDir) {
	console.log('Start preparing books...');
	var tpl = fs.readFileSync('templates/book.xhtml.mst', 'utf8');
	for (var i=1, len=data.length; i<len; ++i) {
		var chapter = {
			title: configs[lang].title,
			bookTitle: data[i].title,
			content: generateContent(data[i].chapters)
		};

		if (tpl) {
			var rendered = mustache.render(tpl, chapter),
				filename = 'chapter_' + formatNumber_100(i) + '.xhtml';

			try {
				fs.writeFileSync(tempDir + '/OPS/' + filename, rendered);
				console.log('Chapter ' + filename + ' prepared.');
			} catch (err) {
				printError(err);
			}
		}
	}
}

function preparePackage(tempDir) {
	console.log('Preparing package...');
	var tpl = fs.readFileSync('templates/package.opf.mst', 'utf8'),
		values = Object.create(configs[lang]);
	if(tpl) {
		values.chapters = [];
		for(var i=1, len=data.length; i<len; ++i) {
			var num = formatNumber_100(i);
			values.chapters.push({ id: 'xchapter_' + num, filename: 'chapter_' + num + '.xhtml' });
		}

		var rendered = mustache.render(tpl, values);
		try {
				fs.writeFileSync(tempDir + '/OPS/package.opf', rendered);
				console.log('Package package.opf prepred.');
			} catch (err) {
				printError(err);
			}
	}
}


function generateEpub(data) {
	console.log('Start generating epub...');
	var tempDir = bblxFilename + '.temp';
	fs.createReadStream('epub-static.zip')
		.pipe(unzip.Extract({ path: tempDir }))
		.on('error', function(err) {
			printError(err);
		})
		.on('close', function() {
			prepareCover(tempDir);
			prepareToc(tempDir);
			prepareBooks(tempDir);
			preparePackage(tempDir);		
		});
}

if (!checkArgs()) {
	process.exit();
} else {
	db = new sqlite3.Database(bblxFilename);
	data = new Array();
	console.log('Getting data...');
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


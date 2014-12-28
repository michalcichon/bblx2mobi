var fs = require('fs'),
	sqlite3 = require("sqlite3").verbose(),
	bblxFilename = process.argv[2],
	lang = process.argv[3],
	db = null;

var books = new Array(
	'',
	'Księga Rodzaju', //1
	'Księga Wyjścia', //2
	'Księga Kapłańska', //3
	'Księga Liczb', //4
	'Księga Powtórzonego Prawa', //5
	'Księga Jozuego', //6
	'Księga Sędziów', //7
	'Księga Rut', //8
	'1 Księga Samuela', //9 
	'2 Księga Samuela', //10
	'1 Księga Królewska', //11
	'2 Księga Królewska', //12
	'1 Księga Kronik', //13
	'2 Księga Kronik', //14
	'Księga Ezdrasza', //15
	'Księga Nehemiasza', //16
	'Księga Estery', //17
	'Księga Hioba', //18
	'Księga Psalmów', //19
	'Księga Przysłów', //20
	'Księga Koheleta', //21
	'Pieśń nad pieśniami', //22
	'Księga Izajasza', //23
	'Księga Jeremiasza', //24
	'Lamentacje Jeremiasza', //25
	'Księga Ezechiela', //26
	'Księga Daniela', //27
	'Księga Ozeasza', //28
	'Księga Joela', //29
	'Księga Amosa', //30
	'Księga Abdiasza', //31
	'Księga Jonasza', //32
	'Księga Micheasza', //33
	'Księga Nahuma', //34
	'Księga Habakuka', //35
	'Księga Sofoniasza', //36
	'Księga Aggeusza', //37
	'Księga Zachariasza', //38
	'Księga Malachiasza',  //39
	'Ewangelia wg. św. Mateusza', //40
	'Ewangelia wg. św. Marka', //41
	'Ewangelia wg. św. Łukasza', //42
	'Ewangelia wg. św. Jana', //43
	'Dzieje Apostolskie', //44
	'List do Rzymian', //45
	'1 List do Koryntian', //46
	'2 List do Koryntian', //47
	'List do Galatów', //48
	'List do Efezjan', //49
	'List do Filipian', //50
	'List do Kolosan', //51
	'1 List do Tesaloniczan', //52
	'2 List do Tesaloniczan', //53
	'1 List do Tymoteusza', //54
	'2 List do Tymoteusza', //55
	'List do Tytusa', //56
	'List do Filemona', //57
	'List do Hebrajczyków', //58
	'List św. Jakuba', //59
	'1 List św. Piotra', //60
	'2 List św. Piotra', //61
	'1 List św. Jana', //62
	'2 List św. Jana', //63
	'3 List św. Jana', //64
	'List św. Judy', //65
	'Apokalipsa św. Jana' //66
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

function chapter(title, content) {
	return '<?xml version="1.0" encoding="UTF-8"?>\
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">\
<head>\
<title>\
Pismo Święte</title><link rel="stylesheet" href="css/stylesheet.css" type="text/css"/>\
<meta charset="utf-8"/>\
</head>\
<body>\
<section class="body-rw Chapter-rw" epub:type="bodymatter chapter">\
<header>\
<h1>'+title+'</h1></header>'+content+'\
</section></body></html>';
}

if (!checkArgs()) {
	process.exit();
} else {
	db = new sqlite3.Database(bblxFilename);
	
	for (var i=1, len=books.length-1; i<len; i++) {
		console.log(i, books.length);
		db.get('SELECT MAX(Chapter) as chapterCount, $id as iid FROM Bible WHERE Book = $id', {$id: i}, function(err, row_i) {
			if (err) {
				console.log('ERROR:', err);
				process.exit();
			}
			var chapterCount = row_i['chapterCount'],
			content = '';

			for(var j=1; j<chapterCount; j++) {
				console.log('dupa');
				content += '<p><span class="first-big-letter">' + j + '</span>';
				db.each('SELECT Book, Chapter, Verse, Scripture FROM Bible WHERE Book = ' + row_i.iid + ' AND Chapter = ' + j, function(err, row_j) {
					if (err) {
						console.log('ERROR:', err);
						process.exit();
					}
					content += row_j.Scripture + ' <sup>'+ (row_j.Verse) +'</sup>';
					console.log(row_j.Scripture);
				});
				content += '</p>';
			}

			var chap = chapter(books[i], content);
			fs.writeFile('pattern/chapter_' + formatNumber_100(row_i.iid) + '.xhtml', chap, function(err) {
				if(err) {
					console.log('ERROR:', err);
					process.exit();
				} else {
					console.log('Chapter ' + books[i] + ' saved.');
				}
			});


	});

	}
	// db.each('SELECT Book, Chapter, Verse, Scripture FROM Bible WHERE Book = 1 AND Chapter = 1', function(err, row) {
	// 	console.log(row.Scripture);
	// });
}


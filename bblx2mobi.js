var fs = require('fs'),
	sqlite3 = require("sqlite3").verbose(),
	bblxFilename = process.argv[2],
	lang = process.argv[3],
	db = null;

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

if (!checkArgs()) {
	process.exit();
} else {
	db = new sqlite3.Database(bblxFilename);
	db.each('SELECT Book, Chapter, Verse, Scripture FROM Bible WHERE Book = 1 AND Chapter = 1', function(err, row) {
		console.log(row.Scripture);
	});
}

# bblx2mobi

A tool to generate mobi and epub ebooks from e-Sword bblx files.

## Pre-requirements

* node.js
* npm install sqlite3
* npm install mustache
* npm install unzip
* npm install archiver --save
* npm install rimraf
* kindlegen available from PATH

## Usage

```
node bblx2mobi <fileame> <lang>
```

Example:

```
node bblx2mobi bible.bblx pl
```

## To do

* support generating apocrypha
* support comments
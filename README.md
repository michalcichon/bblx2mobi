# bblx2mobi

A tool to generate mobi and epub ebooks from e-Sword bblx files.

## Pre-requirements

* node.js -- version 0.10 or later
* kindlegen available from PATH

## Installing

```
npm install
```

After install all dependent libraries should be downloaded.

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
* fix encoding issues in some versions of bblx unicode files

## Dependencies

```
"dependencies": {
    "archiver": "~0.13.0",
    "mustache": "~1.0.0",
    "rimraf": "~2.2.8",
    "sqlite3": "~3.0.4",
    "unzip": "~0.1.11"
  }
```
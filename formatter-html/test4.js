const fs = require('fs');
const path = require('path');

const percorsoFile = process.argv[2];

if (!percorsoFile) {
    console.log('Uso: node estraiCssJs.js percorso/file.html');
    process.exit(1);
}

if (!fs.existsSync(percorsoFile)) {
    console.log('File non trovato: ' + percorsoFile);
    process.exit(1);
}

// legge file html
let html = fs.readFileSync(percorsoFile, 'utf8');

// TODO: gestire file con encoding diversi da utf8

// ----- estrattore css ---------
// trova i blocchi <style>...</style>
let regexStyle = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let pezziCss = [];
let match;

while ((match = regexStyle.exec(html)) !== null) {
    pezziCss.push(match[1].trim());
}

let css = pezziCss.join('\n\n');

// rimuove i blocchi style 
html = html.replace(regexStyle, '');

// -------- estrattore js --------------
// fix script esterni
let regexScript = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let pezziJs = [];

while ((match = regexScript.exec(html)) !== null) {
    let contenuto = match[1].trim();
    if (contenuto.length > 0) {
        pezziJs.push(contenuto);
    }
}

let js = pezziJs.join('\n\n');

html = html.replace(regexScript, '');

// FIX COLLEGAMENTI ESTERNI

if (css.length > 0) {
    let tagLink = '    <link rel="stylesheet" href="style.css">\n';
    html = html.replace('</head>', tagLink + '</head>');
}

if (js.length > 0) {
    let tagScript = '    <script src="script.js"></script>\n';
    html = html.replace('</body>', tagScript + '</body>');
}

// -------- Pulizia Righe Vuote ----------
html = html.replace(/\n{3,}/g, '\n\n');

// output folder
let cartellaOutput = path.join(path.dirname(percorsoFile), 'output');

if (!fs.existsSync(cartellaOutput)) {
    fs.mkdirSync(cartellaOutput);
}

fs.writeFileSync(path.join(cartellaOutput, 'index.html'), html);

if (css.length > 0) {
    fs.writeFileSync(path.join(cartellaOutput, 'style.css'), css);
}

if (js.length > 0) {
    fs.writeFileSync(path.join(cartellaOutput, 'script.js'), js);
}

// output
console.log('Estrazione completata');
console.log('Cartella output: ' + cartellaOutput);
console.log('Righe css estratte: ' + contaRighe(css));
console.log('Righe js estratte: ' + contaRighe(js));

if (css.length === 0) {
    console.log('Nessun css interno trovato, style.css non creato');
}

if (js.length === 0) {
    console.log('Nessun js interno trovato, script.js non creato');
}

function contaRighe(testo) {
    if (testo.length === 0) {
        return 0;
    }
    return testo.split('\n').length;
}
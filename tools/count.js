const fs = require('fs');
const path = require('path');

// Importar datos (Node.js environment)
const DATA = require('../js/data.js');

console.log('--- RECUENTO Y VALIDACIÓN DE DATOS ---');
let totalWords = 0;
let issues = [];

for (const [category, list] of Object.entries(DATA)) {
    console.log(`${category}: ${list.length} palabras`);
    totalWords += list.length;

    let uniqueWords = new Set();
    let duplicates = [];

    list.forEach(item => {
        let normalized = item.word.toLowerCase().trim();
        if (uniqueWords.has(normalized)) {
            duplicates.push(item.word);
        } else {
            uniqueWords.add(normalized);
        }

        if (!item.hints || !Array.isArray(item.hints)) {
            issues.push(`[${category}] ${item.word}: ERROR - No tiene array de pistas`);
        } else if (item.hints.length < 3) {
            issues.push(`[${category}] ${item.word}: Tiene ${item.hints.length} pista(s) (Se recomiendan 3)`);
        }
    });

    if (duplicates.length > 0) {
        issues.push(`[${category}] ⚠️ DUPLICADOS (${duplicates.length}): ${duplicates.join(', ')}`);
        // Adjust count to reflect unique words
        console.log(`${category}: ${list.length} registros (${uniqueWords.size} únicos)`);
    } else {
        console.log(`${category}: ${list.length} palabras (Sin duplicados)`);
    }

    // Update total with unique count? Or keep raw? Let's use unique for total.
    // totalWords += list.length; // Removing raw count
    totalWords += uniqueWords.size;
}

console.log('----------------------------');
console.log(`TOTAL GLOBAL: ${totalWords} palabras`);
console.log('----------------------------');

if (issues.length > 0) {
    console.log(`\n⚠️ SE ENCONTRARON ${issues.length} PALABRAS CON PROBLEMAS:`);
    issues.forEach(iss => console.log(iss));
} else {
    console.log('\n✅ TODAS las palabras tienen 3 o más pistas.');
}
console.log('----------------------------');

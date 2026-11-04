#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para eliminar console.log de archivos HTML
 * Mantiene la funcionalidad intacta eliminando solo las líneas de console.log
 */

class ConsoleLogRemover {
    constructor() {
        this.processedFiles = 0;
        this.removedLogs = 0;
    }

    /**
     * Busca todos los archivos HTML en un directorio recursivamente
     */
    findHtmlFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // Recursivamente buscar en subdirectorios
                this.findHtmlFiles(filePath, fileList);
            } else if (file.endsWith('.html')) {
                fileList.push(filePath);
            }
        });
        
        return fileList;
    }

    /**
     * Elimina console.log de una línea de código
     */
    removeConsoleLogFromLine(line) {
        const trimmedLine = line.trim();
        
        // Lista de console.log que NO deben eliminarse (importantes para debugging)
        const preservePatterns = [
            // Logs de carga del modelo 3D
            /Cargando modelo:/,
            // Logs de estado de variables importantes
            /Variables:/,
            /Materiales:/,
            /estado:/,
            // Logs de configuración de tarjetas
            /Setting up card/,
            /configured correctly/,
            /ready for interaction/,
            // Logs de inicialización importante
            /initialized/,
            /completamente funcional/,
            // Logs de debugging crítico
            /DEBUG:/,
            /FUNCIONA/,
            // Logs de dimensiones y escalas (importantes para el 3D)
            /Dimensiones/,
            /Factores de escala/,
            /visibility changed/,
            /state changed/
        ];

        // Si contiene algún patrón que debe preservarse, mantener la línea
        for (const pattern of preservePatterns) {
            if (pattern.test(trimmedLine)) {
                return line; // Mantener la línea
            }
        }

        // Patrones para detectar console.log que SÍ se pueden eliminar
        const removePatterns = [
            // console.log simples con mensajes genéricos
            /^\s*console\.log\s*\(\s*["'`][^"'`]*["'`]\s*\)\s*;?\s*$/,
            // console.log con variables simples pero no críticas
            /^\s*console\.log\s*\(\s*["'`].*Message received.*["'`]/,
            /^\s*console\.log\s*\(\s*["'`].*Received message.*["'`]/,
            /^\s*console\.log\s*\(\s*["'`].*Sent.*["'`]/,
            /^\s*console\.log\s*\(\s*["'`].*Error.*["'`]/,
            // console.error, console.warn genéricos
            /^\s*console\.(error|warn)\s*\(\s*["'`].*Error.*["'`]/,
            /^\s*console\.(error|warn)\s*\(\s*["'`].*sending.*["'`]/
        ];

        // Si la línea coincide con algún patrón de eliminación, eliminarla
        for (const pattern of removePatterns) {
            if (pattern.test(line)) {
                return null; // Marcar para eliminación
            }
        }

        return line; // Mantener la línea por defecto
    }

    /**
     * Procesa un archivo HTML eliminando console.log
     */
    processHtmlFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const originalLineCount = lines.length;
            let removedFromThisFile = 0;

            // Procesar línea por línea
            const processedLines = [];
            let inScriptTag = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();

                // Detectar si estamos dentro de un tag <script>
                if (trimmedLine.includes('<script')) {
                    inScriptTag = true;
                }
                if (trimmedLine.includes('</script>')) {
                    inScriptTag = false;
                    processedLines.push(line);
                    continue;
                }

                // Solo procesar console.log si estamos dentro de un script tag
                if (inScriptTag) {
                    const processedLine = this.removeConsoleLogFromLine(line);
                    if (processedLine === null) {
                        // Línea eliminada
                        removedFromThisFile++;
                        this.removedLogs++;
                        console.log(`  ❌ Removed: ${line.trim()}`);
                    } else {
                        processedLines.push(processedLine);
                    }
                } else {
                    processedLines.push(line);
                }
            }

            // Solo escribir el archivo si se hicieron cambios
            if (removedFromThisFile > 0) {
                const newContent = processedLines.join('\n');
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`✅ Processed: ${filePath}`);
                console.log(`   📊 Removed ${removedFromThisFile} console.log statements`);
                this.processedFiles++;
            } else {
                console.log(`⚪ No changes: ${filePath}`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    }

    /**
     * Ejecuta el proceso de limpieza
     */
    run(target = '.') {
        console.log('🚀 Starting console.log removal from HTML files...\n');
        
        let htmlFiles = [];
        
        // Verificar si el target es un archivo o directorio
        const stat = fs.statSync(target);
        
        if (stat.isFile()) {
            // Si es un archivo, verificar que sea HTML
            if (target.endsWith('.html')) {
                htmlFiles = [target];
            } else {
                console.log('❌ The specified file is not an HTML file.');
                return;
            }
        } else if (stat.isDirectory()) {
            // Si es un directorio, buscar archivos HTML
            htmlFiles = this.findHtmlFiles(target);
        }
        
        if (htmlFiles.length === 0) {
            console.log('❌ No HTML files found in the specified path.');
            return;
        }

        console.log(`📁 Found ${htmlFiles.length} HTML files to process:\n`);
        
        htmlFiles.forEach(file => {
            console.log(`📄 Processing: ${file}`);
            this.processHtmlFile(file);
            console.log(''); // Línea en blanco para separar archivos
        });

        console.log('🎉 Process completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Files processed: ${this.processedFiles}`);
        console.log(`   - Total console.log removed: ${this.removedLogs}`);
        console.log(`   - Files with no changes: ${htmlFiles.length - this.processedFiles}`);
    }
}

// Ejecutar el script
if (require.main === module) {
    const remover = new ConsoleLogRemover();
    
    // Obtener directorio del argumento de línea de comandos o usar directorio actual
    const targetDir = process.argv[2] || '.';
    
    console.log(`🎯 Target directory: ${path.resolve(targetDir)}\n`);
    
    remover.run(targetDir);
}

module.exports = ConsoleLogRemover;
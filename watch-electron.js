var path = require('path');
var fs = require('fs');
var ts = require('typescript');

fs.exists(__dirname + '/dist/', (exists) => {
    if (!exists) {
        fs.mkdir(__dirname + '/dist/', () => {
            watchFiles();
        });
    } else {
        watchFiles();
    }
});

function watchFiles() {
    watch([
        'electron/server.ts',
        'electron/main.ts'
    ]);
}

function watch(rootFileNames) {
    const options = {module: ts.ModuleKind.CommonJS};
    const files = {};

    rootFileNames.forEach(fileName => {
        files[fileName] = {version: 0};
    });

    const servicesHost = {
        getScriptFileNames: () => rootFileNames,
        getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
        getScriptSnapshot: (fileName) => {
            if (!fs.existsSync(fileName)) {
                return undefined;
            }
            return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
        },
        getCurrentDirectory: () => process.cwd(),
        getCompilationSettings: () => options,
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
    };

    const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

    rootFileNames.forEach(fileName => {
        emitFile(fileName);
        fs.watchFile(fileName,
            {
                persistent: true,
                interval: 250
            },
            (curr, prev) => {
                if (+curr.mtime <= +prev.mtime) {
                    return;
                }

                files[fileName].version++;
                emitFile(fileName);
            }
        );
    });

    function emitFile(fileName) {
        let output = services.getEmitOutput(fileName);

        if (!output.emitSkipped) {
            console.log(`Emitting ${fileName}`);
        } else {
            console.log(`Emitting ${fileName} failed`);
            logErrors(fileName);
        }

        output.outputFiles.forEach(o => {
            console.log(path.basename(o.name));
            fs.writeFileSync(__dirname + '/dist/' + path.basename(o.name), o.text, "utf8");
        });
    }

    function logErrors(fileName) {
        let allDiagnostics = services.getCompilerOptionsDiagnostics().concat(services.getSyntacticDiagnostics(fileName)).concat(services.getSemanticDiagnostics(fileName));
        allDiagnostics.forEach(diagnostic => {
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            if (diagnostic.file) {
                let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                console.log(`  Error ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.log(`  Error: ${message}`);
            }
        });
    }
}

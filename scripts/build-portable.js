const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');
const { createPackageWithOptions } = require('asar');

async function buildPortable() {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');
  const distElectronDir = path.join(rootDir, 'dist-electron');
  const portableDir = path.join(rootDir, 'release', 'portable');

  // Limpiar release/portable
  await fs.remove(portableDir);
  await fs.ensureDir(portableDir);

  // Copiar dist y dist-electron a un directorio temporal
  const tempDir = path.join(rootDir, 'release', 'temp');
  await fs.remove(tempDir);
  await fs.ensureDir(tempDir);
  await fs.copy(distDir, path.join(tempDir, 'dist'));
  await fs.copy(distElectronDir, path.join(tempDir, 'dist-electron'));

  // Minificar archivos JS
  const minifyFiles = async (dir) => {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await minifyFiles(fullPath);
      } else if (fullPath.endsWith('.js')) {
        const code = await fs.readFile(fullPath, 'utf8');
        const minified = await minify(code, {
          compress: true,
          mangle: true,
          toplevel: true
        });
        if (minified.code) {
          await fs.writeFile(fullPath, minified.code);
        }
      }
    }
  };

  console.log('Minificando código con Terser...');
  await minifyFiles(tempDir);

  console.log('Creando ASAR...');
  const asarDest = path.join(portableDir, 'app.asar');
  await createPackageWithOptions(tempDir, asarDest, {});

  console.log('Creando package.json portátil...');
  const originalPkg = await fs.readJson(path.join(rootDir, 'package.json'));
  const portablePkg = {
    name: originalPkg.name,
    version: originalPkg.version,
    main: "app.asar/dist-electron/main.js",
    scripts: {
      start: "electron ."
    },
    dependencies: {
      electron: originalPkg.devDependencies.electron
    }
  };
  await fs.writeJson(path.join(portableDir, 'package.json'), portablePkg, { spaces: 2 });

  await fs.remove(tempDir);
  console.log('¡Versión portátil lista en release/portable!');
}

buildPortable().catch(console.error);

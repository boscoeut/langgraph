import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../node_modules/pyodide');
const targetDir = path.join(__dirname, '../public/pyodide');

async function copyPyodide() {
  try {
    console.log('Source directory:', sourceDir);
    console.log('Target directory:', targetDir);
    
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source directory does not exist: ${sourceDir}`);
    }
    
    // Ensure target directory exists
    await fs.ensureDir(targetDir);
    console.log('Target directory created/verified');
    
    // List files in source directory
    const files = await fs.readdir(sourceDir);
    console.log('Files in source directory:', files);
    
    // Copy all files from node_modules/pyodide to public/pyodide
    await fs.copy(sourceDir, targetDir, {
      filter: (src) => {
        const basename = path.basename(src);
        const shouldSkip = ['node_modules', '.git', 'tests'].includes(basename);
        if (shouldSkip) {
          console.log('Skipping:', src);
          return false;
        }
        return true;
      }
    });
    
    // Verify files were copied
    const copiedFiles = await fs.readdir(targetDir);
    console.log('Files copied to target:', copiedFiles);
    
    console.log('Pyodide files copied successfully!');
  } catch (err) {
    console.error('Error copying Pyodide files:', err);
    process.exit(1);
  }
}

copyPyodide(); 
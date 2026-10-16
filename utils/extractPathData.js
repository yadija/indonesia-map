import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project directory references
const projectRoot = path.resolve(__dirname, '..');
const defaultSvgPath = path.join(projectRoot, 'public', 'map', 'indonesia.svg');
const defaultJsonPath = path.join(projectRoot, 'src', 'data', 'indonesia-map.json');

/**
 * Extracts SVG path attributes (id, name, d) from SVG content.
 * Handles attributes in any order and supports both single and double quotes.
 */
function extractPathsFromSvg(svgContent) {
  const pathTagRegex = /<path\b([^>]*)\/?>/gi;
  const paths = [];
  let match;

  while ((match = pathTagRegex.exec(svgContent)) !== null) {
    const attributesStr = match[1];

    const idMatch = attributesStr.match(/\bid\s*=\s*["']([^"']+)["']/i);
    const nameMatch = attributesStr.match(/\bname\s*=\s*["']([^"']+)["']/i);
    const dMatch = attributesStr.match(/\bd\s*=\s*["']([^"']+)["']/i);

    if (idMatch && dMatch) {
      paths.push({
        id: idMatch[1].trim(),
        name: nameMatch ? nameMatch[1].trim() : idMatch[1].trim(),
        d: dMatch[1].trim(),
      });
    }
  }

  return paths;
}

/**
 * Main function to read SVG and update or generate the target JSON.
 * Preserves existing metadata (population, area, capital, etc.) if target JSON exists.
 */
function processSvgExtraction() {
  const svgPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSvgPath;
  const targetJsonPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : defaultJsonPath;

  console.log(`[SVG Extractor] Reading SVG from: ${svgPath}`);

  if (!fs.existsSync(svgPath)) {
    console.error(`[SVG Extractor] Error: Source SVG file not found at: ${svgPath}`);
    process.exit(1);
  }

  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const extractedPaths = extractPathsFromSvg(svgContent);

  if (extractedPaths.length === 0) {
    console.warn('[SVG Extractor] Warning: No <path> elements with id and d found in SVG.');
    return;
  }

  console.log(`[SVG Extractor] Successfully parsed ${extractedPaths.length} paths from SVG.`);

  // If destination JSON exists, merge to preserve demographic & geographic metadata
  let mergedData = extractedPaths;
  if (fs.existsSync(targetJsonPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(targetJsonPath, 'utf8'));
      if (Array.isArray(existingData)) {
        const existingMap = new Map(existingData.map((item) => [item.id, item]));

        mergedData = extractedPaths.map((newPath) => {
          const existing = existingMap.get(newPath.id);
          if (existing) {
            return {
              ...existing,
              name: existing.name || newPath.name,
              d: newPath.d, // Update SVG coordinates with new path
            };
          }
          return newPath;
        });

        console.log(
          `[SVG Extractor] Merged with existing JSON metadata (${existingData.length} entries preserved).`,
        );
      }
    } catch (err) {
      console.warn(
        `[SVG Extractor] Could not parse existing JSON file (${err.message}). Overwriting with new data.`,
      );
    }
  }

  fs.writeFileSync(targetJsonPath, JSON.stringify(mergedData, null, 2), 'utf8');
  console.log(`[SVG Extractor] Done! Output successfully saved to: ${targetJsonPath}`);
}

processSvgExtraction();

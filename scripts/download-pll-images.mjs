import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataJs = fs.readFileSync(path.join(root, "data.js"), "utf8");
const fn = new Function(`${dataJs}; return pllDatabase;`);
const pllDatabase = fn();

const outDir = path.join(root, "images", "pll");
fs.mkdirSync(outDir, { recursive: true });
const base = "https://visualcube.api.cubing.net/visualcube.php";

for (const p of pllDatabase) {
    const url =
        base +
        "?fmt=svg&size=96&pzl=3&view=plan&stage=pll&case=" +
        encodeURIComponent(p.alg);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`PLL ${p.id}: ${res.status}`);
    fs.writeFileSync(path.join(outDir, `${p.id}.svg`), await res.text());
    console.log(`PLL ${p.id} (${p.name})`);
}

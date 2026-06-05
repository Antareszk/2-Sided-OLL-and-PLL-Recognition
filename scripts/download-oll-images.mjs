import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataJs = fs.readFileSync(path.join(root, "data.js"), "utf8");
const fn = new Function(`${dataJs}; return ollDatabase;`);
const ollDatabase = fn();

const outDir = path.join(root, "images", "oll");
fs.mkdirSync(outDir, { recursive: true });
const base = "https://visualcube.api.cubing.net/visualcube.php";

for (const o of ollDatabase) {
    const url =
        base +
        "?fmt=svg&size=96&pzl=3&view=plan&stage=oll&case=" +
        encodeURIComponent(o.alg);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OLL ${o.id}: ${res.status}`);
    fs.writeFileSync(path.join(outDir, `${o.id}.svg`), await res.text());
    console.log(`OLL ${o.id}`);
}

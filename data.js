/** Группа по EO для 2-sided recognition (см. ТЗ) */
function ollGroup(id) {
  const dots = [1, 2, 3, 4, 17, 18, 19, 20]; // Точки (8 шт)
  const crosses = [21, 22, 23, 24, 25, 26, 27]; // Кресты (7 шт)

  // ИСПРАВЛЕНО: Точный список из 14 алгоритмов-палок
  const lines = [13, 14, 15, 16, 33, 34, 39, 40, 45, 46, 51, 52, 55, 56, 57];

  if (dots.includes(id)) return "dot";
  if (crosses.includes(id)) return "cross";
  if (lines.includes(id)) return "line";

  // Все остальные 28 штук автоматически станут галками (уголками)
  return "angle";
}

/** Стандартные OLL (прямые алгоритмы); reverseAlg вычисляется в script.js */
const OLL_ALGS = {
  1: "R U2 R2 F R F' U2 R' F R F'",
  2: "F R U R' U' F' f R U R' U' f'",
  3: "f R U R' U' f' U' F R U R' U' F'",
  4: "f R U R' U' f' U F R U R' U' F'",
  5: "r' U2 R U R' U r",
  6: "r U2 R' U' R U' r'",
  7: "r U R' U R U2 r'",
  8: "r' U' R U' R' U2 r",
  9: "R U R' U' R' F R2 U R' U' F'",
  10: "R U R' U R' F R F' R U2 R'",
  11: "r U R' U R' F R F' R U2 r'",
  12: "F R U R' U' F' U F R U R' U' F'",
  13: "r U' r' U' r U r' F' U F",
  14: "R' F R U R' F' R F U' F'",
  15: "r' U' r R' U' R U r' U r",
  16: "r U r' R U R' U' r U' r'",
  17: "R U R' U R' F R F' U2 R' F R F'",
  18: "r U R' U R U2 r2 U' R U' R' U2 r",
  19: "M U R U R' U' M' R' F R F'",
  20: "M U R U R' U' M2 U R U' r'",
  21: "R U R' U R U' R' U R U2 R'",
  22: "R U2 R2 U' R2 U' R2 U2 R",
  23: "R2 D R' U2 R D' R' U2 R'",
  24: "r U R' U' r' F R F'",
  25: "F' r U R' U' r' F R",
  26: "R U2 R' U' R U' R'",
  27: "R U R' U R U2 R'",
  28: "r U R' U' r' R U R U' R'",
  29: "R U R' U' R U' R' F' U' F R U R'",
  30: "F R' F R2 U' R' U' R U R' F2",
  31: "R' U' F U R U' R' F' R",
  32: "R U B' U' R' U R B R'",
  33: "R U R' U' R' F R F'",
  34: "R U R2 U' R' F R U R U' F'",
  35: "R U2 R2 F R F' R U2 R'",
  36: "L' U' L U' L' U L U L F' L' F",
  37: "F R U' R' U' R U R' F'",
  38: "R U R' U R U' R' U' R' F R F'",
  39: "L F' L' U' L U F U' L'",
  40: "R' F R U R' U' F' U R",
  41: "R U R' U R U2 R' F R U R' U' F'",
  42: "R' U' R U' R' U2 R F R U R' U' F'",
  43: "f' L' U' L U f",
  44: "f R U R' U' f'",
  45: "F R U R' U' F'",
  46: "R' U' R' F R F' U R",
  47: "F' L' U' L U L' U' L U F",
  48: "F R U R' U' R U R' U' F'",
  49: "r U' r2 U r2 U r2 U' r",
  50: "r' U r2 U' r2 U' r2 U r'",
  51: "f R U R' U' R U R' U' f'",
  52: "R U R' U R U' B U' B' R'",
  53: "r' U' R U' R' U R U' R' U2 r",
  54: "r U R' U R U' R' U R U2 r'",
  55: "R U2 R2 U' R U' R' U2 F R F'",
  56: "r U r' U R U' R' U R U' R' r U' r'",
  57: "R U R' U' M' U R U' r'",
};

const OLL_NAMES = {
  1: "Dot 1",
  2: "Dot 2",
  3: "Dot 3",
  4: "Dot 4",
  5: "Square 1",
  6: "Square 2",
  7: "Lightning 1",
  8: "Lightning 2",
  9: "Lightning 3",
  10: "Lightning 4",
  11: "Lightning 5",
  12: "Lightning 6",
  13: "Knight R",
  14: "Knight L",
  15: "Knight BR",
  16: "Knight BL",
  17: "Dot AC",
  18: "Dot NC",
  19: "Dot R-bar",
  20: "Dot L-bar",
  21: "Double Sune",
  22: "Pi",
  23: "Headlights",
  24: "Chameleon L",
  25: "Chameleon R",
  26: "Anti-Sune",
  27: "Sune",
  28: "Line AC",
  29: "Awkward 1",
  30: "Awkward 2",
  31: "P R",
  32: "P L",
  33: "T front",
  34: "C R",
  35: "L sym",
  36: "W rev",
  37: "Fish",
  38: "W",
  39: "Big fish",
  40: "Big fish rev",
  41: "Awkward 3",
  42: "Awkward 4",
  43: "T rev-P",
  44: "T P",
  45: "T back",
  46: "C L",
  47: "L back",
  48: "Line F2L",
  49: "L R corners",
  50: "L L corners",
  51: "Line HL front",
  52: "Line HL back",
  53: "L front",
  54: "L diag",
  55: "Line diag",
  56: "Line R",
  57: "Line none",
};

const ollDatabase = [];
for (let id = 1; id <= 57; id++) {
  ollDatabase.push({
    id,
    name: OLL_NAMES[id],
    group: ollGroup(id),
    alg: OLL_ALGS[id],
  });
}

const OLL_GROUP_LABELS = {
  all: "All cases (57)",
  cross: "Crosses only (7)",
  dot: "Dots only (8)",
  line: "Lines only (15)",
  angle: "Angles only (27)",
};

/* ============ PLL ============ */

function pllGroup(id) {
  const edges = [7, 8, 17, 18]; // Ua, Ub, H, Z
  const adjacent = [1, 2, 4, 5, 6, 9, 10, 11, 12, 13, 16, 21]; // Aa, Ab, F, Ga, Gb, Ja, Jb, Ra, Rb, T, Gc, Gd
  const diagonal = [3, 14, 15, 19, 20]; // E, Na, Nb, V, Y

  if (edges.includes(id)) return "edges";
  if (adjacent.includes(id)) return "adjacent";
  if (diagonal.includes(id)) return "diagonal";
  return "edges";
}

const PLL_ALGS = {
  1: "x R' U R' D2 R U' R' D2 R2 x'", // Aa
  2: "x R2 D2 R U R' D2 R U' R x'", // Ab
  3: "x' R U' R' D R U R' D' R U R' D R U' R' D' x", // E
  4: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", // F
  5: "R2 U R' U R' U' R U' R2 U' D R' U R D'", // Ga
  6: "R' U' R U D' R2 U R' U R U' R U' R2 D", // Gb
  7: "M2 U M U2 M' U M2", // Ua
  8: "M2 U' M U2 M' U' M2", // Ub
  9: "x R2 F R F' R U2 r' U r U2 x'", // Ja
  10: "R U R' F' R U R' U' R' F R2 U' R' U'", // Jb
  11: "R U R' F' R U2 R' U2 R' F R U R U2 R'", // Ra
  12: "R' U2 R U2 R' F R U R' U' R' F' R2", // Rb
  13: "R U R' U' R' F R2 U' R' U' R U R' F'", // T
  14: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", // Na
  15: "r' D' F r U' r' F' D r2 U r' U' r' F r F'", // Nb
  16: "R2 U' R U' R U R' U R2 U D' R U' R' D", // Gc
  17: "M2 U M2 U2 M2 U M2", // H
  18: "M2 U M2 U M' U2 M2 U2 M'", // Z
  19: "R' U R' d' R' F' R2 U' R' U R' F R F", // V
  20: "F R U' R' U' R U R' F' R U R' U' R' F R F'", // Y
  21: "R U R' U' D R2 U' R U' R' U R' U R2 D'", // Gd
};

const PLL_NAMES = {
  1: "Aa",
  2: "Ab",
  3: "E",
  4: "F",
  5: "Ga",
  6: "Gb",
  7: "Ua",
  8: "Ub",
  9: "Ja",
  10: "Jb",
  11: "Ra",
  12: "Rb",
  13: "T",
  14: "Na",
  15: "Nb",
  16: "Gc",
  17: "H",
  18: "Z",
  19: "V",
  20: "Y",
  21: "Gd",
};

const pllDatabase = [];
for (let id = 1; id <= 21; id++) {
  pllDatabase.push({
    id,
    name: PLL_NAMES[id],
    group: pllGroup(id),
    alg: PLL_ALGS[id],
  });
}
// Сортировка по алфавиту для отображения
pllDatabase.sort((a, b) => a.name.localeCompare(b.name));

// Повороты изображений для правильного 2-sided вида
pllDatabase.find((p) => p.id === 19).rotation = 90; // V
pllDatabase.find((p) => p.id === 9).rotation = 180; // Ja

const PLL_GROUP_LABELS = {
  all: "All (21)",
  edges: "Edges only (4)",
  adjacent: "Adjacent (12)",
  diagonal: "Diagonal (5)",
};

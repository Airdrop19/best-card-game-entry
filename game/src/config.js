// Lantern Duel — an original turn-based card duel. You and the Keeper each
// hold 20 light. Spend ember (energy) to play cards: strike, mend, ward, draw.
// Elements (suits) are told apart by colour AND shape: Flame ▲, Tide ●,
// Leaf ◆, Spark ★. First to snuff the other's lantern wins.
export const VIEW = { width: 1280, height: 800 };
export const START_HP = 20;
export const HAND_SIZE = 5;
export const MAX_ENERGY = 6;

export const ELEMENTS = {
  flame: { name: 'Flame', color: '#e4572e', dark: '#8f2f14', shape: 'triangle' },
  tide:  { name: 'Tide',  color: '#2e86e4', dark: '#164a85', shape: 'circle' },
  leaf:  { name: 'Leaf',  color: '#3fae5a', dark: '#1f6335', shape: 'diamond' },
  spark: { name: 'Spark', color: '#e8b93b', dark: '#8a6a14', shape: 'star' },
};

// Element wheel: flame beats leaf, leaf beats spark, spark beats tide, tide beats flame.
// A strike with the winning element deals +2.
export const BEATS = { flame: 'leaf', leaf: 'spark', spark: 'tide', tide: 'flame' };

// The vocabulary itself lives in src/data/vocabulary.json so that GSD can read
// it over the wire (it needs the parent/leaf structure, which a regex over this
// module cannot reliably recover). This module keeps its original exports so
// nothing in the site changes.
import vocabulary from '../data/vocabulary.json';

export const TAG_HIERARCHY = vocabulary.tagHierarchy;
export const PROJECT_CATEGORIES = vocabulary.categories;

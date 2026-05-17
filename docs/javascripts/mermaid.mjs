import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
import elkLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0/dist/mermaid-layout-elk.esm.min.mjs';
import tidyTreeLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-tidy-tree@0/dist/mermaid-layout-tidy-tree.esm.min.mjs';

mermaid.registerLayoutLoaders(elkLayouts);
mermaid.registerLayoutLoaders(tidyTreeLayouts);
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  layout: "elk",
});

// Important: necessary to make it visible to Zensical
window.mermaid = mermaid;

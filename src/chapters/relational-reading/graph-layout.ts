/**
 * The network of chapters 03 and 07, as Anton laid it out in the graph
 * workbench (31.10.2026). Positions are workbench units; graph.tsx fits
 * them into its drawing box. The same file drives the slides
 * (rltp: design/slides-between-two-people/html/tools/graph-layout.json).
 */
export const LAYOUT = {"forces":{"charge":-410,"link":106,"groupRing":182,"groupPull":0.62,"member":190,"centre":0.12,"apart":158},"positions":{"A":[390,405],"B":[570,405],"a1":[300,282],"a2":[249,456],"a3":[282,525],"b1":[659,293],"b2":[739,366],"b3":[616,534],"s1":[479,317],"s2":[457,522],"gS":[480,165],"gA":[183,349],"gB":[736,474]},"pinned":["A","B","a1","a2","a3","b1","b2","b3","s1","s2","gS","gA","gB"],"nodes":[{"id":"A","tone":"var(--ana)"},{"id":"B","tone":"var(--ben)"},{"id":"a1","tone":"var(--p3)"},{"id":"a2","tone":"var(--p1)"},{"id":"a3","tone":"var(--p5)"},{"id":"b1","tone":"var(--p4)"},{"id":"b2","tone":"var(--p2)"},{"id":"b3","tone":"var(--p0)"},{"id":"s1","tone":"var(--p0)"},{"id":"s2","tone":"var(--p3)"},{"id":"gS","group":"Garden"},{"id":"gA","group":"Chess"},{"id":"gB","group":"Council"}],"links":[["A","B"],["A","a1"],["A","a2"],["A","a3"],["A","s1"],["A","s2"],["A","gS"],["A","gA"],["B","b1"],["B","b2"],["B","b3"],["B","s1"],["B","s2"],["B","gS"],["B","gB"],["gS","s1"],["gA","a1"],["gA","a2"],["gB","b2"],["gB","b3"],["a3","s2"],["a1","s1"]]} as const;

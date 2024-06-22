import { KnowledgeGraph } from "./types";

export async function mergeLocalGraphIntoGlobalGraph(
  localGraph: KnowledgeGraph,
  globalGraph: KnowledgeGraph,
): Promise<KnowledgeGraph> {
  return [...localGraph, ...globalGraph];
}

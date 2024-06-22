import { EntitySlice, KnowledgeGraph } from "./types";

export async function retrieveEntity(
  searchTarget: EntitySlice,
  existingGlobalGraph: KnowledgeGraph,
): Promise<EntitySlice | null> {
  // TODO: this step does not yet handle cases of the existing node being named a different but very similar thing by primary key
  const primaryKey = searchTarget.getPrimaryKey();
  const existingEntity = existingGlobalGraph.find((entity) => {
    return entity.getPrimaryKey() === primaryKey;
  });
  if (existingEntity === undefined) {
    return null;
  }
  return existingEntity;
}

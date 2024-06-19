import { EntityDefinition, EntityInstance } from "@/schema/entity";

export type EntitySlice = Partial<EntityInstance<any>> &
  Pick<EntityInstance<any>, "__type">;

export type KnowledgeGraph = Set<EntitySlice>;

export interface Context {
  validEntities: Set<EntityDefinition>; // defined statically
}

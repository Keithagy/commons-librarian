import { EntityDefinition, EntityInstance } from "@/schema/entity";
import { Vault } from "obsidian-vault-parser";

export type EntitySlice<T extends EntityDefinition = EntityDefinition> =
  Partial<EntityInstance<T>> & Pick<EntityInstance<T>, "__type">;

export type KnowledgeGraph = Set<EntitySlice<EntityDefinition>>;

export interface Context {
  validEntities: Set<EntityDefinition>; // defined statically
  existingVault: Vault;
}

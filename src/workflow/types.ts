import { EntityDefinition, EntityInstance } from "../schema/entity";
import { Vault } from "obsidian-vault-parser";

export type EntitySlice<T extends EntityDefinition = any> = Partial<
  EntityInstance<T>
> &
  Pick<EntityInstance<T>, "__type">;

export type KnowledgeGraph = Set<EntitySlice<EntityDefinition>>;

export interface Context {
  validEntities: Set<EntityDefinition>;
  existingVault: Vault;
}

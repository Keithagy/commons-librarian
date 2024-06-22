import { Vault } from "obsidian-vault-parser";
import { KnowledgeGraph } from "./types";
import {
  EntityDefinition,
  EntityInstanceType,
  parseEntity,
  retrieveEntityDefinition,
} from "src/schema/entity";

export const ENTITY_TYPE_FRONTMATTER_KEY = "__type";
export function parseExistingGlobalGraphFromVault(
  existingVault: Vault,
  entityDefinitionsByName: Record<EntityInstanceType, EntityDefinition>,
): KnowledgeGraph {
  const knowledgeGraph: KnowledgeGraph = [];

  for (const file of Object.values(existingVault.files)) {
    const entityType: EntityInstanceType =
      file.frontMatter[ENTITY_TYPE_FRONTMATTER_KEY];
    const entityDefinition = retrieveEntityDefinition(
      entityType,
      entityDefinitionsByName,
    );
    const entity = parseEntity(file, entityDefinition);
    knowledgeGraph.push(entity);
  }
  return knowledgeGraph;
}

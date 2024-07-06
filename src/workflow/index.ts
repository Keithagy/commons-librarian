import { EntityDefinition } from "src/schema/entity";
import { determineIfEntityTypePresent } from "./determineIfEntityTypePresent";
import { EntitySlice } from "./EntitySlice";
import { initializeEntitiesForType } from "./initializeEntitiesForType";
import { linkEntityIntoLocalGraph } from "./linkEntityIntoLocalGraph";
import { mergeEntity } from "./mergeEntity";
import { populateEntity } from "./populateEntity";
import { retrieveEntity } from "./retrieveEntity";
import { TextSnippet, KnowledgeGraph } from "./types";

export async function performEntityParsing(
  validEntityDefinitions: EntityDefinition[],
  incomingDocument: TextSnippet,
  existingGlobalGraph: KnowledgeGraph,
) {
  const entityTypesMentionedInDoc: EntityDefinition[] = [];
  for (const entityType of validEntityDefinitions) {
    const entityTypePresent = await determineIfEntityTypePresent(
      incomingDocument,
      entityType,
    );
    if (entityTypePresent) {
      entityTypesMentionedInDoc.push(entityType);
    }
  }

  const mergedEntities: EntitySlice[] = [];

  for (const entityType of entityTypesMentionedInDoc) {
    const initializedEntities = await initializeEntitiesForType(
      incomingDocument,
      entityType,
    );

    for (const initialized of initializedEntities) {
      const populated = await populateEntity(initialized, incomingDocument);

      const maybeExistingEntity = await retrieveEntity(
        populated,
        existingGlobalGraph,
      );

      const mergedEntity =
        maybeExistingEntity === null
          ? populated
          : await mergeEntity(populated, maybeExistingEntity);

      mergedEntities.push(mergedEntity);
    }
  }

  const localGraph: KnowledgeGraph = [...mergedEntities];
  for (const entity of mergedEntities) {
    await linkEntityIntoLocalGraph(entity, localGraph, incomingDocument);
  }

  return localGraph;
}

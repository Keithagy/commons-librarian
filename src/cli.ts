import chalk from "chalk";
import { readVault } from "obsidian-vault-parser";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import { EntityDefinition, EntityInstanceType } from "./schema/entity";
import { Context, EntitySlice, KnowledgeGraph } from "./workflow/types";
import { determineIfEntityTypePresent } from "./workflow/determineIfEntityTypePresent";
import { initializeEntitiesForType } from "./workflow/initializeEntitiesForType";
import { linkEntityIntoLocalGraph } from "./workflow/linkEntityIntoLocalGraph";
import { mergeEntity } from "./workflow/mergeEntity";
import { mergeLocalGraphIntoGlobalGraph } from "./workflow/mergeLocalGraphIntoGlobalGraph";
import { parseExistingGlobalGraphFromVault } from "./workflow/parseExistingGlobalGraphFromVault";
import { persist } from "./workflow/persist";
import { populateEntity } from "./workflow/populateEntity";
import { retrieveEntity } from "./workflow/retrieveEntity";

/*
 * Provides a CLI which handles the ingestion of some target obsidian vault.
 * */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("input", {
      alias: "i",
      type: "string",
      description: "Input vault filepath",
    })
    .option("output", {
      alias: "o",
      type: "string",
      description: "Output/existing vault filepath",
    })
    .option("schema", {
      alias: "s",
      type: "string",
      description: "entity schema file path",
    })
    .argv;

  const inputVaultFilePath = argv.input;
  if (!inputVaultFilePath) {
    console.error(chalk.red("No input vault file path provided."));
    console.error(
      chalk.red(
        "Usage: $0 -i <input vault filepath> -o <output vault filepath>",
      ),
    );
    return;
  }

  const inputVault = await readVault(inputVaultFilePath);
  console.log(
    chalk.yellow(`Successfully read input vault: ${inputVault.path}`),
  );
  console.log(
    chalk.yellow(`Vault size: ${Object.keys(inputVault.files).length} files`),
  ); // markdown files in nested folders just get flattened; you don't get a representation of the nesting here

  const outputVaultFilePath = argv["output"];
  if (!outputVaultFilePath) {
    console.error(chalk.red("No output vault file path provided."));
    console.error(
      chalk.red(
        "Usage: $0 -i <input vault filepath> -o <output vault filepath>",
      ),
    );
    return;
  }

  // TODO: userCasePerson shouldn't be directly imported! this should be parameterized
  const validEntityDefinitions = {} as Record<EntityInstanceType, EntityDefinition>;

  {
    const entity_list: EntityDefinition[] = (await import(argv["schema"] as string)).default;
    for (const entity of entity_list) {
      validEntityDefinitions[entity.name] = entity;
    }
  }

  const existingVault = await readVault(outputVaultFilePath);
  const ctx: Context = {
    validEntities: new Set(Object.values(validEntityDefinitions)),
    existingVault,
  };

  const existingGlobalGraph = parseExistingGlobalGraphFromVault(
    existingVault,
    validEntityDefinitions,
  );

  for (const incomingDocument of Object.values(inputVault.files)) {
    console.log(
      chalk.yellow(`Successfully read output vault: ${existingVault.path}`),
    );
    console.log(
      chalk.yellow(
        `Vault size: ${Object.keys(existingVault.files).length} files`,
      ),
    );

    const entityTypesMentionedInDoc = [];
    for (const entityType of Object.values(validEntityDefinitions)) {
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
        const populated = await populateEntity(
          ctx,
          initialized,
          incomingDocument,
        );

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

    const newGlobalGraph = await mergeLocalGraphIntoGlobalGraph(
      localGraph,
      existingGlobalGraph,
    );

    // NOTE: Current implementation commits once per file. Should we consider batch commits?
    await persist(newGlobalGraph, existingVault);
  }
}

// NOTE: entity definitions -- primary keys should be reasonably difficult for llm to mangle
// Solutions to mitigate:
// - levenshtein distance: https://www.baeldung.com/cs/levenshtein-distance-computation
// - substring comparisons / trimming
// - semantic proximity? (this is hard and has broader implications in other steps too, such as querying step)

(async () => {
  await main();
  console.log("done!");
})();

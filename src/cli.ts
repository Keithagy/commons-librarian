import chalk from "chalk";
import { readVault } from "obsidian-vault-parser";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import { EntityDefinition } from "./schema/entity";
import { EntitySlice, KnowledgeGraph } from "./workflow/types";
import { personEntity as userCasePerson } from "./use-case-1";
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
    }).argv;

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
  const validEntityDefinitions: Set<EntityDefinition> = new Set([
    userCasePerson,
  ]);
  Object.values(inputVault.files).forEach(async (incomingDocument) => {
    const existingVault = await readVault(outputVaultFilePath);
    console.log(
      chalk.yellow(`Successfully read output vault: ${existingVault.path}`),
    );
    console.log(
      chalk.yellow(
        `Vault size: ${Object.keys(existingVault.files).length} files`,
      ),
    );
    const existingGlobalGraph =
      parseExistingGlobalGraphFromVault(existingVault);
    const entityTypesMentionedInDoc = Array.from(
      validEntityDefinitions.entries(),
    )
      .map(([entityType]) => entityType)
      .filter(async (entityType) => {
        // TODO: refactor to use Promise.all
        return await determineIfEntityTypePresent(incomingDocument, entityType);
      });

    const newEntitiesFromDocument: EntitySlice[] = await Promise.all(
      (
        await Promise.all(
          entityTypesMentionedInDoc.map((entityType) =>
            initializeEntitiesForType(incomingDocument, entityType).then(
              (initializedEntities) =>
                initializedEntities.map((initialized) =>
                  populateEntity(
                    { validEntities: validEntityDefinitions, existingVault },
                    initialized,
                    incomingDocument,
                  ),
                ),
            ),
          ),
        )
      ).flatMap((slices) => slices),
    );
    const mergedEntities = await Promise.all(
      newEntitiesFromDocument.map((newEntity) =>
        retrieveEntity(newEntity, existingGlobalGraph).then(
          (maybeExistingEntity: EntitySlice | null): Promise<EntitySlice> =>
            maybeExistingEntity === null
              ? new Promise(() => newEntity)
              : mergeEntity(newEntity, maybeExistingEntity),
        ),
      ),
    );

    const localGraph: KnowledgeGraph = new Set();
    await Promise.all(
      mergedEntities.map((entity) =>
        linkEntityIntoLocalGraph(entity, localGraph),
      ),
    );
    const newGlobalGraph = await mergeLocalGraphIntoGlobalGraph(
      localGraph,
      existingGlobalGraph,
    );

    // NOTE: Current implementation commits once per file. Should we consider batch commits?
    await persist(newGlobalGraph, existingVault);
  });
}

// NOTE: entity definitions -- primary keys should be reasonably difficult for llm to mangle
// Solutions to mitigate:
// - levenshtein distance: https://www.baeldung.com/cs/levenshtein-distance-computation
// - substring comparisons / trimming
// - semantic proximity? (this is hard and has broader implications in other steps too, such as querying step)

(async () => {
  await main();
})();

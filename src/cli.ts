import chalk from "chalk";
import { VaultPage, readVault } from "obsidian-vault-parser";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";

/*
 * Provides a CLI which handles the ingestion of some target obsidian vault.
 * */
async function main() {
  const argv = await yargs(hideBin(process.argv)).option("inputs", {
    alias: "i",
    type: "string",
    description: "Input vault filepath",
  }).argv;
  const inputVaultFilePath = argv.inputs; // TODO: connect to cli args
  if (!inputVaultFilePath) {
    console.error(chalk.red("No input vault file path provided."));
    console.error(chalk.red("Usage: $0 -i <input vault filepath>"));
    return;
  }

  const vault = await readVault(inputVaultFilePath);
  console.log(chalk.yellow(`Successfully read vault: ${vault.path}`));
  console.log(
    chalk.yellow(`Vault size: ${Object.keys(vault.files).length} files`),
  ); // markdown files in nested folders just get flattened; you don't get a representation of the nesting here

  const validEntityDefinitions = Object.values(vault.files).forEach;
}

// NOTE: entity definitions -- primary keys should be reasonably difficult for llm to mangle
// Solutions to mitigate:
// - levenshtein distance: https://www.baeldung.com/cs/levenshtein-distance-computation
// - substring comparisons / trimming
// - semantic proximity? (this is hard and has broader implications in other steps too, such as querying step)

// TODO: Placeholder type definitions
type EntityDefinition = string;
type EntityInstance = object;
type EntitySlice = Partial<EntityInstance>;
type KnowledgeGraph = object;
interface Context {
  validEntities: Set<EntityDefinition>; // defined statically
}

async function determineFileContainsEntityType(
  ctx: Context,
  file: VaultPage,
  entDef: EntityDefinition,
): Promise<boolean> {}

async function initializeEntities(
  ctx: Context,
  file: VaultPage,
  entDef: EntityDefinition,
): Promise<EntitySlice[]> {
  // NOTE: this pipeline step prefills primary key of nodes, per zod schema def
}

async function populateEntity(
  ctx: Context,
  entityToPopulate: EntitySlice,
  file: VaultPage,
): EntitySlice {
  // NOTE: returns a copy of `entityToPopulate` with populated fields
}

async function retrieveEntity(
  ctx: Context,
  searchTarget: EntitySlice,
): EntitySlice | null {
  // NOTE: we are passing in entire EntitySlice given that we don't know yet which fields we'll need to triangulate against
  // e.g. alias keys?
  // should expect this function to make use of definition-specific type narrowing
}
async function mergeEntity(
  ctx: Context,
  incoming: ReturnType<typeof populateEntity>,
  existing: EntitySlice,
): EntitySlice {
  // TODO: identify specific merging strategy
}

async function linkEntityIntoLocalGraph(
  ctx: Context,
  incoming: EntitySlice,
  localGraph: KnowledgeGraph,
): Promise<void> {
  // TODO: How to decide the links that a new node should have to any/all existing nodes?
  // NOTE: modifies `localGraph` in place
}
async function mergeLocalGraphIntoGLobalGraph(
  ctx: Context,
  localGraph: KnowledgeGraph,
  globalGraph: KnowledgeGraph,
): Promise<void> {
  // TODO: How to decide the links that a new node should have to any/all existing nodes?
  // NOTE: modifies `globalGraph` in place
}
async function persist(newGlobalGraph: KnowledgeGraph): Promise<void> {
  // NOTE: this is just the commit step
}
(async () => {
  await main();
})();


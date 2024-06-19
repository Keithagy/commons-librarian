import * as vault_parser from "obsidian-vault-parser";
import chalk from "chalk";

const vault = await vault_parser.readVault("vault");

for (const file of Object.values(vault.files)) {
  console.log(chalk.blue(file.path));
  console.log(file.content);
  console.log(file.frontMatter);
}

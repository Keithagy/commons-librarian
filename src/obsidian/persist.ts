import { Vault } from "obsidian-vault-parser";
import { writeFileSync } from "fs";
import { KnowledgeGraph } from "src/workflow/types";

export async function persist(
  newGlobalGraph: KnowledgeGraph,
  ouputVault: Vault,
): Promise<void> {
  console.log(
    JSON.stringify(
      newGlobalGraph.map((n) => n.asInstance()),
      null,
      2,
    ),
  );

  for (const entity of newGlobalGraph) {
    const file = entity.asInstance();
    const pk = entity.getPrimaryKey();

    const out_path = ouputVault.path + "/" + pk.value + ".md";

    for (const link of entity.getFields("link")) {
      if (file[link.name]) {
        file[link.name] = (file[link.name] as string[])?.map((v) => `[[${v}]]`);
      }
    }

    console.log(`writing to ${out_path}: ${JSON.stringify(file, null, 2)}`);

    const content = `---\n${JSON.stringify(file, null, 2)}\n---\n`;

    // wirte file to out_path
    writeFileSync(out_path, content);
  }
}

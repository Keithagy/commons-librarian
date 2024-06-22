import { NotImplementError } from "src/errors";
import { EntitySlice, KnowledgeGraph } from "./types";
import { llmCompletion } from "src/llm/completion";
import { VaultPage } from "obsidian-vault-parser";
import { boolean } from "yargs";
import { z } from "zod";
import { printNode, zodToTs } from "zod-to-ts";

export async function linkEntityIntoLocalGraph(
  incoming: EntitySlice,
  localGraph: KnowledgeGraph,
  page: VaultPage,
): Promise<void> {
  // TODO: How to decide the links that a new node should have to any/all existing nodes?
  // NOTE: modifies `localGraph` in place

  for(const link of incoming.getFields('link')) {
    const opposites = localGraph.filter((entity) => {
      return entity.definition.name === link.target;
    })

    for(const opposite of opposites) {
      console.log(`${incoming.definition.name} -[${link.name}]-> ${opposite.__type}`);

      if ( opposite === incoming) {
        continue;
      }


      const aPK =incoming.getPrimaryKey();
      const bPK = opposite.getPrimaryKey();

      const zResponse = z.object({
        reasoning: z.string(),
        confidence: z.enum(["no_brainer", "seems_alright", "hard_to_know"]),
        vertict: z.boolean().describe("true if the link is correct, false otherwise"),
      })

      const pkOnlySchemaSerialized = printNode(zodToTs(zResponse).node);


      await llmCompletion({
        messages: [{
          role: "system",
          content: `
Given a text you give vertict in JSON format on whether the following  cypher query would be correct or not.

## Query

(a:${incoming.definition.name} {"${aPK.key}": "${aPK.value}"})-[${link.name}]->(b:${opposite.definition.name} {"${bPK.key}": "${bPK.value}"})

## Response format

\`\`\`ts
${pkOnlySchemaSerialized}
\`\`\``
        }, {
          role: "user",
          content: page.content!,
        }
     
        ],
        response_format: {
          type: "json_object",
        },
      })
    }

  }

}

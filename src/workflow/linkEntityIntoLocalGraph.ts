import { EntitySlice, KnowledgeGraph, TextSnippet } from "./types";
import { llmCompletion } from "src/llm/completion";
import { z } from "zod";
import { printNode, zodToTs } from "zod-to-ts";
import { badany } from "src/helpers/utility-types";

export async function linkEntityIntoLocalGraph(
  incoming: EntitySlice,
  localGraph: KnowledgeGraph,
  page: TextSnippet,
): Promise<void> {
  // TODO: How to decide the links that a new node should have to any/all existing nodes?
  // NOTE: modifies `localGraph` in place

  for (const link of incoming.getFields("link")) {
    const opposites = localGraph.filter((entity) => {
      return entity.definition.name === link.target;
    });

    for (const linkDst of opposites) {
      if (linkDst === incoming) {
        // if linking to self
        continue;
      }

      const aPK = incoming.getPrimaryKey();
      const bPK = linkDst.getPrimaryKey();

      const vertict_key = `${aPK.value} has ${link.name} ${bPK.value}`;

      const zResponse = z.object({
        reasoning: z
          .string()
          .describe(
            "reason about if the above  assertion makes sense and about relation direction",
          ),
        confidence: z.enum(["no_brainer", "seems_alright", "hard_to_know"]),
        [vertict_key]: z.boolean(),
        [`${bPK.value} has ${link.name} ${aPK.value}`]: z.boolean(),
      });

      const pkOnlySchemaSerialized = printNode(zodToTs(zResponse).node);

      const resp = await llmCompletion({
        messages: [
          {
            role: "system",
            content: `
Given a text you give a response in JSON format on whether the following cypher-query would be correct or not.

## Query

(a:${incoming.definition.name} {"${aPK.key}": "${aPK.value}"})-[${link.name}]->(b:${linkDst.definition.name} {"${bPK.key}": "${bPK.value}"})

Determine critically which relationship holds between the two entities.

## Response format

\`\`\`ts
${pkOnlySchemaSerialized}
\`\`\``,
          },
          {
            role: "user",
            content: `# input text
\`\`\`
${page.content!}
\`\`\`

`,
          },
        ],
        response_format: {
          type: "json_object",
        },
      });

      const valid_resp = zResponse.parse(
        JSON.parse(resp.choices[0].message.content!),
      );

      if (valid_resp[vertict_key] === true) {
        incoming[link.name] = [bPK.value as badany];
        console.log(`setting ${aPK.value} has ${link.name} ${bPK.value}`);
      } else {
        console.log("not setting link");
      }
    }
  }
}

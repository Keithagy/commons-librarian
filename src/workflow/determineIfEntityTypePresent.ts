import { llmCompletion } from "src/llm/completion";
import {
  EntityDefinition,
  getSchemaOfEntityDefinition,
} from "../schema/entity";
import { BadLLMResponse } from "../errors";
import { VaultPage } from "obsidian-vault-parser";
import { printNode, zodToTs } from "zod-to-ts";
import { z } from "zod";

export async function determineIfEntityTypePresent(
  file: VaultPage,
  entityDefinition: EntityDefinition,
): Promise<boolean> {
  const contents = file.content;
  if (contents === null) {
    return false; // file contents empty; couldn't possibly contain entity
  }
  // TODO: chunking consideration

  const schema = getSchemaOfEntityDefinition(entityDefinition);
  const tsSchema = printNode(zodToTs(schema).node);

  const output_schema = z.object({
    evidence: z.string().describe("short evidence that the entity is present"),
    has_entity: z
      .boolean()
      .optional()
      .nullable()
      .describe(`has ${entityDefinition.name}`),
  });

  const output_ts_schema = printNode(zodToTs(output_schema).node);

  console.log("schema", tsSchema);
  const rest = await llmCompletion({
    messages: [
      {
        role: "system",
        content: `
Your role is to determine if the file below describes at least one ${entityDefinition.name}.

## entity description we are looking for:
\`\`\`ts
${tsSchema}
\`\`\`

## output json schema:

\`\`\`ts
${output_ts_schema}
\`\`\``,
      },
      {
        role: "user",
        content: `file:
\`\`\`
${file.content}
\`\`\``,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const response_json_text = rest.choices[0].message.content;
  if (!response_json_text) {
    throw new BadLLMResponse(rest.choices[0].finish_reason);
  }

  const response: boolean | null = JSON.parse(response_json_text);
  const has_entity = !!output_schema.parse(response).has_entity;
  return has_entity;
}

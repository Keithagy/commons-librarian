import { VaultPage } from "obsidian-vault-parser";

import { zodToTs, printNode } from "zod-to-ts";
import { Context, EntitySlice } from "./types";
import { BadLLMResponse, EntityNotFoundError } from "../errors";
import { FieldDefinition } from "../schema/field";
import { llmCompletion } from "../llm/completion";
import { getSchemaOfEntityDefinition } from "src/schema/entity";

/**
 * returns a copy of `entityToPopulate` with populated fields
 **/
export async function populateEntity(
  ctx: Context,
  einst: EntitySlice,
  file: VaultPage,
): Promise<EntitySlice> {
  const entity = [...ctx.validEntities].find((e) => e?.name === einst.__type);

  if (!entity) {
    throw new EntityNotFoundError(einst.__type);
  }

  const scalarFields = entity.fields.filter(
    (f) => f.type === "scalar",
  ) as Extract<FieldDefinition, { type: "scalar" }>[];
  if (scalarFields.length <= 0) {
    return einst;
  }
  const schema = getSchemaOfEntityDefinition(entity);

  const tsSchema = printNode(zodToTs(schema).node);

  const rest = await llmCompletion({
    messages: [
      {
        role: "system",
        content: `
You are tasked with populating the following fields for entity called ${entity.name}, represented by the following schema:
\`\`\`ts
${tsSchema}
\`\`\`

Give the JSON for that ${entity.name} by drawing from the following file:

\`\`\`
${file.content}
\`\`\`
`,
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
  const response_json = JSON.parse(response_json_text);
  const valid_json: any = schema.parse(response_json);
  console.log("valid_json", valid_json);
  return einst; // TODO: need to actually fill fields into `einst`
}

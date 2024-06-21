import { BadLLMResponse } from "../errors";
import {
  EntityDefinition,
  getPrimaryKeySchemaOfEntityDefinition,
} from "../schema/entity";
import { VaultPage } from "obsidian-vault-parser";
import { EntitySlice, EntitySliceFields, createEntitySlice } from "./types";
import { printNode, zodToTs } from "zod-to-ts";
import { llmCompletion } from "src/llm/completion";
import { z } from "zod";
import _ from "lodash";

export async function initializeEntitiesForType(
  file: VaultPage,
  entDef: EntityDefinition,
): Promise<EntitySlice[]> {
  // NOTE: in this step we are just filling out primary keys,
  // though we leave this context out of our prompt to avoid overwhelming the (likely smaller) LLM.
  const primaryKeyOnlySchema = getPrimaryKeySchemaOfEntityDefinition(entDef);
  const pkOnlySchemaSerialized = printNode(zodToTs(primaryKeyOnlySchema).node);
  const systemPrompt = `
This is a schema definition for the entity ${entDef.name}:
\`\`\`ts
interface ${entDef.name} ${pkOnlySchemaSerialized}

type Response = ${entDef.name}[];
\`\`\`

List all instances of the entity ${entDef.name}.
Extract the Respose JSON from the following file content:
\`\`\`
${file.content}
\`\`\`

`;
  const llmResponse = await llmCompletion({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const response_json_text = llmResponse.choices[0].message.content;
  if (!response_json_text) {
    throw new BadLLMResponse(llmResponse.choices[0].finish_reason);
  }
  const response_json = JSON.parse(response_json_text);

  // giving LLM some leeway
  const parseResult = z
    .array(primaryKeyOnlySchema)
    .or(primaryKeyOnlySchema)
    .safeParse(response_json);

  if (parseResult.error) {
    throw new BadLLMResponse(
      `LLM returned the following malformed JSON entity: 
${response_json}

Schema provided:
${pkOnlySchemaSerialized}`,
    );
  }

  // TODO: review type-checking around this
  const fields = _.flatten([parseResult.data]) as EntitySliceFields[];
  return fields.map((f) => createEntitySlice(entDef, f));
}

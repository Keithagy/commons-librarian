import { BadLLMResponse } from "../errors";
import {
  EntityDefinition,
  getPrimaryKeySchemaOfEntityDefinition,
  getSchemaOfEntityDefinition,
} from "../schema/entity";
import { VaultPage } from "obsidian-vault-parser";
import { EntitySlice } from "./types";
import { printNode, zodToTs } from "zod-to-ts";
import { llmCompletion } from "src/llm/completion";

export async function initializeEntitiesForType(
  file: VaultPage,
  entDef: EntityDefinition,
): Promise<EntitySlice[]> {
  // NOTE: in this step we are just filling out primary keys,
  // though we leave this context out of our prompt to avoid overwhelming the (likely smaller) LLM.
  const primaryKeyOnlySchema = getPrimaryKeySchemaOfEntityDefinition(entDef); // TODO: replace with function to extract only schema of primary keys
  const pkOnlySchemaSerialized = printNode(zodToTs(primaryKeyOnlySchema).node);
  const systemPrompt = `
This is a schema definition for the entity ${entDef.name}:
\`\`\`ts
${pkOnlySchemaSerialized}
\`\`\`

This file content has at least one ${entDef.name}:
\`\`\`
${file.content}
\`\`\`

Your task is to identify all instances of the entity ${entDef.name} and return a list of JSON objects representing them in terms of the schema.`;
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
  if (!Array.isArray(response_json)) {
    throw new BadLLMResponse("LLM did not return a JSON list as expected.");
  }
  return response_json.map((initializedEntityJson) => {
    const parseResult = primaryKeyOnlySchema.safeParse(initializedEntityJson);
    if (parseResult.error) {
      throw new BadLLMResponse(
        `LLM returned the following malformed JSON entity: 
${initializedEntityJson}

Schema provided:
${pkOnlySchemaSerialized}`,
      );
    }
    // TODO: review type-checking around this
    return parseResult.data as EntitySlice;
  });
}

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
  const dummy_slice = createEntitySlice(entDef, {});
  const pk = dummy_slice.getPrimaryKey();

  const primaryKeyOnlySchema = z.object({
    occurrences: z.array(getPrimaryKeySchemaOfEntityDefinition(entDef)),
  });
  const pkOnlySchemaSerialized = printNode(zodToTs(primaryKeyOnlySchema).node);
  const systemPrompt = `
List each unique ${entDef.name} given by the user by thair ${dummy_slice.getPrimaryKey().key}

## JSON Response Format

${pkOnlySchemaSerialized}

`;
  const llmResponse = await llmCompletion({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `# input text
\`\`\`
${file.content!}
 \`\`\`

Go ahead and list each unique ${entDef.name} in the text!
`,
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
  const parseResult = primaryKeyOnlySchema.safeParse(response_json);

  if (parseResult.error) {
    throw new BadLLMResponse(
      `LLM returned the following malformed JSON entity: 
${response_json}

Schema provided:
${pkOnlySchemaSerialized}`,
    );
  }

  // TODO: review type-checking around this
  const fields = _.flatten([
    parseResult.data.occurrences,
  ]) as EntitySliceFields[];
  return fields.map((f) => createEntitySlice(entDef, f));
}

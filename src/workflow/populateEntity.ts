import { VaultPage } from "obsidian-vault-parser";

import { zodToTs, printNode } from "zod-to-ts";
import { Context, EntitySlice } from "./types";
import { BadLLMResponse, EntityNotFoundError } from "../errors";
import { FieldDefinition } from "../schema/field";
import { llmCompletion } from "../llm/completion";
import { getSchemaOfEntityDefinition } from "src/schema/entity";
import { z } from "zod";
import _ from "lodash";

/**
 * returns a copy of `entityToPopulate` with populated fields
 **/
export async function populateEntity(
  ctx: Context,
  einst: EntitySlice,
  file: VaultPage,
): Promise<EntitySlice> {
  const entity = einst.definition;
  const scalarFields = einst
    .getFields("non-primary")
    .filter((f) => f.type === "scalar") as Extract<
    FieldDefinition,
    { type: "scalar" }
  >[];
  if (scalarFields.length <= 0) {
    return einst;
  }
  const schema = getSchemaOfEntityDefinition(entity);

  const tsSchema = printNode(zodToTs(schema).node);

  const pk = einst.getPrimaryKey();
  const pk_val = {
    [pk.key]: pk.value,
  };

  const rest = await llmCompletion({
    messages: [
      {
        role: "system",
        content: `

You extract JSON metadata about a ${entity.name}.
The ${entity.name} we are looking for has:
\`\`\`
${JSON.stringify(pk_val, null, 2)}
\`\`\`

## Output JSON schema
\`\`\`ts
${tsSchema}
\`\`\`

`,
      },
      {
        role: "user",
        content: `## input data
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
  const response_json = JSON.parse(response_json_text);
  const valid_json = z.array(schema).or(schema).parse(response_json);
  const flattend = _.flatten([valid_json]);

  const extracted = flattend.filter((e) => e[pk.key] === pk.value);

  if(extracted.length === 0) {
    throw new EntityNotFoundError(`Failed to populate ${entity.name} ${pk.value} `);
  }

  return Object.assign(einst, extracted[0]); // FIXME: remove pk from valid_json
}

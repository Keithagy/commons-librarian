import { VaultPage } from "obsidian-vault-parser";

import z from "zod";
import { zodToTs, printNode } from "zod-to-ts";
import { Context, EntitySlice } from "./types";
import {
  BadLLMResponse,
  EntityNotFoundError,
  NotImplementError,
} from "../errors";
import { FieldDefinition } from "../schema/field";
import { llmCompletion } from "../llm/completion";

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

  const scalarFields = einst.getFields("non-primary").filter(
    (f) => f.type === "scalar",
  ) as Extract<FieldDefinition, { type: "scalar" }>[];

  if (scalarFields.length > 0) {
    let zod_scalar_parser = z.object({});

    let zfield: z.ZodType<any, any, any>;

    scalarFields.forEach((field) => {
      switch (field.value) {
        case "string":
          zfield = z.string();
          break;
        case "number":
          zfield = z.number();
          break;
        case "boolean":
          zfield = z.boolean();
          break;
        default:
          throw new NotImplementError(
            `Field value ${field.value} not implemented`,
          );
      }
      zfield = zfield.describe("this is a comment");

      zod_scalar_parser = zod_scalar_parser.extend({
        [field.name]: zfield,
      });
    });

    const tsSchema = printNode(zodToTs(zod_scalar_parser).node);

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
    const valid_json: any = zod_scalar_parser.parse(response_json);

    console.log("valid_json", valid_json);
  }
  return einst;
}

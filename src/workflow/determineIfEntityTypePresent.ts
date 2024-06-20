import { llmCompletion } from "src/llm/completion";
import { EntityDefinition } from "../schema/entity";
import { BadLLMResponse, NotImplementError } from "../errors";
import { VaultPage } from "obsidian-vault-parser";
import { printNode, zodToTs } from "zod-to-ts";
import { z } from "zod";
import { FieldDefinition } from "src/schema/field";

export async function determineIfEntityTypePresent(
  file: VaultPage,
  entityDefinition: EntityDefinition,
): Promise<boolean> {
  const contents = file.content;
  if (contents === null) {
    return false; // file contents empty; couldn't possibly contain entity
  }
  // TODO: chunking consideration

  const scalarFields = entityDefinition.fields.filter(
    (f) => f.type === "scalar",
  ) as Extract<FieldDefinition, { type: "scalar" }>[];
  let zod_scalar_parser = z.object({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    zfield = zfield.describe(
      "First and/or last name of person, or part thereof",
    );

    zod_scalar_parser = zod_scalar_parser.extend({
      [field.name]: zfield,
    });
  });
  const tsSchema = printNode(zodToTs(zod_scalar_parser).node);
  console.log("schema", tsSchema);
  const rest = await llmCompletion({
    messages: [
      {
        role: "system",
        content: `
Your role is to determine if the file content below describes at least one ${entityDefinition.name}, represented by the following schema:
\`\`\`ts
${tsSchema}
\`\`\`

File content:
\`\`\`
${file.content}
\`\`\`

You are to respond ONLY with one of the following values:
- true if the file describes at least one instance of entity ${entityDefinition.name}, i.e the file content contains one or more of this entity
- false if the file describes no such entity
- null if unclear`,
      },
    ],
  });

  const response_json_text = rest.choices[0].message.content;
  if (!response_json_text) {
    throw new BadLLMResponse(rest.choices[0].finish_reason);
  }

  const response: boolean | null = JSON.parse(response_json_text);

  // TODO: this response indicates that the LLM was unsure; needs a retry mechanism
  if (response === null) {
    throw new BadLLMResponse(
      `LLM could not determine if entity ${entityDefinition.name} was present in the file at ${file.path}`,
    );
  }
  if (typeof response !== "boolean") {
    throw new BadLLMResponse(
      `LLM did not provide a valid (boolean) response when checking if entity ${entityDefinition.name} was present in the file at ${file.path}`,
    );
  }
  console.info("LLM valid response", response);
  console.info(
    `Entity ${entityDefinition.name} ${
      (response && "exists") || "does not exist"
    } in document at ${file.path}`,
  );
  return response;
}

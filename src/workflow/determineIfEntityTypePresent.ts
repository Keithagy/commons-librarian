import { llmCompletion } from "src/llm/completion";
import {
  EntityDefinition,
  getSchemaOfEntityDefinition,
} from "../schema/entity";
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

  const schema = getSchemaOfEntityDefinition(entityDefinition);
  const tsSchema = printNode(zodToTs(schema).node);
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

import Graph from "graphology";
import { Recipe, RecipeOneAtATime } from "./schema/recipe";
import z from "zod";
import { newId } from "./librarian";
import { hostname } from "os";
import { crawlURL } from "./crawler/crawl-url";
import { Attributes } from "graphology-types";
import { KnowledgeGraph, TextSnippet, zTextSnippet } from "./workflow/types";
import { EntityDefinition } from "./schema/entity";
import { determineIfEntityTypePresent } from "./workflow/determineIfEntityTypePresent";
import { initializeEntitiesForType } from "./workflow/initializeEntitiesForType";
import { populateEntity } from "./workflow/populateEntity";
import { retrieveEntity } from "./workflow/retrieveEntity";
import { mergeEntity } from "./workflow/mergeEntity";
import { performEntityParsing } from "./workflow";
import { htmlToMd } from "./crawler/html-to-md";

const zBaseNode = z.object({});

const zStringBlob = zBaseNode
  .extend({
    content: z.string(),
  })
  .strict();

const zJobNode = zBaseNode.extend({
  type: z.literal("job"),
});

const zURI = zBaseNode
  .extend({
    type: z.literal("url"),
    uri: z.string(),
    protocol: z.string(),
    host: z.string(),
    hostname: z.string(),
    port: z.string().optional(),
  })
  .strict();

export class RecipeRawUrl extends RecipeOneAtATime {
  constructor() {
    super("RecipeRawUrl", zStringBlob);
  }

  async applyOne(g: Graph, nid: string) {
    const node = g.getNodeAttributes(nid);
    const url_regex = /https?:\/\/[^\s]+/g;
    const urls =
      (g.getNodeAttributes(nid).content as string).match(url_regex) ?? [];

    for (const url of urls) {
      const url_parsed = new URL(url);
      const id = newId();
      g.addNode(
        id,
        zURI.parse({
          type: "url",
          uri: url,
          protocol: url_parsed.protocol,
          host: url_parsed.host,
          hostname: url_parsed.hostname,
          port: url_parsed.port,
        }) satisfies z.infer<typeof zURI>,
      );
    }
  }
}

export class Url2MDRecipe extends RecipeOneAtATime {
  constructor() {
    super("Url2MDRecipe", zURI);
  }

  async applyOne(g: Graph, nid: string) {
    const node = g.getNodeAttributes(nid) as z.output<typeof zURI>;
    const crawled = await crawlURL(node.uri);

    const md = await htmlToMd(crawled?.content ?? "");

    const new_node = zTextSnippet.parse({
      type: "zTextSnippet",
      content: md,
    } as z.input<typeof zTextSnippet>);

    g.addNode(newId(), new_node);
  }
}

// MDRecipe2EntityOccurence
// EntityFillProp
// EntityFillRelation

export class MDFindEntityOccurenceRecipe extends RecipeOneAtATime {
  constructor(
    private entites: EntityDefinition[],
    private kg: KnowledgeGraph,
  ) {
    super("MDRecipe2EntityOccurence", zTextSnippet);
  }

  async applyOne(g: Graph, nid: string): Promise<void> {
    const incomingDocument = zTextSnippet.parse(g.getNodeAttributes(nid));

    await performEntityParsing(this.entites, incomingDocument, this.kg);
  }
}

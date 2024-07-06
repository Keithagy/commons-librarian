import Graph from "graphology";
import type { z } from "zod";

export abstract class Recipe {
  constructor(private name: string) {}

  abstract match(g: Graph): Promise<boolean>;
  abstract apply(g: Graph): Promise<void>;

  get id(): string {
    return this.name;
  }
  getName(): string {
    return this.name;
  }
}

const key_processed = "processed";
export abstract class RecipeOneAtATime extends Recipe {
  constructor(
    name: string,
    public zod: z.AnyZodObject,
  ) {
    super(name);
  }

  async match(g: Graph) {
    return (
      g.filterNodes((nid, attr) => {
        return (
          this.zod.safeParse(attr).success && !g.hasDirectedEdge(this.id, nid)
        );
      }).length > 0
    );
  }

  async apply(g: Graph) {
    for (const nid of filterNodes(g, this.zod)) {
      g.addDirectedEdge(this.id, nid, {
        kind: key_processed,
      });
      await this.applyOne(g, nid);
    }
  }

  abstract applyOne(g: Graph, nid: string): Promise<void>;
}

export function filterNodes<Z extends z.AnyZodObject>(g: Graph, z: Z) {
  return g.filterNodes((_, attr) => z.safeParse(attr).success);
}

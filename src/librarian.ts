import Graph from "graphology";
import { Recipe } from "./schema/recipe";

export function newId() {
  return crypto.randomUUID();
}

export class Librarian {
  constructor(
    name: string,
    protected graph: Graph,
    protected recipes: Recipe[],
  ) {
    for (const r of recipes) {
      graph.addNode(r.id, { type: "Recipe" });
    }
  }

  async presentBlob(something: any) {
    const graph = this.graph;

    this.graph.addNode(newId(), {
      content: something,
    });

    while (true) {
      const recipes: Recipe[] = [];
      for (const recipe of this.recipes) {
        if (await recipe.match(this.graph)) {
          recipes.push(recipe);
        }
      }
      if (recipes.length === 0) {
        return; // completion
      } else if (recipes.length === 1) {
        await recipes[0].apply(graph);
      } else {
        throw new Error("Ambiguous recipes");
      }
    }
  }
}

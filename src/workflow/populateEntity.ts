import {VaultPage} from "obsidian-vault-parser"
import {Context, EntitySlice} from "@/workflow/types"
import {NotImplementError} from "@/errors"


export async function populateEntity(
    ctx: Context,
    entityToPopulate: EntitySlice,
    file: VaultPage,
): Promise<EntitySlice> {
    // NOTE: returns a copy of `entityToPopulate` with populated fields

    throw new NotImplementError();
}
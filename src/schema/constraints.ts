/**
 * validations of a more complex type like:
 * - nesting beyond single presence of single links
 * - primary key
 * - sql like constrains like uniqueness
 **/

import z from "zod"
import {zFieldName} from "./field"


export const zConflictResolution = z.object({
    type: z.literal('conflict-resolution'),
    field: zFieldName,
    strategy: z.union([z.literal('latest'), z.literal('earliest'), z.literal('custom')])
})

export const zPrimaryKeyDefinition = z.object({
    type: z.literal('primary-key'),
    field: zFieldName
})


export const zConstraintDefinition = z.union([zConflictResolution, zPrimaryKeyDefinition])


export type ConstraintDefinition = z.infer<typeof zConstraintDefinition>
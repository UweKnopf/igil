import { z } from "zod"

export const costumField = z.object({
    id: z.string(),
    type: z.enum(["short_text", "long_text", "select", "checkbox", "number", "url"]),
    label: z.string(),
    required: z.boolean().optional(),
    helpText: z.string().optional(),
    options: z.array(z.string()).optional(),
    validation: z
      .object({
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        pattern: z.string().optional(),
      })
      .optional()
    })
  
export const createFormSchema = z.object({
  formTitle: z.string().trim().min(1, 'A form name is required').max(100),
  description: z.string().trim().max(1000, 'No more than 1000 characters for the description').optional(),
  isOpen: z.boolean().default(true),
  OpensAt: z.iso.datetime().transform((value) => new Date(value)).default(() => new Date()),
  ClosesAt: z.iso.datetime().transform((value) => new Date(value)).optional(),
  acceptedMimeTypes: z.array(z.string()).optional(), //Correct? default value pdf
  //maxFileSizeBytes: z.int().optional(), //default value see schema
  //submittedAuthorEmail: z.email(),
  costumFields: z.array(costumField).optional(),
  publicOrgSlug: z
    .string()
    .trim()
    .min(1)
    .max(25)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Must be a lowercase URL slug (letters, numbers, and single hyphens only)'
    ),

})

export type CreateFormBody = z.infer<typeof createFormSchema>
export * as ConfigSkillsV1 from "./skills"

import { Schema } from "effect"

export const Info = Schema.Struct({
  paths: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Additional paths to skill folders",
  }),
  urls: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "URLs to fetch skills from (e.g., https://example.com/.well-known/skills/)",
  }),
  exclude_dir: Schema.optional(Schema.mutable(Schema.Array(Schema.String))).annotate({
    description:
      "Directories to exclude from skill discovery. Supports ~/ prefix, absolute, and relative paths.",
  }),
})
export type Info = Schema.Schema.Type<typeof Info>

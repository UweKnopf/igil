import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("account_issuer_accountId_uidx").on(
      table.issuer,
      table.accountId,
    ),
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  submissionForms: many(submissionForms),
  submissions: many(submissions)
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));



//Non Better-Auth generated schema tables
//The Form created by the org where authors submit their manuscripts
export const submissionForms = pgTable("submissionForms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    //Each Org can own multiple Forms
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    publicId: uuid("public_id").defaultRandom(), //used for accessing the public submission form page via url
    title: text("title").notNull(),
    description: text("description"),
    isOpen: boolean("is_open").notNull().default(false),

    opensAt: timestamp("opens_at", { withTimezone: true }),
    closesAt: timestamp("closes_at", { withTimezone: true }),

    acceptedMimeTypes: jsonb("accepted_mime_types")
      .$type<string[]>()
      .notNull()
      .default(["application/pdf"]),

    maxFileSizeBytes: integer("max_file_size_bytes")
      .notNull()
      .default(10 * 1024 * 1024),
    //Fields
    //Mandatory fields
    //submittedAuthorEmail: text("submitted_author_email").notNull(), //can be null for anonymous submission? Maybe with org user input
    //Org defined fields
    fields: jsonb("fields").$type<FormField[]>().notNull().default([]),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

  },
  (table) => [
    uniqueIndex("submission_forms_public_id_unique").on(table.publicId),
  ],

)

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),

  formId: uuid("form_id")
    .notNull()
    .references(() => submissionForms.id, { onDelete: "cascade" }),

  //Each Org can own multiple Forms
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  status: text("status").notNull().default("received"),
  // received | in_review | accepted | declined | withdrawn

  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),

  // Form responses keyed by field ID
  answers: jsonb("answers").$type<Record<string, unknown>>().notNull().default({}),

  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

  // Useful to support an emailed private management link without requiring an account
  managementTokenHash: text("management_token_hash"),
});

export const submissionFiles = pgTable("submission_files", {
  id: uuid("id").defaultRandom().primaryKey(),

  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),

  // Object storage location; never expose this as a public URL
  bucket: text("bucket").notNull(),
  objectKey: text("object_key").notNull(),

  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),

  // pending → uploaded → verified → quarantined → rejected
  uploadStatus: text("upload_status").notNull().default("pending"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

//For keeping the references between file upload and form submission
export const pendingSubmissionUploads = pgTable(
  "pending_submission_uploads",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    formId: uuid("form_id").notNull(),

    bucket: text("bucket").notNull(),
    objectKey: text("object_key").notNull(),

    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    expectedSizeBytes: integer("expected_size_bytes").notNull(),

    // Null until this upload is used in a real submission.
    consumedAt: timestamp("consumed_at", { withTimezone: true }),

    // For cleanup of abandoned uploads.
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("pending_submission_upload_object_key_unique").on(
      table.objectKey,
    ),
  ],
);

export type FormField = {
  id: string;
  type: "short_text" | "long_text" | "select" | "checkbox" | "number" | "url";
  label: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
};

export const submissionsRelations = relations(submissions, ({ one }) => ({
  organization: one(organization, {
    fields: [submissions.organizationId],
    references: [organization.id],
  }),
  submissionForms: one(submissionForms, {
    fields: [submissions.formId],
    references: [submissionForms.id],
  }),
}));

export const submissionFilesRelations = relations(submissionFiles, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionFiles.submissionId],
    references: [submissions.id],
  })
}));

export const pendingSubmissionsRelations = relations(pendingSubmissionUploads, ({ one }) => ({
  submissionForms: one(submissionForms, {
    fields: [pendingSubmissionUploads.formId],
    references: [submissionForms.id],
  })
}));

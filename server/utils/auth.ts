import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../../db";
import * as schema from "../../auth_schema";
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
      organization(/*{ //Only paying costumers should be allowed to create Orgs in prod
        allowUserToCreateOrganization: async (user) => { 
          const subscription = await getSubscription(user.id); //TODO: Add payments and provider (creem)
          return subscription.plan === "pro"; 
      },
    }*/) 
    ],
    emailAndPassword: { 
    enabled: true, 
  },
  database: drizzleAdapter(db, { 
    provider: "pg", // or "pg" or "mysql"
    schema,
  }),
});
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../../db";
import * as schema from "../../auth_schema";
import { organization } from "better-auth/plugins"
import { sendOrganizationInvitation } from "../email/email";

export const auth = betterAuth({
  plugins: [
      organization(/*{ //Only paying costumers should be allowed to create Orgs in prod
        allowUserToCreateOrganization: async (user) => { 
          const subscription = await getSubscription(user.id); //TODO: Add payments and provider (creem)
          return subscription.plan === "pro"; 
      },
    }*/
   {
    async sendInvitationEmail(data) {
      const inviteLink = `https://example.com/accept-invitation/${data.id}`;
      sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
    }
   }
   ) 
    ],
    emailAndPassword: { 
    enabled: true, 
  },
  database: drizzleAdapter(db, { 
    provider: "pg", // or "pg" or "mysql"
    schema,
  }),
});
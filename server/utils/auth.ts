import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "../../db";
import * as schema from "../../auth_schema";

export const auth = betterAuth({
    emailAndPassword: { 
    enabled: true, 
  }, 
  
   
  database: drizzleAdapter(db, { 
    provider: "pg", // or "pg" or "mysql"
    schema,
  }),
});
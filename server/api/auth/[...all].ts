import { auth } from "../../utils/auth";
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler((event) => {
    return auth.handler(toWebRequest(event));
});
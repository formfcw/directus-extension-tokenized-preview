import type { EndpointConfig } from "@directus/types";
import { createError } from "@directus/errors";

const endpoint = process.env.TOKENIZED_PREVIEW_ENDPOINT || "preview";
const directusUrl =
    process?.env?.PUBLIC_URL?.replace(/\/$/, "") || "http://localhost:8055";
const baseUrl =
    process.env.TOKENIZED_PREVIEW_BASE_URL ||
    process.env.PROJECT_URL ||
    directusUrl;
const tokenKey = process.env.TOKENIZED_PREVIEW_TOKEN_KEY || "token";
const refreshTokenCookieName =
    process.env.REFRESH_TOKEN_COOKIE_NAME || "directus_refresh_token";
const sessionCookieName =
    process.env.SESSION_COOKIE_NAME || "directus_session_token";

const TokenizedPreviewError = createError(
    "TOKENIZED_PREVIEW_ERROR",
    "Could not fetch access token! Make sure to be logged in!",
    500
);

export default {
    id: endpoint,
    handler: (router, context) => {
        const { services, getSchema } = context;
        const { AuthenticationService } = services;

        router.get("*", async (req: any, res: any, next: (x: any) => void) => {
            try {
                const accessToken = await getToken();
                if (!accessToken) return next(new TokenizedPreviewError());

                const originalUrl = req.originalUrl.replace(
                    new RegExp(`^/${endpoint}/`),
                    ""
                );

                const url = new URL(originalUrl, baseUrl);
                url.searchParams.append(tokenKey, accessToken);

                // For debugging
                // res.send({ originalUrl, url, accessToken });

                res.redirect(url);
            } catch (error: any) {
                res.status(500);
                res.send(error.message);
            }

            async function getToken() {
                if (req.cookies[sessionCookieName])
                    return req.cookies[sessionCookieName];

                if (req.cookies[refreshTokenCookieName]) {
                    const authService = new AuthenticationService({
                        schema: await getSchema(),
                        accountability: req.accountability,
                    });

                    const data = await authService.refresh(
                        req.cookies[refreshTokenCookieName]
                    );

                    if (data?.refreshToken) {
                        res.cookie(refreshTokenCookieName, data.refreshToken, {
                            maxAge: data.expires,
                            httpOnly: true,
                        });
                    }

                    return data?.accessToken;
                }

                return false;
            }
        });
    },
} as EndpointConfig;

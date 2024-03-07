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
                if (req.cookies.directus_session_token)
                    return req.cookies.directus_session_token;

                if (req.cookies.directus_refresh_token) {
                    const authService = new AuthenticationService({
                        schema: await getSchema(),
                        accountability: req.accountability,
                    });

                    const data = await authService.refresh(
                        req.cookies.directus_refresh_token
                    );

                    if (data?.refreshToken) {
                        res.cookie(
                            "directus_refresh_token",
                            data.refreshToken,
                            {
                                maxAge: data.expires,
                                httpOnly: true,
                            }
                        );
                    }

                    return data?.accessToken;
                }

                return false;
            }
        });
    },
} as EndpointConfig;

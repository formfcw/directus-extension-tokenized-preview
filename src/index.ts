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
    handler: (router) => {
        router.get("*", async (req: any, res: any, next: (x: any) => void) => {
            const { accessToken } = await _refreshAuth(req, res);
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
        });
    },
} as EndpointConfig;

async function _refreshAuth(req: any, res: any) {
    const resp = await fetch(`${directusUrl}/auth/refresh`, {
        method: "post",
        body: JSON.stringify({
            refresh_token: req.cookies.directus_refresh_token,
        }),
        headers: { "Content-Type": "application/json" },
    });
    const json = await resp.json();

    if (json?.data?.refresh_token) {
        res.cookie("directus_refresh_token", json.data.refresh_token, {
            maxAge: json.data.expires,
            httpOnly: true,
        });
    }

    return { accessToken: json?.data?.access_token };
}

export const githubResponse = <T>(data: T) => ({
    data,
    headers: {
        "x-ratelimit-limit": "5000",
        "x-ratelimit-remaining": "4999",
        "x-ratelimit-reset": "0",
    },
});

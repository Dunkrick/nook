export function handleServerError(res, error) {
    if (error instanceof Error) {
        return res.status(500).json({
            error: error.message,
        });
    }

    return res.status(500).json({
        error: "Unknown error",
    });
}
declare global {
    namespace Express {
        interface User {
            id: number;
        }

        interface Request {
            user: User;
        }
    }
}

export { };
export interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string;
    timezone: string;
    default_currency: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

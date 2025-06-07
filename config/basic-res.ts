export type BasicResponse = {
    success: boolean;
    title: string;
    message: string;
    data?: Record<string, unknown>
} & Record<string, unknown>
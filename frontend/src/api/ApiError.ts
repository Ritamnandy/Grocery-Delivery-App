export class ApiError extends Error
{
    readonly status: number;
    /** All validation messages from the server (NestJS returns an array) */
    readonly details: string[];

    constructor ( message: string, status = 0, details: string[] = [] )
    {
        super( message );
        this.name = "ApiError";
        this.status = status;
        this.details = details;
        Object.setPrototypeOf( this, ApiError.prototype );
    }
}
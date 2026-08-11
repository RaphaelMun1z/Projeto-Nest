// INTERFACE
export interface JwtPayload {
    sub: number;
    email: string;
    iat?: number;
    exp?: number;
}

// DTO
export class AuthResDTO {
    token!: string;
    expiresIn!: number;
}

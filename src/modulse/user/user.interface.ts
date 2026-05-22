
type Role = "contributor" | "maintainer";
export interface Iuser {
    name: string,
    email: string,
    password: string,
    role: Role
}
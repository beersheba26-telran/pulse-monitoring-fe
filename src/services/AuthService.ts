import type { AuthResponse, LoginData } from "../model/auth_types";

export default interface AuthService {
    login(loginData: LoginData): Promise<AuthResponse>;
    logout(): Promise<void>;
   
}
import type { AuthResponse, LoginData } from "../model/auth_types";
import type AuthService from "./AuthService";

type UserRole = LoginData["role"];

type MockUserCredentials = {
	id: string;
	role: UserRole;
	password: string;
};

const DOCTOR_IDS = ["1", "2", "3", "4", "5"];
const FIRST_TEN_PATIENT_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const mockCredentials: MockUserCredentials[] = [
	...DOCTOR_IDS.map((id) => ({
		id,
		role: "doctor" as const,
		password: `doctor${id}`,
	})),
	...FIRST_TEN_PATIENT_IDS.map((id) => ({
		id,
		role: "patient" as const,
		password: `patient${id}`,
	})),
];

class AuthServiceImpl implements AuthService {
	async login(loginData: LoginData): Promise<AuthResponse> {
		const matchedUser = mockCredentials.find(
			(user) =>
				user.id === loginData.id &&
				user.role === loginData.role &&
				user.password === loginData.password,
		);

		if (!matchedUser) {
			throw new Error("Invalid credentials");
		}

		return {
			token: `fake-token-${matchedUser.role}-${matchedUser.id}`,
			userId: matchedUser.id,
			role: matchedUser.role,
		};
	}

	async logout(): Promise<void> {
		return;
	}
}

export const authService = new AuthServiceImpl();

export default AuthServiceImpl;

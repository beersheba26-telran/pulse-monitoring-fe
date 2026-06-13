import type { AuthResponse, LoginData } from "../model/auth_types";
import type AuthService from "./AuthService";

type UserRole = LoginData["role"];

type MockUserCredentials = {
	id: string;
	role: UserRole;
	password: string;
};

const DOCTOR_IDS = ["doc_01", "doc_02", "doc_03", "doc_04", "doc_05","doc_06",
     "doc_07", "doc_08", "doc_09", "doc_10"];
const PATIENT_IDS = ["pat_001", "pat_002", "pat_003", "pat_004", "pat_005",
         "pat_006", "pat_007", "pat_008", "pat_009", "pat_010",
        "pat_011", "pat_012", "pat_013", "pat_014", "pat_015",
        "pat_016", "pat_017", "pat_018", "pat_019", "pat_020",
        "pat_021", "pat_022", "pat_023", "pat_024", "pat_025",
        "pat_026", "pat_027", "pat_028", "pat_029", "pat_030",
        "pat_031", "pat_032", "pat_033", "pat_034", "pat_035",
        "pat_036", "pat_037", "pat_038", "pat_039", "pat_040",
        "pat_041", "pat_042", "pat_043", "pat_044", "pat_045",
        "pat_046", "pat_047", "pat_048", "pat_049", "pat_050"];

const mockCredentials: MockUserCredentials[] = [
	...DOCTOR_IDS.map((id) => ({
		id,
		role: "doctor" as const,
		password: `${id}`,
	})),
	...PATIENT_IDS.map((id) => ({
		id,
		role: "patient" as const,
		password: `${id}`,
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

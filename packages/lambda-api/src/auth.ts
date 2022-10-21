import { getEnv } from "./env"
import { LambdaError } from "./error"

export function checkAuth(key: string) {
	if (key !== getEnv().AUTH_KEY) {
		throw LambdaError.auth()
	}
}

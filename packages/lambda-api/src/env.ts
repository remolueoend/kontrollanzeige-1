import { LambdaError } from "./error"

export type Env = {
	AUTH_KEY: string
	WEATHER_API_TOKEN: string
	OJP_KEY: string
	ENVIRONMENT: "production" | "development"
}

let _env: Env | null = null

export function getEnv(): Env {
	if (!_env) {
		if (!("AUTH_KEY" in process.env))
			throw LambdaError.server("missing environment variable AUTH_KEY")
		if (!("WEATHER_API_TOKEN" in process.env))
			throw LambdaError.server(
				"missing environment variable WEATHER_API_TOKEN"
			)
		if (!("OJP_KEY" in process.env))
			throw LambdaError.server("missing environment variable OJP_KEY")

		_env = {
			AUTH_KEY: process.env.AUTH_KEY!,
			WEATHER_API_TOKEN: process.env.WEATHER_API_TOKEN!,
			OJP_KEY: process.env.OJP_KEY!,
			ENVIRONMENT:
				process.env.NODE_ENV === "development"
					? process.env.NODE_ENV
					: "production",
		}
	}

	return _env
}

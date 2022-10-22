import { APIGatewayProxyEventHeaders } from "aws-lambda"
import { getEnv } from "./env"
import { LambdaError } from "./error"

const authHeaderPrefix = "Bearer "
const getTokenFromHeaders = (headers: APIGatewayProxyEventHeaders) =>
	headers["Authorization"] || headers["authorization"]

export function checkAuth(requestHeaders: APIGatewayProxyEventHeaders) {
	const key = getTokenFromHeaders(requestHeaders)?.substring(
		authHeaderPrefix.length
	)
	if (key !== getEnv().AUTH_KEY) {
		throw LambdaError.auth()
	}
}

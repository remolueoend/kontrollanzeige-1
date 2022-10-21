import { APIGatewayProxyResult } from "aws-lambda"

export function json<T>(body: T, statusCode = 200): APIGatewayProxyResult {
	return {
		statusCode,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	}
}

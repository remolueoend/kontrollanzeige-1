import { APIGatewayProxyResult } from "aws-lambda"
import { json } from "./resp"

export class LambdaError extends Error {
	constructor(
		public readonly code: 400 | 401 | 500,
		message: string,
		public readonly meta?: unknown,
		stack?: string
	) {
		super(message)
		if (stack) {
			this.stack = stack
		}
	}

	public toJSON() {
		if (process.env.NODE_ENV === "development") {
			return {
				code: this.code,
				message: this.message,
				meta: this.meta,
				stack: this.stack,
			}
		}
		return {
			code: this.code,
			message: this.message,
		}
	}

	toResult(): APIGatewayProxyResult {
		return json(this.toJSON(), this.code)
	}

	public static fromError(err: Error) {
		return new LambdaError(500, err.message, undefined, err.stack)
	}

	public static client(message = "client error", meta?: unknown) {
		return new LambdaError(400, message, meta)
	}

	public static server(message: string, meta?: unknown) {
		return new LambdaError(500, message, meta)
	}

	public static auth(message = "auth error") {
		return new LambdaError(401, message)
	}
}

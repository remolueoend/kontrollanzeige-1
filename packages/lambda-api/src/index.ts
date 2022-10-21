import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda"
import { Axios } from "axios"
import { z, ZodError } from "zod"
import { checkAuth } from "./auth"
import { LambdaError } from "./error"
import { json } from "./resp"
import { getTrips } from "./trips"

const inputLocation = z.union([
	z.object({ label: z.string(), lat: z.number(), long: z.number() }),
	z.object({ label: z.string(), placeRef: z.string() }),
])
export const inputSchema = z.object({
	authKey: z.string(),
	journeys: z.array(
		z.object({
			from: inputLocation,
			to: inputLocation,
		})
	),
})

export async function handler(
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	try {
		const result = await handleRequest(event, context)
		return result
	} catch (err) {
		if (err instanceof LambdaError) {
			return err.toResult()
		} else {
			return LambdaError.fromError(err as Error).toResult()
		}
	}
}

function parseArgs(event: APIGatewayEvent): z.infer<typeof inputSchema> {
	try {
		return inputSchema.parse(JSON.parse(event.body!))
	} catch (err) {
		throw LambdaError.client(
			"failed to parse input args",
			(err as ZodError).issues
		)
	}
}

async function handleRequest(
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	const args = parseArgs(event)
	checkAuth(args.authKey)

	const journeys = await Promise.all(
		args.journeys.map(async (j) => ({
			from: j.from,
			to: j.to,
			trips: await getTrips(j.from, j.to),
		}))
	)

	return json(journeys)
}

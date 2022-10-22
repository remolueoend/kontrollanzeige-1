import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda"
import { Axios } from "axios"
import { z, ZodError } from "zod"
import { checkAuth } from "./auth"
import { LambdaError } from "./error"
import { json } from "./resp"
import { getTrips } from "./trips"
import { getForecast } from "./weather"

const journeyLocation = z.union([
	z.object({ label: z.string(), lat: z.number(), long: z.number() }),
	z.object({ label: z.string(), placeRef: z.string() }),
])
export const inputSchema = z.object({
	journeys: z.array(
		z.object({
			from: journeyLocation,
			to: journeyLocation,
		})
	),
	forecasts: z.array(
		z.object({
			locationId: z.string(),
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
	checkAuth(event.headers)
	const args = parseArgs(event)

	const forecastsPromise = Promise.all(
		args.forecasts.map(async (f) => await getForecast(f.locationId))
	)

	const journeysPromise = Promise.all(
		args.journeys.map(async (j) => ({
			from: j.from,
			to: j.to,
			trips: await getTrips(j.from, j.to),
		}))
	)

	const [forecasts, journeys] = await Promise.all([
		forecastsPromise,
		journeysPromise,
	])

	return json({
		journeys,
		forecasts,
	})
}

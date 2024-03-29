import { APIGatewayProxyEvent, Context } from "aws-lambda"
import { z } from "zod"
import { handler, inputSchema } from "./index"

const body: z.infer<typeof inputSchema> = {
	journeys: [
		{
			from: { placeRef: "8503000", label: "Zürich" },
			to: {
				lat: 47.3673417,
				long: 8.5521984,
				label: "Ergon Informatik AG",
			},
		},
	],
	forecasts: [
		{
			locationId: "47.4823,8.4595",
		},
	],
}

const event: APIGatewayProxyEvent = {
	headers: { Authorization: `Bearer ${process.env.AUTH_KEY}` },
	httpMethod: "get",
	isBase64Encoded: false,
	multiValueHeaders: {},
	multiValueQueryStringParameters: {},
	path: "/",
	pathParameters: {},
	queryStringParameters: {},
	requestContext: {} as any,
	resource: "",
	stageVariables: {},
	body: JSON.stringify(body),
}
const context: Context = {
	callbackWaitsForEmptyEventLoop: true,
	functionName: "",
	functionVersion: "",
	invokedFunctionArn: "",
	memoryLimitInMB: "",
	awsRequestId: "",
	logGroupName: "",
	logStreamName: "",
	getRemainingTimeInMillis: () => 0,
	done: () => {},
	fail: () => {},
	succeed: () => {},
}

async function test() {
	const result = await handler(event, context)
	console.log(result)
}

test()

import { DateTime, Duration } from "luxon"
import { encodeTripRequest } from "./xml-encoding"
import { js2xml, xml2js } from "xml-js"
import { Axios } from "axios"
import { getEnv } from "../env"
import { LambdaError } from "../error"
import { ojpLeg, ojpResponse } from "./schemas"
import { z, ZodError } from "zod"
import { decodeTrips } from "./decoding"

const axios = () =>
	new Axios({
		headers: {
			Authorization: `Bearer ${getEnv().OJP_KEY}`,
			"Content-Type": "application/xml",
		},
		responseType: "text",
	})

export type Location =
	| {
			lat: number
			long: number
			label: string
	  }
	| {
			placeRef: string
			label: string
	  }

export type Leg =
	| {
			type: "timed"
			departure: {
				stopName: string
				quay?: string
				time: {
					planned: DateTime
					estimated?: DateTime
					delay: Duration
				}
			}
			arrival: {
				stopName: string
				quay?: string
				time: {
					planned: DateTime
					estimated?: DateTime
					delay: Duration
				}
			}
			service: {
				mode: "rail" | "bus" | "tram"
				lineName: string
				lastStop: string
			}
	  }
	| {
			type: "transfer"
			mode: "walk"
			duration: Duration
			departure: {
				time: DateTime
				location: string
			}
			arrival: {
				time: DateTime
				location: string
			}
	  }
	| {
			type: "continuous"
			service: {
				mode: "walk"
			}
			duration: Duration
			departure: {
				time: DateTime
				location: string
			}
			arrival: {
				time: DateTime
				location: string
			}
	  }

export type Trip = {
	start: DateTime
	end: DateTime
	legs: Leg[]
}

export async function getTrips(
	from: Location,
	to: Location,
	time = DateTime.now()
): Promise<Trip[]> {
	const encodedRequestBody = encodeTripRequest(from, to, time)
	const requestBody = js2xml(encodedRequestBody, { compact: true })

	const resp = await axios().post(
		"https://api.opentransportdata.swiss/ojp2020",
		requestBody
	)
	if (resp.status !== 200) {
		throw LambdaError.server("OJP request failed", resp.data)
	}

	const asJsObject = xml2js(resp.data, { compact: true })
	try {
		const parsedData = ojpResponse.parse(asJsObject)
		return decodeTrips(parsedData)
	} catch (err) {
		const zodErroor = err as ZodError
		throw LambdaError.server(
			"failed to parse OJP response",
			zodErroor.issues
		)
	}
}

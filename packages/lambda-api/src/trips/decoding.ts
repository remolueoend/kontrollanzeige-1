import { Duration } from "luxon"
import { z } from "zod"
import { Leg, Trip } from "."
import { LambdaError } from "../error"
import {
	ojpContinuousLeg,
	ojpLeg,
	ojpResponse,
	ojpTimedLeg,
	ojpTransferLeg,
} from "./schemas"

function decodeTimedLeg(leg: z.infer<typeof ojpTimedLeg>): Leg {
	const ojpDep = leg["ojp:LegBoard"]
	const ojpArr = leg["ojp:LegAlight"]
	return {
		type: "timed",
		departure: {
			stopName: ojpDep["ojp:StopPointName"],
			quay: ojpDep["ojp:EstimatedQuay"] || ojpDep["ojp:PlannedQuay"],
			time: {
				planned: ojpDep["ojp:ServiceDeparture"]["ojp:TimetabledTime"],
				estimated: ojpDep["ojp:ServiceDeparture"]["ojp:EstimatedTime"],
				delay: ojpDep["ojp:ServiceDeparture"]["ojp:EstimatedTime"]
					? ojpDep["ojp:ServiceDeparture"]["ojp:EstimatedTime"].diff(
							ojpDep["ojp:ServiceDeparture"]["ojp:TimetabledTime"]
					  )
					: Duration.fromMillis(0),
			},
		},
		arrival: {
			stopName: ojpArr["ojp:StopPointName"],
			quay: ojpArr["ojp:EstimatedQuay"] || ojpArr["ojp:PlannedQuay"],
			time: {
				planned: ojpArr["ojp:ServiceArrival"]["ojp:TimetabledTime"],
				estimated: ojpArr["ojp:ServiceArrival"]["ojp:EstimatedTime"],
				delay: ojpArr["ojp:ServiceArrival"]["ojp:EstimatedTime"]
					? ojpArr["ojp:ServiceArrival"]["ojp:EstimatedTime"].diff(
							ojpArr["ojp:ServiceArrival"]["ojp:TimetabledTime"]
					  )
					: Duration.fromMillis(0),
			},
		},
		service: {
			mode: leg["ojp:Service"]["ojp:Mode"]["ojp:PtMode"],
			lineName: leg["ojp:Service"]["ojp:PublishedLineName"],
			lastStop: leg["ojp:Service"]["ojp:DestinationText"],
		},
	}
}

function decodeTransferLeg(leg: z.infer<typeof ojpTransferLeg>): Leg {
	return {
		type: "transfer",
		departure: {
			location: leg["ojp:LegStart"]["ojp:LocationName"],
			time: leg["ojp:TimeWindowStart"],
		},
		arrival: {
			location: leg["ojp:LegEnd"]["ojp:LocationName"],
			time: leg["ojp:TimeWindowEnd"],
		},
		mode: leg["ojp:TransferMode"],
		duration: leg["ojp:TimeWindowStart"].diff(leg["ojp:TimeWindowEnd"]),
	}
}

function decodeContinuousLeg(leg: z.infer<typeof ojpContinuousLeg>): Leg {
	return {
		type: "continuous",
		departure: {
			location: leg["ojp:LegStart"]["ojp:LocationName"],
			time: leg["ojp:TimeWindowStart"],
		},
		arrival: {
			location: leg["ojp:LegEnd"]["ojp:LocationName"],
			time: leg["ojp:TimeWindowEnd"],
		},
		service: {
			mode: leg["ojp:Service"]["ojp:IndividualMode"],
		},
		duration: leg["ojp:TimeWindowStart"].diff(leg["ojp:TimeWindowEnd"]),
	}
}

function decodeLeg(leg: z.infer<typeof ojpLeg>): Leg {
	if ("ojp:TimedLeg" in leg) {
		return decodeTimedLeg(leg["ojp:TimedLeg"])
	} else if ("ojp:TransferLeg" in leg) {
		return decodeTransferLeg(leg["ojp:TransferLeg"])
	} else if ("ojp:ContinuousLeg" in leg) {
		return decodeContinuousLeg(leg["ojp:ContinuousLeg"])
	} else {
		throw LambdaError.server("unexpected leg type", leg)
	}
}

export function decodeTrips(resp: z.infer<typeof ojpResponse>): Trip[] {
	const ojpTrips = resp["siri:OJP"]["siri:OJPResponse"][
		"siri:ServiceDelivery"
	]["ojp:OJPTripDelivery"]["ojp:TripResult"].map((r) => r["ojp:Trip"])

	return ojpTrips.map((trip) => ({
		start: trip["ojp:StartTime"],
		end: trip["ojp:EndTime"],
		legs: trip["ojp:TripLeg"].map(decodeLeg),
	}))
}

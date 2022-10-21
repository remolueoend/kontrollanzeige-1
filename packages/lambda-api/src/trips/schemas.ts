import { z } from "zod"
import { DateTime } from "luxon"

const xmlStringValue = z.object({ _text: z.string() }).transform((v) => v._text)
const xmlNumberValue = xmlStringValue.transform((v) => Number(v))
const xmlDateValue = xmlStringValue.transform((v) => DateTime.fromISO(v))

const ojpTime = z.object({
	"ojp:TimetabledTime": xmlDateValue,
	"ojp:EstimatedTime": xmlDateValue.optional(),
})

const ojpDuration = xmlStringValue

const ojpMode = z.object({
	"ojp:PtMode": z
		.object({ _text: z.enum(["rail", "bus", "tram"]) })
		.transform((v) => v._text),
})

const ojpText = z
	.object({
		"ojp:Text": xmlStringValue,
	})
	.transform((v) => v["ojp:Text"])

const ojpLocation = z.object({
	"ojp:LocationName": ojpText,
})

const ojpService = z.object({
	"ojp:Mode": ojpMode,
	"ojp:PublishedLineName": ojpText,
	"ojp:DestinationText": ojpText,
})

export const ojpTimedLeg = z.object({
	"ojp:LegBoard": z.object({
		"ojp:StopPointName": ojpText,
		"ojp:PlannedQuay": ojpText.optional(),
		"ojp:EstimatedQuay": ojpText.optional(),
		"ojp:ServiceDeparture": ojpTime,
		"ojp:Order": xmlNumberValue,
	}),
	"ojp:LegAlight": z.object({
		"ojp:StopPointName": ojpText,
		"ojp:PlannedQuay": ojpText.optional(),
		"ojp:EstimatedQuay": ojpText.optional(),
		"ojp:ServiceArrival": ojpTime,
		"ojp:Order": xmlNumberValue,
	}),
	"ojp:Service": ojpService,
})

export const ojpTransferLeg = z.object({
	"ojp:TransferMode": z
		.object({ _text: z.literal("walk") })
		.transform((v) => v._text),
	"ojp:LegStart": ojpLocation,
	"ojp:LegEnd": ojpLocation,
	"ojp:TimeWindowStart": xmlDateValue,
	"ojp:TimeWindowEnd": xmlDateValue,
	"ojp:Duration": ojpDuration,
})
export const ojpContinuousLeg = z.object({
	"ojp:Duration": ojpDuration,
	"ojp:LegStart": ojpLocation,
	"ojp:LegEnd": ojpLocation,
	"ojp:TimeWindowStart": xmlDateValue,
	"ojp:TimeWindowEnd": xmlDateValue,
	"ojp:Service": z.object({
		"ojp:IndividualMode": z
			.object({ _text: z.literal("walk") })
			.transform((v) => v._text),
	}),
})

export const ojpLeg = z.union([
	z.object({ "ojp:TimedLeg": ojpTimedLeg }),
	z.object({ "ojp:TransferLeg": ojpTransferLeg }),
	z.object({ "ojp:ContinuousLeg": ojpContinuousLeg }),
])

const ojpTrip = z.object({
	"ojp:Duration": ojpDuration,
	"ojp:Transfers": xmlNumberValue,
	"ojp:StartTime": xmlDateValue,
	"ojp:EndTime": xmlDateValue,
	"ojp:TripLeg": z.array(ojpLeg),
})

const ojpTripResult = z.object({
	"ojp:ResultId": xmlStringValue,
	"ojp:Trip": ojpTrip,
})

export const ojpResponse = z.object({
	"siri:OJP": z.object({
		"siri:OJPResponse": z.object({
			"siri:ServiceDelivery": z.object({
				"ojp:OJPTripDelivery": z.object({
					"ojp:TripResult": z.array(ojpTripResult),
				}),
			}),
		}),
	}),
})

import { DateTime } from "luxon"
import { Location } from "."

const tagValue = (value: { toString(): string }) => ({
	_text: value.toString(),
})

const ojpText = (text: string) => ({
	"ojp:Text": tagValue(text),
})
const objText = (text: string) => ({
	"obj:Text": tagValue(text),
})

const dateString = (value: DateTime) => value.toISO()

const location = (location: Location) =>
	"placeRef" in location
		? {
				"ojp:StopPlaceRef": tagValue(location.placeRef),
				"ojp:LocationName": ojpText(location.label),
		  }
		: {
				"ojp:GeoPosition": {
					Longitude: tagValue(location.long),
					Latitude: tagValue(location.lat),
				},
				"ojp:LocationName": objText(location.label),
		  }

const declaration = { _attributes: { version: "1.0", encoding: "UTF-8" } }
const rootAttributes = {
	_attributes: {
		"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
		"xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
		xmlns: "http://www.siri.org.uk/siri",
		version: "1.0",
		"xmlns:ojp": "http://www.vdv.de/ojp",
		"xsi:schemaLocation":
			"http://www.siri.org.uk/siri ../ojp-xsd-v1.0/OJP.xsd",
	},
}

export function encodeTripRequest(
	from: Location,
	to: Location,
	time = DateTime.now()
) {
	const requestTimestamp = DateTime.now()
	return {
		_declaration: declaration,
		OJP: {
			...rootAttributes,
			OJPRequest: {
				ServiceRequest: {
					RequestTimestamp: tagValue(dateString(requestTimestamp)),
					RequestorRef: tagValue("wipfsteg/kontrollanzeige-1/api"),
					"ojp:OJPTripRequest": {
						RequestTimestamp: tagValue(
							dateString(requestTimestamp)
						),
						"ojp:Origin": {
							"ojp:PlaceRef": location(from),
							"ojp:DepArrTime": dateString(time),
						},
						"ojp:Destination": {
							"ojp:PlaceRef": location(to),
						},
						"ojp:Params": {
							"ojp:IncludeTrackSections": {},
							"ojp:IncludeTurnDescription": {},
							"ojp:IncludeIntermediateStops": {},
						},
					},
				},
			},
		},
	}
}

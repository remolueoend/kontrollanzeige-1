import { test, expect } from "@jest/globals"
import { encodeTripRequest } from "./xml-encoding"
import { js2xml } from "xml-js"

test("correctly encodes a trip request", () => {
	const encoded = encodeTripRequest(
		{ placeRef: "8503000", label: "Zürich" },
		{ lat: 47.3673417, long: 8.5521984, label: "Ergon Informatik AG" }
	)

	const xml = js2xml(encoded, { compact: true })
	console.log(xml)

	expect(xml).not.toBeNull()
})

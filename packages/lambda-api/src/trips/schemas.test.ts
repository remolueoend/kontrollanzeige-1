import { test, expect } from "@jest/globals"
import fs from "fs"
import { xml2js } from "xml-js"
import { ojpResponse } from "./schemas"
import path from "path"

test("parses test1.xml correctly", () => {
	const xmlStr = fs.readFileSync(path.resolve(__dirname, "./test1.xml"), {
		encoding: "utf-8",
	})
	const obj = xml2js(xmlStr, { compact: true })
	const parsed = ojpResponse.parse(obj)

	const trips =
		parsed["siri:OJP"]["siri:OJPResponse"]["siri:ServiceDelivery"][
			"ojp:OJPTripDelivery"
		]["ojp:TripResult"]

	expect(trips[0]["ojp:Trip"]["ojp:Transfers"]).not.toBeNull()
})

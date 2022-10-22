import { DateTime } from "luxon"
import { z } from "zod"

// see: file:///home/remo/Downloads/2021-03-29%20srf_meteo_api_commercial_eng_dok-1.pdf

const dateTime = z.string().transform((v) => DateTime.fromISO(v))

export const forecastHour = z.object({
	local_date_time: dateTime,
	TTT_C: z.number(),
	TTL_C: z.number(),
	TTH_C: z.number(),
	PROBPCP_PERCENT: z.number(),
	RRR_MM: z.number(),
	FF_KMH: z.number(),
	FX_KMH: z.number(),
	DD_DEG: z.number(),
	SYMBOL_CODE: z.number(),
	type: z.literal("hour"),
})

const forecastGeolocation = z.object({})

const forecastForecast = z.object({
	hour: z.array(forecastHour),
})

export const forecastResponse = z.object({
	geolocation: forecastGeolocation,
	forecast: forecastForecast,
})

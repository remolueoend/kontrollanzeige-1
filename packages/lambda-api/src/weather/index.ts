import { Axios } from "axios"
import { DateTime } from "luxon"
import { z, ZodError } from "zod"
import { getEnv } from "../env"
import { LambdaError } from "../error"
import { forecastHour, forecastResponse } from "./schemas"

const axios = () =>
	new Axios({
		responseType: "json",
		headers: {
			Authorization: `Bearer ${getEnv().WEATHER_API_TOKEN}`,
			"Content-Type": "application/json",
		},
	})

type HourForecast = {
	time: DateTime
	temperature: number
	rainProbability: number
	symbol: number
}

export type DayForecast = {
	morning: HourForecast
	midday: HourForecast
	evening: HourForecast
}

function decodeHourForecast(
	forecast: z.infer<typeof forecastHour>
): HourForecast {
	return {
		time: forecast.local_date_time,
		rainProbability: forecast.PROBPCP_PERCENT,
		temperature: forecast.TTT_C,
		symbol: forecast.SYMBOL_CODE,
	}
}

function decodeForecast(
	response: z.infer<typeof forecastResponse>
): DayForecast {
	const morningForecast = response.forecast.hour[3]
	const middayForecast = response.forecast.hour[5]
	const eveningForecast = response.forecast.hour[6]

	return {
		morning: decodeHourForecast(morningForecast),
		midday: decodeHourForecast(middayForecast),
		evening: decodeHourForecast(eveningForecast),
	}
}

export async function getForecast(locationId: string): Promise<DayForecast> {
	const resp = await axios().get(
		`https://api.srgssr.ch/srf-meteo/forecast/${locationId}`
	)

	if (resp.status !== 200) {
		throw LambdaError.server("failed to request forecast", resp.data)
	}

	try {
		const parsed = forecastResponse.parse(JSON.parse(resp.data))
		return decodeForecast(parsed)
	} catch (err) {
		throw LambdaError.server(
			"failed to parse forecast response",
			(err as ZodError).issues
		)
	}
}

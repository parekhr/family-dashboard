import type { Location } from '../../hooks/useHouseholdData'

type PlaceResult = {
    name: string
    admin1?: string
    latitude: number
    longitude: number
}

const stateCodes: Record<string, string> = {
    Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
    Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC', Florida: 'FL',
    Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN',
    Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME',
    Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
    Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH',
    'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
    Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
    'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
    Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI',
    Wyoming: 'WY',
}

export async function searchLocations(query: string): Promise<Location[]> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&countryCode=US`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Location search failed (${response.status})`)
    const data = await response.json()

    return (data.results ?? []).map((place: PlaceResult) => ({
        latitude: Number(place.latitude.toFixed(4)),
        longitude: Number(place.longitude.toFixed(4)),
        name: place.admin1 ? `${place.name}, ${stateCodes[place.admin1] ?? place.admin1}` : place.name,
    }))
}
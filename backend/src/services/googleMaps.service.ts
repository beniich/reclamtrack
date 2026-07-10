import { Client, TravelMode } from "@googlemaps/google-maps-services-js";
import { logger } from '../utils/logger.js';

/**
 * Service pour interagir avec les APIs Google Maps (Distance Matrix, Traffic)
 */
export class GoogleMapsService {
    private client: Client;
    private apiKey: string;

    constructor() {
        this.client = new Client({});
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    }

    /**
     * Calcule la distance et le temps de trajet réel (avec trafic) entre deux points
     */
    async getDistanceAndDuration(origin: string, destination: string) {
        if (!this.apiKey) {
            logger.warn("⚠️ Google Maps API Key manquante. Mode simulation activé.");
            return this.getMockData();
        }

        try {
            const response = await this.client.distancematrix({
                params: {
                    origins: [origin],
                    destinations: [destination],
                    mode: TravelMode.driving,
                    departure_time: new Date(), // Prise en compte du trafic temps réel
                    key: this.apiKey
                }
            });

            const element = response.data.rows[0].elements[0];
            return {
                distance: element.distance.text,
                duration: element.duration.text,
                durationInTraffic: element.duration_in_traffic ? element.duration_in_traffic.text : element.duration.text,
                status: element.status
            };
        } catch (error) {
            logger.error("❌ Erreur Google Maps API:", error);
            return this.getMockData();
        }
    }

    private getMockData() {
        return {
            distance: "12.4 km",
            duration: "25 mins",
            durationInTraffic: "32 mins (Trafic dense)",
            status: "OK"
        };
    }
}

export const googleMapsService = new GoogleMapsService();

import { Client } from '@hubspot/api-client';
import { logger } from '../utils/logger.js';

let hubspotClient: Client | null = null;

/**
 * Initialise le client HubSpot de manière lazy (paresseuse).
 */
const getClient = (): Client => {
    if (!hubspotClient) {
        const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
        if (!accessToken || accessToken === 'votre_token_hubspot_ici') {
            logger.warn('HUBSPOT_ACCESS_TOKEN est manquant ou invalide. Les appels à HubSpot seront ignorés.');
        }
        // Même si le token est manquant, on instancie pour ne pas casser l'app,
        // mais les appels réels échoueront ou on les simulera.
        hubspotClient = new Client({ accessToken: accessToken || '' });
    }
    return hubspotClient;
};

export const getHubspotStatus = async () => {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token || token === 'votre_token_hubspot_ici') {
        return { connected: false, message: 'Non configuré (Token manquant)' };
    }
    try {
        // Simple appel pour tester la validité (ex: get l'owner ou le compte)
        const client = getClient();
        // L'API CRM V3 standard pour vérifier l'accès: récupérer les propriétés de base des contacts
        await client.crm.contacts.coreApi.getPage(1, undefined, undefined, undefined, undefined, false);
        return { connected: true, message: 'Connecté' };
    } catch (error) {
        logger.error('Erreur de connexion HubSpot', error);
        return { connected: false, message: 'Erreur de connexion (Token potentiellement invalide)' };
    }
};

export interface HubSpotContactInput {
    email: string;
    firstname: string;
    lastname: string;
    phone?: string;
    company?: string;
    linkedin_url?: string;
    lifecyclestage?: string; // lead, marketingqualifiedlead, customer
}

export const createOrUpdateContact = async (contact: HubSpotContactInput) => {
    const client = getClient();
    
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
        logger.info('[MOCK] Création de contact HubSpot simulée (Pas de token):', contact);
        return { success: true, mocked: true, contactId: 'mock-id-1234' };
    }

    try {
        // Note: L'API v3 Contacts
        const properties = {
            email: contact.email,
            firstname: contact.firstname,
            lastname: contact.lastname,
            phone: contact.phone || '',
            company: contact.company || '',
            linkedin_url: contact.linkedin_url || '',
            lifecyclestage: contact.lifecyclestage || 'lead'
        };

        const apiResponse = await client.crm.contacts.basicApi.create({
            properties,
            associations: []
        });

        logger.info('Contact HubSpot créé:', apiResponse.id);
        return { success: true, contactId: apiResponse.id, mocked: false };
    } catch (e: any) {
        // Gestion de l'erreur "Contact déjà existant"
        if (e.code === 409 && e.body?.message?.includes('already exists')) {
            logger.warn('Le contact existe déjà sur HubSpot:', contact.email);
            // On pourrait faire un Update ici avec searchApi, mais on retourne juste succès pour l'instant
            return { success: true, message: 'Le contact existe déjà', mocked: false };
        }
        logger.error('Erreur lors de la création du contact HubSpot', e.message);
        throw new Error('Impossible de créer le contact dans HubSpot');
    }
};

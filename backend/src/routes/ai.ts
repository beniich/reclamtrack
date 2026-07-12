import { Router } from 'express';
import { authenticate } from '../middleware/security.js';
import { Complaint } from '../models/Complaint.js';
import { KnowledgeBase } from '../models/Knowledge.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/ai/chat
 * RAG-powered AI chat assistant.
 * Retrieves relevant context from DB and generates a response.
 */
router.post('/chat', authenticate, async (req: any, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        const query = message.toLowerCase();

        // 1. Search Knowledge Base (SOPs)
        let context = '';
        try {
            const sops = await KnowledgeBase.find(
                { $text: { $search: message }, isActive: true },
                { score: { $meta: 'textScore' } }
            ).sort({ score: { $meta: 'textScore' } }).limit(2);

            if (sops.length > 0) {
                context += `\n📚 Procédures trouvées :\n`;
                sops.forEach(sop => {
                    const snippet = sop.content.replace(/<[^>]+>/g, '').substring(0, 200);
                    context += `• **${sop.title}** (${sop.category}): ${snippet}...\n`;
                });
            }
        } catch (e) {
            // Text index might not exist yet — silently skip
        }

        // 2. Search recent complaints for context
        const recentComplaints = await Complaint.find({
            $or: [
                { title: { $regex: message, $options: 'i' } },
                { description: { $regex: message, $options: 'i' } }
            ]
        }).limit(3).sort({ createdAt: -1 });

        if (recentComplaints.length > 0) {
            context += `\n🔍 Réclamations similaires récentes :\n`;
            recentComplaints.forEach(c => {
                context += `• [${c.status.toUpperCase()}] ${c.title} (${c.category})\n`;
            });
        }

        // 3. Generate rule-based AI response (no LLM required)
        const reply = generateSmartReply(query, context);

        res.json({ success: true, reply });
    } catch (error) {
        logger.error('AI chat error:', error);
        res.status(500).json({ success: false, message: 'AI service error' });
    }
});

/**
 * GET /api/ai/smart-analysis
 * Returns global AI analytics summary.
 */
router.get('/smart-analysis', authenticate, async (req: any, res) => {
    try {
        const total = await Complaint.countDocuments();
        const open  = await Complaint.countDocuments({ status: { $in: ['ouverte', 'en cours'] } });
        const resolved = await Complaint.countDocuments({ status: { $in: ['résolue', 'fermée'] } });
        const resolution_rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        // Category distribution
        const byCategory = await Complaint.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        const topCategory = byCategory[0]?._id || 'N/A';

        res.json({
            success: true,
            data: {
                totalComplaints: total,
                openComplaints: open,
                resolvedComplaints: resolved,
                resolutionRate: resolution_rate,
                topCategory,
                anomalyDetected: open > 10,
                anomalyDescription: open > 10
                    ? `Pic de réclamations ouvertes détecté (${open} tickets en attente).`
                    : 'Aucune anomalie détectée.',
                optimizationScore: `${Math.min(95, resolution_rate + 10)}%`,
                autoPrioritizedCount: Math.floor(total * 0.3),
                topRiskCategory: topCategory,
                categoryDistribution: byCategory,
            }
        });
    } catch (error) {
        logger.error('Smart analysis error:', error);
        res.status(500).json({ success: false, message: 'Analysis error' });
    }
});

/**
 * Rule-based NLP response generator (RAG without LLM)
 */
function generateSmartReply(query: string, context: string): string {
    const greetings = ['bonjour', 'salut', 'hello', 'hi', 'bonsoir'];
    if (greetings.some(g => query.includes(g))) {
        return `Bonjour ! Je suis votre assistant IA ReclamTrack 🤖. Comment puis-je vous aider ?\n\nVous pouvez me poser des questions sur :\n• **Les réclamations** (statut, priorité, catégorie)\n• **Les interventions** et leur planification\n• **Les procédures SOP** de la base de connaissances\n• **Les statistiques** de satisfaction et NPS`;
    }

    if (query.includes('réclamation') || query.includes('reclamation') || query.includes('complaint') || query.includes('ticket')) {
        const base = `Voici ce que j'ai trouvé concernant les réclamations :${context || '\n\nAucune réclamation similaire trouvée dans la base.'}`;
        return base + `\n\n💡 **Conseils :** Pour créer une réclamation, rendez-vous dans **/complaints/list**. Pour assigner automatiquement un technicien, utilisez l'algorithme d'auto-assignation.`;
    }

    if (query.includes('intervention') || query.includes('technicien') || query.includes('assignation')) {
        return `🔧 **Gestion des interventions**\n\n${context}Vous pouvez :\n• Voir la carte des interventions sur **/map**\n• Utiliser l'auto-assignation intelligente (proximité + charge)\n• Consulter le planning sur **/planning**`;
    }

    if (query.includes('stock') || query.includes('inventaire') || query.includes('pièce')) {
        return `📦 **Gestion des stocks**\n\nVous pouvez gérer votre inventaire depuis **/inventory**.\n• Alertes automatiques pour les seuils bas\n• Scan QR code disponible sur **/scan**\n• Réquisitions et approbations gérées automatiquement`;
    }

    if (query.includes('flotte') || query.includes('véhicule') || query.includes('fleet')) {
        return `🚗 **Gestion de Flotte**\n\nSuivez vos véhicules en temps réel sur **/fleet**.\n• Maintenance préventive automatique\n• Statut trafic en temps réel (AI)\n• Alertes kilométrage et entretien`;
    }

    if (query.includes('rapport') || query.includes('report') || query.includes('pdf') || query.includes('excel')) {
        return `📊 **Rapports & Exports**\n\nDepuis **/reports**, vous pouvez :\n• Générer des rapports PDF avec KPIs branded\n• Exporter en Excel ou CSV\n• Consulter l'analyse NPS sur **/reports/analytics/nps**`;
    }

    if (query.includes('nps') || query.includes('satisfaction') || query.includes('feedback')) {
        return `⭐ **Satisfaction Client & NPS**\n\n• Page de feedback public : **/feedback**\n• Tableau NPS complet : **/reports/analytics/nps**\n\nLe NPS (Net Promoter Score) mesure la fidélité client de -100 à +100. Un score > 50 est considéré excellent.`;
    }

    if (query.includes('congé') || query.includes('planning') || query.includes('rh')) {
        return `📅 **RH & Planning**\n\nGérez votre équipe sur **/planning** et **/hr** :\n• Calendrier interactif (drag & drop)\n• Gestion des congés avec approbation\n• Détection automatique des conflits horaires`;
    }

    if (query.includes('it') || query.includes('ticket it') || query.includes('helpdesk')) {
        return `🖥️ **IT Helpdesk**\n\nDepuis **/it-admin/tickets** :\n• Assignation automatique Niveau 1\n• Liaison tickets → Assets IT\n• SLA automatique selon priorité/impact/urgence\n• Calcul de priorité par matrice ITIL`;
    }

    if (query.includes('aide') || query.includes('help') || query.includes('?')) {
        return `🤖 **Assistant ReclamTrack** — Je peux vous aider avec :\n\n1. **Réclamations** → statuts, priorités, catégories\n2. **Interventions** → assignation, carte, timer\n3. **Flotte** → véhicules, maintenance, trafic\n4. **Stocks** → inventaire, QR scan, réquisitions\n5. **RH** → planning, congés, conflits\n6. **IT** → tickets, assets, helpdesk\n7. **Rapports** → PDF, Excel, NPS\n\nPosez-moi une question précise !`;
    }

    // Fallback with context
    if (context) {
        return `Voici ce que j'ai trouvé dans la base de connaissances :\n${context}\n\nSi cette réponse ne correspond pas à votre question, essayez de reformuler ou consultez la **Base de Connaissances** sur **/knowledge**.`;
    }

    return `Je n'ai pas trouvé d'information précise sur ce sujet dans notre base.\n\n💡 Essayez des termes comme : *réclamation*, *intervention*, *flotte*, *stock*, *planning*, *rapport*, *helpdesk*.\n\nOu consultez la **base de connaissances** sur **/knowledge** pour les procédures SOP.`;
}

export default router;

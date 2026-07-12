import type { Request, Response } from 'express';
import { Router } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { logger } from '../utils/logger.js';
import { Feedback } from '../models/Feedback.js';

const router = Router();

// GET /api/feedback - Liste
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        const { status, rating } = req.query;
        const query: any = {};

        if (status) query.status = status;
        if (rating) query.rating = { $gte: Number(rating) };

        const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

        res.json({ success: true, data: feedbacks });
    } catch (error) {
        logger.error('Erreur récupération feedback:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/feedback/nps - Calcul du Net Promoter Score
router.get('/nps', auth, async (req: Request, res: Response) => {
    try {
        const all = await Feedback.find({ rating: { $exists: true } });
        
        if (all.length === 0) {
            return res.json({ success: true, nps: 0, total: 0, promoters: 0, passives: 0, detractors: 0 });
        }

        // NPS uses a 1-10 scale - map our 1-5 rating to 1-10
        const promoters   = all.filter(f => (f.rating / 5) * 10 >= 9).length;
        const passives    = all.filter(f => { const s = (f.rating / 5) * 10; return s >= 7 && s < 9; }).length;
        const detractors  = all.filter(f => (f.rating / 5) * 10 < 7).length;
        const total = all.length;

        const nps = Math.round(((promoters - detractors) / total) * 100);
        const avgRating = all.reduce((sum, f) => sum + f.rating, 0) / total;

        // Rating distribution (1-5)
        const distribution = [1,2,3,4,5].map(r => ({
            rating: r,
            count: all.filter(f => f.rating === r).length
        }));

        res.json({ success: true, nps, total, promoters, passives, detractors, avgRating: Math.round(avgRating * 10) / 10, distribution });
    } catch (error) {
        logger.error('Erreur calcul NPS:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST /api/feedback - Soumettre
router.post('/', async (req: Request, res: Response) => {
    try {
        const { category, rating, comment, source, userId } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: 'Note et commentaire requis' });
        }

        const newFeedback = new Feedback({
            source: source || 'web',
            category: category || 'General',
            rating: Number(rating),
            comment,
            userId: userId || undefined,
            status: 'new'
        });

        await newFeedback.save();
        logger.info(`Nouveau feedback reçu: ${rating}/5`);

        res.status(201).json({ success: true, message: 'Merci pour votre retour !' });
    } catch (error) {
        logger.error('Erreur soumission feedback:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

export default router;

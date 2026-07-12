import { Router, type Request, type Response, type NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { body } from 'express-validator';
import { validator } from '../middleware/validator.js';
import { authenticate as protect, requireOrganization } from '../middleware/security.js';
import InventoryItem from '../models/InventoryItem.js';
import { Requisition, RequisitionStatus } from '../models/Requisition.js';
import { io } from '../services/socketService.js';

const router = Router();

// Apply auth to all routes
router.use(protect, asyncHandler(requireOrganization));

/**
 * @route   GET /api/inventory/items
 * @desc    Get all inventory items (optionally filtered by category/search/lowStock)
 * @access  Private
 */
router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q, category, lowStock } = req.query;

        const filter: Record<string, unknown> = {};

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { reference: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (lowStock === 'true') {
            filter.$expr = { $lte: ['$currentStock', '$minStockAlert'] };
        }

        const items = await InventoryItem.find(filter).sort({ name: 1 });

        res.json({
            success: true,
            data: items,
            total: items.length
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/inventory/items/search
 * @desc    Search items (alias for /items with q)
 * @access  Private
 */
router.get('/items/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q, category, lowStock } = req.query;
        const filter: Record<string, unknown> = {};

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { reference: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) filter.category = category;
        if (lowStock === 'true') filter.$expr = { $lte: ['$currentStock', '$minStockAlert'] };

        const results = await InventoryItem.find(filter);
        res.json({ success: true, data: results, total: results.length });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/inventory/items/:id
 * @desc    Get single item
 * @access  Private
 */
router.get('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/inventory/items
 * @desc    Create new item
 * @access  Private
 */
router.post('/items', [
    body('name').notEmpty(),
    body('reference').notEmpty(),
    body('category').optional().isString(),
    body('currentStock').optional().isNumeric(),
    body('minStockAlert').optional().isNumeric(),
], validator, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await InventoryItem.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   PUT /api/inventory/items/:id
 * @desc    Update item
 * @access  Private
 */
router.put('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body as Record<string, unknown>, { new: true });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        
        // Check for low stock and emit alert
        if (item.currentStock <= item.minStockAlert) {
            if (io) {
                io.emit('stock-alert', { 
                    item, 
                    message: `Le stock pour ${item.name} est bas (${item.currentStock}). Veuillez réapprovisionner.`
                });
            }
        }
        
        res.json({ success: true, data: item });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   DELETE /api/inventory/items/:id
 * @desc    Delete item
 * @access  Private
 */
router.delete('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await InventoryItem.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Item deleted' });
    } catch (err) {
        next(err);
    }
});

// Requisitions routes
router.get('/requisitions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requisitions = await Requisition.find({ organizationId: req.organizationId })
            .populate('requesterId', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: requisitions });
    } catch (err) {
        next(err);
    }
});

router.post('/requisitions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqData = {
            ...(req.body as Record<string, unknown>),
            organizationId: req.organizationId,
            requesterId: req.user!.id,
            status: RequisitionStatus.PENDING
        };
        const requisition = await Requisition.create(reqData);
        res.status(201).json({ success: true, data: requisition });
    } catch (err) {
        next(err);
    }
});

router.put('/requisitions/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, comment } = req.body as Record<string, any>;
        const reqItem = await Requisition.findOne({ _id: req.params.id, organizationId: req.organizationId });
        
        if (!reqItem) {
            return res.status(404).json({ success: false, message: 'Requisition not found' });
        }
        
        reqItem.status = status as RequisitionStatus;
        reqItem.updatedAt = new Date();
        reqItem.history.push({
            status: status as RequisitionStatus,
            action: 'Status updated to ' + status,
            userId: req.user!.id as any, // Need to make sure req.user is typed or casted
            comment: comment || '',
            timestamp: new Date()
        });
        
        await reqItem.save();
        
        if (io) {
            io.emit('requisition-updated', { requisition: reqItem, message: `Réquisition mise à jour: ${status}` });
        }
        
        res.json({ success: true, data: reqItem });
    } catch (err) {
        next(err);
    }
});

export default router;

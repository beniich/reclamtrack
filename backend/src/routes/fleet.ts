import type { Request, Response} from 'express';
import { Router } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { Vehicle } from '../models/Vehicle.js';
import { FleetTrafficAgent } from '../services/fleetAgent.service.js';
import { logger } from '../utils/logger.js';
import { io } from '../services/socketService.js';

const router = Router();

// GET /api/fleet/vehicles - Liste des véhicules with search & filter
router.get('/vehicles', auth, async (req: Request, res: Response) => {
  try {
    const count = await Vehicle.countDocuments();
    if (count === 0) {
      await Vehicle.insertMany([
        {
          plateNumber: '1234-A-50',
          type: 'van',
          details: 'Renault Master',
          status: 'available',
          mileage: 45000,
          lastMaintenance: new Date('2024-12-01'),
          nextMaintenanceDue: new Date('2025-06-01'),
          fuelLevel: 75,
        },
        {
          plateNumber: '5678-B-50',
          type: 'truck',
          details: 'Isuzu NPR',
          status: 'in_use',
          mileage: 82000,
          lastMaintenance: new Date('2024-11-15'),
          nextMaintenanceDue: new Date('2025-05-15'),
          fuelLevel: 40,
        },
        {
          plateNumber: '9012-C-50',
          type: 'car',
          details: 'Dacia Duster',
          status: 'maintenance',
          mileage: 30000,
          lastMaintenance: new Date('2024-10-01'),
          nextMaintenanceDue: new Date('2025-04-01'),
          fuelLevel: 10,
        },
        {
          plateNumber: 'TX-7742-G',
          type: 'truck',
          details: 'Volvo FH16',
          status: 'maintenance',
          mileage: 120000,
          lastMaintenance: new Date('2023-10-12'),
          nextMaintenanceDue: new Date('2024-04-12'),
          fuelLevel: 24,
        },
        {
          plateNumber: 'BC-9011-Z',
          type: 'van',
          details: 'Ford Transit Box',
          status: 'in_use',
          mileage: 67000,
          lastMaintenance: new Date('2024-01-15'),
          nextMaintenanceDue: new Date('2024-07-15'),
          fuelLevel: 82,
        },
      ]);
    }

    const { status, type, search, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (status && status !== 'all') query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, totalCount] = await Promise.all([
      Vehicle.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Vehicle.countDocuments(query),
    ]);

    const total = await Vehicle.countDocuments();
    const available = await Vehicle.countDocuments({ status: 'available' });
    const maintenance = await Vehicle.countDocuments({
      status: { $in: ['maintenance', 'repair'] },
    });
    const in_use = await Vehicle.countDocuments({ status: 'in_use' });
    const lowFuel = await Vehicle.countDocuments({ fuelLevel: { $lt: 25 } });

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
      summary: { total, available, maintenance, in_use, lowFuel },
    });
  } catch (error) {
    logger.error('Erreur récupération véhicules:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/fleet/traffic-status - Etat du trafic IA
router.get('/traffic-status', auth, (_req: Request, res: Response) => {
    try {
        const status = FleetTrafficAgent.getFleetTrafficStatus();
        res.json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/fleet/vehicles/export - Export CSV
router.get('/vehicles/export', auth, async (_req: Request, res: Response) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });

    const csvHeader =
      'Plate Number,Type,Details,Status,Fuel Level (%),Mileage (km),Last Maintenance,Next Maintenance Due\n';
    const csvRows = vehicles
      .map((v) =>
        [
          v.plateNumber,
          v.type,
          v.details,
          v.status,
          v.fuelLevel,
          v.mileage,
          v.lastMaintenance ? new Date(v.lastMaintenance).toISOString().split('T')[0] : 'N/A',
          v.nextMaintenanceDue ? new Date(v.nextMaintenanceDue).toISOString().split('T')[0] : 'N/A',
        ].join(',')
      )
      .join('\n');

    const csv = csvHeader + csvRows;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="fleet-vehicles-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    logger.error('Erreur export CSV:', error);
    res.status(500).json({ success: false, message: 'Erreur export' });
  }
});

// GET /api/fleet/vehicles/:id - Détails véhicule
router.get('/vehicles/:id', auth, async (req: Request, res: Response) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driverId', 'name');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    logger.error('Erreur récupération véhicule:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/fleet/vehicles - Créer un véhicule
router.post('/vehicles', auth, async (req: Request, res: Response) => {
  try {
    const {
      plateNumber,
      type,
      details,
      status,
      mileage,
      lastMaintenance,
      nextMaintenanceDue,
      fuelLevel,
    } = req.body;

    const existing = await Vehicle.findOne({ plateNumber });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Numéro de plaque déjà existant' });
    }

    const vehicle = new Vehicle({
      plateNumber,
      type,
      details,
      status,
      mileage,
      lastMaintenance,
      nextMaintenanceDue,
      fuelLevel,
    });
    await vehicle.save();

    logger.info(`Nouveau véhicule créé: ${vehicle.plateNumber}`);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    logger.error('Erreur création véhicule:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/fleet/vehicles/:id - Mettre à jour un véhicule
router.put('/vehicles/:id', auth, async (req: Request, res: Response) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable' });
    }
    logger.info(`Véhicule mis à jour: ${vehicle.plateNumber}`);
    res.json({ success: true, data: vehicle });
  } catch (error) {
    logger.error('Erreur mise à jour véhicule:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/fleet/vehicles/:id/status - Mise à jour statut
router.put('/vehicles/:id/status', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable' });
    }

    vehicle.status = status;
    if (driverId !== undefined) vehicle.driverId = driverId;
    await vehicle.save();

    logger.info(`Véhicule ${vehicle.plateNumber} statut changé vers ${status}`);
    res.json({ success: true, data: vehicle });
  } catch (error) {
    logger.error('Erreur mise à jour véhicule:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/fleet/vehicles/:id/maintenance/check - Vérification maintenance préventive
router.post('/vehicles/:id/maintenance/check', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable' });
    }
    
    const now = new Date();
    let needsMaintenance = false;
    let reason = '';
    
    // Check if next maintenance date is past
    if (vehicle.nextMaintenanceDue && new Date(vehicle.nextMaintenanceDue) <= now) {
        needsMaintenance = true;
        reason = 'Date de maintenance programmée dépassée.';
    }
    
    // Note: We could also check mileage thresholds if we have a lastMaintenanceMileage field
    // For now, if needsMaintenance is true, we update the status
    
    if (needsMaintenance && vehicle.status !== 'maintenance') {
        vehicle.status = 'maintenance';
        await vehicle.save();
        
        if (io) {
            io.emit('fleet-alert', { 
                vehicle, 
                message: `Maintenance requise pour le véhicule ${vehicle.plateNumber}: ${reason}` 
            });
        }
    }
    
    res.json({ 
        success: true, 
        needsMaintenance, 
        reason,
        data: vehicle
    });
  } catch (error) {
    logger.error('Erreur vérification maintenance:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/fleet/vehicles/:id - Supprimer un véhicule
router.delete('/vehicles/:id', auth, async (req: Request, res: Response) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Véhicule introuvable' });
    }
    logger.info(`Véhicule supprimé: ${vehicle.plateNumber}`);
    res.json({ success: true, message: 'Véhicule supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur suppression véhicule:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;

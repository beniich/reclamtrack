import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import TechnicalSchema from '../models/TechnicalSchema.js';

// @desc    Get all schemas for an organization
// @route   GET /api/technical-schemas
// @access  Private
export const getSchemas = asyncHandler(async (req: Request, res: Response) => {
  const schemas = await TechnicalSchema.find({ organizationId: req.organizationId })
    .populate('createdBy', 'name email avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: schemas.length,
    data: schemas,
  });
});

// @desc    Get single schema
// @route   GET /api/technical-schemas/:id
// @access  Private
export const getSchema = asyncHandler(async (req: Request, res: Response) => {
  const schema = await TechnicalSchema.findOne({
    _id: req.params.id,
    organizationId: req.organizationId,
  }).populate('createdBy', 'name email');

  if (!schema) {
    res.status(404);
    throw new Error('Schéma introuvable');
  }

  res.status(200).json({
    success: true,
    data: schema,
  });
});

// @desc    Create new schema
// @route   POST /api/technical-schemas
// @access  Private
export const createSchema = asyncHandler(async (req: Request, res: Response) => {
  // Add user to req.body
  (req.body as Record<string, unknown>).createdBy = req.user!.id;
  (req.body as Record<string, unknown>).organizationId = req.organizationId;

  const schema = await TechnicalSchema.create(req.body);

  res.status(201).json({
    success: true,
    data: schema,
  });
});

// @desc    Update schema
// @route   PUT /api/technical-schemas/:id
// @access  Private
export const updateSchema = asyncHandler(async (req: Request, res: Response) => {
  let schema = await TechnicalSchema.findOne({
    _id: req.params.id,
    organizationId: req.organizationId,
  });

  if (!schema) {
    res.status(404);
    throw new Error('Schéma introuvable');
  }

  // Make sure user is schema owner or admin
  if (schema.createdBy.toString() !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
    res.status(403);
    throw new Error('Vous n\'êtes pas autorisé à modifier ce schéma');
  }

  schema = await TechnicalSchema.findByIdAndUpdate(req.params.id, req.body as Record<string, unknown>, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: schema,
  });
});

// @desc    Delete schema
// @route   DELETE /api/technical-schemas/:id
// @access  Private
export const deleteSchema = asyncHandler(async (req: Request, res: Response) => {
  const schema = await TechnicalSchema.findOne({
    _id: req.params.id,
    organizationId: req.organizationId,
  });

  if (!schema) {
    res.status(404);
    throw new Error('Schéma introuvable');
  }

  // Make sure user is schema owner or admin
  if (schema.createdBy.toString() !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
    res.status(403);
    throw new Error('Vous n\'êtes pas autorisé à supprimer ce schéma');
  }

  await TechnicalSchema.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    data: {},
  });
});

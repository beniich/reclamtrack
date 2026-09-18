import mongoose, { Document, Schema } from 'mongoose';

export type ComplaintStatus = 'nouvelle' | 'en cours' | 'en attente' | 'planifié' | 'résolue' | 'fermée' | 'rejetée';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface IComplaint extends Document {
  number: string;
  // Step 1: Info
  category: string;
  subcategory: string;
  priority: Priority;
  urgency: number; // 1-5
  impact: number;  // 1-5
  title: string;
  description: string;

  // Step 2: Location
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    latitude: number;
    longitude: number;
  };

  // Step 3: Files
  photos?: string[];
  documents?: { name: string; url: string }[];
  audioNote?: string;

  // Step 4: Contact (if not anonymous)
  isAnonymous: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  reporterAddress?: string;
  reporterLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  reporterMetadata?: {
    browser?: string;
    os?: string;
    preferredContactChannel?: 'sms' | 'email' | 'phone';
  };

  // Workflow
  status: ComplaintStatus;
  assignedTeamId?: mongoose.Types.ObjectId;
  technicianId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  assetId?: mongoose.Types.ObjectId; // Lien vers l'équipement (GMAO)
  timeline: {
    eventType: string;
    message: string;
    createdAt: Date;
    authorId?: mongoose.Types.ObjectId;
  }[];

  rejectionReason?: string;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ComplaintSchema: Schema = new Schema(
  {
    number: { type: String, unique: true }, // Auto-generated

    // Step 1
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    urgency: { type: Number, enum: [1, 2, 3, 4, 5], default: 3 },
    impact: { type: Number, enum: [1, 2, 3, 4, 5], default: 3 },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Step 2
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // Step 3
    photos: [{ type: String }],
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    audioNote: { type: String },

    // Step 4
    isAnonymous: { type: Boolean, default: false },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    reporterAddress: { type: String },
    reporterLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
    },
    reporterMetadata: {
        browser: String,
        os: String,
        preferredContactChannel: { type: String, enum: ['sms', 'email', 'phone'], default: 'email' }
    },

    // Workflow
    status: {
      type: String,
      enum: ['nouvelle', 'en cours', 'en attente', 'planifié', 'résolue', 'fermée', 'rejetée'],
      default: 'nouvelle',
    },
    rejectionReason: { type: String },
    assignedTeamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset' },
    assignedAt: { type: Date },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    timeline: [
      {
        eventType: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

// Index for organization filtering
ComplaintSchema.index({ organizationId: 1, status: 1 });
ComplaintSchema.index({ organizationId: 1, createdAt: -1 });

// Auto-generate unique complaint number and calculate priority Matrix
ComplaintSchema.pre<IComplaint>('save', async function (next) {
  // 1. Industrial Logic: Link Asset Criticality to Impact
  if (this.assetId && (this.isModified('assetId') || this.isNew)) {
    const Asset = mongoose.model('Asset');
    const asset: any = await Asset.findById(this.assetId);
    if (asset) {
      if (asset.criticality === 'A') this.impact = 5;
      else if (asset.criticality === 'B') this.impact = 3;
      else if (asset.criticality === 'C') this.impact = 1;
    }
  }

  // 2. GLPI Logic: Priority Matrix
  if (this.isModified('urgency') || this.isModified('impact') || this.isNew) {
    const score = (this.urgency + this.impact) / 2;
    if (score >= 4.5) this.priority = 'urgent';
    else if (score >= 3.5) this.priority = 'high';
    else if (score >= 2.5) this.priority = 'medium';
    else this.priority = 'low';
  }

  // 3. Number Generation
  if (this.isNew && !this.number) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    this.number = `REC-${datePart}-${randomPart}`;
  }
  next();
});

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

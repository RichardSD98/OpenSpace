const mongoose = require('mongoose');

const NEIGHBORHOODS = [
  'Katutura',
  'Khomasdal',
  'Klein Windhoek',
  'Olympia',
  'Pioneerspark',
  'Eros',
  'Windhoek West',
  'Hochland Park',
  'Suiderhof',
  'Rocky Crest',
  'Otjomuise',
  'Havana',
  'Academia',
  'Ludwigsdorf',
  'Other',
];

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    unitType: {
      type: String,
      enum: ['apartment', 'flat', 'single room', 'studio'],
      required: true,
    },
    rent: { type: Number, required: true, min: 0 },
    deposit: { type: Number, default: 0, min: 0 },
    neighborhood: {
      type: String,
      enum: NEIGHBORHOODS,
      required: true,
    },
    address: { type: String, trim: true },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    availableFrom: { type: Date, required: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    photos: [{ type: String }],
    amenities: [{ type: String }],
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

listingSchema.index({ neighborhood: 1, unitType: 1, rent: 1 });

module.exports = mongoose.model('Listing', listingSchema);

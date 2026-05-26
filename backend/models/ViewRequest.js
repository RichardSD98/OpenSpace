const mongoose = require('mongoose');

const viewRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One request per renter per listing
viewRequestSchema.index({ listing: 1, renter: 1 }, { unique: true });

module.exports = mongoose.model('ViewRequest', viewRequestSchema);

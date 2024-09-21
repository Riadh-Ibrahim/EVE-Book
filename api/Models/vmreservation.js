const mongoose = require('mongoose');

const vmreservationSchema = new mongoose.Schema({
  vmName: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'Pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

vmreservationSchema.statics.updateStatuses = async function() {
  const now = new Date();
  
  // Update status for reservations
  await this.updateMany(
    { endDate: { $lt: now } }, // Past reservations
    { $set: { status: 'Completed' } }
  );

  await this.updateMany(
    { startDate: { $gte: now }, endDate: { $lte: now } }, // Current reservations
    { $set: { status: 'In Progress' } }
  );

  await this.updateMany(
    { startDate: { $gt: now } }, // Future reservations
    { $set: { status: 'Pending' } }
  );
};

const Reservation = mongoose.model('Reservation', vmreservationSchema);
module.exports = Reservation;

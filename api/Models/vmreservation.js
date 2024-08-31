const mongoose = require('mongoose');

const vmreservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vmName: {
    type: String, // Add VM name
    required: true
  },
  status: {
    type: String, // Add status (e.g., 'Pending', 'Active', 'Completed')
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
    default: Date.now // Track when the reservation was created
  }
});


const Reservation = mongoose.model('Reservation', vmreservationSchema);
module.exports = Reservation;

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: { 
//     type: String, 
//     unique: true,
//     required: true,
//   },
//   password: String,
//   role: {
//     type: String,
//     enum: ['buyer', 'farmer', 'plant pathologist'],
//     required: true,
//   },
// });

// userSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// userSchema.methods.comparePassword = function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: { 
    type: String, 
    unique: true,
    required: true,
  },
  password: String,
  role: {
    type: String,
    enum: ['buyer', 'farmer', 'plant pathologist'],
    required: true,
  },
  // Additional fields for better chat management
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  // Communication preferences
  canReceiveMessages: {
    type: Boolean,
    default: true,
  },
  // Blocked users (optional)
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Message settings
  messageSettings: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// 🔐 Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 Compare candidate password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can message another user
userSchema.methods.canMessageUser = function(targetUserId) {
  return this.isActive && 
         this.canReceiveMessages && 
         !this.blockedUsers.includes(targetUserId);
};

// Update last seen timestamp
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type:String,
//     required: true
//   },
//   email: { 
//     type: String, 
//     unique: true,
//     required: true
//   },
//   password: String,
//   role: {
//   type: String,
//   enum: ['buyer', 'farmer', 'plant pathologist'],
//   required: true
// }
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


// ✅ User Schema
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
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Chat Schema
const chatSchema = new mongoose.Schema({
  socketId: String,
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  content: String,
  readStatus: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);

// ✅ Export both models
module.exports = {
  User,
  Chat,
};

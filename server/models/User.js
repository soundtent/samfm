const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const db = mongoose.connection;

const ScheduleEntry = require("../models/ScheduleEntry");

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  admin: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: {
    type: String
  },
  scheduleEntries: [{
    type : Schema.Types.ObjectId,
    ref: 'ScheduleEntry'
  }]
});


UserSchema.statics.getScheduleEntriesWithUsers = async (sortByField, reverseSort=false, user_ids=[]) => { // user_ids = array of ObjectIds. Passing an empty array searchers all users
  var sortNum = 1;
  if (reverseSort) {sortNum = -1;}

  var aggregation = [
    { // create users field
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "scheduleEntries",
        as: "users"
      }
    },
    { 
      $sort: { [sortByField]: sortNum } 
    },
    { //filter out users which are not part of user_ids
      $project: {
        location: 1,
        participants: 1,
        description: 1,
        notes: 1,
        nowPlaying: 1,
        startTime: 1,
        endTime: 1,
        streamUrl: 1,
        updatedAt: 1,
        createdAt: 1,
        users: {
          $filter: {
            input: "$users",
            as: "the_user",
            cond: {
              $in: ["$$the_user._id", user_ids ]
            }
          }
        }
      }
    },
    { //remove objects with empty (filtered out) users arrays
      $match: {
        "users.0": {
          $exists: true
        }
      }
    },
  ];

  if (user_ids.length == 0) {
    aggregation = [aggregation[0],aggregation[1]]; // no need to filter if searching all users
  }

  const scheduleEntriesWithUsers = await ScheduleEntry.aggregate(aggregation);
  return scheduleEntriesWithUsers;
}

UserSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;
const dayjs = require('dayjs');

function convertStartEndTimes(req,res,next) { //converts strings to dateTIme objects to be added to the model
  // console.log(req.body);
  // var startTime = req.body.startTime;
  // var endTime = req.body.endTime;

  // console.log("before");
  // console.log(startTime);

  // dayjs.tz.setDefault("GMT");
  // req.body.startTime = dayjs.tz(req.body.startTime).add(2, "y").toDate();
  // req.body.endTime = dayjs.tz(req.body.endTime).add(2, "y").toDate();
  
  // dayjs.tz.setDefault(res.app.get("timezone"));
  // res.locals.currentLocalTime = dayjs.tz().toDate();

  next();
}

module.exports = convertStartEndTimes;
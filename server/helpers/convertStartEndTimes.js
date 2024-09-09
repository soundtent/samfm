const dayjs = require('dayjs');

function convertStartEndTimes(req,res,next) { //converts strings to dateTIme objects to be added to the model

  const timezone = req.app.get("timezone");
  dayjs.tz.setDefault(timezone);
  req.body.startTime = dayjs.tz(req.body.startDate+"T"+req.body.startTime+":00").toDate();
  req.body.endTime = dayjs.tz(req.body.endDate+"T"+req.body.endTime+":00").toDate();
  
  delete req.body.startDate;
  delete req.body.endDate;

  next();
}

module.exports = convertStartEndTimes;
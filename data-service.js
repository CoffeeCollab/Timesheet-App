import mongoose from "mongoose"

var Schema = mongoose.Schema;

const timesheetSchema = new Schema({
    userId: {type: Number, unique: true},
    userName: {type:String, unique: true},
    entries:[
        {
            date: Date,
            timeIn: Date,
            timeOut: Date,
        },
    ],
});

const Timesheet = mongoose.model("Timesheet", timesheetSchema);

export default Timesheet;
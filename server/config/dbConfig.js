const mongoose = require('mongoose');
const express = require('express');
const app = express();

const connectDB = async (mongoUrl)=>{
	try {
		mongoose.set('strictQuery',false);
		console.log(`Connecting to database with url ${mongoUrl}`);
		const conn = await mongoose.connect(mongoUrl);
		console.log(`Database Connected: ${conn.connection.host}`)
	} catch (error) {
		console.log(error);
	}
}

module.exports = connectDB;
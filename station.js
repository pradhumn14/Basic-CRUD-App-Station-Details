const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    station_id: {
        type: String
    },
    station_name: {
        type: String
    },
    station_address: {
        type: String
    },
    station_price:{
        type: String
    }
});

module.exports = mongoose.model("Station", stationSchema);
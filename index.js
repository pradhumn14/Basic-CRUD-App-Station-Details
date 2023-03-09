const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const stationModel = require('./station');


const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// App Config
const connection_url = 'mongodb://localhost:27017';

// DB Config
const connectToMongo = async () => {
    try {
        mongoose.connect(connection_url, {
            useNewUrlParser: true, useUnifiedTopology: true
        }, 6000000)
        console.log('mongodb connect');
        return mongoose;
    } catch (error) {
        console.log(error);
    }
}


app.get('/', async function (req, res) {
    let limit = req.query.limit ? parseInt(req.query.limit) : null;
    await connectToMongo();
    if (limit) {
        stationModel.find().limit(limit).exec((err, docs) => {
            if (!err) {
                res.render('home', { data: docs });
            } else {
                console.log('Failed to retrieve the Station List: ' + err);
            }
        });
    } else {
        stationModel.find((err, docs) => {
            if (!err) {
                res.render('home', { data: docs });
            } else {
                console.log('Failed to retrieve the Station List: ' + err);
            }
        });
    }
});


app.post('/', async function (req, res) {
    console.log(req.body.station_id);
    console.log(req.body.station_name);
    console.log(req.body.station_address);
    console.log(req.body.station_price);
    let newStation = new stationModel({
        station_id: req.body.station_id,
        station_name: req.body.station_name,
        station_address: req.body.station_address,
        station_price: req.body.station_price
    });

    try {
        await newStation.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving station data');
    }
})

app.post('/:id/edit', async function (req, res) {
    const id = req.params.id;
    console.log(req.body.station_name);
    console.log(req.body.station_address);
    console.log(req.body.station_price);
    await connectToMongo();
    stationModel.findOneAndUpdate(
        { station_id: id },
        {
            $set: {
                station_name: req.body.station_name,
                station_address: req.body.station_address,
                station_price: req.body.station_price
            }
        },
        { new: true },
        function (err, doc) {
            if (err) {
                console.log("Something wrong when updating data!");
            }
            console.log(doc);
            res.redirect('/show/' + doc.station_id);
        }
    );
});

app.get('/:id/edit', async function (req, res) {
    const id = req.params.id;
    await connectToMongo();
    stationModel.findOne({ station_id: id }, (err, doc) => {
        if (doc == null) {
            res.send("wrong station id");
        } else {
            res.render("edit", { station: doc });
        }
    })
});

app.get('/delete/:id', async function (req, res) {
    const id = req.params.id;
    await connectToMongo();
    stationModel.findOne({ station_id: id }, (err, docs) => {
        if (docs == null) {
            res.send("wrong station id");
        } else {
            console.log(docs);
            res.render("delete", { data: docs });
        }
    })
});

app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await connectToMongo();
        const station = await stationModel.findOneAndDelete({ station_id: id });
        if (!station) {
            res.status(404).send('Station not found');
        } else {
            res.status(200).send('Station deleted successfully');
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting station');
    }
});





app.get('/show/:id', async function (req, res) {
    const id = req.params.id;
    await connectToMongo();
    stationModel.findOne({ station_id: id }, (err, docs) => {
        if (docs == null) {
            res.send("wrong station id");
        } else {
            console.log(docs);
            res.render("show", { data: docs });
        }
    })
});

app.post('/save-article', async (req, res) => {
    let newAddress = new articleModel({
        articleTitle: req.body.title,
        articleDiscriptaion: req.body.discription,
        articleMarkdown: req.body.markdown
    })
    console.log(newAddress);
    // const user = await newAddress.save();
    newAddress.save().then((address) => {
        res.redirect('/')
    }).catch((err) => {
        console.log(err)
    })
})


const port = 3000;
app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port: ${port}`);
});
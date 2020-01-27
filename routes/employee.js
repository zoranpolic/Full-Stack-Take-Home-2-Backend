'use strict';

const express = require('express');
const router = express.Router();

const {Validator} = require('node-input-validator');

let axios = require('axios').default;

let DATABASE = [];
let limitCEOReached = false;

const extAPIEndpoint1 = "https://ron-swanson-quotes.herokuapp.com/v2/quotes";
const extAPIEndpoint2 = "https://quotes.rest/qod";

/* Return all current records */
router.get('', function (req, res) {
    res.header('Access-Control-Allow-Origin' , "*" );
    return res.send(DATABASE);
});

/* Return the record corresponding to the id parameter */
router.get('/:id', function (req, res) {
    res.header('Access-Control-Allow-Origin' , "*" );
    return res.send(DATABASE.filter(x => x._id == req.url.substring(1)));
})

/* Delete the record corresponding to the id parameter */
router.delete('/:id', function (req, res) {
    res.header('Access-Control-Allow-Origin' , "*" );
    let ceoCheck = DATABASE.filter(x => x._id == req.url.substring(1));
    if(ceoCheck[0].role.localeCompare("ceo")==0){
        limitCEOReached = false;
    }
    DATABASE = DATABASE.filter(x => x._id != req.url.substring(1));
    return res.send(DATABASE);
})

/* POST employees listing. */
router.post('', function (req, res) {
    console.log(req.headers);
    res.header('Access-Control-Allow-Origin' , '*' );
    res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin');
    let newRecord = {
        _id: 0,
        firstName: "",
        lastName: "",
        hireDate: "",
        role: ""
    };

    req.body.role = req.body.role.toLowerCase();

    console.log("CP 1: limitCEOReached: " + limitCEOReached);
    if (req.body.role.localeCompare("ceo") === 0 && limitCEOReached) {
        res.status(422).send('There can be only one CEO');
    } else {

        const v = new Validator(req.body, {
            firstName: 'required|string',
            lastName: 'required|string',
            hireDate: 'required|dateFormat:YYYY-MM-DD|dateBeforeToday:1,days',
            role: 'required|in:ceo,vp,manager,lackey'
        });

        axios.all([fetchAsync(extAPIEndpoint1), fetchAsync(extAPIEndpoint2)])
            .then(axios.spread(function (quote1, quote2) {
                // Both requests are now complete
                v.check()
                    .then(function (matched) {
                        if (!matched) {
                            res.status(422).send('Invalid request parameters');
                        } else {

                            newRecord._id = Math.floor((Math.random() * 300000) + 1);
                            newRecord.firstName = req.body.firstName;
                            newRecord.lastName = req.body.lastName;
                            newRecord.hireDate = req.body.hireDate;
                            newRecord.role = req.body.role;
                            console.log("CP 2: limitCEOReached: " + limitCEOReached);
                            console.log("CP 2: req.body.role: " + req.body.role);
                            console.log("CP 2: req.body.role.localeCompare(\"ceo\"): " + req.body.role.localeCompare("ceo"));
                            if (req.body.role.localeCompare("ceo") === 0) {
                                limitCEOReached = true;
                                console.log("CP 3: limitCEOReached: " + limitCEOReached);
                            }
                            newRecord.quote1 = quote1;
                            newRecord.quote2 = quote2;
                            DATABASE.push(newRecord);
                            res.send(DATABASE);
                        }
                    });
            }));

    }

});

async function fetchAsync(url) {
    try {
        const response = await axios.get(url);
        if (url.localeCompare(extAPIEndpoint1)) {
            console.log(response.data.contents.quotes[0].quote);
            return response.data.contents.quotes[0].quote;
        } else if (url.localeCompare(extAPIEndpoint2)) {
            console.log(response.data[0]);
            return response.data[0];
        }
    } catch (error) {
        //console.error(error);
        if (url.localeCompare(extAPIEndpoint1)) {
            console.log("Error retrieving quote from " + extAPIEndpoint1);
            return "Error retrieving quote from " + extAPIEndpoint1;
        } else if (url.localeCompare(extAPIEndpoint2)) {
            console.log("Error retrieving quote from " + extAPIEndpoint2)
            return "Error retrieving quote from " + extAPIEndpoint2;
        }
    }
}

/* Replace the record corresponding to :id with the contents of the PUT body */
router.put('/:id', function (req, res) {
    res.header('Access-Control-Allow-Origin' , "*" );
    let newRecord = {
        _id: 0,
        firstName: "",
        lastName: "",
        hireDate: "",
        role: ""
    };

    req.body.role = req.body.role.toLowerCase();

    console.log("CP 1: limitCEOReached: " + limitCEOReached);
    let ceoCheck = DATABASE.filter(x => x._id == req.url.substring(1));
    let almostLimitCEOReached = true;
    if(ceoCheck[0].role.localeCompare("ceo")==0){
        almostLimitCEOReached = false;
    }
    if ((req.body.role.localeCompare("ceo") === 0 && limitCEOReached) && ceoCheck[0].role.localeCompare("ceo")!=0) {
        res.status(422).send('There can be only one CEO');
    } else {

        const v = new Validator(req.body, {
            firstName: 'required|string',
            lastName: 'required|string',
            hireDate: 'required|dateFormat:YYYY-MM-DD|dateBeforeToday:1,days',
            role: 'required|in:ceo,vp,manager,lackey'
        });

        axios.all([fetchAsync(extAPIEndpoint1), fetchAsync(extAPIEndpoint2)])
            .then(axios.spread(function (quote1, quote2) {
                // Both requests are now complete
                v.check()
                    .then(function (matched) {
                        if (!matched) {
                            res.status(422).send('Invalid request parameters');
                        } else {
                            if(limitCEOReached && !almostLimitCEOReached){
                                limitCEOReached = false;
                            }
                            DATABASE = DATABASE.filter(x => x._id != req.url.substring(1));
                            newRecord._id = req.url.substring(1);
                            newRecord.firstName = req.body.firstName;
                            newRecord.lastName = req.body.lastName;
                            newRecord.hireDate = req.body.hireDate;
                            newRecord.role = req.body.role;
                            console.log("CP 2: limitCEOReached: " + limitCEOReached);
                            console.log("CP 2: req.body.role: " + req.body.role);
                            console.log("CP 2: req.body.role.localeCompare(\"ceo\"): " + req.body.role.localeCompare("ceo"));
                            if (req.body.role.localeCompare("ceo") === 0) {
                                limitCEOReached = true;
                                console.log("CP 3: limitCEOReached: " + limitCEOReached);
                            }
                            newRecord.quote1 = quote1;
                            newRecord.quote2 = quote2;
                            DATABASE.push(newRecord);
                            res.send(DATABASE);
                        }
                    });
            }));
    }

});

module.exports = router;

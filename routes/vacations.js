const mysql = require('mysql2/promise');
var express = require('express');
var router = express.Router();

let pool;
(async function initializePool() {
    pool = await mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'Vacations',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
})();

router.get('/', async (req, res) => {
    try {
        const [results] = await pool.execute(`SELECT * FROM vacations`);
        if (results.length) {
            res.send(results)
        } else {
            res
                .status(404)
                .send('there are no vacations in the database')
        }
    } catch (e) {
        res
            .status(500)
            .send('something has gone wrong!')
    }
});

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const [results] = await pool.execute(`SELECT * FROM vacations WHERE id = ?`, [id]);
        if (results.length) {
            res.send(results[0]);
        } else {
            res
                .status(404)
                .send(`vacation ${id} doesn't exist`);
        }
    } catch (e) {
        res
            .status(500)
            .send('something has gone wrong!');
    }
});

router.post('/', async (req, res) => {
    const {
        description,
        destination,
        photoURL,
        startDate,
        endDate,
        price
    } = req.body;
    if (!description) {
        res
            .status(400)
            .send('expected title in request');
    }
    const [results] = await pool.execute(`INSERT INTO vacations (
        vacations_description,
        destination,
        photo_url,
        start_date,
        end_date,
        price)
    VALUES (
        '${description}',
        '${destination}',
        '${photoURL}',
        '${startDate}',
        '${endDate}',
        '${price}')`);
    if (results.insertId) {
        res.send({id: results.insertId});
    } else {
        res
            .status(500)
            .send('something went wrong');
    }
});

module.exports = router;
const { excercise, user } = require("../model/tracker");
const express = require("express");
const router = express.Router();


router.route("/")
    .post(async (req, res) => {
        const { username } = req.body;

        const findUser = await user.findOne({ username });
        if (findUser) {
            res.status(409).json({ msg: "User already exists" });
        }

        const createdUser = new user({ username });
        await createdUser.save();

        if (createdUser) {
            return res.status(201).json(createdUser);
        }
    })
    .get(async (req, res) => {
        const findAllusers = await user.find({}).select("_id username");

        if (findAllusers) {
            res.status(200).json(findAllusers);
        }
    })

router.route("/:_id/exercises")
    .post(async function (req, res) {
        const { _id } = req.params;
        const { description, duration, date } = req.body;

        const users = await user.findOne({ _id: _id });
        console.log(users)

        if (!users) {
            res.status(400).json({ msg: `No user with the id: ${_id}` });
        }
        const exerciseObject = new excercise({
            user_id: users._id,
            description,
            duration,
            date: date ? new Date(date) : new Date()
        });

        if (exerciseObject) {
            await exerciseObject.save();
            res.status(201).json({
                _id: users._id,
                username: users.username,
                description: exerciseObject.description,
                duration: exerciseObject.duration,
                date: new Date(exerciseObject.date).toDateString()
            });

        } else {
            res.status(400).send("An error occured");
        }
    })

router.route("/:_id/logs")
    .get(async (req, res) => {
        const { _id } = req.params;
        const users = await user.findById(_id);
        const { limit, from, to } = req.query;

        /**CHECKING IF USER EXISTS */
        if (!users) {
            res.send(`No user with the id: ${_id}`);
            return;
        }

        /**SEARCH LOGIC */
        let dateObj = {};
        if (from) {
            dateObj["$gte"] = new Date(from);
        }
        if (to) {
            dateObj["$lte"] = new Date(to);
        }
        let filter = {
            user_id: _id
        }

        if (from || to) {
            filter.date = dateObj;
        }

        const excercises = await excercise.find(filter).limit(+limit ?? 500);

        /**MAP THROUGH*/
        const logs = excercises.map(e => ({
            description: e.description,
            duration: e.duration,
            date: e.date.toDateString()
        }));

        if (excercises) {
            res.status(200).json({
                username: users.username,
                count: excercises.length,
                _id: users._id,
                logs: logs
            })

        }
    })

module.exports = router;
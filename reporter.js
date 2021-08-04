const express = require("express");
const Reporter = require("../models/reporter");
const auth = require('../middlware/auth')

const router = new express.Router();



router.post("/reporters", async(req, res) => {
    const user = new Reporter(req.body);
    try {
        await user.save()
        const token = await user.generateToken()
        res.status(200).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
});



router.get("/reporters", auth, (req, res) => {
    Reporter.find({})
        .then((users) => {
            res.status(200).send(users);
        })
        .catch((e) => {
            res.status(500).send(e);
        });
});



router.get("/reporters/:id", auth, (req, res) => {
    const _id = req.params.id;
    Reporter.findById(_id)
        .then((user) => {
            if (!user) {
                return res.status(400).send("Unable to find user");
            }
            res.status(200).send(user);
        })
        .catch((e) => {
            res.status(500).send("Unable to connect to database");
        });
});



router.patch('/reporters/:id', async(req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findByIdAndUpdate(_id, req.body, {
            new: true,
            runValidators: true
        })
        if (!user) {
            return res.status(400).send('No user is found')
        }
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})



router.patch("/reporters/:id", auth, async(req, res) => {
    const updates = Object.keys(req.body);
    console.log(updates);

    const allowedUpdates = ["name", "password"];
    var isValid = updates.every((el) => allowedUpdates.includes(el));
    console.log(isValid);

    if (!isValid) {
        return res.status(400).send("Sorry cannot update");
    }
    const _id = req.params.id;
    try {
        const user = await Reporter.findById(_id)
        updates.forEach((el) => (user[el] = req.body[el]))
        await user.save()
        console.log(user)
        if (!user) {
            return res.send('No user is found')
        }
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
});



router.delete('/reporters/:id', auth, async(req, res) => {
    const _id = req.params.id
    try {
        const user = await Reporter.findByIdAndDelete(_id)
        if (!user) {
            return res.status(400).send('No user is found')
        }
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})



router.post('/reporters/login', async(req, res) => {
    try {
        const user = await Reporter.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send('Try again ' + e)
    }
})



router.get('/profile', auth, async(req, res) => {
    res.send(req.user)
})




router.delete('/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((el) => {
            return el.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }

})




router.post('/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Logout all was done successsfully')
    } catch (e) {
        res.send('Please login')
    }
})

module.exports = router;
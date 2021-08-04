const express = require('express')
const News = require('../models/news')
const auth = require('../middlware/auth')
const router = new express.Router()



router.post('/news', auth, async(req, res) => {
    const task = new News({...req.body, owner: req.user._id })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



router.get('/news', auth, async(req, res) => {
    try {
        await req.user.populate('userTasks').execPopulate()
        res.send(req.user.userTasks)
    } catch (e) {
        res.status(500).send(e)
    }
})



router.get('/news/:id', auth, async(req, res) => {
    const _id = req.params.id
    try {
        const task = await News.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(400).send('No Task is found')
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})



router.patch('/news/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']
    var isValid = updates.every((el) => allowedUpdates.includes(el))

    if (!isValid) {
        return res.status(400).send("Cannot update")
    }
    const _id = req.params.id
    try {
        const task = await News.findOne({ _id, owner: req.user._id })
        updates.forEach((el) => task[el] = req.body[el])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send('No task is found ')
    }
})



router.delete('/news/:id', auth, async(req, res) => {
    const _id = req.params.id
    try {
        const task = await News.findOneAndDelete({ _id, owner: req.user._id })
        if (!task) {
            return res.status(400).send('No task is found')
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router
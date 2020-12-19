const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const User = require('../models/user')
const auth = require('../middleware/auth')




//creates a task
router.post('/tasks',auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})


//gets the tasks by query key completed value true/false
//GET gets the tasks using pagination limit and skip.
router.get('/tasks', auth, async (req,res)=>{
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
})


//gets task by id
router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if(!task){
            return res.status(404).send()
        }
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//updates a task
router.patch('/tasks/:id', auth, async(req,res)=>{
    const tasksUpdates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = tasksUpdates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }
    try {
        const task = await Task.findOne({ _id: req.params.id , owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }

        tasksUpdates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//deletes a task
router.delete('/tasks/:id', auth, async (req,res)=>{
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router

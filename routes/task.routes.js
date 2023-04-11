const router = require("express").Router();

const { response } = require("../app");
const Project = require("../models/Project.model");
const Task = require("../models/Task.model");

router.post("/tasks", (req, res, next) => {
    const { title, description, projectId } = req.body;

    Task.create({ title, description, project: projectId })
        .then((newTask) => {
            console.log(newTask);
            return Project.findByIdAndUpdate(projectId, {$push: {tasks: newTask._id}})
        })
        .then(response => res.status(201).json(response))
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                message: "error creating new task",
                error: err
            });
        });
});

router.delete("/tasks/:taskId", async (req, res, next) => {

    try{
        const {taskId} = req.params;

        const taskToDelete = await Task.findById(taskId);
    
        const taskProjectId = taskToDelete.project;
    
        const taskProject = await Project.findById(taskProjectId);
    
        const tasksArr = taskProject.tasks.slice(0).map((task) => task.toString());
        
        const taskIndex = tasksArr.indexOf(taskId);
    
        tasksArr.splice(taskIndex, 1);
    
        await Project.findByIdAndUpdate(taskProjectId, {tasks: tasksArr});
    
        await Task.findByIdAndDelete(taskId);

        res.json({ message: `Task with ${taskId} is removed successfully.` });

    } catch(err) {
        console.error(err);
    }
    
});

module.exports = router;
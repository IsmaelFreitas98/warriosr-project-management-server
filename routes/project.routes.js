const router = require("express").Router();
const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const Task = require("../models/Task.model");


//POST /api/projects
router.post("/projects", (req, res, next) => {
    const { title, description } = req.body;

    Project.create({ title, description, tasks: [] })
        .then((response) => {
            res.status(201).json(response);
        }).catch((err) => {
            console.error(err);
            res.status(500).json({
                message: "error creating new project",
                error: err
            });
        });
});

//GET /api/projects
router.get("/projects", (req, res, next) => {
    Project.find()
        .populate("tasks")
        .then((projectsFromDB) => {
            res.json(projectsFromDB);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// GET /api/projects/:projectId
router.get('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    // Each Project document has a `tasks` array holding `_id`s of Task documents
    // We use .populate() method to get swap the `_id`s for the actual Task documents
    Project.findById(projectId)
        .populate('tasks')
        .then(project => res.status(200).json(project))
        .catch(error => res.json(error));
});



// PUT /api/projects/:projectId
router.put('/projects/:projectId', (req, res, next) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Project.findByIdAndUpdate(projectId, req.body, { new: true })
        .then((updatedProject) => res.json(updatedProject))
        .catch(error => res.json(error));
});


// DELETE /api/projects/:projectId  
router.delete('/projects/:projectId', async (req, res, next) => {
    
    try {
        const { projectId } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400).json({ message: 'Specified id is not valid' });
            return;
        }
        
        const projectToRemove = await Project.findById(projectId);
        console.log(projectToRemove.tasks);

        if(projectToRemove.tasks.length !== 0) {
            projectToRemove.tasks.forEach( async (task) => {
                try {
                    await Task.findByIdAndRemove(task);
                } catch(err) {
                    console.error(err);
                }                    
            });
        }
    
        await Project.findByIdAndRemove(projectId);
        res.json({ message: `Project with ${projectId} is removed successfully.` })
        
    } catch(err) {
        console.error(err);
    }
});

module.exports = router;
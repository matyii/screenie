const fs = require('fs');
const express = require('express');
const path = require('path');
const router = express.Router();

router.get("/:filename", (req, res) => {
    const filename = req.params["filename"];
    const filePath = path.join(__dirname, `../uploads/profile_pictures/${filename}`);

    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    } else {
        console.error(`File not found at path: ${filePath}`);
        return res.status(404).send("File not found.");
    }
});

module.exports = router;
const fs = require('fs');
const path = require('path');

const calculateFolderSize = (folderPath, excludeFolder) => {
    let totalSize = 0;

    const calculateSize = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            if (stats.isFile()) {
                totalSize += stats.size;
            } else if (stats.isDirectory() && file !== excludeFolder) {
                calculateSize(filePath);
            }
        });
    };

    if (fs.existsSync(folderPath)) {
        calculateSize(folderPath);
    }

    return totalSize;
};

module.exports = calculateFolderSize;
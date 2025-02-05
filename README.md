[(Logo)](/preview/logo.png)
# screenie.host
## ShareX screenshot uploader built with NodeJS and [DaisyUI](https://v5.daisyui.com/)

### Features
- Easy configuration
- Automatic config generation for each user
- A user-friendly dashboard
- User profile management with vanity URLs and private profiles
- Badge system for users
- Storage capacity management
- Detailed user and admin dashboard
- Embed support for uploaded files
- Theme customization with [multiple themes available](https://v5.daisyui.com/docs/themes/)

### Installation
- Download / Clone the source code.
- Run `npm i` to install the packages.
- Fill in the `config.json` config file.
- Import the SQL file `db.sql`  to your database server and fill in the connection information to the `.env` file.
- If you have made any changes to the design, run `npm run build:css` to rebuild the CSS file.
- To run the server, use the command `node .` or `npm start` to run the server.

### Config
Here is a list of all the keys in the config with their meaning:

- `maindomain`: This is the main domain, if a domain is not set in the config it falls back to this.
- `uploadkeylength`: The length of characters that are in the upload key.
- `nodeserverport`: The port for the server.
- `maxSizePerFileMB`: The maximum size per file in megabytes.
- `discordInviteURL`: The URL for the Discord invite endpoint. (`maindomain.example/discord`)

### .env File
Here is a list of all the keys in the `.env` file with their meaning:

- `DB_HOST`: The database host.
- `DB_USER`: The database user.
- `DB_PASSWORD`: The database password.
- `DB_NAME`: The database name.

### Plans in the future
- [] Trying to move the project to a framework
- [] Spotify API for the profiles
- [] Expanding the dashboard

### How to make new endpoints
To make a new endpoint you need to make a file in the `routes` folder with your name of choice. Example: `example.js`
The empty version should look like this:
```js
const express = require('express')
const router = express.Router()
router.get("/", (req, res) => {
    res.send('Hello!')
})
module.exports = router;
```

Then you just need to add a new value to the `"routes.json"` array:
```json
{
        "endpoint": "/yourendpoint",
        "location": "./routes/yourfile"
}
```

**Note!**
In your endpoint JS file, leave the router endpoint on `"/"`, since you will be giving the name of the route in the main `routes.json` file.


### How to add new folders to check
To add new folders to the checker, you simply add a new list element containing the path of the folder in the `folders` variable in the `server.js` file. The checker (`/functions/check.js`) will run through all the list items, and checking them, if they exist, if they don't exist, it will make the specified folder.

### API
- **GET** `/api/uploads/:uploadkey` : Returns a list of uploads uploaded with the upload key.
- **GET** `/api/domains` : Returns a list of all the domains.
- **POST** `/api/upload`: This is the upload URL, and you can use other apps to upload files. In the post body you only need the `uploadKey` and the `file`.
- **GET** `/api/profile_pictures` : Returns profile pictures.
- **GET** `/api/user/:id` : Returns user details by user ID.
- **POST** `/api/user/:id` : Updates user details by user ID.
- **DELETE** `/api/user/:id` : Deletes a user by user ID.
- **GET** `/api/uploads` : Returns a list of all uploads.
- **GET** `/api/upload/:id` : Returns upload details by upload ID.
- **DELETE** `/api/upload/:id` : Deletes an upload by upload ID.
- **GET** `/api/domains` : Returns a list of all domains.
- **GET** `/api/domain/:id` : Returns domain details by domain ID.
- **POST** `/api/domain` : Adds a new domain.
- **POST** `/api/domain/:id` : Updates domain details by domain ID.
- **DELETE** `/api/domain/:id` : Deletes a domain by domain ID.
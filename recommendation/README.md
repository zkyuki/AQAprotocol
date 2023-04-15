# recommendation

## How to Use the Flask Application

This Flask application can automatically categorize text submitted from a web browser into category tags using the OpenAI API, and save them to a SQLite database. You can then display a list of posts that include the saved text and related category tags.

Below are the steps to run this application.

### Requirements

- Python 3.x
- Flask
- OpenAI API account (API key required)

### Installation

1. Install Python 3.x.

2. Install Flask. In the terminal, run the following command:
```
pip install flask
```

3. Create an OpenAI API account and obtain an API key.

### Running the Application

1. Navigate to the directory containing the application.

2. To create the SQLite database, run the `create_tables()` function before running the application. Run the following command:
```
python
from app import create_tables
create_tables()
```

3. To run the Flask application, run the following command:
```
export FLASK_APP=app
export FLASK_ENV=development
flask run
```

4. Open a web browser and enter a URL like `http://localhost:5000/`. The index page of the application will be displayed.

### Using the Application

1. A text box will be displayed for entering the post content. Enter the post content in the text box.

2. Click the "Post" button to save the post. The application will automatically categorize the post content into category tags using the OpenAI API and save them to the SQLite database.

3. After the post is saved, you will be redirected to the index page. This will display a list of all posts and their associated category tags.

That's it. For more detailed instructions on how to use the Flask application, see the `app.py` file.

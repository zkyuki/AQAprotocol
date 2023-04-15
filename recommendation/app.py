from flask import Flask, g, render_template, request, redirect, url_for
import openai
import sqlite3

app = Flask(__name__)
openai.api_key = ""

def get_db_connection():
    if 'db_connection' not in g:
        g.db_connection = sqlite3.connect('posts.db')
    return g.db_connection

@app.teardown_appcontext
def close_db_connection(exception=None):
    if 'db_connection' in g:
        g.db_connection.close()

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        post_content = request.form['post_content']
        category_tags = get_category_tags(post_content)
        post_id = save_post_and_tags(post_content, category_tags) 
        return redirect(url_for('index'))

    posts_with_categories = get_all_posts_with_categories()
    return render_template('index.html', posts_with_categories=posts_with_categories)

if __name__ == '__main__':
    app.run(debug=True)

def get_category_tags(post_content):
    prompt = (
        f"Please categorize the following post into appropriate categories:\n\n"
        f"Post: {post_content}\n\n"
        f"Categories:"
    )

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=50,
        n=1,
        stop=None,
        temperature=0.5,
    )

    tags_text = response.choices[0].text.strip()
    tags = tags_text.split(', ')
    return tags

def create_tables():
    with app.app_context():
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS post_category (
                post_id INTEGER,
                category_id INTEGER,
                FOREIGN KEY (post_id) REFERENCES posts (id),
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        ''')
        connection.commit()

# create tables
create_tables()

def save_post_and_tags(post_content, category_tags):
    with app.app_context():
        connection = get_db_connection()
        cursor = connection.cursor()

        # Save the post
        cursor.execute('INSERT INTO posts (content, created_at) VALUES (?, CURRENT_TIMESTAMP)', (post_content,))
        post_id = cursor.lastrowid

        # Save category tags and relationship
        for tag in category_tags:
            cursor.execute('INSERT OR IGNORE INTO categories (name) VALUES (?)', (tag,))
            cursor.execute('SELECT id FROM categories WHERE name = ?', (tag,))
            category_id = cursor.fetchone()[0]
            cursor.execute('INSERT INTO post_category (post_id, category_id) VALUES (?, ?)', (post_id, category_id))

        connection.commit()

        return post_id
    
def get_all_posts_with_categories():
    connection = get_db_connection()
    cursor = connection.cursor()
    
    cursor.execute('''
        SELECT posts.id, posts.content, GROUP_CONCAT(categories.name) as categories
        FROM posts
        JOIN post_category ON posts.id = post_category.post_id
        JOIN categories ON post_category.category_id = categories.id
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
    ''')
    
    posts_with_categories = cursor.fetchall()
    return posts_with_categories

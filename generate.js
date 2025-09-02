const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');

// `marked` 설정을 커스터마이징합니다.
marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    smartLists: true,
    smartypants: false
});

const POSTS_DIR = path.join(__dirname, 'posts');
const OUTPUT_DIR = path.join(__dirname, 'posts');

// HTML 템플릿을 정의합니다.
const postTemplate = (title, author, date, content) => `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | My Blog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
            color: #495057;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }

        .container {
            max-width: 800px;
            width: 100%;
            padding: 2rem;
            box-sizing: border-box;
        }
        
        .header {
            background-color: #ffffff;
            padding: 1.5rem 2rem;
            margin-bottom: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
        }

        .back-link {
            display: flex;
            align-items: center;
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
            font-size: 1rem;
            margin-bottom: 1rem;
            transition: color 0.3s ease;
        }

        .back-link:hover {
            color: #03254c;
        }

        .back-link i {
            margin-right: 0.5rem;
        }

        .post-title {
            color: #03254c;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .post-meta {
            color: #868e96;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .meta-item i {
            margin-right: 0.5rem;
            color: #007bff;
        }

        /* Post Content */
        .post-content {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .post-content h1, .post-content h2, .post-content h3, .post-content h4 {
            color: #343a40;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .post-content p {
            margin-bottom: 1rem;
        }

        .post-content a {
            color: #007bff;
            text-decoration: none;
            border-bottom: 2px solid #007bff;
            transition: all 0.3s ease;
        }

        .post-content a:hover {
            background-color: #007bff;
            color: #fff;
        }

        .post-content pre {
            background-color: #e9ecef;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
        }

        .post-content code {
            font-family: 'Courier New', Courier, monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <a href="../index.html" class="back-link">
                <i class="fas fa-arrow-left"></i>
                Go Back
            </a>
            <h1 class="post-title">${title}</h1>
            <div class="post-meta">
                <span class="meta-item"><i class="fas fa-user"></i>${author}</span>
                <span class="meta-item"><i class="fas fa-calendar-alt"></i>${date}</span>
            </div>
        </header>
        <main class="post-content">
            ${content}
        </main>
    </div>
</body>
</html>
`;

async function generate() {
    console.log('Starting blog generation process...');
    const posts = [];
    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

    for (const file of files) {
        const filePath = path.join(POSTS_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content: markdownContent } = matter(fileContent);

        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);
        const htmlFileName = file.replace('.md', '.html');
        const htmlFilePath = path.join(OUTPUT_DIR, htmlFileName);

        // Create the individual post HTML file
        const fullHtml = postTemplate(
            frontmatter.title,
            frontmatter.author,
            frontmatter.date,
            htmlContent
        );
        fs.writeFileSync(htmlFilePath, fullHtml);

        console.log(`Generated HTML for: ${htmlFileName}`);

        // Add to posts array for posts.json
        posts.push({
            title: frontmatter.title,
            author: frontmatter.author,
            date: frontmatter.date,
            summary: markdownContent.substring(0, 100).replace(/\n/g, ' '),
            url: `./posts/${htmlFileName}`
        });
    }

    // Sort posts by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Write the posts.json file
    const postsJsonPath = path.join(__dirname, 'posts.json');
    fs.writeFileSync(postsJsonPath, JSON.stringify(posts, null, 2));
    console.log('Generated posts.json file.');
    console.log('Blog generation complete!');
}

generate();

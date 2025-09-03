const fs = require('fs');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, 'posts');
const posts = [];

// posts 디렉토리의 모든 파일 읽기
fs.readdirSync(postsDir).forEach(file => {
  if (file.endsWith('.md')) {
    const mdFilePath = path.join(postsDir, file);
    const mdContent = fs.readFileSync(mdFilePath, 'utf-8');
    const { data, content } = matter(mdContent);

    // posts.json에 저장할 포스트 데이터
    posts.push({
      title: data.title,
      author: data.author,
      date: typeof data.date === 'object' ? data.date.toISOString().split('T')[0] : data.date,
      summary: content.substring(0, 100).trim() + '...',
      url: `./posts/${file.replace('.md', '.html')}`
    });

    // 마크다운을 HTML로 변환
    const htmlContent = marked.parse(content);

    // HTML 파일 생성
    const htmlFilePath = path.join(postsDir, file.replace('.md', '.html'));
    const htmlTemplate = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - My Blog</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #343a40; }
        .container { max-width: 800px; }
        .post-content img { max-width: 100%; height: auto; border-radius: 8px; margin-top: 16px; margin-bottom: 16px; }
        .post-content h1, .post-content h2, .post-content h3 { font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
        .post-content pre { background-color: #e9ecef; padding: 16px; border-radius: 8px; overflow-x: auto; }
        .post-content a { color: #007bff; text-decoration: underline; }
        .header-container { background-color: #ffffff; padding: 1.5rem; border-bottom: 1px solid #e9ecef; }
        .post-info span { display: flex; align-items: center; }
    </style>
</head>
<body class="bg-gray-50 flex flex-col items-center py-10">
    <header class="w-full header-container shadow-sm mb-8">
        <div class="container mx-auto flex items-center justify-between">
            <a href="../index.html" class="text-gray-600 hover:text-gray-800 transition duration-300">
                <i class="fas fa-arrow-left mr-2"></i>뒤로가기
            </a>
            <h1 class="text-2xl font-bold text-gray-800">${data.title}</h1>
            <div></div>
        </div>
    </header>
    <main class="w-full container bg-white rounded-xl shadow-lg p-8 md:p-12">
        <div class="post-info text-sm text-gray-500 mb-8 flex justify-end space-x-4">
            <span><i class="fas fa-user mr-2"></i>${data.author}</span>
            <span><i class="fas fa-calendar-alt mr-2"></i>${typeof data.date === 'object' ? data.date.toISOString().split('T')[0] : data.date}</span>
        </div>
        <div class="post-content leading-relaxed text-gray-700">
            ${htmlContent}
        </div>
    </main>
</body>
</html>`;
    fs.writeFileSync(htmlFilePath, htmlTemplate);
  }
});

// posts.json 파일 생성
fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));

console.log('Posts generated and updated successfully!');

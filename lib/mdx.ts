import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');
  console.log('contentDirectory', contentDirectory);

export function getAllTasks() {
  const files = fs.readdirSync(contentDirectory);

  return files.map((fileName) => {
    const slug = fileName.replace('.mdx', '');
    const fullPath = path.join(contentDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title,
      difficulty: data.difficulty,
      category: data.category,
    };
  });
}

export async function getTaskBySlug(slug: string) {
  console.log('getTaskBySlug slug', slug);
  const fullPath = path.join(contentDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return { data, content };
}
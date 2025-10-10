<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Machine Learning', 'slug' => 'machine-learning'],
            ['name' => 'Natural Language Processing', 'slug' => 'nlp'],
            ['name' => 'Computer Vision', 'slug' => 'computer-vision'],
            ['name' => 'GPT', 'slug' => 'gpt'],
            ['name' => 'OpenAI', 'slug' => 'openai'],
            ['name' => 'Claude', 'slug' => 'claude'],
            ['name' => 'Stable Diffusion', 'slug' => 'stable-diffusion'],
            ['name' => 'Midjourney', 'slug' => 'midjourney'],
            ['name' => 'API', 'slug' => 'api'],
            ['name' => 'Open Source', 'slug' => 'open-source'],
            ['name' => 'Free', 'slug' => 'free'],
            ['name' => 'Paid', 'slug' => 'paid'],
            ['name' => 'Python', 'slug' => 'python'],
            ['name' => 'JavaScript', 'slug' => 'javascript'],
            ['name' => 'TypeScript', 'slug' => 'typescript'],
            ['name' => 'React', 'slug' => 'react'],
            ['name' => 'Vue', 'slug' => 'vue'],
            ['name' => 'Node.js', 'slug' => 'nodejs'],
            ['name' => 'TensorFlow', 'slug' => 'tensorflow'],
            ['name' => 'PyTorch', 'slug' => 'pytorch'],
            ['name' => 'Automation', 'slug' => 'automation'],
            ['name' => 'Productivity', 'slug' => 'productivity'],
            ['name' => 'Business', 'slug' => 'business'],
            ['name' => 'Education', 'slug' => 'education'],
            ['name' => 'Research', 'slug' => 'research'],
        ];

        foreach ($tags as $tag) {
            \App\Models\Tag::updateOrCreate(
                ['slug' => $tag['slug']],
                $tag
            );
        }
    }
}

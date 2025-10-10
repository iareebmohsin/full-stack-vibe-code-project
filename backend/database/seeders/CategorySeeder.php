<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Code Generation',
                'slug' => 'code-generation',
                'description' => 'AI tools that help generate, complete, or suggest code',
                'icon' => '💻',
                'color' => '#3B82F6',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Chat & Assistants',
                'slug' => 'chat-assistants',
                'description' => 'Conversational AI tools and chatbots',
                'icon' => '💬',
                'color' => '#10B981',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Image Generation',
                'slug' => 'image-generation',
                'description' => 'AI tools for creating and editing images',
                'icon' => '🎨',
                'color' => '#8B5CF6',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Data Analysis',
                'slug' => 'data-analysis',
                'description' => 'Tools for analyzing and visualizing data with AI',
                'icon' => '📊',
                'color' => '#F59E0B',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Writing & Content',
                'slug' => 'writing-content',
                'description' => 'AI tools for writing, editing, and content creation',
                'icon' => '✍️',
                'color' => '#EF4444',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Development Tools',
                'slug' => 'development-tools',
                'description' => 'AI-powered development and debugging tools',
                'icon' => '🛠️',
                'color' => '#6366F1',
                'order' => 6,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}

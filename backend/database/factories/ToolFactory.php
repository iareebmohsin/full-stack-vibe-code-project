<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tool>
 */
class ToolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->words(3, true);

        return [
            'user_id' => \App\Models\User::factory(),
            'category_id' => \App\Models\Category::factory(),
            'title' => ucwords($title),
            'slug' => \Illuminate\Support\Str::slug($title),
            'description' => fake()->paragraph(3),
            'url' => fake()->url(),
            'github_url' => fake()->boolean(30) ? 'https://github.com/' . fake()->userName() . '/' . fake()->word() : null,
            'documentation_url' => fake()->boolean(50) ? fake()->url() : null,
            'thumbnail_url' => fake()->boolean(40) ? fake()->imageUrl(640, 480, 'tech') : null,
            'tool_type' => fake()->randomElement(['library', 'framework', 'api', 'service', 'application']),
            'pricing_model' => fake()->randomElement(['free', 'freemium', 'paid', 'open_source']),
            'status' => 'published',
            'views_count' => fake()->numberBetween(0, 1000),
            'favorites_count' => fake()->numberBetween(0, 100),
            'is_featured' => fake()->boolean(10),
            'published_at' => now(),
        ];
    }

    /**
     * Indicate that the tool is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    /**
     * Indicate that the tool is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }

    /**
     * Indicate that the tool is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the tool is free.
     */
    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'pricing_model' => 'free',
        ]);
    }

    /**
     * Indicate that the tool is open source.
     */
    public function openSource(): static
    {
        return $this->state(fn (array $attributes) => [
            'pricing_model' => 'open_source',
            'github_url' => 'https://github.com/' . fake()->userName() . '/' . fake()->word(),
        ]);
    }
}

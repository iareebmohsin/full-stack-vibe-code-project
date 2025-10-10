<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => \Illuminate\Support\Str::slug($name),
            'usage_count' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Indicate that the tag is popular.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'usage_count' => fake()->numberBetween(50, 200),
        ]);
    }
}
